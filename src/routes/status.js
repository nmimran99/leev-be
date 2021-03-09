import { Router } from 'express';
import * as controller from '../controller/status';

const router = Router();

router.post('/createStatusItem', controller.createStatusItem);
router.post('/updateStatusItem', controller.updateStatusItem);
router.post('/getStatusList', controller.getStatusList);


export default router;