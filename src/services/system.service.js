import System from '../models/system';


export const createSystem = async (req) => {
    const { assetId, owner, linkedUsers, name  } = req.body;
    let system = new System({
       name, 
       site: assetId,
       owner,
       linkedUsers
    })

    return await system.save();
}


export const getSystems = async (req) => {
    const { assetId } = req.body;
    return await System.find({ site: assetId}).populate([{ path: 'owner', select: 'firstName lastName phoneNumber'}, { path: 'site'}, {path: 'linkedUsers'}])
}

export const removeSystem = async (req) => {
    const { systemId } = req.body;
    return await System.findOneAndDelete({ _id: systemId })
}

export const editSystemName = async (req) => {
    const { systemId, name, owner } = req.body;
    return await System.findOneAndUpdate({_id: systemId}, {name: name, owner: owner}, {
        new: true
    });
}

export const addUsers = async (req) => {
    const { systemId, users } = req.body;
    return await System.findOneAndUpdate({_id: systemId}, { linkedUsers: users}, { new: true}).populate([{ path: 'owner', select: 'firstName lastName phoneNumber'}, { path: 'site'}, {path: 'linkedUsers'}]);
}

export const addUser = async (req) => {
    const { systemId, userId } = req.body;
    return await System.findOneAndUpdate({_id: systemId}, { $push: { 'linkedUsers': userId} }, { new: true}).populate([{ path: 'owner', select: 'firstName lastName phoneNumber'}, { path: 'site'}, {path: 'linkedUsers'}]);
}

export const updateSystemOwner = async (req) => {
    const { systemId, owner} = req.body;
    return await System.findOneAndUpdate({_id: systemId}, { owner: owner}, { new: true});
}

export const updateSystemName = async (req) => {
    const { systemId, name} = req.body;
    return await System.findOneAndUpdate({_id: systemId}, { name: name}, { new: true});
}

export const removeUser = async (req) => {
    const { systemId, userId} = req.body;
    return await System.findOneAndUpdate({_id: systemId}, { $pull: { 'linkedUsers': userId }}, { new: true}).populate([{ path: 'owner', select: 'firstName lastName phoneNumber'}, { path: 'site'}, {path: 'linkedUsers'}]);
}

export const getSystemsOptions = async (req) => {
    return await System.find({}, '_id name');
}