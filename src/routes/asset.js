import { Router } from 'express';
import * as controller from '../controller/asset';

const router = Router();

router.post('/createAsset', controller.createAsset);
router.post('/updateAsset', controller.updateAsset);
router.post('/updateAssetOwner', controller.updateAssetOwner);
router.post('/updateAssetType', controller.updateAssetType);
router.post('/getAssets', controller.getAssets);
router.post('/getAsset', controller.getAsset);
router.post('/removeAsset', controller.removeAsset);

export default router;