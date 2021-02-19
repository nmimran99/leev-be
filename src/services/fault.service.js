import Fault from '../models/fault';
import Comment from '../models/comment';
import { relocateFile } from '../api/generic';

export const createFault = async (req) => {
    const { title, description, asset, system, owner, createdBy  } = req.body;
    let images = [];
    if (req.files.length) { 
        req.files.forEach(f => {
            images.push(f.filename)
        })
    }

    let fault = new Fault({
       title,
       description, 
       asset,
       system,
       owner,
       status: { statusId: 'ready', state: 'open', order: '1'},
       createdBy,
       images,
       comments: [] 
    })

    let savedFault = await fault.save();
    if (!savedFault.images.length) return savedFault;
    await Promise.all(savedFault.images.map(async (image, index) => {
        let newURL = await relocateFile(image, savedFault._id, 'faults');
        savedFault.images[index] = newURL;
    }));
    return await Fault.findOneAndUpdate({ _id: savedFault._id}, {images: savedFault.images}, { new: true} )


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
    const { faultId, title, description, asset, system } = req.body;
    return await Fault.findOneAndUpdate( { _id: faultId }, { title, description, asset, system }, { new: true })
        .populate([
            { path: 'owner', select: 'firstName lastName phoneNumber' },
            { path: 'asset' },
            { path: 'system' }
        ]);
}

export const getMinifiedFaults = async (req) => {
    const { filters } = req.body;
    let query = getFaultsQueryParams(filters);
    const faults = await Fault.find(query)
    .populate([
        { path: 'owner', select: 'firstName lastName phoneNumber avatar' },
        { path: 'asset' }
    ]);

    return Promise.resolve(faults);
    
}

export const getFaults = async (req) => {
    const { filters } = req.body;
    let query = getFaultsQueryParams(filters);
    return await Fault.find(query)
    .populate([
        { path: 'owner', select: 'firstName lastName phoneNumber avatar' },
        { path: 'asset' },
        { path: 'system' },
        { path: 'following', select: 'firstName lastName phoneNumber avatar' },
        { path: 'comments', populate: { path: 'user', model: 'User' , select: 'firstName lastName avatar' }}
    ]);
}

export const getFault = async (req) => {
    const { faultId } = req.body;

    return await Fault.findOne({faultId: faultId })
    .populate([
        { path: 'owner', select: 'firstName lastName phoneNumber avatar' },
        { path: 'asset' },
        { path: 'system' },
        { path: 'following', select: 'firstName lastName phoneNumber avatar' },
        { path: 'comments', populate: { path: 'user', model: 'User' , select: 'firstName lastName avatar' }}
    ]);
    
}

export const getFaultsQueryParams = (query) => {
    delete query.sortBy;
    delete query.sortOrder;
    delete query.viewType;

    if (query.status) {
        query.status = { $in: query.status}
    }

    
    return query;
}

export const addFaultComment = async (req) => {
    const { faultId, userId, commentText } = req.body;
    const comment = new Comment({
        parentObject: faultId,
        user: userId,
        text: commentText
    });
        
    let comm = await comment.save();
    return await Fault.findOneAndUpdate(
        faultId, 
        { 
            $push: { 
                comments: comm
            }
        },
        {
            new: true,
            upsert: true
        }
    ).populate({
        path: 'comments'
    });  
}

export const deleteFaultComment = async (req) => {
    const { faultId, commentId } = req.body;
    return findOne
}

