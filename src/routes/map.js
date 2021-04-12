import { Router } from 'express';
import * as controller from '../controller/map';
import * as authService from '../middleware/authenticate';


const router = Router();

router.post('/getMapData', authService.authenticate, controller.getMapData);

export default router; 