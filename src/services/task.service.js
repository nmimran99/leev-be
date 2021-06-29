import { getDateParts, relocateFile, removeUnlistedImages } from '../api/generic';
import Task from '../models/task';
import Status from '../models/status';
import Comment from '../models/comment';
import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import { getUnauthorizedMessage } from '../api/generic';
import { uploadFilesToBlob } from '../api/blobApi';
import { parseISO } from 'date-fns';


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
		{ path: 'location' },
		{
			path: 'comments',
			populate: {
				path: 'user',
				model: 'User',
				select: 'firstName lastName avatar',
			},
		},
		{ path: 'instances' }
	]);
};

export const createTask = async (req) => {

	const {
		title,
		description,
		asset,
		system,
		location,
		owner,
		relatedUsers,
		steps,
		schedule,
		isUsingSteps,
		isSequential,
		isRepeatable,
		createdBy,
	} = req.body;

	let initStatus = await Status.findOne({ module: 'tasks', order: 1 });

	const task = new Task({
		tenant: req.user.tenant,
		title,
		description,
		asset: asset || null,
		system: system || null,
		location: location || null,
		owner,
		relatedUsers: JSON.parse(relatedUsers),
		steps: JSON.parse(steps),
		isUsingSteps,
		isSequential,
		isRepeatable,
		schedule: schedule ? JSON.parse(schedule) : [],
		isRepeatActive: false,
		instances: [],
		createdBy,
		status: initStatus,
		images: [],
		comments: []
	});

	let savedTask = await task.save();

	const urls = await uploadFilesToBlob(req.files, 'images');

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
		location,
		owner,
		steps,
		isUsingSteps,
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

	const urls = await uploadFilesToBlob(req.files, 'images');

	return await Task.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			description,
			asset,
			system,
			location,
			owner,
			steps: JSON.parse(steps),
			isUsingSteps,
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
		{ path: 'location' },
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

export const getTasks = async (req, additionalFilters) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	const addQuery = {
		...getTasksQueryParams({ ...filters, ...additionalFilters}),
		...getRelatedQuery(permLevel, userId),
	};

	return Task.find({ tenant: tenant, ...addQuery }).populate([
		{ path: 'asset' },
		{ path: 'system' },
		{ path: 'owner', select: 'firstName lastName phoneNumber avatar' },
		{ path: 'status' },
		{ path: 'instances' }
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
	
	const st = await Status.findOne({ _id: status }); 
	let toUpdate = {
		status, lastUpdatedBy: req.user._id
	};
	if (st.state === 'close') {
		toUpdate.closedDate = new Date();
	};

	return await Task.findOneAndUpdate(
		{ _id: taskId },
		{ ...toUpdate },
		{ new: true }
	).populate('status');
};

export const addTaskComment = async (req) => {
	const { taskId, userId, text } = req.body;
	let newURL = null;

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

	if (req.file) {
		let uploaded = await uploadFilesToBlob([req.file], "images");
		if (uploaded.length) {
			newURL = uploaded[0];
		}
	}

	const comment = new Comment({
		parentObject: taskId,
		user: userId,
		text: text,
		image: newURL
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
		if (entry[1] === null || entry[1] === undefined) {
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
		{ schedule, lastUpdatedBy: req.user._id, isRepeatActive: Boolean(schedule.length) },
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

export const syncRepeatableTasks = async () => {
	const tasks = await Task.find({ isRepeatActive: true, isRepeatable: true });
	tasks.forEach(task => {
		task.schedule.forEach(sc => {
			if (evaluateTaskSchedule(sc)) {
				createTaskFormTemplate(task);
			}		
		})
	})
}

export const evaluateTaskSchedule = (schedule) => {
	const currentDateParts = getDateParts(new Date());
	const startDateParts = getDateParts(parseISO(schedule.startDate));
	return (
		schedule.interval === 'day' ||
		( schedule.interval === 'week' && currentDateParts.weekDay == startDateParts.weekDay ) ||
		( schedule.interval === 'month' && currentDateParts.day == startDateParts.day ) ||
		( schedule.interval === 'year' && currentDateParts.yearDay == startDateParts.yearDay )
	)
}

export const createTaskFormTemplate = async (taskTemplate) => {
	
	const { tenant, title, description, asset, system, owner, relatedUsers, steps, isUsingSteps, createdBy, images } = taskTemplate;
	let initStatus = await Status.findOne({ module: 'tasks', order: 1 });

	const task = new Task({
		tenant,
		title,
		description,
		asset,
		system,
		owner,
		relatedUsers,
		steps,
		isUsingSteps,
		createdBy,
		status: initStatus,
		images
	});

	const savedTask = await task.save();
	await Task.findOneAndUpdate({ _id: taskTemplate._id }, { $push: { instances: savedTask._id } });
}

export const completeTaskStep = async (req) => {
	const { taskId, order, isCompleted } = req.body;
	
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

	return await Task.findOneAndUpdate({ _id: taskId},
		{ $set: { "steps.$[el].isCompleted": isCompleted }},
		{ 
			arrayFilters: [{ "el.order": order }],
			new: true,
			useFindAndModify: false
		}		
	
	)
}
