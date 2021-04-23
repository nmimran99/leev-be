import { Router } from 'express';
import * as controller from '../controller/system';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/createSystem', authenticate, authorize, controller.createSystem);
router.post('/getSystems', authenticate, authorize, controller.getSystems);
router.post('/removeSystem', authenticate, authorize, controller.removeSystem);
router.post('/editSystemName', authenticate, authorize, controller.editSystemName);
router.post('/addRelatedUsers', authenticate, authorize, controller.addRelatedUsers);
router.post('/addRelatedUser', authenticate, authorize, controller.addRelatedUser);
router.post('/updateSystemOwner', authenticate, authorize, controller.updateSystemOwner);
router.post('/updateSystemName', authenticate, authorize, controller.updateSystemName);
router.post('/removeRelatedUser', authenticate, authorize, controller.removeRelatedUser);
router.post('/getSystemsOptions', authenticate, authorize, controller.getSystemsOptions);
router.post('/updateSystemData', authenticate, authorize, controller.updateSystemData);

export default router;