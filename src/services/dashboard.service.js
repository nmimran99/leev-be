import { Types } from "mongoose";
import Fault from "../models/fault";
import Asset from "../models/asset";
import Task from "../models/task";
import Log from "../logger/log.model";
import { getStatusByNameAndModule, getStatusIds } from "./status.service";
import { addDays, millisecondsToMinutes, parseISO, startOfDay } from "date-fns";
import { getTasksQueryParams } from "./task.service";
import { getRelatedQuery } from "../middleware/authorize";
import { getDateParts } from "../api/generic";
import { Mongoose } from "mongoose";

export const getDashboardData = async (req) => {
	const { asset } = req.body;
	const result = {};

	try {
		const itemsFilters = await getItemsFilters(req, req.headers.permLevel);
		result.openFaults = await getOpenFaultsByStatus(req, itemsFilters);
		result.openTasks = await getOpenTasksByStatus(req, itemsFilters);
		result.avgTimeToClose = await getFaultsAvgTimeToClose(req, itemsFilters);
		result.pendingFaults = await getPendingFaults(req, itemsFilters);
		result.upcomingTasks = await calculateNext30DaysTasks(req, itemsFilters);
		result.lastOperations = await getLastOperations(req, itemsFilters);
		result.faultsOverdue = await getFaultsOverdue(req, itemsFilters);

		return result;
	} catch (e) {
		console.log(e.message);
        return { status: 500, error: true, reason: e.message }
	}
};

export const getItemsFilters = async (req, permLevel) => {
	let filters = { tenant: req.user.tenant };

	if (req.body.asset) {
		filters.asset = req.body.asset
	}

	if (permLevel === 1) {
		filters = {
			...filters,
			$or: [{ owner: req.user._id }, { relatedUsers: req.user._id }],
		};
	}
	return filters;
};

export const getIdList = (items) => {
	return items.map((it) => it._id);
};

export const getOpenFaultsByStatus = async (req, filters) => {
	const faultStatuses = await getStatusIds("faults", "open");
	const addQuery = {
		...filters,
		...getRelatedQuery(req.header.permLevel, req.user._id),
	};

	const agg = await Fault.aggregate([
		{ $match: { ...addQuery, status: { $in: faultStatuses } } },
		{
			$group: {
				_id: "$status",
				status_count: { $sum: 1 },
			},
		},
		{ $project: { status: "$_id", status_count: 1 } },
		{
			$lookup: {
				from: "statuslists",
				localField: "status",
				foreignField: "_id",
				as: "statusObj",
			},
		},
	]);
	const byStatus = agg.map((ag) => {
		return {
			statusId: ag.statusObj[0].statusId,
			count: ag.status_count,
			_id: ag._id,
		};
	});

	const total = byStatus.reduce((val, c) => val + c.count, 0);
	return {
		byStatus,
		total,
	};
};

export const getOpenTasksByStatus = async (req, filters) => {
	const taskStatuses = await getStatusIds("tasks", "open");

	const addQuery = {
		...filters,
		...getRelatedQuery(req.header.permLevel, req.user._id),
	};

	const agg = await Task.aggregate([
		{
			$match: {
				...addQuery,
				isRepeatable: false,
				status: { $in: taskStatuses },
			},
		},
		{
			$group: {
				_id: "$status",
				status_count: { $sum: 1 },
			},
		},
		{ $project: { status: "$_id", status_count: 1 } },
		{
			$lookup: {
				from: "statuslists",
				localField: "status",
				foreignField: "_id",
				as: "statusObj",
			},
		},
	]);
	const byStatus = agg.map((ag) => {
		return {
			statusId: ag.statusObj[0].statusId,
			count: ag.status_count,
			_id: ag._id,
		};
	});
	const total = byStatus.reduce((val, c) => val + c.count, 0);
	return {
		byStatus,
		total,
	};
};

export const getFaultsAvgTimeToClose = async (req, filters) => {
	const faultStatuses = await getStatusIds("faults", "close");

	const addQuery = {
		...filters,
		...getRelatedQuery(req.header.permLevel, req.user._id),
	};

	const agg = await Fault.aggregate([
		{ $match: { ...addQuery, status: { $in: faultStatuses } } },
		{
			$project: {
				_id: 1,
				dateDiff: { $subtract: ["$closedDate", "$createdAt"] },
			},
		},
		{
			$group: {
				_id: null,
				max: { $max: "$dateDiff" },
				min: { $min: "$dateDiff" },
				avg: { $avg: "$dateDiff" },
			},
		},
		{ $project: { _id: 0, max: 1, min: 1, avg: 1 } },
	]);

	if (!agg.length) return {};
	return {
		max: millisecondsToMinutes(agg[0].max),
		min: millisecondsToMinutes(agg[0].min),
		avg: millisecondsToMinutes(agg[0].avg),
	};
};

