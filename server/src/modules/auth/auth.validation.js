import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(150),
    password: z.string().min(6).max(100),
    first_name: z.string().min(1).max(100),
    last_name: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    employee_code: z.string().max(50).optional().nullable(),
  }),
};

export const loginSchema = {
  body: z.object({
    login: z.string().min(1), // email or username
    password: z.string().min(1),
    device_id: z.string().max(255).optional().nullable(),
  }),
};

export const refreshSchema = {
  body: z.object({
    refresh_token: z.string().min(1),
    device_id: z.string().max(255).optional().nullable(),
  }),
};

export const logoutSchema = {
  body: z.object({
    refresh_token: z.string().optional(),
    session_id: z.coerce.number().optional(),
  }),
};
