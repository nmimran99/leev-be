import Notification from '../models/notification';
import User from '../models/user';
import StatusList from '../models/status';
import Comment from '../models/comment';
import System from '../models/system';
import i18next from 'i18next';
import { getDBModal, removeDuplicateObjectIds, getFullName, getStatusColor } from '../api/generic';
import { getAddress } from './asset.service';
import { sendMail } from '../smtp/mail';


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
			const relatedUsers = data.fullDocument.relatedUsers;
			relatedUsers.forEach((r) => {
				if (actionBy && r.equals(actionBy)) {
					return;
				}
				dist.push(r);
			});
			if (actionBy && !actionBy.equals(data.fullDocument.owner)) {
				dist.push(data.fullDocument.owner);
			}
			resolve(removeDuplicateObjectIds(dist));
		}
	});
};

export const distributeUpdateNotifications = async (data, type, payload) => {
	const actionBy = data.updateDescription
		? data.updateDescription.updatedFields.lastUpdatedBy ||
		  data.fullDocument.lastUpdatedBy
		: data.fullDocument.createdBy;
		console.log(data)
	const distributionList = await getDistributionList(data, type, actionBy);

	if (!distributionList) return;
	const notification = {
		tenant: data.fullDocument.tenant,
		actionType: type,
		actionOn: {
			objectType: data.ns.coll,
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
				await sendNotificationEmail(n)
			} catch (e) {
				console.log(e.message);
				return e;
			}
		})
	);
};


export const sendNotificationEmail = async (n) => {
	try {
		const options = await createEmailOptions(n);
		console.log(n)
		let d = await sendMail(options);
		return d;
	} catch(e) {
		console.log(e.message)
		return e.message
	}
}

export const createEmailOptions = async (n) => {
	try {
		const { objectType, internalId, externalId } = n.actionOn;
		const Model = await getDBModal(objectType);
		const user = await User.findOne({ _id: n.user });
		const actionBy = await User.findOne({ _id: n.actionBy})
		const t = i18next.getFixedT(user.lang);
		const item = await Model.findOne(internalId).populate([
			{ path: 'asset' },
			{ path: 'system' },
			{ path: 'status' },
			{ path: 'owner', populate: {
					path: 'role',
					model: 'Role',
					select: 'roleName',
				}
			}
		]);
		
		let context = {};
		let emailSubject;
		if ([ 'faults', 'tasks'].includes(objectType)) {
			context.title = item.title;
			context.description = item.description;
			if ( item.system) {
				context.system = item.system.name;
				context.systemData = item.system.name;
				context.systemLabel = t("email.system")
			}
			if (item.asset) {
				context.address = getAddress(item.asset.address).address;
				context.assetData = getAddress(item.asset.address).address;
				context.assetLabel = t("email.asset");
			}
			context.itemId = externalId;
			context.itemLink = `${process.env.FRONTEND_URL}/${objectType}/${externalId}`;
			context.avatar = actionBy.avatar

			if (n.actionType === 'statusChange') {
				context.statusName = t(`statuses.${item.status.statusId}`);
				context.statusText = `${getFullName(actionBy)} ${t(`email.changeStatusText`)}`;
				context.statusColor = `background: ${getStatusColor(item.status.statusId)}`
				emailSubject = `${externalId} -  ${t(`email.${n.actionType}Subject`)} - ${t(`statuses.${item.status.statusId}`) }`
			}
			
			if (n.actionType === 'ownerChange' || 'itemCreated') {
				context.ownerName = getFullName(item.owner);
				context.ownerText = `${getFullName(actionBy)} ${t(`email.changeOwnerText`)}`
				context.ownerAvatar = item.owner.avatar;
				context.ownerRole = item.owner.role.roleName
				emailSubject = `${externalId} -  ${t(`email.${n.actionType}Subject`)} - ${ getFullName(item.owner) }`
			}

			if (n.actionType === 'addComment') {
				context.commentText = `${ getFullName(actionBy)} ${t("email.addCommentText")}`;
				context.comment = n.data.commentText;
				emailSubject = `${externalId} -  ${t(`email.${n.actionType}Subject`)} - ${ getFullName(actionBy) }`
			}

			if (n.actionType === 'relatedUserAdded') {
				context.relatedUserAddedText = `${ getFullName(actionBy)} ${t("email.relatedUserAddedText")}`;
				context.avatar = actionBy.avatar;
				emailSubject = `${externalId} -  ${t(`email.${n.actionType}Subject`)} - ${ getFullName(actionBy) }`
			}

			if (n.actionType === 'itemCreated') {
				context.titleLabel = t(`email.${objectType}Title`);
				context.titleData = item.title;
				context.descriptionLabel = t(`email.${objectType}Description`)
				context.descriptionData = item.description;
				context.itemCreatedSuccessfulyText = `${getFullName(actionBy)}  ${t(`email.${objectType}CreatedSuccessfulyText`)}`;
				context.itemCreatedSuccessfulyInstructions = t("email.itemCreatedSuccessfulyInstructions")
				emailSubject = `${externalId} -  ${t(`email.${objectType}AssignEmailSubject`)}`
			}
		}

		return Promise.resolve({
			from: 'system@leev.co.il',
			to: user.email,
			subject: emailSubject,
			template: n.actionType,
			context
		});
	} catch(e) {
		console.log(e.message);
		return null;
	}	
}

