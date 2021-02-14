import { Router } from 'express';
import * as controller from '../controller/system';



const router = Router();

router.post('/createSystem', controller.createSystem);
router.post('/getSystems', controller.getSystems);
router.post('/removeSystem', controller.removeSystem);
router.post('/editSystemName', controller.editSystemName);
router.post('/addUsers', controller.addUsers);
router.post('/addUser', controller.addUser);
router.post('/updateSystemOwner', controller.updateSystemOwner);
router.post('/updateSystemName', controller.updateSystemName);
router.post('/removeUser', controller.removeUser);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;