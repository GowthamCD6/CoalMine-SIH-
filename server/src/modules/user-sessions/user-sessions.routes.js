import express from 'express';
import UserSessionsController from './user-sessions.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { sessionParamSchema } from './user-sessions.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/:id',
  requirePermission('SESSIONS_READ'),
  validate(sessionParamSchema),
  UserSessionsController.getById
);

router.delete(
  '/:id',
  requirePermission('SESSIONS_MANAGE'),
  validate(sessionParamSchema),
  UserSessionsController.revoke
);

export default router;
