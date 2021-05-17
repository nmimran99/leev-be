import Fault from '../models/fault';
import Comment, { populate } from '../models/comment';
import Asset from '../models/asset';
import System from '../models/system';
import { removeDuplicateObjectIds } from '../api/generic';
import Status from '../models/status';
import { isUserRelated, getRelatedQuery } from '../middleware/authorize';
import User from '../models/user';
import { uploadFilesToBlob } from '../api/blobApi';
import { getAddress } from './asset.service';
import i18next from 'i18next';
import { sendMail } from '../smtp/mail';

// function without permission checking are functions that are allowing only item.read === 2;
// only permLevel that is being checked is 1.

export const createFault = async (req) => {
	let {
		title,
		description,
		asset,
		system,
		owner,
		relatedUsers
	} = req.body;

	const { _id: createdBy } = req.user;
	let images = [];

	// if (req.files.length) {
	// 	req.files.forEach((f) => {
	// 		images.push(f.filename);
	// 	});
	// }

	let initStatus = await Status.findOne({ module: 'faults', order: 1 });
	let assetData = await Asset.findOne({ _id: asset }, 'tenant owner');
	let systemData = await System.findOne({ _id: system }, 'owner');

	
	let relatedUsersArr = [];
	if (assetData) relatedUsersArr.push(assetData.owner);
	if (systemData) relatedUsersArr.push(systemData.owner);
	if (!owner) {
		owner = systemData.owner
	}
	relatedUsersArr = removeDuplicateObjectIds(relatedUsersArr.filter((v) => v.toString() !== owner.toString()));

	if (!createdBy) {
		createdBy = systemData.owner;
	}

	if (!title) {
		title = `${description.substr(0,40)}...`;
	}

	let fault = new Fault({
		tenant: req.user ? req.user.tenant : assetData.tenant,
		title,
		description,
		asset,
		system,
		owner: owner || systemData.owner,
		relatedUsers: relatedUsers || relatedUsersArr,
		status: initStatus._id,
		createdBy,
		lastUpdatedBy: systemData.owner,
		images: [],
		comments: [],
	});

	let savedFault = await fault.save();
	// if (!savedFault.images.length) return savedFault;
	
	const urls = await uploadFilesToBlob(req.files, 'images')
	// await Promise.all(
	// 	savedFault.images.map(async (image, index) => {
	// 		let newURL = await relocateFile(image, savedFault._id, 'faults');
	// 		savedFault.images[index] = newURL;
	// 	})
	// );

	return await Fault.findOneAndUpdate(
		{ _id: savedFault._id },
		{ images: urls },
		{ new: true }
	);
};


export const deleteFault = async (req) => {
	const { faultId } = req.body;

	return await Fault.findOneAndDelete({ _id: faultId });
};

export const updateRelatedUsers = async (req) => {
	const { faultId, relatedUsers } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ relatedUsers: relatedUsers, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
	]);
};

export const addRelatedUser = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $push: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
	]);
};

export const removeRelatedUser = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $pull: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
	]);
};

export const updateFaultOwner = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	const fault = await Fault.findOne({ _id: faultId });
	let relatedUsers = fault.relatedUsers;
	if (relatedUsers.includes(userId)) {
		relatedUsers = relatedUsers.filter((f) => f != userId);
	}
	relatedUsers.push(fault.owner);

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ owner: userId, relatedUsers, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: 'owner',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
	]);
};

export const updateFaultData = async (req) => {
	const {
		_id,
		title,
		description,
		asset,
		system,
		owner,
		uploadedImages,
	} = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		_id,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	// let prepImages = [];
	// let images = [];
	// if (req.files.length) {
	// 	req.files.forEach((f) => {
	// 		images.push(f.filename);
	// 	});

	// 	await Promise.all(
	// 		images.map(async (image, index) => {
	// 			let newURL = await relocateFile(image, _id, 'faults');
	// 			prepImages[index] = newURL;
	// 		})
	// 	);
	// }

	// removeUnlistedImages(
	// 	[...prepImages, ...JSON.parse(uploadedImages)],
	// 	'faults',
	// 	_id
	// );

	const urls = await uploadFilesToBlob(req.files, 'images');

	return await Fault.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			description,
			asset,
			system,
			owner,
			images: [...urls, ...JSON.parse(uploadedImages)],
			lastUpdatedBy: req.user._id,
		},
		{ new: true }
	).populate([
		{
			path: 'owner',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
		{ path: 'asset' },
		{ path: 'system' },
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
		{ path: 'status' },
		{
			path: 'comments',
			populate: {
				path: 'user',
				model: 'User',
				select: 'firstName lastName avatar',
			},
		},
	]);
};

