import { getStatusIds } from './status.service';
import { getAssets } from './asset.service';
import { getFaults } from './fault.service';
import { getTasks } from './task.service';

export const getMapData = async (req) => {
    let assets = await getAssets(req);
    
	req.body.filters = getMapFilters(req, 'faults');
    const faults = await getFaults(req);

	req.body.filters = getMapFilters(req, 'tasks');
    const tasks = await getTasks(req);
    
	return {
		assets,
		faults,
		tasks,
	};
};

export const getMapFilters = async (req, module) => {
    if (!req.body.filters) return;
    let { filters } = req.body;
    
    if (filters[module]) {
		filters.status =
			filters[module].status || (await getStatusIds('faults', 'open'));
    }
    return filters;
}
