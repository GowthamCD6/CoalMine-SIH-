import express from 'express';
import AuditLogsController from './audit-logs.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listAuditLogsSchema,
  getAuditLogSchema,
} from './audit-logs.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('AUDIT_READ'),
  validate(listAuditLogsSchema),
  AuditLogsController.list
);

router.get(
  '/:id',
  requirePermission('AUDIT_READ'),
  validate(getAuditLogSchema),
  AuditLogsController.getById
);

export default router;
