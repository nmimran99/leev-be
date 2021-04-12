import * as mapService from '../services/map.service';

export const getMapData = async (req, res) => {
    try{
        let data = await mapService.getMapData(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}