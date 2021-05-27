import { Router } from 'express';
import * as controller from '../controller/task';
import { uploadTaskImage } from '../services/multer.service';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';



const router = Router();

router.post('/createTask',authenticate, authorize, uploadTaskImage.array('images', 10) ,controller.createTask);
router.post('/deleteTask',authenticate, authorize, controller.deleteTask);
router.post('/getTasks',authenticate, authorize, controller.getTasks);
router.post('/getTask',authenticate, authorize, controller.getTask);
router.post('/updateTask',authenticate, authorize, uploadTaskImage.array('images', 10), controller.updateTask);
router.post('/updateTaskOwner',authenticate, authorize, controller.updateTaskOwner);
router.post('/updateTaskStatus',authenticate, authorize, controller.updateTaskStatus);
router.post('/addTaskComment',authenticate, authorize, uploadTaskImage.single('image'), controller.addTaskComment);
router.post('/deleteTaskComment',authenticate, authorize, controller.deleteTaskComment);
router.post('/updateTaskComment',authenticate, authorize, controller.updateTaskComment);
router.post('/addRelatedUser',authenticate, authorize, controller.addRelatedUser);
router.post('/removeRelatedUser',authenticate, authorize, controller.removeRelatedUser);
router.post('/completeTaskStep',authenticate, authorize, controller.completeTaskStep);
router.post('/updateTaskSchedule',authenticate, authorize, controller.updateTaskSchedule);
router.post('/getTaskOptions',authenticate, authorize, controller.getTaskOptions);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;