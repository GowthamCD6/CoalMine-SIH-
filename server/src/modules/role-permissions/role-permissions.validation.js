import { z } from 'zod';

export const listRolePermissionsSchema = {
  params: z.object({
    roleId: z.coerce.number().positive(),
  }),
};

export const attachRolePermissionSchema = {
  params: z.object({
    roleId: z.coerce.number().positive(),
  }),
  body: z.object({
    permission_id: z.coerce.number().positive(),
  }),
};

export const detachRolePermissionSchema = {
  params: z.object({
    roleId: z.coerce.number().positive(),
    permissionId: z.coerce.number().positive(),
  }),
};
