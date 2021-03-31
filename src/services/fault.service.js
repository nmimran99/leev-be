import Fault from '../models/fault';
import Comment, { populate } from '../models/comment';
import { relocateFile, removeUnlistedImages } from '../api/generic';
import Status from '../models/status';
import { extractuserId } from './user.service';

export const createFault = async (req) => {
	const {
		tenant, 
		title,
		description,
		asset,
		system,
		owner,
		following,
		createdBy,
	} = req.body;
	let images = [];

	if (req.files.length) {
		req.files.forEach((f) => {
			images.push(f.filename);
		});
	}

	let initStatus = await Status.findOne({ module: 'faults', order: 1 });

	let fault = new Fault({
		tenant,
		title,
		description,
		asset,
		system,
		owner,
		following: following || [],
		status: initStatus._id,
		createdBy,
		lastUpdatedBy: createdBy,
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

export const updateFollowingUsers = async (req) => {
	const { faultId, following } = req.body;
	
	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ following: following, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
	]);
};

export const addFollower = async (req) => {
	const { faultId, userId } = req.body;

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $push: { following: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
	]);
};

export const removeFollower = async (req) => {
	const { faultId, userId } = req.body;

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $pull: { following: userId }, lastUpdatedBy: req.user._id  },
		{ new: true }
	).populate([
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
	]);
};

export const updateFaultOwner = async (req) => {
	const { faultId, userId } = req.body;

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ owner: userId, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
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

	console.log(req.user._id)
	
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
			lastUpdatedBy: req.user._id
		},
		{ new: true }
	).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
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
	const { filters } = req.body;
	let query = getFaultsQueryParams(filters);
	const faults = await Fault.find(query).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
	]);
	return Promise.resolve(faults);
};

export const getFaults = async (req) => {
	const { tenant, filters } = req.body;
	let addQuery = getFaultsQueryParams(filters);

	const faults = await Fault.find({ tenant: tenant, ...addQuery}).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'status' },
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
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
	if (plain) {
		return await Fault.findOne({ _id: faultId }).populate('status');
	}
	return await Fault.findOne({ faultId: faultId }).populate([
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'following', select: 'firstName lastName phoneNumber avatar' },
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

	Object.entries(query).forEach(entry => {
		if (!entry[1]) {
			delete query[entry[0]]
		}
	});

	if (query.status) {
		query.status = { $in: query.status };
	}

	return query;
};

export const addFaultComment = async (req) => {
	const { faultId, userId, text } = req.body;
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
	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ status },
		{ new: true }
	).populate('status');
};

export const getFaultOptions = async (req) => {
	const query = req.body;
	Object.entries(query).forEach(o => {
		if (!o[1]) {
			delete query[0];
		}
	})
	return await Fault.find({ ...query });
}

