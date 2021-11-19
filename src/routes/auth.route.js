import express from 'express';

import { authController } from '../controllers';

import { protect } from '../middlewares';

const {
  register,
  login,
  logout,
  generateTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
} = authController;

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/tokens', generateTokens);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);

router.get('/verify-email', verifyEmail);
router.post('/logout', logout);

export default router;
