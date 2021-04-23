import { getStatusIds, getStatusList } from './status.service';
import { getAssets } from './asset.service';
import { getFaults } from './fault.service';
import { getTasks } from './task.service';

export const getMapData = async (req) => {
	try {
		const faults = await getMapFaults(req);
		const tasks = await getMapTasks(req);
		const assets = await getMapAssets(req);

		return {
			assets,
			faults,
			tasks,
		};
	} catch(e) {
		console.log(e.message);
		return null;
	}
};

export const getMapAssets = async (req) => { 
	let { filters } = req.body
	if (filters.asset) {
		filters._id = filters.asset;
		delete filters.asset;
	}
	return await getAssets(req);
} 

export const getMapFaults = async (req) => {
	return await getFaults(req);
}  

export const getMapTasks = async (req) => { 
	return await getTasks(req);
} 