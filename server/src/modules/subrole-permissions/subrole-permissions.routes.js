import express from 'express';
import SubrolePermissionsController from './subrole-permissions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listSubrolePermissionsSchema,
  attachSubrolePermissionSchema,
  detachSubrolePermissionSchema,
} from './subrole-permissions.validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  requirePermission('SUBROLES_READ'),
  validate(listSubrolePermissionsSchema),
  SubrolePermissionsController.list
);

router.post(
  '/',
  requirePermission('SUBROLES_MANAGE_PERMISSIONS'),
  validate(attachSubrolePermissionSchema),
  SubrolePermissionsController.attach
);

router.delete(
  '/:permissionId',
  requirePermission('SUBROLES_MANAGE_PERMISSIONS'),
  validate(detachSubrolePermissionSchema),
  SubrolePermissionsController.detach
);

export default router;
