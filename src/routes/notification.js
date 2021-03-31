import { Router } from 'express';
import * as controller from '../controller/notification';
import * as authService from '../middleware/authenticate';


const router = Router();

router.post('/getNotifications', authService.authenticate, controller.getNotifications);
router.post('/updateNotificationRead', authService.authenticate, controller.updateNotificationRead);

export default router;
