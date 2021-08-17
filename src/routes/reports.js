import { Router } from 'express';
import * as controller from '../controller/reports';
import { authenticate } from '../middleware/authenticate';


const router = Router();

router.post('/getReportPublic', authenticate, controller.getReportPublic);
router.post('/getReports', authenticate, controller.getReports);
router.post('/getReportData', authenticate, controller.getReportData);
router.post('/createReport', authenticate, controller.createReport);
router.post('/distributeReport', authenticate, controller.distributeReport)

export default router;
