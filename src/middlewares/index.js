import {
  generateAuthTokens,
  generateResetPasswordToken,
  generateToken,
  generateVerifyEmailToken,
  saveToken,
  verifyToken
} from './tokens';

const tokens = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
};

export { tokens };

export { default as protect } from './protect';
export { default as rateLimiter } from './rateLimiter';
export { default as restrictTo } from './restrictTo';
export { default as validate } from './validate';
