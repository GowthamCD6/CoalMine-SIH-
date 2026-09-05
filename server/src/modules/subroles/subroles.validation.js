import { z } from 'zod';
import { STATUS } from '../../config/constants.js';

export const listSubrolesSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'name', 'code', 'status', 'created_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    role_id: z.coerce.number().optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE, 'ALL']).optional(),
    search: z.string().optional(),
  }),
};

export const getSubroleSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createSubroleSchema = {
  body: z.object({
    role_id: z.coerce.number().positive(),
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(50).toUpperCase(),
    description: z.string().optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updateSubroleSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    role_id: z.coerce.number().positive().optional(),
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(50).toUpperCase().optional(),
    description: z.string().optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
