import { z } from 'zod';

export const listSubrolePermissionsSchema = {
  params: z.object({
    subroleId: z.coerce.number().positive(),
  }),
};

export const attachSubrolePermissionSchema = {
  params: z.object({
    subroleId: z.coerce.number().positive(),
  }),
  body: z.object({
    permission_id: z.coerce.number().positive(),
  }),
};

export const detachSubrolePermissionSchema = {
  params: z.object({
    subroleId: z.coerce.number().positive(),
    permissionId: z.coerce.number().positive(),
  }),
};
