import Fault from "../models/fault";
import Task from "../models/task";
import Report from "../models/report";
import Log from "../logger/log.model";
import Tag from "../models/tag";
import { parse, parseISO } from "date-fns";
import Asset from '../models/asset';
import { signPayload } from "./auth.service";
import { generateLink } from "../api/generic";
import User from "../models/user";
import i18next from "i18next";
import { sendMail } from "../smtp/mail";
import { getAddress } from "./asset.service";


export const getReportData = async (req) => {
	let { module, fromDate, toDate, asset } = req.body;
	fromDate = parse(fromDate, 'yyyy-MM-dd', new Date)
	toDate = parse(toDate, 'yyyy-MM-dd', new Date)
	
	return await getFaultsReportData({ fromDate, toDate, asset });
};

export const getFaultsReportData = async (filters) => {
    try {
        const openedFaults = await getFaultsOpenedBetween(filters);
        const closedFaults = await getFaultsClosedBetween(filters);
        const faultsBySystemAndLocation = await getFaultsBySystemAndLocation(
            closedFaults
        );
        const mostActiveUsers = await getMostActiveUsers(closedFaults, filters);
        const mostUsedTags = await getMostUsedTags(closedFaults, filters);
		const assetData = await Asset.findOne({ _id: filters.asset });
        return {
			fromDate: filters.fromDate,
			toDate: filters.toDate,
			asset: assetData,
            openFaultCount: openedFaults.length,
            closedFaultCount: closedFaults.length,
            faultsBySystemAndLocation,
            mostActiveUsers,
            mostUsedTags,
            closedFaults
        };
    } catch (e) {
        console.log(e.message);
        return e;

    }
	
};

export const getFaultsOpenedBetween = async ({ asset, fromDate, toDate }) => {
	return await Fault.find({
		asset,
		createdAt: {
			$gte: fromDate,
			$lte: toDate,
		},
	});
};

export const getFaultsClosedBetween = async ({ asset, fromDate, toDate }) => {
	return await Fault.find({
		asset,
		closedDate: {
			$gte: fromDate,
			$lte: toDate,
		},
	}).populate("location system");
};

export const getFaultsBySystemAndLocation = async (faults) => {
	const bySystem = {};
	const byLocation = {};
	const byCombination = {};

	faults.forEach((fault) => {
		let systemId = fault.system._id;
		let locationId = fault.location._id;
		let combinationId = `${systemId}-${locationId}`;

		if (bySystem[systemId]) {
			bySystem[systemId].count += 1;
		} else {
			bySystem[systemId] = {
				data: fault.system,
				count: 1,
			};
		}

		if (byLocation[locationId]) {
			byLocation[locationId].count += 1;
		} else {
			byLocation[locationId] = {
				data: fault.location,
				count: 1,
			};
		}

		if (byCombination[combinationId]) {
			byCombination[combinationId].count += 1;
		} else {
			byCombination[combinationId] = {
				system: fault.system,
				location: fault.location,
				count: 1,
			};
		}
	});

	return { bySystem, byLocation, byCombination };
};

export const getMostActiveUsers = async (faults, filters) => {
	const { fromDate, toDate } = filters;
	const faultIds = faults.map((f) => f._id);
	const rows = await Log.aggregate([
		{
			$match: {
				"itemData.itemIdentifier": { $in: faultIds },
				createdAt: {
					$gte: fromDate,
					$lte: toDate,
				},
			},
		},
		{
			$group: {
				_id: "$actionBy",
				userActions: { $sum: 1 },
			},
		},
		{
			$project: {
				actionBy: "$_id",
				userActions: 1,
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "_id",
				foreignField: "_id",
				as: "user",
			},
		}
	]);
	let filtered = rows.filter(u => u.user[0].email !== process.env.SYSTEM_USER_EMAIL)
	return filtered.sort((a,b) => a.userActions - b.userActions > 0 ? -1 : 1);
};

export const getMostUsedTags = async (faults, filters) => {
	const { fromDate, toDate } = filters;
	const faultIds = faults.map((f) => f._id);

	const tags = await Tag.find({
		"mentions.fault": { $in: faultIds },
		"mentions.date": {
			$gte: fromDate,
			$lte: toDate,
		},
	});

	const totals = tags.reduce((acc, t) => {
		let mentions = t.mentions.filter(
			(tm) =>
				(tm.date >= fromDate &&
				tm.date <= toDate)
		);
		acc[t._id] = {
			data: t,
			count: mentions.length,
		};
        return acc;
	}, {});

	return totals;
};

export const createReport = async (req) => {
	const { tenant } = req.user;
	const { name, parameters } = req.body;

	const report = new Report({
		tenant,
		name,
		parameters,
		createdBy: req.user._id
	});

	let saved = await report.save();
	return saved._id;
}

export const distributeReport = async (req) => {
	const { reportId, userList } = req.body;

	try {
		const report = await Report.findOne({_id: reportId}).populate('tenant');
		const asset = await Asset.findOne({ _id: report.parameters.asset })
		const users = await User.find({ _id: { $in: userList }});
		const mailList = users.map(u => u.email);

		const t = i18next.getFixedT(report.tenant.lang);

		let d = await sendMail({
			from: "system@leev.co.il",
			to: "system@leev.co.il",
			bcc: mailList,
			subject: `${report.tenant.name} - ${report.name}`,
			template: "sharereport",
			context: {
				link: generateLink(reportId),
				reportName: report.name,
				companyName: report.tenant.name,
				text1: t("reports.text1"),
				text2: t("reports.text2"),
				direction: report.tenant.lang === 'he' ? 'rtl' : 'ltr',
				asset: getAddress(asset.address).address
			}
		});

		return true;
	} catch (e) {
		console.log(e.message);
		return false;
	}
}

export const getReportPublic = async (req) => {
	const { reportId } = req.body;
	let report = await Report.findOne({ _id: reportId });

	let fromDate = parse(report.parameters.fromDate, 'yyyy-MM-dd', new Date)
	let toDate = parse(report.parameters.toDate, 'yyyy-MM-dd', new Date)
	return await getFaultsReportData({ fromDate, toDate, asset: report.parameters.asset });
}

export const getReports = async (req) => {
	const { tenant } = req.user;

	return await Report.find({ tenant })
		.populate([{ path: 'parameters.asset', model: Asset }, { path: 'createdBy', model: User}]);
}


export const getReport = async (req) => {
	const { reportId } = req.body;

	return await Report.findOne({ _id: reportId });
}