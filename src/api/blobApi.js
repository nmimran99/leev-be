
import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';
import { promises as fs } from "fs";
import { createURL, removeFileByPath } from './generic';




export const uploadImagesToBlob = async (files) => {
    console.log(files)
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('images');
    let promises = [];
    for await (const file of files) {
        const blobName = 'image' + new Date().getTime() + '_' + file.filename;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadFile(file.path);
        blockBlobClient.setHTTPHeaders({ blobContentType: file.mimetype})
        await removeFileByPath(file.path);
        promises.push(createURL(`images/${blobName}`));
    };

    return Promise.all(promises);
}