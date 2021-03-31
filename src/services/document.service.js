import { relocateFile, removeFile, removeUnlistedImages } from '../api/generic';
import Document from '../models/document';
import path from 'path';

export const createDocument = async (req) => {
	const {
		tenant,
		description,
		asset,
		system,
		fault,
		task,
		user,
		createdBy,
	} = req.body;
	if (!req.file) return;

	let file = req.file.filename;
	let newURL = await relocateFile(file, tenant, 'documents');

	const doc = new Document({
		tenant,
		description,
		asset,
		system,
		fault,
		task,
		user,
		createdBy,
		type: path.extname(req.file.filename),
		url: newURL,
	});

	return await doc.save();
};

export const getDocument = async (req) => {
	const { documentId } = req.body;
	return await Document.findOne({ _id: documentId }).populate([
		{ path: 'asset', select: 'address' },
		{ path: 'system', select: 'name' },
		{ path: 'fault', select: 'faultId' },
		{ path: 'task', select: 'taskId' },
		{ path: 'user', select: 'firstName lastName phoneNumber avatar' },
	]);
};

export const deleteDocument = async (req) => {
	const { tenant, documentId } = req.body;
	const doc = await Document.findOne({ _id: documentId });
	if (!doc) return;
	await removeFile('documents', tenant, path.basename(doc.url));
	return await Document.findOneAndDelete(
		{ _id: documentId },
		{ useFindAndModify: false }
	);
};

export const getDocuments = async (req) => {
    const { tenant, filters } = req.body;
    return await Document.find({ tenant: tenant, ...filters }).populate([
		{ path: 'asset', select: 'address' },
		{ path: 'system', select: 'name' },
		{ path: 'fault', select: 'faultId' },
		{ path: 'task', select: 'taskId' },
		{ path: 'user', select: 'firstName lastName phoneNumber avatar' },
	]);
}
