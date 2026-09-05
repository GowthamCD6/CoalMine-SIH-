import { z } from 'zod';
import { STATUS } from '../../config/constants.js';

export const listUsersSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.enum(['id', 'username', 'email', 'employee_code', 'status', 'created_at', 'last_login_at']).optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE, 'ALL']).optional(),
    search: z.string().optional(),
    employee_code: z.string().optional(),
    email: z.string().optional(),
  }),
};

export const getUserSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
};

export const createUserSchema = {
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(150),
    password: z.string().min(6).max(100),
    first_name: z.string().min(1).max(100),
    last_name: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    employee_code: z.string().max(50).optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional().default(STATUS.ACTIVE),
  }),
};

export const updateUserSchema = {
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    username: z.string().min(3).max(100).optional(),
    email: z.string().email().max(150).optional(),
    password: z.string().min(6).max(100).optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    employee_code: z.string().max(50).optional().nullable(),
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
};
