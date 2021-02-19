import * as systemService from '../services/system.service';



export const createSystem = async (req, res) => {
    try{
        let data = await systemService.createSystem(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}

export const getSystems = async (req, res) => {
    try{
        let data = await systemService.getSystems(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const removeSystem = async (req, res) => {
    try{
        let data = await systemService.removeSystem(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const editSystemName = async (req, res) => {
    try{
        let data = await systemService.editSystemName(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const addUsers = async (req, res) => {
    try{
        let data = await systemService.addUsers(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const addUser = async (req, res) => {
    try{
        let data = await systemService.addUser(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const updateSystemOwner = async (req, res) => {
    try{
        let data = await systemService.updateSystemOwner(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const updateSystemName = async (req, res) => {
    try{
        let data = await systemService.updateSystemName(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}


export const removeUser = async (req, res) => {
    try{
        let data = await systemService.removeUser(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}

export const getSystemsOptions = async (req, res) => {
    try{
        let data = await systemService.getSystemsOptions(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    } 
}
