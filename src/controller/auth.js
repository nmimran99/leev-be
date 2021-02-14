import * as authService from '../services/auth.service';

export const authenticate = async (req, res) => {
    try{
        let data = await authService.authenticate(req);
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e.message);
    }  
}