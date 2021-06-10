import { Router } from 'express';
import * as controller from '../controller/dashboard';

const router = Router();

router.post('/getDashboardData', controller.getDashboardData);


export default router; 