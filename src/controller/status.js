import * as statusService from '../services/status.service';

export const createStatusItem = async (req, res) => {
    try{
        let data = await statusService.createStatusItem(req);
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

export const updateStatusItem = async (req, res) => {
    try{
        let data = await statusService.updateStatusItem(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}
