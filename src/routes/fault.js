import { Router } from 'express';
import * as controller from '../controller/fault';
import { uploadFaultImage } from '../services/multer.service';


const router = Router();

router.post('/createFault', uploadFaultImage.array('images', 10), controller.createFault);
router.post('/deleteFault', controller.deleteFault);
router.post('/updateFollowingUsers', controller.updateFollowingUsers);
router.post('/updateFaultOwner', controller.updateFaultOwner);
router.post('/updateFaultData', controller.updateFaultData);
router.post('/getFaults', controller.getFaults);
router.post('/getFault', controller.getFault);
router.post('/addFaultComment', controller.addFaultComment);
router.post('/deleteFaultComment', controller.deleteFaultComment);

export default router;