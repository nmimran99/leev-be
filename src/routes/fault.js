import { Router } from 'express';
import * as controller from '../controller/fault';
import { uploadFaultImage } from '../services/multer.service';
import * as authService from '../middleware/authenticate';


const router = Router();

router.post('/createFault', authService.authenticate, uploadFaultImage.array('images', 10), controller.createFault);
router.post('/deleteFault', authService.authenticate, controller.deleteFault);
router.post('/updateFollowingUsers', authService.authenticate, controller.updateFollowingUsers);
router.post('/updateFaultOwner', authService.authenticate, controller.updateFaultOwner);
router.post('/updateFaultData', authService.authenticate, uploadFaultImage.array('images', 10),controller.updateFaultData);
router.post('/getFaults', authService.authenticate, controller.getFaults);
router.post('/addFollower', authService.authenticate, controller.addFollower);
router.post('/removeFollower', authService.authenticate, controller.removeFollower);
router.post('/getFault', authService.authenticate, controller.getFault);
router.post('/addFaultComment', authService.authenticate, controller.addFaultComment);
router.post('/deleteFaultComment', authService.authenticate, controller.deleteFaultComment);
router.post('/updateFaultComment', authService.authenticate, controller.updateFaultComment);
router.post('/changeFaultStatus', authService.authenticate, controller.changeFaultStatus);
router.post('/getFaultOptions', authService.authenticate, controller.getFaultOptions);

export default router;
