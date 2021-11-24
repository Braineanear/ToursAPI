import {
  forgotPasswordSchema,
  generateTokensSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from './auth.schema';
import {
  changeProfilePasswordSchema,
  updateProfileDataSchema
} from './profile.schema';
import { createTourSchema, getAllToursSchema } from './tour.schema';

const authSchema = {
  registerSchema,
  loginSchema,
  logoutSchema,
  generateTokensSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
};

const profileSchema = {
  updateProfileDataSchema,
  changeProfilePasswordSchema
};

const tourSchema = {
  getAllToursSchema,
  createTourSchema
};

export { authSchema, profileSchema, tourSchema };
