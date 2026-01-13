import { registry } from '@/config/openapi.config';
import { z } from 'zod';
import { loginSchema } from './auth.validation';

const tokenResponseSchema = z.object({
  token: z
    .string()
    .openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
});

const userResponseSchema = z.object({
  _id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
  fullName: z.string().openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'john@example.com' }),
  role: z.enum(['admin', 'user']).openapi({ example: 'user' }),
});

// POST /auth/login
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  description:
    'Returns access token and sets refresh token in httpOnly cookie.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Login successfully' }),
            data: z.object({
              user: userResponseSchema,
              token: z.string().openapi({
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              }),
            }),
          }),
        },
      },
    },
    401: { description: 'Incorrect email or password' },
  },
});

// POST /auth/refresh-token
registry.registerPath({
  method: 'post',
  path: '/auth/refresh-token',
  tags: ['Auth'],
  summary: 'Refresh access token',
  description:
    'Reads refresh token from httpOnly cookie and returns new access token.',
  responses: {
    200: {
      description: 'Token refreshed successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Token refreshed' }),
            data: tokenResponseSchema,
          }),
        },
      },
    },
    401: { description: 'No refresh token provided or invalid token' },
  },
});

// POST /auth/logout
registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Logout user',
  description: 'Clears the refresh token cookie.',
  responses: {
    200: {
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Logout successfully' }),
          }),
        },
      },
    },
  },
});
