import Fault from "../models/fault";
import Comment, { populate } from "../models/comment";
import Asset from "../models/asset";
import System from "../models/system";
import { removeDuplicateObjectIds } from "../api/generic";
import Status from "../models/status";
import { isUserRelated, getRelatedQuery } from "../middleware/authorize";
import User from "../models/user";
import { uploadFilesToBlob } from "../api/blobApi";
import { getAddress } from "./asset.service";
import i18next from "i18next";
import { sendMail } from "../smtp/mail";
import Tag from "../models/tag";


export const createFault = async (req) => {
	let { title, description, asset, system, owner, relatedUsers, location, tags } = req.body;

	let createdBy = null;
	tags = JSON.parse(tags);
	relatedUsers = JSON.parse(relatedUsers);
	let initStatus = await Status.findOne({ module: "faults", order: 1 });
	let assetData = await Asset.findOne({ _id: asset }, "tenant owner");
	let systemData = await System.findOne({ _id: system }, "owner");

	if (req.user) {
		createdBy = req.user._id;
	} else {
		let systemUser = await User.findOne({ email: "system@leev.co.il" });
		createdBy = systemUser._id;
	}

	let relatedUsersArr = [];
	if (assetData) relatedUsersArr.push(assetData.owner);
	if (systemData) relatedUsersArr.push(systemData.owner);
	if (!owner) {
		owner = systemData.owner;
	}
	relatedUsersArr = removeDuplicateObjectIds(
		relatedUsersArr.filter((v) => v.toString() !== owner.toString())
	);

	if (!title) {
		title = `${description.substr(0, 40)}...`;
	}

	let fault = new Fault({
		tenant: req.user ? req.user.tenant : assetData.tenant,
		title,
		description,
		asset,
		system,
		location,
		owner: owner || assetData.owner,
		relatedUsers: relatedUsers || relatedUsersArr,
		status: initStatus._id,
		createdBy,
		lastUpdatedBy: createdBy,
		closedDate: null,
		images: [],
		comments: [],
		tags
	});

	try {
		let savedFault = await fault.save();
	
		const urls = await uploadFilesToBlob(req.files, "images");
		await modifyTagMentions(savedFault._id, tags, [], createdBy);
		
		return await Fault.findOneAndUpdate(
			{ _id: savedFault._id },
			{ images: urls },
			{ new: true }
		);
	} catch (e) {
		console.log(e.message);
		return
	}
	
};

export const deleteFault = async (req) => {
	const { faultId } = req.body;

	return await Fault.findOneAndDelete({ _id: faultId });
};

export const updateRelatedUsers = async (req) => {
	const { faultId, relatedUsers } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ relatedUsers: relatedUsers, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: "relatedUsers",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
	]);
};

export const addRelatedUser = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $push: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: "relatedUsers",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
	]);
};

export const removeRelatedUser = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ $pull: { relatedUsers: userId }, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: "relatedUsers",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
	]);
};

export const updateFaultOwner = async (req) => {
	const { faultId, userId } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	const fault = await Fault.findOne({ _id: faultId });
	let relatedUsers = fault.relatedUsers;
	if (relatedUsers.includes(userId)) {
		relatedUsers = relatedUsers.filter((f) => f != userId);
	}
	relatedUsers.push(fault.owner);

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{ owner: userId, relatedUsers, lastUpdatedBy: req.user._id },
		{ new: true }
	).populate([
		{
			path: "owner",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
	]);
};

