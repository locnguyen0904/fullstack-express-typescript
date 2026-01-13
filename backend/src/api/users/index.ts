import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';
import UserController from '@/api/users/user.controller';
import Controller from '@/core/controller.core';
import { isAuth, authorize } from '@/middlewares/auth.middleware';
import { createUserSchema, updateUserSchema } from './user.validation';
import { idParamSchema } from '@/common/validation/params.validation';
import './user.doc';

const router = Router();
const controller = Container.get(UserController);

router.get(
  '/',
  isAuth,
  authorize('admin'),
  Controller.handler(controller.findAll.bind(controller))
);
router.get(
  '/:id',
  isAuth,
  authorize('admin'),
  Controller.handler(controller.findOne.bind(controller))
);
router.post(
  '/',
  isAuth,
  authorize('admin'),
  validate({ body: createUserSchema }),
  Controller.handler(controller.create.bind(controller))
);
router.put(
  '/:id',
  isAuth,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateUserSchema }),
  Controller.handler(controller.update.bind(controller))
);
router.delete(
  '/:id',
  isAuth,
  authorize('admin'),
  Controller.handler(controller.delete.bind(controller))
);

export default router;
