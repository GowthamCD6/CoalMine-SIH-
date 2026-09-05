import express from 'express';
import SubrolesController from './subroles.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listSubrolesSchema,
  getSubroleSchema,
  createSubroleSchema,
  updateSubroleSchema,
} from './subroles.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('SUBROLES_READ'),
  validate(listSubrolesSchema),
  SubrolesController.list
);

router.get(
  '/:id',
  requirePermission('SUBROLES_READ'),
  validate(getSubroleSchema),
  SubrolesController.getById
);

router.post(
  '/',
  requirePermission('SUBROLES_CREATE'),
  validate(createSubroleSchema),
  SubrolesController.create
);

router.put(
  '/:id',
  requirePermission('SUBROLES_UPDATE'),
  validate(updateSubroleSchema),
  SubrolesController.update
);

router.delete(
  '/:id',
  requirePermission('SUBROLES_DELETE'),
  validate(getSubroleSchema),
  SubrolesController.delete
);

export default router;
