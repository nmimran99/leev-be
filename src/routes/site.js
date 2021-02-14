import { Router } from 'express';
import * as controller from '../controller/site';

const router = Router();

router.post('/createSite', controller.createSite);
router.post('/updateSiteAddress', controller.updateSiteAddress);
router.post('/updateSiteOwner', controller.updateSiteOwner);
router.post('/updateSiteType', controller.updateSiteType);
router.post('/getSites', controller.getSites);
router.post('/getSite', controller.getSite);
router.post('/removeSite', controller.removeSite);

export default router;