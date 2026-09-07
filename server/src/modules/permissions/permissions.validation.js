import { z } from 'zod';

export const listPermissionsSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'name', 'code', 'created_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    search: z.string().optional(),
  }),
};

export const getPermissionSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createPermissionSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(100).toUpperCase(),
    description: z.string().optional().nullable(),
  }),
};

export const updatePermissionSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(100).toUpperCase().optional(),
    description: z.string().optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
