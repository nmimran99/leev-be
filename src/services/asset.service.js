import Asset from '../models/asset';
import User from '../models/user'

export const createAsset = async (req) => {
    const { tenantId, userId, country, province, city, street, streetNumber, entrance, zipcode, owner, type, addInfo  } = req.body;
    let asset = new Asset({
        tenant: tenantId,
        address: {
            country,
            province,
            city,
            street,
            streetNumber,
            entrance,
            zipcode,
        },
        owner,
        type,
        addInfo,
        createdBy: userId,
    })

    return await asset.save();
}

export const updateAssetAddress = async(req) => {
    const { assetId, address, addInfo, type } = req.body;
    return await Asset.findOneAndUpdate( { _id: assetId }, { address, addInfo, type }, { new: true });
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
    const { assets } = req.body;
    return await Asset.find( assets ? { _id: { $in: req.body.assets}} : {}).populate('owner');  
}

export const getAsset = async (req) => {
    const { assetId } = req.body;
    return await Asset.findOne({_id: assetId}).populate('owner');
}

export const removeAsset = async (req) => {
    const { assetId } = req.body;
    return await Asset.findOneAndDelete({_id: assetId})
}

