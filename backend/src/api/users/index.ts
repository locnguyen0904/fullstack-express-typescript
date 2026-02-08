import './user.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { container } from 'tsyringe';

import UserController from '@/api/users/user.controller';
import { idParamSchema, listQuerySchema } from '@/common';
import { authorize, isAuth } from '@/middlewares';

import { createUserSchema, updateUserSchema } from './user.validation';

const router = Router();
const controller = container.resolve(UserController);

router.get(
  '/',
  isAuth,
  authorize('admin'),
  validate({ query: listQuerySchema }),
  controller.findAll.bind(controller)
);
router.get(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  controller.findOne.bind(controller)
);
router.post(
  '/',
  isAuth,
  authorize('admin'),
  validate({ body: createUserSchema }),
  controller.create.bind(controller)
);
router.put(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateUserSchema }),
  controller.update.bind(controller)
);
router.delete(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  controller.delete.bind(controller)
);

export default router;