export const updateFaultData = async (req) => {
	let { _id, title, description, asset, system, owner, uploadedImages, location, tags } =
		req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		_id,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	const urls = await uploadFilesToBlob(req.files, "images");
	tags = JSON.parse(tags);
	await modifyTagMentions(_id, tags, null, req.user._id);

	return await Fault.findOneAndUpdate(
		{ _id: _id },
		{
			title,
			description,
			asset,
			system,
			location,
			owner,
			images: [...urls, ...JSON.parse(uploadedImages)],
			lastUpdatedBy: req.user._id,
			tags
		},
		{ new: true }
	).populate([
		{
			path: "owner",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
		{ path: "asset" },
		{ path: "system" },
		{ path: "location" },
		{
			path: "relatedUsers",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
		{ path: "status" },
		{
			path: "comments",
			populate: {
				path: "user",
				model: "User",
				select: "firstName lastName avatar",
			},
		},
	]);
};

export const getMinifiedFaults = async (req) => {
	const { permLevel } = req.headers;
	const { filters } = req.body;
	const user = req.user;

	let query = {
		...getFaultsQueryParams(filters),
		...getRelatedQuery(permLevel, user._id),
	};

	const faults = await Fault.find(query).populate([
		{
			path: "owner",
			select: "firstName lastName phoneNumber avatar role",
			populate: { path: "role", model: "Role", select: "roleName" },
		},
		{ path: "asset" },
	]);
	return Promise.resolve(faults);
};

export const getFaults = async (req, additionalFilters) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	let addQuery = {
		...getFaultsQueryParams({ ...filters, ...additionalFilters }),
		...getRelatedQuery(permLevel, userId),
	};

	const faults = await Fault.find({ tenant: tenant, ...addQuery })
		.sort({ createdAt: -1 })
		.populate([
			{
				path: "owner",
				select: "firstName lastName phoneNumber avatar role",
				populate: {
					path: "role",
					model: "Role",
					select: "roleName",
				},
			},
			{ path: "asset" },
			{ path: "system" },
			{ path: "location" },
			{ path: "status" },
			{
				path: "relatedUsers",
				
				select: "firstName lastName phoneNumber avatar role",
				populate: { path: "role", model: "Role", select: "roleName" },
			},
			{
				path: "comments",
				populate: {
					path: "user",
					model: "User",
					select: "firstName lastName avatar",
				},
			},
			{ path: "tags", model: 'Tag' }
		]);
	return Promise.resolve(faults);
};

export const getFault = async (req) => {
	const { faultId, plain } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	if (plain) {
		
		return await Fault.findOne({ _id: faultId }).populate([{ path: "status" },
		{ path: "tags", model: 'Tag' }]);
	}
	return await Fault.findOne({ faultId: faultId }).populate([
		{
			path: "owner",
			select: "firstName lastName phoneNumber avatar role",
			populate: {
				path: "role",
				model: "Role",
				select: "roleName",
			},
		},
		{ path: "asset" },
		{ path: "system" },
		{ path: "location" },
		{
			path: "relatedUsers",
			select: "firstName lastName phoneNumber avatar role",
			populate: {
				path: "role",
				model: "Role",
				select: "roleName",
			},
		},
		{
			path: "comments",
			populate: {
				path: "user",
				model: "User",
				select: "firstName lastName avatar",
			},
		},
		{ path: "status" },
		{ path: "tags", model: 'Tag' }
	]);
};

export const getFaultsQueryParams = (query) => {
	delete query.sortBy;
	delete query.sortOrder;
	delete query.viewType;

	Object.entries(query).forEach((entry) => {
		if (!entry[1]) {
			delete query[entry[0]];
		}
	});

	if (query.status) {
		query.status = { $in: query.status };
	}

	if (query.assets) {
		query.asset = { $in: query.assets };
		delete query.assets
	}

	return query;
};

export const addFaultComment = async (req) => {
	const { faultId, userId, text } = req.body;
	let newURL = null;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	if (req.file) {
		let uploaded = await uploadFilesToBlob([req.file], "images");
		if (uploaded.length) {
			newURL = uploaded[0];
		}
	}

	const comment = new Comment({
		parentObject: faultId,
		user: userId,
		text: text,
		image: newURL,
	});

	let comm = await comment.save();
	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		{
			$push: {
				comments: comm,
			},
			lastUpdatedBy: req.user._id,
		},
		{
			new: true,
			upsert: true,
		}
	).populate({
		path: "comments",
		populate: {
			path: "user",
			model: "User",
			select: "firstName lastName avatar",
		},
	});
};

export const updateFaultComment = async (req) => {
	const { faultId, commentId, text } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	let updated = await Comment.findOneAndUpdate(
		{ _id: commentId },
		{ text },
		{ new: true }
	);
	return Fault.findOne({ _id: faultId }).populate({
		path: "comments",
		populate: {
			path: "user",
			model: "User",
			select: "firstName lastName avatar",
		},
	});
};

export const changeFaultStatus = async (req) => {
	const { faultId, status } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	const st = await Status.findOne({ _id: status }); 
	let toUpdate = {
		status, lastUpdatedBy: req.user._id
	};
	if (st.state === 'close') {
		toUpdate.closedDate = new Date();
	};

	return await Fault.findOneAndUpdate(
		{ _id: faultId },
		toUpdate,
		{ new: true }
	).populate("status");
};

export const getFaultOptions = async (req) => {
	const query = req.body;
	Object.entries(query).forEach((o) => {
		if (!o[1]) {
			delete query[0];
		}
	});
	return await Fault.find({ ...query });
};

export const assignUserToExternalFault = async (req) => {
	const { userId, faultId } = req.body;
	try {
		const user = await User.findOne({ _id: userId });
		let fault = await Fault.findOne({ _id: faultId }).populate([
			{ path: "asset" },
			{ path: "system" },
		]);
		fault.createdBy = userId;
		fault.relatedUsers.push(userId);

		await fault.save();
		await notifyUserAssigned(user, fault);
		return true;
	} catch (e) {
		console.log(e.message);
		return false;
	}
};

