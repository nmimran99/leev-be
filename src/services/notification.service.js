import Notification from '../models/notification';
import User from '../models/user';
import StatusList from '../models/status';
import Comment from '../models/comment';
import Asset from '../models/asset';
import System from '../models/system';
import { removeDuplicateObjectIds } from '../api/generic';
import { get } from 'mongoose';

export const createNotification = async (data) => {
	if (data.operationType === 'update') {
		const { updatedFields } = data.updateDescription;
		Object.entries(updatedFields).forEach((entry) => {
			let key = entry[0];
			if (key === 'status') {
				createStatusUpdateNotification(data);
			} else if (key === 'owner') {
				createOwnerChangeNotification(data);
			} else if (key.includes('comments')) {
				data.updateDescription.updatedFields.comment = entry[1];
				createCommentNotification(data);
			} else if (
				key.includes('relatedUsers')
			) {
				data.updateDescription.updatedFields.relatedUser = entry[1];
				createRelatedUserNotification(data);
			}
		});
	} else if (data.operationType === 'insert') {
		createInsertNotification(data);
	}
};

export const createInsertNotification = async (data) => {
	const owner = data.fullDocument.owner;
	await distributeUpdateNotifications(data, 'itemCreated', { owner });
};

export const createRelatedUserNotification = async (data) => {
	let relatedUser = await User.findOne(
		{ _id: data.updateDescription.updatedFields.relatedUser },
		'_id firstName lastName avatar'
	);
	if (!relatedUser) return;
	const actionBy =
		data.updateDescription.updatedFields.lastUpdatedBy ||
		data.fullDocument.lastUpdatedBy;
	if (relatedUser._id.toString() == actionBy) return;
	await distributeUpdateNotifications(data, 'relatedUserAdded', {
		relatedUser,
	});
};

export const createOwnerChangeNotification = async (data) => {
	const owner = await User.findOne(
		{ _id: data.updateDescription.updatedFields.owner },
		'firstName lastName'
	);
	await distributeUpdateNotifications(data, 'ownerChange', { owner });
};

export const createStatusUpdateNotification = async (data) => {
	const status = await StatusList.findOne({
		_id: data.updateDescription.updatedFields.status,
	});
	await distributeUpdateNotifications(data, 'statusChange', {
		statusName: status.statusId,
	});
};

export const createCommentNotification = async (data) => {
	const comment = await Comment.findOne({
		_id: data.updateDescription.updatedFields.comment,
	});
	await distributeUpdateNotifications(data, 'addComment', {
		commentText: comment.text,
	});
};

export const getNotifications = async (req) => {
	const { page } = req.body;
	const { _id, tenant } = req.user;

	return await Notification.find({ tenant, user: _id })
		.sort({ createdAt: -1 })
		.skip(page * 15 || 0)
		.limit(15)
		.populate({ path: 'actionBy', select: 'firstName lastName avatar' });
};

export const updateNotificationRead = async (req) => {
	const { notificationId, read } = req.body;
	return await Notification.findOneAndUpdate(
		{ _id: notificationId },
		{ read },
		{ new: true }
	);
};

export const getDistributionList = (data, type, actionBy) => {
	return new Promise(async (resolve, reject) => {
		if (type === 'relatedUserAdded') {
			if (data.updateDescription.updatedFields.relatedUser == actionBy)
				resolve(null);
			resolve([data.updateDescription.updatedFields.relatedUser]);
		} else {
			let dist = [];
			const relatedUsers =
				data.fullDocument.relatedUsers;
			relatedUsers.forEach((r) => {
				if (r.equals(actionBy)) {
					return;
				}
				dist.push(r);
			});
			if (!actionBy.equals(data.fullDocument.owner)) {
				dist.push(data.fullDocument.owner);
			}

			// if (data.fullDocument.system) {
			// 	const system = await System.findOne({ _id: data.fullDocument.system });
			// 	dist.push(system.relatedUsers);
			// }
			resolve(removeDuplicateObjectIds(dist));
		}
	});
};

export const distributeUpdateNotifications = async (data, type, payload) => {
	const actionBy = data.updateDescription
		? data.updateDescription.updatedFields.lastUpdatedBy ||
		  data.fullDocument.lastUpdatedBy
		: data.fullDocument.lastUpdatedBy;
	const distributionList = await getDistributionList(data, type, actionBy);

	if (!distributionList) return;
	const notification = {
		tenant: data.fullDocument.tenant,
		actionType: type,
		actionOn: {
			obejctType: data.ns.coll,
			internalId: data.documentKey._id,
			externalId: data.fullDocument[`${data.ns.coll.slice(0, -1)}Id`],
		},
		actionBy,
		data: payload,
		read: false,
	};

	return await Promise.all(
		distributionList.map(async (distUser) => {
		
			let n = new Notification({ ...notification, user: distUser });
			try {
				await n.save();
			} catch (e) {
				console.log(e.message);
				return e;
			}
		})
	);
};
