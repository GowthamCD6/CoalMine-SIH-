import express from 'express';
import RolesController from './roles.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listRolesSchema,
  getRoleSchema,
  createRoleSchema,
  updateRoleSchema,
} from './roles.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('ROLES_READ'),
  validate(listRolesSchema),
  RolesController.list
);

router.get(
  '/:id',
  requirePermission('ROLES_READ'),
  validate(getRoleSchema),
  RolesController.getById
);

router.post(
  '/',
  requirePermission('ROLES_CREATE'),
  validate(createRoleSchema),
  RolesController.create
);

router.put(
  '/:id',
  requirePermission('ROLES_UPDATE'),
  validate(updateRoleSchema),
  RolesController.update
);

router.delete(
  '/:id',
  requirePermission('ROLES_DELETE'),
  validate(getRoleSchema),
  RolesController.delete
);

export default router;
