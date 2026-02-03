import { z } from 'zod';

import { registry } from '@/config/openapi.config';

export const baseSuccessSchema = z.object({
  status: z.string().openapi({ example: 'success' }),
  message: z.string().openapi({ example: 'OK' }),
});

export const dataResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  baseSuccessSchema.extend({
    data: schema.optional(),
  });

export const listResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  baseSuccessSchema.extend({
    data: z.array(schema),
    total: z.number(),
    page: z.number(),
    pages: z.number(),
    limit: z.number(),
  });

export const errorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false),
    error: z.object({
      message: z.string(),
      code: z.string().optional(),
      stack: z.string().optional(),
      details: z
        .array(
          z.object({
            message: z.string(),
            code: z.string(),
          })
        )
        .optional(),
    }),
  })
);
