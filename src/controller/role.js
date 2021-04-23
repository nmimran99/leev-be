import * as roleService from '../services/role.service';

export const getRole = async (req, res) => {
	try {
		let data = await roleService.getRole(req);
		if (data.error) {
			return res.status(403).send('unauthorized');
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const createRole = async (req, res) => {
	try {
		let data = await roleService.createRole(req);
		if (data.error) {
			return res.status(403).send('unauthorized');
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const updateRole = async (req, res) => {
	try {
		let data = await roleService.updateRole(req);
		if (data.error) {
			return res.status(403).send('unauthorized');
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};
