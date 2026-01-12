import { registry } from '@/config/openapi.config';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './user.validation';
import { idParamSchema } from '@/common/validation/params.validation';

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const security = [{ [bearerAuth.name]: [] }];

const userResponseSchema = z.object({
  _id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
  fullName: z.string().openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'john@example.com' }),
  role: z.enum(['admin', 'user']).openapi({ example: 'user' }),
  createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
});

// GET /users
registry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  summary: 'Get all users',
  security,
  responses: {
    200: {
      description: 'List of users',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(userResponseSchema),
            total: z.number(),
            page: z.number(),
            pages: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
  },
});

// GET /users/:id
registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Get a user by ID',
  security,
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'User details',
      content: {
        'application/json': {
          schema: z.object({
            data: userResponseSchema,
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'User not found' },
  },
});

// POST /users
registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  summary: 'Create a new user',
  security,
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: userResponseSchema,
          }),
        },
      },
    },
    400: { description: 'Bad request - Email already taken' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
  },
});

// PUT /users/:id
registry.registerPath({
  method: 'put',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Update a user',
  security,
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: userResponseSchema,
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'User not found' },
  },
});

// DELETE /users/:id
registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Delete a user',
  security,
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'User deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: userResponseSchema,
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'User not found' },
  },
});
