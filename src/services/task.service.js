import { relocateFile, removeUnlistedImages } from '../api/generic';
import Task from '../models/task';
import Status from '../models/status';
import Comment from '../models/comment';
import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import { getUnauthorizedMessage } from '../api/generic';
import { uploadImagesToBlob } from '../api/blobApi';

export const getTask = async (req) => {
	const { taskId, plain } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	if (plain) {
		return await Task.findOne({ _id: taskId }).populate('status');
	}
	return await Task.findOne({ taskId: taskId }).populate([
		{ path: 'asset' },
		{ path: 'system' },
		{
			path: 'owner',
			select: 'firstName lastName avatar phoneNumber role',
			populate: {
				path: 'role',
				model: 'Role',
				select: 'roleName',
			},
		},
		{
			path: 'relatedUsers',
			select: 'firstName lastName avatar phoneNumber, role',
			populate: {
				path: 'role',
				model: 'Role',
				select: 'roleName',
			},
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

export const createTask = async (req) => {
	// let images = [];

	// if (req.files.length) {
	// 	req.files.forEach((f) => {
	// 		console.log(f);
	// 		images.push(f.filename);
	// 	});
	// }

	let initStatus = await Status.findOne({ module: 'tasks', order: 1 });
	const {
		title,
		description,
		asset,
		system,
		owner,
		relatedUsers,
		steps,
		isUsingSteps,
		isSequential,
		isRepeatable,
		schedule,
		createdBy,
	} = req.body;

	const task = new Task({
		tenant: req.user.tenant,
		title,
		description,
		asset: asset || null,
		system: system || null,
		owner,
		relatedUsers: JSON.parse(relatedUsers),
		steps: JSON.parse(steps),
		isUsingSteps,
		isSequential,
		isRepeatable,
		schedule: JSON.parse(schedule),
		createdBy,
		status: initStatus,
		images: [],
	});

	let savedTask = await task.save();

	// if (!savedTask.images.length) return savedTask;
	// await Promise.all(
	// 	savedTask.images.map(async (image, index) => {
	// 		let newURL = await relocateFile(image, savedTask._id, 'tasks');
	// 		savedTask.images[index] = newURL;
	// 	})
	// );

	const urls = await uploadImagesToBlob(req.files);

	return await Task.findOneAndUpdate(
		{ _id: savedTask._id },
		{ images: urls },
		{ new: true }
	);
};

export const updateTask = async (req) => {
	const {
		_id,
		title,
		description,
		asset,
		system,
		owner,
		steps,
		isUsingSteps,
		isSequntial,
		isRepeatable,
		uploadedImages,
	} = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		_id,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	// let prepImages = [];
	// let images = [];
	// if (req.files.length) {
	// 	req.files.forEach((f) => {
	// 		images.push(f.filename);
	// 	});

	// 	await Promise.all(
	// 		images.map(async (image, index) => {
	// 			let newURL = await relocateFile(image, _id, 'tasks');
	// 			prepImages[index] = newURL;
	// 		})
	// 	);
	// }

	// removeUnlistedImages(
	// 	[...prepImages, ...JSON.parse(uploadedImages)],
	// 	'tasks',
	// 	_id
	// );

	const urls = await uploadImagesToBlob(req.files);

	return await Task.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			description,
			asset,
			system,
			owner,
			steps: JSON.parse(steps),
			isUsingSteps,
			isSequntial,
			isRepeatable,
			images: [...urls, ...JSON.parse(uploadedImages)],
			lastUpdatedBy: req.user._id
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

export const deleteTask = async (req) => {
	const { taskId } = req.body;
	return await Task.findOneAndDelete(
		{ _id: taskId },
		{ useFindAndModify: false }
	);
};

export const getTasks = async (req) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	const addQuery = {
		...getTasksQueryParams(filters),
		...getRelatedQuery(permLevel, userId),
	};
	return Task.find({ tenant: tenant, ...addQuery }).populate([
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'status' },
	]);
};

export const updateTaskOwner = async (req) => {
	const { taskId, owner } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ owner, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate('owner');
};

export const updateTaskStatus = async (req) => {
	const { taskId, status } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ status, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate('status');
};

export const addTaskComment = async (req) => {
	const { taskId, userId, text } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	const comment = new Comment({
		parentObject: taskId,
		user: userId,
		text: text,
	});

	let comm = await comment.save();
	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{
			$push: {
				comments: comm,
			},
			lastUpdatedBy: req.user._id
		},
		{
			new: true,
			upsert: true,
			useFindAndModify: false,
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

export const updateTaskComment = async (req) => {
	const { taskId, commentId, text } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	await Comment.findOneAndUpdate({ _id: commentId }, { text }, { new: true });
	return Task.findOne({ _id: taskId }).populate({
		path: 'comments',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});
};

export const deleteTaskComment = async (req) => {
	const { taskId, commentId } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	const task = await Task.findOneAndUpdate(
		{ _id: taskId },
		{
			$pull: { comments: commentId },
		},
		{
			new: true,
		}
	).populate({
		path: 'comments',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});

	await Comment.findOneAndDelete({ _id: commentId });
	return task;
};

export const addRelatedUser = async (req) => {
	const { taskId, userId } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ $push: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate({
		path: 'relatedUsers',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});
};

export const removeRelatedUser = async (req) => {
	const { taskId, userId } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ $pull: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate({
		path: 'relatedUsers',
		populate: {
			path: 'user',
			model: 'User',
			select: 'firstName lastName avatar',
		},
	});
};

export const getTasksQueryParams = (query) => {
	if (!query) return null;
	delete query.sortBy;
	delete query.sortOrder;

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

export const updateTaskSchedule = async (req) => {
	const { taskId, schedule } = req.body;

	const isRelated = await isUserRelated(
		'tasks',
		Task,
		taskId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ schedule, lastUpdatedBy: req.user._id },
		{ new: true, useFindAndModify: false }
	);
};

export const getTaskOptions = async (req) => {
	const query = req.body;
	Object.entries(query).forEach((o) => {
		if (!o[1]) {
			delete query[0];
		}
	});
	return await Task.find({ ...query });
};
