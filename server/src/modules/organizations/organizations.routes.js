import express from 'express';
import OrganizationsController from './organizations.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listOrganizationsSchema,
  getOrganizationSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
} from './organizations.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('ORGANIZATIONS_READ'),
  validate(listOrganizationsSchema),
  OrganizationsController.list
);

router.get(
  '/:id',
  requirePermission('ORGANIZATIONS_READ', { scope: 'organization' }),
  validate(getOrganizationSchema),
  OrganizationsController.getById
);

router.post(
  '/',
  requirePermission('ORGANIZATIONS_CREATE'),
  validate(createOrganizationSchema),
  OrganizationsController.create
);

router.put(
  '/:id',
  requirePermission('ORGANIZATIONS_UPDATE', { scope: 'organization' }),
  validate(updateOrganizationSchema),
  OrganizationsController.update
);

router.delete(
  '/:id',
  requirePermission('ORGANIZATIONS_DELETE', { scope: 'organization' }),
  validate(getOrganizationSchema),
  OrganizationsController.delete
);

export default router;
