import { Router } from 'express';
import * as controller from '../controller/auth';

const router = Router();

router.post('/authenticate', controller.authenticate);

export default router;