import * as taskService from '../services/task.service';

export const createTask = async (req, res) => {
	try {
		let data = await taskService.createTask(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const getTask = async (req, res) => {
	try {
		let data = await taskService.getTask(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const updateTask = async (req, res) => {
	try {
		let data = await taskService.updateTask(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const deleteTask = async (req, res) => {
	try {
		let data = await taskService.deleteTask(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const getTasks = async (req, res) => {
	try {
		let data = await taskService.getTasks(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const updateTaskOwner = async (req, res) => {
	try {
		let data = await taskService.updateTaskOwner(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const updateTaskStatus = async (req, res) => {
	try {
		let data = await taskService.updateTaskStatus(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const addTaskComment = async (req, res) => {
	try {
		let data = await taskService.addTaskComment(req);
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};
export const deleteTaskComment = async (req, res) => {
	try {
		let data = await taskService.deleteTaskComment(req);
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const updateTaskComment = async (req, res) => {
	try {
		let data = await taskService.updateTaskComment(req);
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const addRelatedUser = async (req, res) => {
	try {
		let data = await taskService.addRelatedUser(req);
		return res.status(200).send(data);
	} catch (e) {
        console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const removeRelatedUser = async (req, res) => {
	try {
		let data = await taskService.removeRelatedUser(req);
		return res.status(200).send(data);
	} catch (e) {
        console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const updateTaskSchedule = async (req, res) => {
	try {
		let data = await taskService.updateTaskSchedule(req);
		return res.status(200).send(data);
	} catch (e) {
        console.log(e.message);
		return res.status(500).send(e.message);
	}
};
