import { Router } from 'express';
import * as controller from '../controller/reports';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';


const router = Router();

router.post('/getReportPublic', authenticate, authorize, controller.getReportPublic);
router.post('/getReports', authenticate, authorize, controller.getReports);
router.post('/getReport', authenticate, authorize, controller.getReport);
router.post('/getReportData', authenticate, authorize, controller.getReportData);
router.post('/createReport', authenticate, authorize, controller.createReport);
router.post('/distributeReport', authenticate, authorize, controller.distributeReport)

export default router;
