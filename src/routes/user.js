import { Router } from 'express';
import * as controller from '../controller/user';
import { upload } from '../services/multer.service';


const router = Router();

router.post('/uploadAvatar', upload.single('file'), controller.uploadAvatar);
router.post('/registerUser', controller.registerUser);
router.post('/loginUser', controller.loginUser);
router.post('/reloginUser', controller.reloginUser);
router.post('/deleteUser', controller.deleteUser);
router.post('/resetPasswordLink', controller.resetPasswordLink);
router.post('/setNewPassword', controller.setNewPassword);
router.post('/authorizeSetNewPassword', controller.authorizeSetNewPassword);
router.get('/getUserList', controller.getUserList);
router.post('/getUserData', controller.getUserData);
router.post('/getUserDataById', controller.getUserDataById);


// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;