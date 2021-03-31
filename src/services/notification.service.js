import Notification from '../models/notification';
import User from '../models/user';
import StatusList from '../models/status'
import { get } from 'mongoose';


export const createNotification = async (data) => {
    if (data.operationType === 'update') {
        const { updatedFields } = data.updateDescription; 
        if (updatedFields.hasOwnProperty('status')) {
            createStatusUpdateNotification(data)
        } else if (updatedFields.hasOwnProperty('owner')) {
            createOwnerChangeNotification(data)
        }
    }
};

export const createOwnerChangeNotification = async (data) => {

    const owner = await User.findOne({ _id: data.updateDescription.updatedFields.owner }, 'firstName lastName')
    const actionBy = data.updateDescription.updatedFields.lastUpdatedBy || data.fullDocument.lastUpdatedBy;
    const distributionList = await getDistributionList(data);

    console.log(distributionList);

    const notification = new Notification({
        tenant: data.fullDocument.tenant,
        user: data.fullDocument.owner,
        actionType: 'ownerChange',
        actionOn: {
            obejctType: data.ns.coll,
            internalId: data.documentKey._id,
            externalId: data.fullDocument[`${data.ns.coll.slice(0, -1)}Id`]
        },
        actionBy,
        data: {
            owner    
        },
        read: false
    })

    return await notification.save();
}

export const createStatusUpdateNotification = async (data) => {

    const status = await StatusList.findOne({ _id: data.updateDescription.updatedFields.status });

    const notification = new Notification({
        tenant: data.fullDocument.tenant,
        user: data.fullDocument.owner,
        actionType: 'statusUpdate',
        actionOn: {
            obejctType: data.ns.coll,
            internalId: data.documentKey._id,
            externalId: data.fullDocument[`${data.ns.coll.slice(0, -1)}Id`]
        },
        actionBy: data.updateDescription.updatedFields.lastUpdatedBy || data.fullDocument.lastUpdatedBy,
        data: {
            statusName: status.statusId
            
        },
        read: false
    })

    return await notification.save();
}

export const getNotifications = async (req) => {
    const { page } = req.body;
    const { _id, tenant } = req.user;

    return await Notification.find({ tenant, user: _id })
    .sort({ createdAt: -1 })
    .skip( page * 15 || 0 )
    .limit(15)
    .populate({ path: 'actionBy', select: 'firstName lastName avatar'});
}

export const updateNotificationRead = async (req) => {
    const { notificationId, read } = req.body;
    return await Notification.findOneAndUpdate({ _id: notificationId }, { read }, { new: true});
}

export const getDistributionList = (data) => {
    return new  Promise((resolve,reject) => {
        let dist = [];
        const actionBy = data.updateDescription.updatedFields.lastUpdatedBy || data.fullDocument.lastUpdatedBy;
        const relatedUsers = data.fullDocument.relatedUsers || data.fullDocument.following;
        relatedUsers.forEach(r => {
            if (r !== actionBy) {
                dist.push(r)
            }
        });
        if (actionBy !== data.fullDocument.owner) {
            dist.push(data.fullDocument.owner);
        }
        resolve(dist);
    })
    
}