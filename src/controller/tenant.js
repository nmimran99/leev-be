import * as tenantService from '../services/tenant.service';

export const createTenant = async (req, res) => {
    try{
        let data = await tenantService.createTenant(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const updateTenant = async (req, res) => {
    try{
        let data = await tenantService.updateTenant(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const deleteTenant = async (req, res) => {
    try{
        let data = await tenantService.deleteTenant(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const getTenants = async (req, res) => {
    try{
        let data = await tenantService.getTenants(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const getTenant = async (req, res) => {
    try{
        let data = await tenantService.getTenant(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

