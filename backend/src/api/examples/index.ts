import 'reflect-metadata';
import './example.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';

import { idParamSchema, listQuerySchema } from '@/common';
import { asyncHandler } from '@/helpers';
import { authorize, isAuth } from '@/middlewares';

import ExampleController from './example.controller';
import { createExampleSchema, updateExampleSchema } from './example.validation';

const router: Router = Router();
const controller = Container.get(ExampleController);

router.get(
  '/',
  validate({ query: listQuerySchema }),
  asyncHandler(controller.findAll.bind(controller))
);
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.findOne.bind(controller))
);

router.post(
  '/',
  isAuth,
  authorize('admin'),
  validate({ body: createExampleSchema }),
  asyncHandler(controller.create.bind(controller))
);
router.put(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateExampleSchema }),
  asyncHandler(controller.update.bind(controller))
);
router.delete(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.delete.bind(controller))
);

export default router;
