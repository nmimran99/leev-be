import * as statusService from '../services/status.service';

export const createStatusList = async (req, res) => {
    try{
        let data = await statusService.createStatusList(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getStatusList = async (req, res) => {
    try{
        let data = await statusService.getStatusList(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateStatusList = async (req, res) => {
    try{
        let data = await statusService.updateStatusList(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}
