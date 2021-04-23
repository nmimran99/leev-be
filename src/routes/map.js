import { Router } from 'express';
import * as controller from '../controller/map';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';


const router = Router();

router.post('/getMapData', authenticate, authorize, controller.getMapData);

export default router; 