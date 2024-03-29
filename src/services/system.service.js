import { getUnauthorizedMessage } from '../api/generic';
import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import System from '../models/system';

export const createSystem = async (req) => {
	const { asset, owner, relatedUsers, name, data } = req.body;
	let system = new System({
		name,
		asset,
		owner,
		relatedUsers,
		data,
		lastUpdatedBy: req.user._id
	});

	return await system.save();
};

export const getSystems = async (req) => {
	const { tenant, _id: userId } = req.user;
	const { assetId } = req.body;
	const { permLevel } = req.headers;

	const addQuery = {
		...getRelatedQuery(permLevel, userId),
	};

	return await System.find({ asset: assetId, ...addQuery }).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar role', populate: { path: 'role', model: 'Role', select: 'roleName'} },
		{ path: 'asset' },
		{
            path: 'relatedUsers',
            select: 'firstName lastName avatar role',
			populate: {
				path: 'role',
                model: 'Role',
                select: 'roleName'
			},
		},
	]);
};

export const removeSystem = async (req) => {
	const { systemId } = req.body;
	return await System.findOneAndDelete({ _id: systemId });
};

export const editSystemName = async (req) => {
	const { systemId, name, owner } = req.body;
	
	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ name: name, owner: owner },
		{
			new: true,
		}
	);
};

export const addRelatedUsers = async (req) => {
	const { systemId, users } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ relatedUsers: users, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber' },
		{ path: 'asset' },
		{ path: 'relatedUsers' },
	]);
};

export const addRelatedUser = async (req) => {
	const { systemId, userId } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}
	

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ $push: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
		{ path: 'relatedUsers' },
	]);
};

export const updateSystemOwner = async (req) => {
	const { systemId, owner } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ owner, lastUpdatedBy: req.user._id },
		{ new: true }
	);
};

export const updateSystemName = async (req) => {
	const { systemId, name } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ name, lastUpdatedBy: req.user._id },
		{ new: true }
	);
};

export const removeRelatedUser = async (req) => {
	const { systemId, userId } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemId },
		{ $pull: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
		{ path: 'relatedUsers' },
	]);
};

export const getSystemsOptions = async (req) => {
	let q = {};
	if (req.body.asset) {
		q.asset = req.body.asset;
	}
	return await System.find(q, '_id name asset').populate('asset');
};

export const updateSystemData = async (req) => {
	const { systemData } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemData.system,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOneAndUpdate(
		{ _id: systemData.system },
		{ data: systemData.data, lastUpdatedBy: req.user._id },
		{ new: true }
	);
};


export const removeSystemOwnership = async (userId,actionBy) => {
	const systems = await System.find({ owner: userId}).populate('asset');
	return Promise.all(systems.map(async system => {
		system.owner = system.asset.owner;
		system.relatedUsers = system.relatedUsers.filter(u => u !== userId)
		system.lastUpdatedBy = actionBy
		await system.save();
	}));
}

export const getSystem = async (req) => {
	const { systemId } = req.body;

	const isRelated = await isUserRelated(
		'systems',
		System,
		systemId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await System.findOne({ _id: systemId }).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' }
	])
}