export const getPendingFaults = async (req, filters) => {
	const status = await getStatusByNameAndModule("pending", "faults");
	const addQuery = {
		...filters,
		...getRelatedQuery(req.header.permLevel, req.user._id),
	};

	const faults = await Fault.find({ status: status[0]._id, ...addQuery }).sort({
		createdAt: 1,
	});

	const pendingFaults = await Promise.all(
		faults.map(async (f) => {
			const actionLogs = await Log.find({ "itemData.itemIdentifier": f._id })
				.sort({ createdAt: -1 })
				.limit(1);
			return {
				faultData: f,
				changeStatusDate: actionLogs.length ? actionLogs[0].createdAt : null,
			};
		})
	);

    return pendingFaults.sort((a,b) => a.changeStatusDate < b.changeStatusDate ? -1 : 1)
};

export const calculateNext30DaysTasks = async (req, filters) => {
	const dates = getDaysArray(new Date(), addDays(new Date(), 30));

	const addQuery = {
		...filters,
		...getRelatedQuery(req.headers.permLevel, req.user._id),
	};

	const repeatableTasks = await Task.find({ isRepeatable: true, ...addQuery });
	let brackets = dates.reduce((result, d) => {
		const dParts = getDateParts(d);
		let bracket = { date: d, parts: dParts, data: [] };
		repeatableTasks.forEach((rt) => {
			rt.schedule.forEach((rts) => {
				const startDate = parseISO(rts.startDate);
				if (startOfDay(startDate) > startOfDay(d)) return;

				let rtsParts = getDateParts(startDate);
				if (rts.interval === "day") {
					bracket.data.push(rt);
				}
				if (rts.interval === "week") {
					if (dParts.weekDay == rtsParts.weekDay) {
						bracket.data.push(rt);
					}
				}
				if (rts.interval === "month") {
					if (dParts.day == rtsParts.day) {
						bracket.data.push(rt);
					}
				}
				if (rts.interval === "year") {
					if (dParts.yearDay == rtsParts.yearDay) {
						bracket.data.push(rt);
					}
				}
			});
		});
		if (bracket.data.length) result.push(bracket);
		return result;
	}, []);
    let final = [];
    brackets.forEach(b => {
        b.data.forEach(bd => {
            final.push({
                date: b.date,
                data: bd,
                parts: b.parts
            })
        })
    })
	return Promise.resolve(final);
};

const getDaysArray = (start, end) => {
	for (
		var arr = [], dt = new Date(start);
		dt <= end;
		dt.setDate(dt.getDate() + 1)
	) {
		arr.push(new Date(dt));
	}
	return arr;
};

export const getLastOperations = async (req, filters) => {
	const addQuery = {
        ...filters,
		...getRelatedQuery(req.headers.permLevel, req.user._id),
	};

	const faults = await Fault.find({ tenant: req.user.tenant, ...addQuery }).populate('status');
	const tasks = await Task.find({ tenant: req.user.tenant, ...addQuery }).populate('status');
	const items = [...getIdList(faults), ...getIdList(tasks)];
	const logs = await Log.find({ "itemData.itemIdentifier": { $in: items } })
    .populate([
        {
            path: 'payload.comment',
            model: 'Comment'
        },
        {
            path: 'payload.status',
            model: 'StatusList'
        },
        {
            path: 'payload.relatedUser',
            model: 'User',
            select: 'avatar role firstName lastName role phoneNumber'
        },
        {
            path: 'payload.owner',
            model: 'User',
            select: 'avatar role firstName lastName role phoneNumber'
        },
		{
            path: 'payload.actionBy',
            model: 'User',
            select: 'avatar role firstName lastName role phoneNumber'
        },
        {
            path: 'actionBy',
            model: 'User',
            select: 'avatar role firstName lastName role phoneNumber',
			populate: {
				path: 'role',
				model: 'Role'
			}
        }
    ])
		.sort({ createdAt: -1 })
		.limit(50);
	return logs;
};

export const getFaultsOverdue = async (req, filters) => {
	const faultStatuses = await getStatusIds("faults", "open");
	const addQuery = {
		...filters,
		...getRelatedQuery(req.headers.permLevel, req.user._id),
	};

	const faults = await Fault.find({
		...addQuery,
		status: { $in: faultStatuses },
		createdAt: {
			$lt: startOfDay(addDays(new Date(), -1)),
		},
	});
	return faults;
};
