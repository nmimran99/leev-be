import { getRelatedQuery, isUserRelated } from "../middleware/authorize";
import Asset from "../models/asset";
import System from "../models/system";
import Task from "../models/task";
import Fault from "../models/fault";
import Location from "../models/location";
import { geoCode } from "./geocoder.service";
import { getStatusIds } from "./status.service";
import User from "../models/user";

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
			address.entrance || ""
		}, ${address.city}`,
		country: address.country,
	};
};

export const updateAsset = async (req) => {
	const { assetId, owner, address, addInfo, type } = req.body;

	const isRelated = await isUserRelated(
		"assets",
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
		"assets",
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
		"assets",
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

	return await Asset.find({ tenant, ...addQuery }).populate("owner");
};

export const getAsset = async (req) => {
	const { assetId, plain } = req.body;

	const isRelated = await isUserRelated(
		"assets",
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
	return await Asset.findOne({ _id: assetId }).populate([
		{ path: "owner", populate: "role" },
	]);
};

export const getAssetExtended = async (req) => {
	const { assetId } = req.body;

	const isRelated = await isUserRelated(
		"assets",
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
	}

	let asset = await Asset.findOne({ _id: assetId }).populate([
		{
			path: "owner",
			select: "firstName lastName phoneNumber role avatar",
			populate: "role",
		},
	]);

	return asset;
};

export const getAssetData = async (req) => {
	const { assetId, module } = req.body;

	const faultStatuses = await getStatusIds("faults", "open");
	const taskStatuses = await getStatusIds("tasks", "open");

	const isRelated = await isUserRelated(
		"assets",
		Asset,
		assetId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return getUnauthorizedMessage();
	}
	let results = {};

	try {
		if (module === "systems") {
			results.systems = await System.find({ asset: assetId }).populate([
				{
					path: "owner",
					select: "_id firstName lastName phoneNumber role avatar",
					populate: "role",
				},
				{
					path: "relatedUsers",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
			]);
		}
		if (module === "tasks") {
			results.tasks = await Task.find({
				asset: assetId,
				status: { $in: taskStatuses },
			}).populate([
				{
					path: "owner",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
				{
					path: "relatedUsers",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
				{
					path: "status",
				},
			]);
		}
		if (["faults", "systems", "locations"].includes(module)) {
			results.faults = await Fault.find({
				asset: assetId,
				status: { $in: faultStatuses },
			}).populate([
				{
					path: "owner",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
				{
					path: "relatedUsers",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
				{
					path: "status",
				},
			]);
		}
		if (module === "locations") {
			results.locations = await Location.find({ asset: assetId }).populate([
				{
					path: "relatedUsers",
					select: "firstName lastName phoneNumber role avatar",
					populate: "role",
				},
			]);
		}
		if (module === "residents") {
			results.residents = await User.find({
				'data.asset': assetId,
				$or: [{ "data.isResident": true }, { "data.isOwner": true }],
			}).populate(
				{
					path: "data.location",
					model: 'Location'
				}
			);
		}
	} catch (e) {
		console.log(e.message);
	}

	return results;
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

	if (query.searchText) {
		delete query.searchText
	}
	return query;
};

export const getAssetExternal = async (req) => {
	const { assetId } = req.body;

	try {
		const asset = await Asset.findOne({ _id: assetId }, "address tenant").populate('tenant');
		const systems = await System.find({ asset: asset._id }, "name");
		const locations = await Location.find({ asset: assetId }, "name");

		return {
			asset,
			systems: systems.length ? systems : [],
			locations: locations.length ? locations : [],
		};
	} catch (e) {
		return { error: true, reason: "asset or systems not found", status: 200 };
	}
};
export const checkAssetOwnership = async (userId) => {
	const arr = await Asset.find({ owner: userId });
	return Boolean(arr.length);
};
