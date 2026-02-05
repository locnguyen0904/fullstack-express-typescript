import './user.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';

import UserController from '@/api/users/user.controller';
import { idParamSchema, listQuerySchema } from '@/common';
import { asyncHandler } from '@/helpers';
import { authorize, isAuth } from '@/middlewares';

import { createUserSchema, updateUserSchema } from './user.validation';

const router = Router();
const controller = Container.get(UserController);

router.get(
  '/',
  isAuth,
  authorize('admin'),
  validate({ query: listQuerySchema }),
  asyncHandler(controller.findAll.bind(controller))
);
router.get(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.findOne.bind(controller))
);
router.post(
  '/',
  isAuth,
  authorize('admin'),
  validate({ body: createUserSchema }),
  asyncHandler(controller.create.bind(controller))
);
router.put(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateUserSchema }),
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
