import express from 'express';
import PagePermissionsController from './page-permissions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listPagePermissionsSchema,
  attachPagePermissionSchema,
  detachPagePermissionSchema,
} from './page-permissions.validation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  requirePermission('PAGES_READ'),
  validate(listPagePermissionsSchema),
  PagePermissionsController.list
);

router.post(
  '/',
  requirePermission('PAGES_MANAGE'),
  validate(attachPagePermissionSchema),
  PagePermissionsController.attach
);

router.delete(
  '/:permissionId',
  requirePermission('PAGES_MANAGE'),
  validate(detachPagePermissionSchema),
  PagePermissionsController.detach
);

export default router;
