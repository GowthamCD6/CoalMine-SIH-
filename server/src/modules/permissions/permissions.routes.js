import express from 'express';
import PermissionsController from './permissions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listPermissionsSchema,
  getPermissionSchema,
  createPermissionSchema,
  updatePermissionSchema,
} from './permissions.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('PERMISSIONS_READ'),
  validate(listPermissionsSchema),
  PermissionsController.list
);

router.get(
  '/:id',
  requirePermission('PERMISSIONS_READ'),
  validate(getPermissionSchema),
  PermissionsController.getById
);

router.post(
  '/',
  requirePermission('PERMISSIONS_MANAGE'),
  validate(createPermissionSchema),
  PermissionsController.create
);

router.put(
  '/:id',
  requirePermission('PERMISSIONS_MANAGE'),
  validate(updatePermissionSchema),
  PermissionsController.update
);

router.delete(
  '/:id',
  requirePermission('PERMISSIONS_MANAGE'),
  validate(getPermissionSchema),
  PermissionsController.delete
);

export default router;
