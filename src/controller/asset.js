import * as assetService from '../services/asset.service';

export const createAsset = async (req, res) => {
    try{
        let data = await assetService.createAsset(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAsset = async (req, res) => {
    try{
        let data = await assetService.updateAsset(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAssetOwner = async (req, res) => {
    try{
        let data = await assetService.updateAssetOwner(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAssetType = async (req, res) => {
    try{
        let data = await assetService.updateAssetType(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getAssets = async (req, res) => {
    try{
        let data = await assetService.getAssets(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getAsset = async (req, res) => {
    try{
        let data = await assetService.getAsset(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const removeAsset = async (req, res) => {
    try{
        let data = await assetService.removeAsset(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}