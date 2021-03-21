import * as documentService from '../services/document.service';

export const createDocument = async (req, res) => {
    try{
        let data = await documentService.createDocument(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const getDocument = async (req, res) => {
    try{
        let data = await documentService.getDocument(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const deleteDocument = async (req, res) => {
    try{
        let data = await documentService.deleteDocument(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const getDocuments = async (req, res) => {
    try{
        let data = await documentService.getDocuments(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}
