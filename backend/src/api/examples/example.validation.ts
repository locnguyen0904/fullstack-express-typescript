import Joi from 'joi';

export const createExampleSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

export const updateExampleSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
});
