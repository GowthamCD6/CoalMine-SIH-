import { z } from 'zod';
import { STATUS } from '../../config/constants.js';

export const listOrganizationsSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'name', 'code', 'status', 'created_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE, 'ALL']).optional(),
    search: z.string().optional(),
  }),
};

export const getOrganizationSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createOrganizationSchema = {
  body: z.object({
    name: z.string().min(2).max(150),
    code: z.string().min(2).max(50).toUpperCase(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updateOrganizationSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    code: z.string().min(2).max(50).toUpperCase().optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
