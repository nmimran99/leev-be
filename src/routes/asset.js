import { Router } from 'express';
import * as controller from '../controller/asset';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadAssetImage } from '../services/multer.service';

const router = Router();

router.post('/createAsset', authenticate, authorize, uploadAssetImage.array('images'), controller.createAsset);
router.post('/updateAsset', authenticate, authorize, uploadAssetImage.array('images'), controller.updateAsset);
router.post('/updateAssetOwner', authenticate, authorize, controller.updateAssetOwner);
router.post('/updateAssetType', authenticate, authorize, controller.updateAssetType);
router.post('/getAssets', authenticate, authorize, controller.getAssets);
router.post('/getAsset', authenticate, authorize, controller.getAsset);
router.post('/getAssetExtended', authenticate, authorize, controller.getAssetExtended);
router.post('/getAssetData', authenticate, authorize, controller.getAssetData);
router.post('/removeAsset', authenticate, authorize, controller.removeAsset);
router.post('/getAssetExternal', controller.getAssetExternal);

export default router;