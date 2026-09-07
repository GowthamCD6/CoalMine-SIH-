import { z } from 'zod';
import { STATUS } from '../../config/constants.js';

export const listUserSubrolesSchema = {
  params: z.object({
    userId: z.coerce.number().positive(),
  }),
};

export const listSubroleUsersSchema = {
  params: z.object({
    subroleId: z.coerce.number().positive(),
  }),
};

export const assignUserSubroleSchema = {
  params: z.object({
    userId: z.coerce.number().positive(),
  }),
  body: z.object({
    subrole_id: z.coerce.number().positive(),
    expires_at: z.string().datetime().optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updateUserSubroleSchema = {
  params: z.object({
    userId: z.coerce.number().positive(),
    subroleId: z.coerce.number().positive(),
  }),
  body: z.object({
    expires_at: z.string().datetime().optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};

export const unassignUserSubroleSchema = {
  params: z.object({
    userId: z.coerce.number().positive(),
    subroleId: z.coerce.number().positive(),
  }),
};
