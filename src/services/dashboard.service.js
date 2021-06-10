import Fault from "../models/fault";
import Asset from "../models/asset";
import Task from "../models/task";
import Log from "../logger/log.model";
import { getStatusIds } from "./status.service";

export const getDashboardData = async (req) => {
	const { assets } = req.body;
	const result = {};

	const itemsFilters = await getItemsFilters(req, 2);

	const openFaults =  await getOpenFaultsByStatus(itemsFilters);
    const openTasks =  await getOpenTasksByStatus(itemsFilters);
    const avgTimeToClose = await getFaultsAvgTimeToClose(itemsFilters);
    
};

export const getItemsFilters = async (req, permLevel) => {
	let filters = {};

	if (req.body.assets.length) {
		filters.asset = { $in: req.body.assets };
	}

	if (permLevel === 1) {
		filters = {
			...filters,
			$or: [{ owner: req.user._id }, { relatedUsers: req.user._id }],
		};
	}
	return filters;
};

export const getIdList = async (items) => {
	return items.map((it) => it._id);
};

export const getOpenFaultsByStatus = async (filters) => {
    const faultStatuses = await getStatusIds('faults', 'open');
	const agg = await Fault.aggregate([
		{ $match: { ...filters, status: {$in: faultStatuses } } },
		{
			$group: {
				_id: "$status",
				status_count: { $sum: 1 },
			},
		},
		{ $project: { status: "$_id", status_count: 1 } },
        { $lookup: {
            from: 'statuslists',
            localField: 'status',
            foreignField: '_id',
            as: 'statusObj'
        }}
	]);
	const byStatus = agg.map(ag => {
        return {
            statusId: ag.statusObj[0].statusId,
            count: ag.status_count,
            _id: ag._id
        }
    });

    const total = byStatus.reduce((val, c) =>  val + c.count, 0);
    return {
        byStatus,
        total
    }
};

export const getOpenTasksByStatus = async (filters) => {
    const taskStatuses = await getStatusIds('tasks', 'open');
	const agg = await Task.aggregate([
		{ $match: { ...filters, isRepeatable: false, status: { $in: taskStatuses } } },
		{
			$group: {
				_id: "$status",
				status_count: { $sum: 1 },
			},
		},
		{ $project: { status: "$_id", status_count: 1 } },
        { $lookup: {
            from: 'statuslists',
            localField: 'status',
            foreignField: '_id',
            as: 'statusObj'
        }}
	]);
	const byStatus = agg.map(ag => {
        return {
            statusId: ag.statusObj[0].statusId,
            count: ag.status_count,
            _id: ag._id
        }
    });
    const total = byStatus.reduce((val, c) =>  val + c.count, 0);
    return {
        byStatus,
        total
    }
};

export const getFaultsAvgTimeToClose = async (filters) => {
    const faultStatuses = await getStatusIds('faults', 'close');
    const agg = await Fault.aggregate([
        { $match: { ...filters, status: { $in: faultStatuses } }},
        { $project: { faultId: 1, _id: 1, dateDiff: { $subtract: [ '$closedDate', '$createdAt']}}}
    ])

    console.log(agg);
}