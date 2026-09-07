import express from 'express';
import MaterialsController from './materials.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listMaterialsSchema,
  getMaterialSchema,
  createMaterialSchema,
  updateMaterialStatusSchema,
} from './materials.validation.js';

const router = express.Router();

// Require authentication on all materials endpoints
router.use(authenticate);

// Get summary metrics (must be defined before /:id)
router.get(
  '/summary',
  requirePermission('MATERIALS_READ'),
  MaterialsController.getSummary
);

// List material inward records
router.get(
  '/',
  requirePermission('MATERIALS_READ'),
  validate(listMaterialsSchema),
  MaterialsController.list
);

// Get single consignment details
router.get(
  '/:id',
  requirePermission('MATERIALS_READ'),
  validate(getMaterialSchema),
  MaterialsController.getById
);

// Log inbound material - accessible to all roles with MATERIALS_CREATE
router.post(
  '/',
  requirePermission('MATERIALS_CREATE'),
  validate(createMaterialSchema),
  MaterialsController.create
);

// Update inspection status
router.patch(
  '/:id/status',
  requirePermission('MATERIALS_APPROVE'),
  validate(updateMaterialStatusSchema),
  MaterialsController.updateStatus
);

// Delete record (Admin / Super Admin only)
router.delete(
  '/:id',
  requirePermission('MATERIALS_DELETE'),
  validate(getMaterialSchema),
  MaterialsController.delete
);

export default router;
