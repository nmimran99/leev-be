import * as dashboardService from '../services/dashboard.service';

export const getDashboardData = async (req, res) => {
    try{
        let data = await dashboardService.getDashboardData(req);
        if(data.error) {
            return res.status(res.status).send(res.reason);
        }
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}