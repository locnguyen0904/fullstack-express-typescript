import './auth.doc';

import { Router } from 'express';
import validate from 'express-zod-safe';
import { container } from 'tsyringe';

import AuthController from '@/api/auth/auth.controller';
import { loginSchema } from '@/api/auth/auth.validation';
import { authLimiter } from '@/middlewares';

const router = Router();
const controller = container.resolve(AuthController);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  controller.login.bind(controller)
);

router.post('/refresh-token', controller.refreshToken.bind(controller));

router.post('/logout', controller.logout.bind(controller));

export default router;
