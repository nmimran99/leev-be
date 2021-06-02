import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import Location from '../models/location';

export const createLocation = async (req) => {
    const { asset, name, relatedUsers } = req.body;

    const location = new Location({
        name,
        asset,
        relatedUsers,
        createdBy: req.user._id
    });

    return await location.save();
}

export const updateLocation = async (req) => {
    const { locationId, asset, name, relatedUsers } = req.body;
    
    const isRelated = await isUserRelated(
		"locations",
		Location,
		locationId,
		req.user._id,
		req.headers.permLevel
	);

    if (!isRelated) {
		return getUnauthorizedMessage();
	}

    return await Location.findOneAndUpdate({ _id: locationId}, {
        name,
        asset,
        relatedUsers
    },{
        new: true,
        useFindAndModify: false
    })
    .populate([
        {
            path: 'relatedUsers',
            select: 'firstName lastName phoneNumber role avatar',
            popualte: 'role'
        }
    ]);
}

export const checkLocationName = async (req) => {
    const { asset, name } = req.body;

    const location = await Location.find({ asset, name });
    return Boolean(location.length);
}

export const getAssetLocations = async (req) => {
    const { assetId } = req.body;

    return await Location.find({ asset: assetId }).populate([
        {
            path: 'relatedUsers',
            select: 'firstName lastName phoneNumber role avatar',
            popualte: 'role'
        }
    ]);
}

export const getLocationData = async (req) => {
    const { locationId } = req.body;

    return await Location.findOne({ _id: locationId})
    .populate([
        {
            path: 'relatedUsers',
            select: 'firstName lastName avatar role phoneNumber',
            populate: 'role'
        }
    ])

}