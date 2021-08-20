import * as reportsService from '../services/reports.service';

export const getReportData = async (req, res) => {
	try {
		let data = await reportsService.getReportData(req);
		if (data.error) {
			return res.status(403).send('unauthorized');
		}
		return res.status(200).send(data);
	} catch (e) {
		console.log(e.message);
		return res.status(500).send(e.message);
	}
};


export const createReport = async (req, res) => {
    try{
        let data = await reportsService.createReport(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const distributeReport = async (req, res) => {
    try{
        let data = await reportsService.distributeReport(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}


export const getReportPublic = async (req, res) => {
    try{
        let data = await reportsService.getReportPublic(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const getReports = async (req, res) => {
    try{
        let data = await reportsService.getReports(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}


export const getReport = async (req, res) => {
    try{
        let data = await reportsService.getReport(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}
