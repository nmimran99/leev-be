import { Router } from 'express';
import * as controller from '../controller/role';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/createRole', authenticate, authorize, controller.createRole);
router.post('/getRole', authenticate, authorize ,controller.getRole);
router.post('/getRoles', authenticate, authorize ,controller.getRoles);
router.post('/updateRole', authenticate, authorize , controller.updateRole);


export default router;