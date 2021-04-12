import { Router } from 'express';
import * as controller from '../controller/task';
import { uploadTaskImage } from '../services/multer.service';
import * as authService from '../middleware/authenticate';



const router = Router();

router.post('/createTask', authService.authenticate, uploadTaskImage.array('images', 10) ,controller.createTask);
router.post('/deleteTask', authService.authenticate, controller.deleteTask);
router.post('/getTasks', authService.authenticate, controller.getTasks);
router.post('/getTask', authService.authenticate, controller.getTask);
router.post('/updateTask', authService.authenticate, uploadTaskImage.array('images', 10), controller.updateTask);
router.post('/updateTaskOwner', authService.authenticate, controller.updateTaskOwner);
router.post('/updateTaskStatus', authService.authenticate, controller.updateTaskStatus);
router.post('/addTaskComment', authService.authenticate, controller.addTaskComment);
router.post('/deleteTaskComment', authService.authenticate, controller.deleteTaskComment);
router.post('/updateTaskComment', authService.authenticate, controller.updateTaskComment);
router.post('/addRelatedUser', authService.authenticate, controller.addRelatedUser);
router.post('/removeRelatedUser', authService.authenticate, controller.removeRelatedUser);
router.post('/updateTaskSchedule', authService.authenticate, controller.updateTaskSchedule);
router.post('/getTaskOptions', authService.authenticate, controller.getTaskOptions);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;