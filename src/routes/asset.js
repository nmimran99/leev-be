import { Router } from 'express';
import * as controller from '../controller/asset';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/createAsset', authenticate, authorize, controller.createAsset);
router.post('/updateAsset', authenticate, authorize, controller.updateAsset);
router.post('/updateAssetOwner', authenticate, authorize, controller.updateAssetOwner);
router.post('/updateAssetType', authenticate, authorize, controller.updateAssetType);
router.post('/getAssets', authenticate, authorize, controller.getAssets);
router.post('/getAsset', authenticate, authorize, controller.getAsset);
router.post('/removeAsset', authenticate, authorize, controller.removeAsset);

export default router;