import { Router } from 'express';
import * as controller from '../controller/tenant';



const router = Router();

router.post('/createTenant', controller.createTenant);
router.post('/updateTenant', controller.updateTenant);
router.post('/removeTenant', controller.removeTenant);
router.get('/getTenants', controller.getTenants);


export default router;