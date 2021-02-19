import { Router } from 'express';
import * as controller from '../controller/user';
import { uploadAvatar } from '../services/multer.service';


const router = Router();

router.post('/uploadAvatar', uploadAvatar.single('avatar'), controller.uploadAvatar);
router.post('/removeAvatar', controller.removeAvatar);
router.post('/registerUser',uploadAvatar.single('avatar'), controller.registerUser);
router.post('/loginUser', controller.loginUser);
router.post('/reloginUser', controller.reloginUser);
router.post('/disableUser', controller.disableUser);
router.post('/enableUser', controller.enableUser);
router.post('/deleteUser', controller.deleteUser);
router.post('/resetPasswordLink', controller.resetPasswordLink);
router.post('/setNewPassword', controller.setNewPassword);
router.post('/authorizeSetNewPassword', controller.authorizeSetNewPassword);
router.get('/getUserList', controller.getUserList);
router.post('/getUsersData', controller.getUsersData);
router.post('/getUserDataById', controller.getUserDataById);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;