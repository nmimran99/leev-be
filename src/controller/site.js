import * as siteService from '../services/site.service';
import * as userSrevice from '../services/user.service';

export const createSite = async (req, res) => {
    try{
        let data = await siteService.createSite(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateSiteAddress = async (req, res) => {
    try{
        let data = await siteService.updateSiteAddress(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateSiteOwner = async (req, res) => {
    try{
        let data = await siteService.updateSiteOwner(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateSiteType = async (req, res) => {
    try{
        let data = await siteService.updateSiteType(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getSites = async (req, res) => {
    try{
        let data = await siteService.getSites(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getSite = async (req, res) => {
    try{
        let data = await siteService.getSite(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const removeSite = async (req, res) => {
    try{
        let data = await siteService.removeSite(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}