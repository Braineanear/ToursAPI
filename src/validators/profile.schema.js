import Joi from 'joi';

import { password } from './custom.schema';

export const updateProfileDataSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string().email().optional()
  })
};

export const changeProfilePasswordSchema = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required().custom(password),
    password: Joi.string().required().custom(password),
    passwordConfirmation: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .custom(password)
  })
};
