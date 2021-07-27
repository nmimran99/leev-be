import * as systemService from '../services/system.service';



export const createSystem = async (req, res) => {
    try{
        let data = await systemService.createSystem(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getSystems = async (req, res) => {
    try{
        let data = await systemService.getSystems(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const getSystem = async (req, res) => {
    try{
        let data = await systemService.getSystem(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const removeSystem = async (req, res) => {
    try{
        let data = await systemService.removeSystem(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const editSystemName = async (req, res) => {
    try{
        let data = await systemService.editSystemName(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const addRelatedUsers = async (req, res) => {
    try{
        let data = await systemService.addUsers(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const addRelatedUser = async (req, res) => {
    try{
        let data = await systemService.addRelatedUser(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const updateSystemOwner = async (req, res) => {
    try{
        let data = await systemService.updateSystemOwner(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const updateSystemName = async (req, res) => {
    try{
        let data = await systemService.updateSystemName(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}


export const removeRelatedUser = async (req, res) => {
    try{
        let data = await systemService.removeRelatedUser(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const getSystemsOptions = async (req, res) => {
    try{
        let data = await systemService.getSystemsOptions(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const updateSystemData = async (req, res) => {
    try{
        let data = await systemService.updateSystemData(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}
