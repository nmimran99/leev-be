import Site from '../models/site';
import User from '../models/user'

export const createSite = async (req) => {
    const { userId, country, province, city, street, streetNumber, entrance, zipcode, owner, type, addInfo  } = req.body;
    let site = new Site({
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

    return await site.save();
}

export const updateSiteAddress = async(req) => {
    const { siteId, address, addInfo, type } = req.body;
    return await Site.findOneAndUpdate( { _id: siteId }, { address, addInfo, type }, { new: true });
}

export const updateSiteOwner = async(req) => {
    const { siteId, owner } = req.body;
    return await Site.findOneAndUpdate(siteId, { owner }, { new: true });
}

export const updateSiteType = async(req) => {
    const { siteId, type } = req.body;
    return await Site.findOneAndUpdate(siteId, { type }, { new: true });
}

export const getSites = async (req) => {
    const { sites } = req.body;
    return await Site.find( sites ? { _id: { $in: req.body.sites}} : {}).populate('owner');  
}

export const getSite = async (req) => {
    const { siteId } = req.body;
    return await Site.findOne({_id: siteId}).populate('owner');
}

export const removeSite = async (req) => {
    const { siteId } = req.body;
    return await Site.findOneAndDelete({_id: siteId})
}

