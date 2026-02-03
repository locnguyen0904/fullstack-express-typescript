import 'reflect-metadata';
import './example.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';

import { idParamSchema, listQuerySchema } from '@/common';
import { Controller } from '@/core';
import { authorize,isAuth } from '@/middlewares';

import ExampleController from './example.controller';
import { createExampleSchema, updateExampleSchema } from './example.validation';

const router: Router = Router();
const controller = Container.get(ExampleController);

router.get(
  '/',
  validate({ query: listQuerySchema }),
  Controller.handler(controller.findAll.bind(controller))
);
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  Controller.handler(controller.findOne.bind(controller))
);

router.post(
  '/',
  isAuth,
  authorize('admin'),
  validate({ body: createExampleSchema }),
  Controller.handler(controller.create.bind(controller))
);
router.put(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateExampleSchema }),
  Controller.handler(controller.update.bind(controller))
);
router.delete(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  Controller.handler(controller.delete.bind(controller))
);

export default router;
