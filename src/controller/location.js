import * as locationService from '../services/location.service';

export const createLocation = async (req, res) => {
    try{
        let data = await locationService.createLocation(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateLocation = async (req, res) => {
    try{
        let data = await locationService.updateLocation(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const checkLocationName = async (req, res) => {
    try{
        let data = await locationService.checkLocationName(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getAssetLocations = async (req, res) => {
    try{
        let data = await locationService.getAssetLocations(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getLocationData = async (req, res) => {
    try{
        let data = await locationService.getLocationData(req);
        if (data.error) {
            return res.status(data.status).send(data.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}