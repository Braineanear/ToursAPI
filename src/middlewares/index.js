import protect from './protect';
import restrictTo from './restrictTo';
import rateLimiter from './rateLimiter';
import {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
} from './tokens';

const tokens = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
};

export { protect, restrictTo, rateLimiter, tokens };
