import { Router } from 'express';
import * as controller from '../controller/fault';
import { uploadFaultImage } from '../services/multer.service';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';


const router = Router();

router.post('/createFault', authenticate, authorize, uploadFaultImage.array('images', 10), controller.createFault);
router.post('/createExternalFault', uploadFaultImage.array('images', 10), controller.createFault);
router.post('/deleteFault', authenticate, authorize, controller.deleteFault);
router.post('/updateRelatedUsers', authenticate, authorize, controller.updateRelatedUsers);
router.post('/updateFaultOwner', authenticate, authorize, controller.updateFaultOwner);
router.post('/updateFaultData', authenticate, authorize, uploadFaultImage.array('images', 10),controller.updateFaultData);
router.post('/getFaults', authenticate, authorize, controller.getFaults);
router.post('/addRelatedUser', authenticate, authorize, controller.addRelatedUser);
router.post('/removeRelatedUser', authenticate, authorize, controller.removeRelatedUser);
router.post('/getFault', authenticate, authorize, controller.getFault);
router.post('/addFaultComment', authenticate, authorize, controller.addFaultComment);
router.post('/deleteFaultComment', authenticate, authorize, controller.deleteFaultComment);
router.post('/updateFaultComment', authenticate, authorize, controller.updateFaultComment);
router.post('/changeFaultStatus', authenticate, authorize, controller.changeFaultStatus);
router.post('/getFaultOptions', authenticate, authorize, controller.getFaultOptions);
router.post('/assignUserToExternalFault', controller.assignUserToExternalFault);

export default router;
