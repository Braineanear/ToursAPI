import Joi from 'joi';
import { password } from './custom.schema';

export const registerSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    passwordConfirmation: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .custom(password),
    role: Joi.string().required()
  })
};

export const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
};

export const logoutSchema = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

export const generateTokensSchema = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

export const forgotPasswordSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

export const resetPasswordSchema = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    passwordConfirmation: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .custom(password)
  })
};

export const verifyEmailSchema = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
};
