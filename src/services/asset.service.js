import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import Asset from '../models/asset';
import System from '../models/system';
import { geoCode } from './geocoder.service';

export const createAsset = async (req) => {
	const { tenant, userId, address, owner, type, addInfo } = req.body;

	const coordinates = await geoCode(getAddress(address));
	let asset = new Asset({
		tenant: tenant,
		address: { ...address },
		owner,
		type,
		addInfo,
		createdBy: userId,
		coordinates,
	});

	return await asset.save();
};

export const getAddress = (address) => {
	return {
		address: `${address.street} ${address.streetNumber}${
			address.entrance || ''
		}, ${address.city}`,
		country: address.country,
	};
};

export const updateAsset = async (req) => {
	const { assetId, owner, address, addInfo, type } = req.body;

	const isRelated = await isUserRelated(
		'assets',
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	return await Asset.findOneAndUpdate(
		{ _id: assetId },
		{ owner, address, addInfo, type },
		{ new: true }
	);
};

export const updateAssetOwner = async (req) => {
    const { assetId, owner } = req.body;
    
    const isRelated = await isUserRelated(
		'assets',
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
    }
    
	return await Asset.findOneAndUpdate(assetId, { owner }, { new: true });
};

export const updateAssetType = async (req) => {
    const { assetId, type } = req.body;
    
    const isRelated = await isUserRelated(
		'assets',
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
    }
    
	return await Asset.findOneAndUpdate(assetId, { type }, { new: true });
};

export const getAssets = async (req) => {
    const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	const addQuery = {
		...getAssetsQueryParams(filters),
		...getRelatedQuery(permLevel, userId),
    };
    
	return await Asset.find({ tenant, ...addQuery }).populate('owner');
};

export const getAsset = async (req) => {
    const { assetId, plain } = req.body;
    
    const isRelated = await isUserRelated(
		'assets',
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
    );

    
	if (!isRelated) {
		return getUnauthorizedMessage();
    }
    
	if (plain) {
		return await Asset.findOne({ _id: assetId });
	}
	return await Asset.findOne({ _id: assetId }).populate('owner');
};

export const removeAsset = async (req) => {
	const { assetId } = req.body;
	return await Asset.findOneAndDelete({ _id: assetId });
};

export const getAssetsQueryParams = (query) => {
	if (!query) return {};
	delete query.sortBy;
	delete query.sortOrder;

	Object.entries(query).forEach((entry) => {
		if (!entry[1]) {
			delete query[entry[0]];
		}
	});

	if (query.asset) {
		query._id = query.asset;
	}
	if (query.assets) {
		query._id = { $in: query.assets };
	}
	return query;
};

export const getAssetExternal = async (req) => {
	const { assetId } = req.body;
	
	try {
		const asset = await Asset.findOne({ _id: assetId }, 'address');
		const systems = await System.find({ asset: asset._id }, 'name');

		return { asset, systems: systems.length ? systems : null };
	} catch(e){
		return { error: true, reason: 'asset or systems not found', status: 200 };
	}

}