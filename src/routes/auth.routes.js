import express from 'express';

import { authController } from '../controllers';
import { validate } from '../middlewares';
import { authSchema } from '../validators';

const {
  register,
  login,
  logout,
  generateTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
} = authController;

const {
  registerSchema,
  loginSchema,
  logoutSchema,
  generateTokensSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} = authSchema;

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/tokens', validate(generateTokensSchema), generateTokens);
router.post('/logout', validate(logoutSchema), logout);
router.get('/verify-email', validate(verifyEmailSchema), verifyEmail);

export default router;
