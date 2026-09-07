import express from 'express';
import UsersController from './users.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listUsersSchema,
  getUserSchema,
  createUserSchema,
  updateUserSchema,
} from './users.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('USERS_READ'),
  validate(listUsersSchema),
  UsersController.list
);

router.get(
  '/:id',
  requirePermission('USERS_READ'),
  validate(getUserSchema),
  UsersController.getById
);

router.post(
  '/',
  requirePermission('USERS_CREATE'),
  validate(createUserSchema),
  UsersController.create
);

router.put(
  '/:id',
  requirePermission('USERS_UPDATE'),
  validate(updateUserSchema),
  UsersController.update
);

router.delete(
  '/:id',
  requirePermission('USERS_DELETE'),
  validate(getUserSchema),
  UsersController.delete
);

router.get(
  '/:id/sessions',
  requirePermission('SESSIONS_READ'),
  validate(getUserSchema),
  UsersController.getUserSessions
);

export default router;
