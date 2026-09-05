import express from 'express';
import RolePermissionsController from './role-permissions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listRolePermissionsSchema,
  attachRolePermissionSchema,
  detachRolePermissionSchema,
} from './role-permissions.validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  requirePermission('ROLES_READ'),
  validate(listRolePermissionsSchema),
  RolePermissionsController.list
);

router.post(
  '/',
  requirePermission('ROLES_MANAGE_PERMISSIONS'),
  validate(attachRolePermissionSchema),
  RolePermissionsController.attach
);

router.delete(
  '/:permissionId',
  requirePermission('ROLES_MANAGE_PERMISSIONS'),
  validate(detachRolePermissionSchema),
  RolePermissionsController.detach
);

export default router;
