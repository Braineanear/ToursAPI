import JoiDate from '@joi/date';
import JoiBase from 'joi';

import { objectId } from './custom.schema';

const Joi = JoiBase.extend(JoiDate);

export const getAllToursSchema = {
  params: Joi.object().keys({
    sort: Joi.string().optional(),
    fields: Joi.string().optional(),
    limit: Joi.number().optional(),
    page: Joi.number().optional()
  })
};

export const createTourSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().min(10).max(70),
    duration: Joi.number().required(),
    maxGroupSize: Joi.number().required(),
    difficulty: Joi.string().required().valid('easy', 'medium', 'difficult'),
    price: Joi.number().required(),
    priceDiscount: Joi.number().optional(),
    summary: Joi.string().required(),
    description: Joi.string().optional(),
    startDates: Joi.array().items(Joi.date().format('DD/MM/YYYY')).required(),
    secretTour: Joi.boolean().optional(),
    startLocation: {
      description: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number()).required(),
      day: Joi.number().required()
    },
    locations: Joi.array()
      .items({
        description: Joi.string().required(),
        coordinates: Joi.array().items(Joi.number()).required(),
        day: Joi.number().required()
      })
      .required(),
    guides: Joi.array().items(Joi.string().custom(objectId)).required()
  })
};
