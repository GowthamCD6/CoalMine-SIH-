import { z } from 'zod';

export const listPagePermissionsSchema = {
  params: z.object({
    pageId: z.coerce.number().positive(),
  }),
};

export const attachPagePermissionSchema = {
  params: z.object({
    pageId: z.coerce.number().positive(),
  }),
  body: z.object({
    permission_id: z.coerce.number().positive(),
  }),
};

export const detachPagePermissionSchema = {
  params: z.object({
    pageId: z.coerce.number().positive(),
    permissionId: z.coerce.number().positive(),
  }),
};
