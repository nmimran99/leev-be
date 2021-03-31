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

export const addFollower = async (req, res) => {
    try{
        let data = await faultService.addFollower(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const removeFollower = async (req, res) => {
    try{
        let data = await faultService.removeFollower(req);
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
        console.log(e.message)
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

export const getFault = async (req, res) => {
    try{
        let data = await faultService.getFault(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const addFaultComment = async (req, res) => {
    try{
        let data = await faultService.addFaultComment(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}
export const deleteFaultComment = async (req, res) => {
    try{
        let data = await faultService.deleteFaultComment(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateFaultComment = async (req, res) => {
    try{
        let data = await faultService.updateFaultComment(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const changeFaultStatus = async (req, res) => {
    try{
        let data = await faultService.changeFaultStatus(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getFaultOptions = async (req, res) => {
    try{
        let data = await faultService.getFaultOptions(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}



