import { Router } from 'express';
import * as controller from '../controller/dashboard';
import { authorize } from '../middleware/authorize';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/getDashboardData', authenticate, authorize, controller.getDashboardData);


export default router; 