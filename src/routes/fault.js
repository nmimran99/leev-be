import { Router } from 'express';
import * as controller from '../controller/fault';

const router = Router();

router.post('/createFault', controller.createFault);
router.post('/deleteFault', controller.deleteFault);
router.post('/updateFollowingUsers', controller.updateFollowingUsers);
router.post('/updateFaultOwner', controller.updateFaultOwner);
router.post('/updateFaultData', controller.updateFaultData);
router.post('/getFaults', controller.getFaults);


export default router;