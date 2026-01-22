import { Router } from 'express';
import validate from 'express-zod-safe';
import { Container } from 'typedi';
import AuthController from '@/api/auth/auth.controller';
import { loginSchema } from '@/api/auth/auth.validation';
import Controller from '@/core/controller.core';
import { authLimiter } from '@/middlewares/rate-limit.middleware';
import './auth.doc';

const router = Router();
const controller = Container.get(AuthController);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  Controller.handler(controller.login.bind(controller))
);

// Refresh token is read from httpOnly cookie
router.post(
  '/refresh-token',
  Controller.handler(controller.refreshToken.bind(controller))
);

router.post('/logout', Controller.handler(controller.logout.bind(controller)));

export default router;
