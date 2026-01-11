import { registry } from '@/config/openapi.config';
import { z } from 'zod';
import { createExampleSchema, updateExampleSchema } from './example.validation';

// GET /
registry.registerPath({
  method: 'get',
  path: '/examples',
  tags: ['Examples'],
  summary: 'Get all examples',
  responses: {
    200: {
      description: 'List of examples',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(createExampleSchema),
            total: z.number(),
            page: z.number(),
            pages: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
  },
});

// GET /:id
registry.registerPath({
  method: 'get',
  path: '/examples/{id}',
  tags: ['Examples'],
  summary: 'Get an example by ID',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
    }),
  },
  responses: {
    200: {
      description: 'Example details',
      content: {
        'application/json': {
          schema: z.object({
            data: createExampleSchema.extend({ _id: z.string() }),
          }),
        },
      },
    },
    404: {
      description: 'Example not found',
    },
  },
});

// POST /
registry.registerPath({
  method: 'post',
  path: '/examples',
  tags: ['Examples'],
  summary: 'Create a new example',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createExampleSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Example created successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: createExampleSchema.extend({ _id: z.string() }),
          }),
        },
      },
    },
  },
});

// PUT /:id
registry.registerPath({
  method: 'put',
  path: '/examples/{id}',
  tags: ['Examples'],
  summary: 'Update an example',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateExampleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Example updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: createExampleSchema.extend({ _id: z.string() }),
          }),
        },
      },
    },
    404: {
      description: 'Example not found',
    },
  },
});

// DELETE /:id
registry.registerPath({
  method: 'delete',
  path: '/examples/{id}',
  tags: ['Examples'],
  summary: 'Delete an example',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
    }),
  },
  responses: {
    200: {
      description: 'Example deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: createExampleSchema.extend({ _id: z.string() }),
          }),
        },
      },
    },
    404: {
      description: 'Example not found',
    },
  },
});
