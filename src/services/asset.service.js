import Asset from '../models/asset';
import User from '../models/user'

export const createAsset = async (req) => {
    const { tenantId, userId, address, owner, type, addInfo  } = req.body;

    let asset = new Asset({
        tenant: tenantId,
        address: { ...address },
        owner,
        type,
        addInfo,
        createdBy: userId,
    })

    return await asset.save();
}

export const updateAsset = async(req) => {
    const { assetId, owner, address, addInfo, type } = req.body;
    return await Asset.findOneAndUpdate( { _id: assetId }, { owner, address, addInfo, type }, { new: true });
}

export const updateAssetOwner = async(req) => {
    const { assetId, owner } = req.body;
    return await Asset.findOneAndUpdate(assetId, { owner }, { new: true });
}

export const updateAssetType = async(req) => {
    const { assetId, type } = req.body;
    return await Asset.findOneAndUpdate(assetId, { type }, { new: true });
}

export const getAssets = async (req) => {
    const { tenant, assets } = req.body;
    return await Asset.find( assets ? { tenant: tenant, _id: { $in: req.body.assets}} : { tenant: tenant }).populate('owner');  
}

export const getAsset = async (req) => {
    const { assetId, plain } = req.body;
    if (plain) {
        return await Asset.findOne({_id: assetId});
    }
    return await Asset.findOne({_id: assetId}).populate('owner');
}

export const removeAsset = async (req) => {
    const { assetId } = req.body;
    return await Asset.findOneAndDelete({_id: assetId})
}

