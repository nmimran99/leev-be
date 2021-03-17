import { Router } from 'express';
import * as controller from '../controller/task';
import { uploadTaskImage } from '../services/multer.service';



const router = Router();

router.post('/createTask', uploadTaskImage.array('images', 10) ,controller.createTask);
router.post('/deleteTask', controller.deleteTask);
router.post('/getTasks', controller.getTasks);
router.post('/getTask', controller.getTask);
router.post('/updateTask', uploadTaskImage.array('images', 10), controller.updateTask);
router.post('/updateTaskOwner', controller.updateTaskOwner);
router.post('/updateTaskStatus', controller.updateTaskStatus);
router.post('/addTaskComment', controller.addTaskComment);
router.post('/deleteTaskComment', controller.deleteTaskComment);
router.post('/updateTaskComment', controller.updateTaskComment);
router.post('/addRelatedUser', controller.addRelatedUser);
router.post('/removeRelatedUser', controller.removeRelatedUser);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;