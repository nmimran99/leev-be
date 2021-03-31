import * as notificationService from '../services/notification.service';

export const getNotifications = async (req, res) => {
    try{
        let data = await notificationService.getNotifications(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

export const updateNotificationRead = async (req, res) => {
    try{
        let data = await notificationService.updateNotificationRead(req);
        return res.status(200).send(data);
    } catch(e) {
        console.log(e.message)
        return res.status(500).send(e.message);
    }  
}

