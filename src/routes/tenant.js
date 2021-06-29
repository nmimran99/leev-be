import { Router } from 'express';
import * as controller from '../controller/tenant';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';


const router = Router();

router.post('/createTenant', authenticate, authorize, controller.createTenant);
router.post('/updateTenant', authenticate, authorize, controller.updateTenant);
router.post('/deleteTenant', authenticate, authorize, controller.deleteTenant);
router.post('/getTenants', authenticate, authorize, controller.getTenants);
router.post('/getTenant', authenticate, authorize, controller.getTenant);


export default router;