import { Router } from 'express';
import * as controller from '../controller/status';

const router = Router();

router.post('/createStatusList', controller.createStatusList);
router.post('/updateStatusList', controller.updateStatusList);
router.post('/getStatusList', controller.getStatusList);


export default router;