import express from 'express';
import UserSubrolesController from './user-subroles.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listUserSubrolesSchema,
  listSubroleUsersSchema,
  assignUserSubroleSchema,
  updateUserSubroleSchema,
  unassignUserSubroleSchema,
} from './user-subroles.validation.js';

export const userSubrolesRouter = express.Router({ mergeParams: true });
export const subroleUsersRouter = express.Router({ mergeParams: true });

userSubrolesRouter.use(authenticate);
subroleUsersRouter.use(authenticate);

// Routes for /api/v1/users/:userId/subroles
userSubrolesRouter.get(
  '/',
  requirePermission('USERS_READ'),
  validate(listUserSubrolesSchema),
  UserSubrolesController.listUserSubroles
);

userSubrolesRouter.post(
  '/',
  requirePermission('USERS_MANAGE_ROLES'),
  validate(assignUserSubroleSchema),
  UserSubrolesController.assign
);

userSubrolesRouter.patch(
  '/:subroleId',
  requirePermission('USERS_MANAGE_ROLES'),
  validate(updateUserSubroleSchema),
  UserSubrolesController.update
);

userSubrolesRouter.delete(
  '/:subroleId',
  requirePermission('USERS_MANAGE_ROLES'),
  validate(unassignUserSubroleSchema),
  UserSubrolesController.unassign
);

// Routes for /api/v1/subroles/:subroleId/users
subroleUsersRouter.get(
  '/',
  requirePermission('SUBROLES_READ'),
  validate(listSubroleUsersSchema),
  UserSubrolesController.listSubroleUsers
);

export default {
  userSubrolesRouter,
  subroleUsersRouter,
};
