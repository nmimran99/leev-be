import Log from './log.model';

export const logChanges = async (data) => {
    let actionType, actionBy, itemId;
    let module = data.ns.coll; 
    let itemIdentifier = data.documentKey._id;
    let payload = {};

    const createLogEntry = (le) => {
        return new Log({
            tenant: data.fullDocument.tenant,
            actionBy: le.actionBy,
            actionType: le.actionType,
            operationType: data.operationType,
            itemData: {
                module,
                itemId: le.itemId,
                itemIdentifier
            },
            payload 
        });
    }

    if (data.operationType === 'update') {
		const { updatedFields } = data.updateDescription;
        actionBy = data.updateDescription.updatedFields.lastUpdatedBy || data.fullDocument.lastUpdatedBy;
        console.log(updatedFields)
		itemId = data.fullDocument[`${data.ns.coll.slice(0, -1)}Id`];
        Promise.all(Object.entries(updatedFields).map( async entry => {
			let key = entry[0];
            let val = entry[1];
			if (key === 'status') {
				actionType = 'statusChange'
                payload[key] = val;
			} else if (key === 'owner') {
				actionType = 'ownerChange'
                payload[key] = val;
			} else if (key.includes('comments')) {
				data.updateDescription.updatedFields.comment = entry[1];
				actionType = 'addComment';
                payload['comment'] = val;
			} else if (key.includes('relatedUsers')) {
				data.updateDescription.updatedFields.relatedUser = entry[1];
				actionType = 'relatedUserAdded';
                payload['relatedUser'] = val;
            } else if (['updatedAt', 'image', 'lastUpdatedBy'].includes(key)){
                return;
			} else {
                payload[key] = val;
                actionType = 'detailsUpdate'
            }
            const logEntry = createLogEntry({ actionBy, actionType, payload, itemId})
            return await logEntry.save();
		}));
        return;
	} else if (data.operationType === 'insert') {
		actionType = 'itemCreated';
        actionBy = data.fullDocument.createdBy;
        payload.document = data.fullDocument;
        itemId = data.fullDocument[`${data.ns.coll.slice(0, -1)}Id`];
        const logEntry = createLogEntry({ actionBy, actionType, payload, itemId})
        return await logEntry.save();
	}
}

export const logDeletion = async (props, actionBy, module) => {
    const { tenant, itemId, _id: itemIdentifier } = props;
    let logEntry = new Log({
        tenant,
        actionBy,
        actionType: 'itemDeleted',
        operationType: 'delete',
        itemData: {
            module,
            itemId,
            itemIdentifier
        },
        payload: props
    });

    return await logEntry.save();
}