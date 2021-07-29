import * as faultService from "../services/fault.service";

export const createFault = async (req, res) => {
	try {
		let data = await faultService.createFault(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const deleteFault = async (req, res) => {
	try {
		let data = await faultService.deleteFault(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const updateRelatedUsers = async (req, res) => {
	try {
		let data = await faultService.updateRelatedUsers(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const updateFaultOwner = async (req, res) => {
	try {
		let data = await faultService.updateFaultOwner(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const addRelatedUser = async (req, res) => {
	try {
		let data = await faultService.addRelatedUser(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const removeRelatedUser = async (req, res) => {
	try {
		let data = await faultService.removeRelatedUser(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const updateFaultData = async (req, res) => {
	try {
		let data = await faultService.updateFaultData(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const getFaults = async (req, res) => {
	try {
		let data = await faultService.getFaults(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};

export const getFault = async (req, res) => {
	try {
		let data = await faultService.getFault(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const addFaultComment = async (req, res) => {
	try {
		let data = await faultService.addFaultComment(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};
export const deleteFaultComment = async (req, res) => {
	try {
		let data = await faultService.deleteFaultComment(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const updateFaultComment = async (req, res) => {
	try {
		let data = await faultService.updateFaultComment(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const changeFaultStatus = async (req, res) => {
	try {
		let data = await faultService.changeFaultStatus(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const getFaultOptions = async (req, res) => {
	try {
		let data = await faultService.getFaultOptions(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const assignUserToExternalFault = async (req, res) => {
	try {
		let data = await faultService.assignUserToExternalFault(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const addFaultTag = async (req, res) => {
	try {
		let data = await faultService.addFaultTag(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const removeFaultTag = async (req, res) => {
	try {
		let data = await faultService.removeFaultTag(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const getFaultTagOptions = async (req, res) => {
	try {
		let data = await faultService.getFaultTagOptions(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

export const createTag = async (req, res) => {
	try {
		let data = await faultService.createTag(req);
		if (!data) {
			return res.status(200).send(null);
		}
		if (data.error) {
			return res.status(data.status).send(data.reason);
		}
		return res.status(200).send(data);
	} catch (e) {
		return res.status(500).send(e.message);
	}
};

