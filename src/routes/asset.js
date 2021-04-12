import { Router } from 'express';
import * as controller from '../controller/asset';
import * as authService from '../middleware/authenticate';

const router = Router();

router.post('/createAsset', authService.authenticate, controller.createAsset);
router.post('/updateAsset', authService.authenticate,controller.updateAsset);
router.post('/updateAssetOwner', authService.authenticate,controller.updateAssetOwner);
router.post('/updateAssetType', authService.authenticate,controller.updateAssetType);
router.post('/getAssets', authService.authenticate,controller.getAssets);
router.post('/getAsset', authService.authenticate,controller.getAsset);
router.post('/removeAsset', authService.authenticate,controller.removeAsset);

export default router;