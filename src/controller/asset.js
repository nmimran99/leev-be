import * as assetService from '../services/asset.service';
import * as userSrevice from '../services/user.service';

export const createAsset = async (req, res) => {
    try{
        let data = await assetService.createAsset(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAssetAddress = async (req, res) => {
    try{
        let data = await assetService.updateAssetAddress(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAssetOwner = async (req, res) => {
    try{
        let data = await assetService.updateAssetOwner(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateAssetType = async (req, res) => {
    try{
        let data = await assetService.updateAssetType(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getAssets = async (req, res) => {
    try{
        let data = await assetService.getAssets(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getAsset = async (req, res) => {
    try{
        let data = await assetService.getAsset(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const removeAsset = async (req, res) => {
    try{
        let data = await assetService.removeAsset(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}