
export const authorize = (req, res, next) => {

	const { requesttype, module } = req.headers;
    const { role } = req.user;
    
    const modulePermissions = role.permissions.find((p) => p.module === module);
	const permLevel = modulePermissions[requesttype];
	console.log(requesttype, permLevel)
	if (permLevel < getMinPermLevel(requesttype)) {
		return res.status(403).send({ error: true, status: 403, reason: 'unauthorized' });
    }
    
	req.headers.permLevel = permLevel;
	next();
};

export const getMinPermLevel = (requesttype) => {
	const types = {
		create: 2,
		update: 1,
		delete: 2,
		read: 1,
		changeOwner: 1,
		changeStatus: 1,
		changeRelatedUsers: 1,
		changeSchedule: 1,
		comment: 1,
		upload: 2,
		download: 2,
	};
	return types[requesttype];
};

export const isUserRelated = async (type, schemaObject, itemId, userId, permLevel) => {
	if (permLevel === 2) return true;
	try {
		const condition = itemId.match(/^[0-9a-fA-F]{24}$/) ? { _id: itemId } : { [type.slice(0,-1) + 'Id']: itemId };
		const item = await schemaObject.findOne(condition, `owner ${['faults', 'tasks'].includes(type) ? 'relatedUsers' : ''}`);
		if (item) {
			if (item.relatedUsers) {
				if (item.relatedUsers.includes(userId)){
					return true;
				}
			}
			return item.owner ? item.owner.equals(userId) : false;
		}
		return false;
	} catch(e) {
		console.log(e.message);
		return false;
	}
   
}

export const getRelatedQuery = (permLevel, userId) => {
	if (permLevel === 1) {
		return {
			$or: [
				{ owner: userId},
				{ relatedUsers: userId }
			]
		};
	}
	return {};
}	
