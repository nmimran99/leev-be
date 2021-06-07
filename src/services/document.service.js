import { removeFile } from '../api/generic';
import Document from '../models/document';
import path from 'path';
import { getRelatedQuery, isUserRelated } from '../middleware/authorize';
import { removeFileFromBlob, uploadFilesToBlob } from '../api/blobApi';
import { logDeletion } from '../logger/log.service';

export const createDocument = async (req) => {
	const { tenant, _id: createdBy } = req.user;
	const {
		description,
		asset,
		system,
		fault,
		task,
		user
	} = req.body;
	if (!req.file) return;

	let file = req.file.filename;

	const newURL = await uploadFilesToBlob([req.file], 'documents');

	const doc = new Document({
		tenant,
		description,
		asset,
		system,
		fault,
		task,
		user,
		createdBy,
		lastUpdatedBy: createdBy,
		type: path.extname(req.file.filename),
		url: newURL[0],
	});

	return await doc.save();
};

export const getDocument = async (req) => {
	const { documentId } = req.body;

	const isRelated = await isUserRelated(
		'documents',
		Document,
		documentId,
		req.user._id,
		req.headers.permLevel
	);
	
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	return await Document.findOne({ _id: documentId });
};

export const deleteDocument = async (req) => {
	const { tenant, documentId } = req.body;
	const doc = await Document.findOne({ _id: documentId });
	if (!doc) return;
	await removeFileFromBlob(doc.url);
	let deleted = await Document.findOneAndDelete(
		{ _id: documentId },
		{ useFindAndModify: false }
	);
	await logDeletion(deleted, req.user._id, 'documents');
	return deleted;
};

export const getDocuments = async (req) => {
	const { tenant, _id: userId } = req.user;
	const { filters } = req.body;
	const { permLevel } = req.headers;

	let addQuery = {
		...getDocmentsQueryParams(filters),
		...getRelatedQuery(permLevel, userId),
	};

    return await Document.find({ tenant: tenant, ...addQuery }).populate([
		{ path: 'asset', select: 'address' },
		{ path: 'system', select: 'name' },
		{ path: 'fault', select: 'faultId' },
		{ path: 'task', select: 'taskId' },
		{ path: 'user', select: 'firstName lastName phoneNumber avatar' },
	]);
}

export const updateDocumentDetails = async (req) => {
	const { tenant, _id: userId } = req.user;
	const { documentId, details } = req.body;

	const isRelated = await isUserRelated(
		'documents',
		Document,
		documentId,
		req.user._id,
		req.headers.permLevel
	);
	
	if (!isRelated) {
		return { error: true, reason: 'unauthorized', status: 403 };
	}

	const updated = getDocmentsQueryParams(details);
	return await Document.findOneAndUpdate({ _id: details._id }, { ...updated, lastUpdatedBy: req.user._id, }, { new: true, useFindAndModify: false}).populate([
		{ path: 'asset', select: 'address' },
		{ path: 'system', select: 'name' },
		{ path: 'fault', select: 'faultId' },
		{ path: 'task', select: 'taskId' },
		{ path: 'user', select: 'firstName lastName phoneNumber avatar' },
	]);
}

export const getDocmentsQueryParams = (query) => {

	Object.entries(query).forEach((entry) => {
		if (!entry[1]) {
			delete query[entry[0]];
		} else if (Array.isArray(entry[1])) {
			query[entry[0]] = { $in: entry[1]};
		}
	});

	return query;
};
