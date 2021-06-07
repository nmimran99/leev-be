import { Router } from 'express';
import * as controller from '../controller/user';
import { uploadAvatar } from '../services/multer.service';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { sendMail } from '../smtp/mail';



const router = Router();

router.post('/uploadAvatar', authenticate, authorize, uploadAvatar.single('avatar'), controller.uploadAvatar);
router.post('/removeAvatar', authenticate, authorize, controller.removeAvatar);
router.post('/updateUserData', authenticate, authorize, controller.updateUserData);
router.post('/registerUser',authenticate, authorize, uploadAvatar.single('avatar'), controller.registerUser);
router.post('/loginUser', controller.loginUser);
router.post('/reloginUser', controller.reloginUser);
router.post('/disableUser', controller.disableUser);
router.post('/enableUser', controller.enableUser);
router.post('/deactivateUser', controller.deactivateUser);
router.post('/resetPasswordLink', controller.resetPasswordLink);
router.post('/setNewPassword', controller.setNewPassword);
router.post('/authorizeSetNewPassword', controller.authorizeSetNewPassword);
router.get('/getUserList', authenticate, authorize, controller.getUserList);
router.get('/getResidentList', authenticate, authorize, controller.getResidentList);
router.post('/getUsersData', controller.getUsersData);
router.post('/getUserDataById', authenticate, authorize, controller.getUserDataById);
router.post('/updateUserRole', authenticate, authorize, controller.updateUserRole);
router.post('/verifyEmailExists', controller.verifyEmailExists);

router.post('/sendTestEmail', async (req, res) => {
    let d = await sendMail({
        from: 'system@leev.co.il',
        to: 'nmimran99@gmail.com',
        subject: 'test',
        template: 'index',
        context: {}
    });

    return res.status(200).send(d);

})
// TODO
// 1. add middleware to delete user to make sure the user that performs the action has permission
// 2. add middleware to register user to make sure the user that performs the action has permission

export default router;