import { z } from 'zod';
import { STATUS, PAGE_TYPE } from '../../config/constants.js';

export const listPagesSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'name', 'code', 'sort_order', 'status', 'created_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE, 'ALL']).optional(),
    parent_id: z.coerce.number().optional().nullable(),
    type: z.enum([PAGE_TYPE.PAGE, PAGE_TYPE.MENU, PAGE_TYPE.GROUP]).optional(),
    search: z.string().optional(),
  }),
};

export const getPageSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createPageSchema = {
  body: z.object({
    name: z.string().min(2).max(150),
    code: z.string().min(2).max(100).toUpperCase(),
    route: z.string().max(255).optional().nullable(),
    parent_id: z.coerce.number().positive().optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    sort_order: z.coerce.number().int().optional().default(0),
    type: z.enum([PAGE_TYPE.PAGE, PAGE_TYPE.MENU, PAGE_TYPE.GROUP]).default(PAGE_TYPE.PAGE),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updatePageSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    code: z.string().min(2).max(100).toUpperCase().optional(),
    route: z.string().max(255).optional().nullable(),
    parent_id: z.coerce.number().positive().optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    sort_order: z.coerce.number().int().optional(),
    type: z.enum([PAGE_TYPE.PAGE, PAGE_TYPE.MENU, PAGE_TYPE.GROUP]).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
