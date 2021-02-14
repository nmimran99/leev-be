import * as faultService from '../services/fault.service';


export const createFault = async (req, res) => {
    try{
        let data = await faultService.createFault(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const deleteFault = async (req, res) => {
    try{
        let data = await faultService.deleteFault(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateFollowingUsers = async (req, res) => {
    try{
        let data = await faultService.updateFollowingUsers(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateFaultOwner = async (req, res) => {
    try{
        let data = await faultService.updateFaultOwner(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateFaultData = async (req, res) => {
    try{
        let data = await faultService.updateFaultData(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getFaults = async (req, res) => {
    try{
        let data = await faultService.getFaults(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}


