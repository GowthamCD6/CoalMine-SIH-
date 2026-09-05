import { z } from 'zod';
import { STATUS, MINE_TYPE } from '../../config/constants.js';

export const listMinesSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'name', 'code', 'mine_type', 'status', 'created_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    organization_id: z.coerce.number().optional(),
    mine_type: z.enum([MINE_TYPE.OPEN_CAST, MINE_TYPE.UNDERGROUND, MINE_TYPE.MIXED]).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE, 'ALL']).optional(),
    search: z.string().optional(),
  }),
};

export const getMineSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createMineSchema = {
  body: z.object({
    organization_id: z.coerce.number().positive(),
    name: z.string().min(2).max(150),
    code: z.string().min(2).max(50).toUpperCase(),
    mine_type: z.enum([MINE_TYPE.OPEN_CAST, MINE_TYPE.UNDERGROUND, MINE_TYPE.MIXED]),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updateMineSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    organization_id: z.coerce.number().positive().optional(),
    name: z.string().min(2).max(150).optional(),
    code: z.string().min(2).max(50).toUpperCase().optional(),
    mine_type: z.enum([MINE_TYPE.OPEN_CAST, MINE_TYPE.UNDERGROUND, MINE_TYPE.MIXED]).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