export const notifyUserAssigned = async (user, fault) => {
	try {
		const t = i18next.getFixedT(user.lang);

		let d = await sendMail({
			from: "system@leev.co.il",
			to: user.email,
			subject: t("email.faultsAssignEmailSubject"),
			template: "userassigned",
			context: {
				address: getAddress(fault.asset.address).address,
				faultCreatedSuccessfully: t("email.faultCreatedSuccessfully"),
				faultFollowInstructions: t("email.faultFollowInstructions"),
				faultId: fault.faultId,
				faultLink: `${process.env.FRONTEND_URL}/workspace/faults/${fault.faultId}`,
				systemLabel: t("email.system"),
				systemData: fault.system.name,
				titleLabel: t("email.faultsTitle"),
				titleData: fault.title,
				descriptionLabel: t("email.faultsDescription"),
				descriptionData: fault.description,
				lang: user.lang === "he" ? "rtl" : "ltr",
			},
		});
	} catch (e) {
		console.log(e.message);
		return e.message;
	}
};

export const removeFaultOwnership = async (userId) => {
	const faults = await Fault.find(
		{ $or: [{ owner: userId}, { relatedUsers: { $elemMatch: { $eq: userId}  } }]}
	).populate("system");
	return Promise.all(
		faults.map(async (fault) => {
			fault.owner = fault.system.owner;
			fault.relatedUsers = fault.relatedUsers.filter(u => u != userId)
			fault.lastUpdatedBy = userId;
			await fault.save();
		})
	);
};

export const getFaultTags = async (req) => {
	const { faultId } = req.body;
	const { tenant } = req.user;

	const tags = await Fault.findOne({ _id: faultId}, 'tags');
	return await Tag.find({ tenant, _id: { $nin: tags }});
}

export const addFaultTag = async (req) => {
	const { faultId, tagId } = req.body;

	let savedTag;
	let mention = { date: new Date, user: req.user._id, fault: faultId };

	const checkFault = await Fault.findOne({ _id: faultId });
	if (checkFault && checkFault.tags.includes(tagId)) {
		return checkFault;
	}
	savedTag = await Tag.findOneAndUpdate({ _id: tagId}, { $push: { mentions: mention}}, { useFindAndModify: false, new: true});	

	if (!savedTag) return;
	return await Fault.findOneAndUpdate({ _id: faultId }, { $push: { tags: savedTag._id }}, { useFindAndModify: false, new: true });
};

export const removeFaultTag = async (req) => {
	const { faultId, tagId } = req.body;

	const isRelated = await isUserRelated(
		"faults",
		Fault,
		faultId,
		req.user._id,
		req.headers.permLevel
	);
	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	const updatedTag = await Tag.findOneAndUpdate({ _id: tagId }, { $pull: { mentions: { fault: faultId }}}, { useFindAndModify: false, new: true });
	if (!updatedTag) return;
	return await Fault.findOneAndUpdate({ _id: faultId }, { $pull: { tags: tagId }}, { useFindAndModify: false, new: true });
}

export const getFaultTagOptions = async (req) => {
	const { faultId, searchText } = req.body;
	const { tenant } = req.user;
	console.log(searchText)
	const fault = await Fault.findOne({ _id: faultId}, 'tags');
	return await Tag.find({ tenant, _id: { $nin: fault ? fault.tags : [] }, value: { $regex: searchText }});
}


export const createTag = async (req) => {
	const { value } = req.body;
	const { tenant } = req.user;

	const tag = await Tag.find({ tenant, value });
	if (tag.length >= 1) return tag[0];

	const newTag = new Tag({
		tenant,
		value,
		mentions: []
	});

	return await newTag.save();
}

export const modifyTagMentions = async (faultId, newList, oldList, userId) => {

	if (!oldList) {
		let f = await Fault.findOne({ _id: faultId });
		if (f) {
			oldList = f.tags;
		}
	}
	let addition = newList.filter(nl => !oldList.includes(nl));
	let removal = oldList.filter(ol => !newList.includes(ol));

	if (addition.length) {
		Promise.all(addition.map( async tagAdd => {
			return await Tag.findOneAndUpdate({ _id: tagAdd }, { $push: { mentions: { date: new Date, user: userId, fault: faultId } }});
		}))
	}
	if (removal.length) {
		Promise.all(removal.map( async tagRemove => {
			return await Tag.findOneAndUpdate({ _id: tagRemove }, { $pull: { mentions: { fault: faultId }}});
		}))
	};
	
}