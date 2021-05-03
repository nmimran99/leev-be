import Fault from '../models/fault';
import Comment, { populate } from '../models/comment';
import Asset from '../models/asset';
import System from '../models/system';
import { relocateFile, removeUnlistedImages } from '../api/generic';
import Status from '../models/status';
import { isUserRelated, getRelatedQuery } from '../middleware/authorize';
import User from '../models/user';

// function without permission checking are functions that are allowing only item.read === 2;
// only permLevel that is being checked is 1.

export const createFault = async (req) => {
	let {
		tenant,
		title,
		description,
		asset,
		system,
		owner,
		relatedUsers,
		createdBy,
	} = req.body;
	let images = [];

	if (req.files.length) {
		req.files.forEach((f) => {
			images.push(f.filename);
		});
	}

	let initStatus = await Status.findOne({ module: 'faults', order: 1 });
	let assetData = await Asset.findOne({ _id: asset }, 'tenant owner');
	let systemData = await System.findOne({ _id: system }, 'owner');

	let relatedUsersArr = [];
	if (assetData) relatedUsersArr.push(assetData.owner);
	if (systemData) relatedUsersArr.push(systemData.owner);
	relatedUsersArr = relatedUsersArr.filter((v) => v.toString() !== owner);

	let fault = new Fault({
		tenant: tenant || assetData.tenant,
		title,
		description,
		asset,
		system,
		owner: owner || systemData.owner,
		relatedUsers: relatedUsers || relatedUsersArr,
		status: initStatus._id,
		createdBy: createdBy || systemData.owner,
		lastUpdatedBy: createdBy || systemData.owner,
		images,
		comments: [],
	});

	let savedFault = await fault.save();
	if (!savedFault.images.length) return savedFault;
	await Promise.all(
		savedFault.images.map(async (image, index) => {
			let newURL = await relocateFile(image, savedFault._id, 'faults');
			savedFault.images[index] = newURL;
		})
	);

	return await Fault.findOneAndUpdate(
		{ _id: savedFault._id },
		{ images: savedFault.images },
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

	let prepImages = [];
	let images = [];
	if (req.files.length) {
		req.files.forEach((f) => {
			images.push(f.filename);
		});

		await Promise.all(
			images.map(async (image, index) => {
				let newURL = await relocateFile(image, _id, 'faults');
				prepImages[index] = newURL;
			})
		);
	}

	removeUnlistedImages(
		[...prepImages, ...JSON.parse(uploadedImages)],
		'faults',
		_id
	);

	return await Fault.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			description,
			asset,
			system,
			owner,
			images: [...prepImages, ...JSON.parse(uploadedImages)],
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
	console.log(addQuery);
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

export const getFaults = async (req) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	let addQuery = {
		...getFaultsQueryParams(filters),
		...getRelatedQuery(permLevel, userId),
	};

	const faults = await Fault.find({ tenant: tenant, ...addQuery }).populate([
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

	let fault = await Fault.findOne({_id: faultId});
	fault.createdBy = userId;
	fault.relatedUsers.push(userId);

	return await fault.save();
}