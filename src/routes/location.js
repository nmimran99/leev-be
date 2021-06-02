import { Router } from 'express';
import * as controller from '../controller/location';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/createLocation', authenticate, authorize, controller.createLocation);
router.post('/updateLocation', authenticate, authorize, controller.updateLocation);
router.post('/checkLocationName', authenticate, authorize, controller.checkLocationName);
router.post('/getAssetLocations', authenticate, authorize, controller.getAssetLocations);
router.post('/getLocationData', authenticate, authorize, controller.getLocationData);

export default router;