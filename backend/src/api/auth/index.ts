import './auth.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';

import AuthController from '@/api/auth/auth.controller';
import { loginSchema } from '@/api/auth/auth.validation';
import { asyncHandler } from '@/helpers';
import { authLimiter } from '@/middlewares';

const router = Router();
const controller = Container.get(AuthController);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(controller.login.bind(controller))
);

router.post(
  '/refresh-token',
  asyncHandler(controller.refreshToken.bind(controller))
);

router.post('/logout', asyncHandler(controller.logout.bind(controller)));

export default router;