export const getMinifiedFaults = async (req) => {
	const { permLevel } = req.headers;
	const { filters } = req.body;
	const user = req.user;

	let query = {
		...getFaultsQueryParams(filters),
		...getRelatedQuery(permLevel, user._id),
	};

	const faults = await Fault.find(query).populate([
		{
			path: 'owner',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
		{ path: 'asset' },
	]);
	return Promise.resolve(faults);
};

export const getFaults = async (req, additionalFilters) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	let addQuery = {
		...getFaultsQueryParams({ ...filters, ...additionalFilters}),
		...getRelatedQuery(permLevel, userId),
	};

	const faults = await Fault.find({ tenant: tenant, ...addQuery }).sort({ createdAt: -1 }).populate([
		{
			path: 'owner',
			select: 'firstName lastName phoneNumber avatar role',
			populate: {
				path: 'role',
				model: 'Role',
				select: 'roleName',
			},
		},
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'status' },
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: { path: 'role', model: 'Role', select: 'roleName' },
		},
		{
			path: 'comments',
			populate: {
				path: 'user',
				model: 'User',
				select: 'firstName lastName avatar',
			},
		},
	]);
	return Promise.resolve(faults);
};

export const getFault = async (req) => {
	const { faultId, plain } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	if (plain) {
		return await Fault.findOne({ _id: faultId }).populate('status');
	}
	return await Fault.findOne({ faultId: faultId }).populate([
		{
			path: 'owner',
			select: 'firstName lastName phoneNumber avatar role',
			populate: {
				path: 'role',
				model: 'Role',
				select: 'roleName',
			},
		},
		{ path: 'asset' },
		{ path: 'system' },
		{
			path: 'relatedUsers',
			select: 'firstName lastName phoneNumber avatar role',
			populate: {
				path: 'role',
				model: 'Role',
				select: 'roleName',
			},
		},
		{
			path: 'comments',
			populate: {
				path: 'user',
				model: 'User',
				select: 'firstName lastName avatar',
			},
		},
		{ path: 'status' },
	]);
};

export const getFaultsQueryParams = (query) => {
	delete query.sortBy;
	delete query.sortOrder;
	delete query.viewType;

	Object.entries(query).forEach((entry) => {
		if (!entry[1]) {
			delete query[entry[0]];
		}
	});

	if (query.status) {
		query.status = { $in: query.status };
	}

	return query;
};

export const addFaultComment = async (req) => {
	const { faultId, userId, text } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	const comment = new Comment({
		parentObject: faultId,
		user: userId,
		text: text,
	});

	let comm = await comment.save();
	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{
			$push: {
				comments: comm,
			},
		},
		{
			new: true,
			upsert: true,
		}
	).populate({
		path: 'comments',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});
};

export const updateFaultComment = async (req) => {
	const { faultId, commentId, text } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	let updated = await Comment.findOneAndUpdate(
		{ _id: commentId },
		{ text },
		{ new: true }
	);
	return Fault.findOne({ _id: faultId }).populate({
		path: 'comments',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});
};

export const changeFaultStatus = async (req) => {
	const { faultId, status } = req.body;

	const isRelated = await isUserRelated(
		'faults',
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ status },
		{ new: true }
	).populate('status');
};

export const getFaultOptions = async (req) => {
	const query = req.body;
	Object.entries(query).forEach((o) => {
		if (!o[1]) {
			delete query[0];
		}
	});
	return await Fault.find({ ...query });
};

export const assignUserToExternalFault = async (req) => {
	const { userId, faultId } = req.body;
	try {
		const user = await User.findOne({ _id: userId });
		let fault = await Fault.findOne({_id: faultId}).populate([
			{ path: 'asset' },
			{ path: 'system' }
		]);
		fault.createdBy = userId;
		fault.relatedUsers.push(userId); 
		
		await fault.save();
		await notifyUserAssigned(user, fault);
		return true;
	} catch(e) {
		console.log(e.message);
		return false
	}
	
}

export const notifyUserAssigned = async (user, fault) => {
	try {
		const t = i18next.getFixedT(user.lang);
	
			let d = await sendMail({
			from: 'system@leev.co.il',
			to: user.email,
			subject: t("email.faultsAssignEmailSubject"),
			template: 'userassigned',
			context: {
				address: getAddress(fault.asset.address).address,
				faultCreatedSuccessfully: t("email.faultCreatedSuccessfully"),
				faultFollowInstructions: t("email.faultFollowInstructions"),
				faultId: fault.faultId,
				faultLink: `http://www.leev.co.il/workspace/faults/${fault.faultId}`,
				systemLabel: t("email.system"),
				systemData: fault.system.name,
				titleLabel: t("email.faultsTitle"),
				titleData: fault.title,
				descriptionLabel: t("email.faultsDescription"),
				descriptionData: fault.description,
				lang: user.lang === 'he' ? 'rtl' : 'ltr'
			}
		});
		
	} catch(e) {
		console.log(e.message)
		return e.message
	}
}