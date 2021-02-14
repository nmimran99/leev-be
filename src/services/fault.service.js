import Fault from '../models/fault';

export const createFault = async (req) => {
    const { title, description, site, system, owner, createdBy  } = req.body;
    let fault = new Fault({
       title,
       description, 
       site,
       system,
       owner,
       status: 'ready',
       createdBy
    })

    return await fault.save();
}

export const deleteFault = async (req) => {
    const { faultId } = req.body;
    return await Fault.findOneAndDelete({ _id: faultId});
}

export const updateFollowingUsers = async (req) => {
    const { faultId, following } = req.body;
    return await Fault.findOneAndUpdate( { _id: faultId }, { following: following }, { new: true }).populate([{ path: 'following', select: 'firstName lastName phoneNumber' }]);
}

export const updateFaultOwner = async (req) => {
    const { faultId, userId } = req.body;
    return await Fault.findOneAndUpdate( { _id: faultId }, { owner: userId }, { new: true }).populate([{ path: 'owner', select: 'firstName lastName phoneNumber' }]);
}

export const updateFaultData = async (req) => {
    const { faultId, title, description, site, system } = req.body;
    return await Fault.findOneAndUpdate( { _id: faultId }, { title, description, site, system }, { new: true })
        .populate([
            { path: 'owner', select: 'firstName lastName phoneNumber' },
            { path: 'site' },
            { path: 'system' }
        ]);
}

export const getFaults = async (req) => {
    const { filters } = req.body;
    let query = getFaultsQueryParams(filters);
    return await Fault.find(query)
    .populate([
        { path: 'owner', select: 'firstName lastName phoneNumber' },
        { path: 'site' },
        { path: 'system' },
        { path: 'following', select: 'firstName lastName phoneNumber' }
    ])
}

export const getFaultsQueryParams = (query) => {
    delete query.sortBy;
    delete query.sortOrder;
    delete query.viewType;

    if (query.status) {
        query.status = { statusId: query.status}
    }
    
    return query;
}