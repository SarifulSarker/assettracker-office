import { Router } from 'express';
import authController from '../Controller/authController.js';

const router = Router();

router.post('/signin', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);
router.post('/check-email',authController.checkEmail);
router.post('/forgetPassword/verify-otp',authController.verifyOTP)
router.post('/reset-password',authController.resetPassword)
export default router;