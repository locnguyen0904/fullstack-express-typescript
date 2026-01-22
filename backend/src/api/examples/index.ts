import 'reflect-metadata';
import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';
import { createExampleSchema, updateExampleSchema } from './example.validation';
import { idParamSchema } from '@/common/validation/params.validation';
import { listQuerySchema } from '@/common/validation/list.validation';
import ExampleController from './example.controller';
import Controller from '@/core/controller.core';
import { isAuth, authorize } from '@/middlewares/auth.middleware';
import './example.doc';

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
