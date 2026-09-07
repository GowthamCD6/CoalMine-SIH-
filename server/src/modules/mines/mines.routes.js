import express from 'express';
import MinesController from './mines.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listMinesSchema,
  getMineSchema,
  createMineSchema,
  updateMineSchema,
} from './mines.validation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('MINES_READ'),
  validate(listMinesSchema),
  MinesController.list
);

router.get(
  '/:id',
  requirePermission('MINES_READ', { scope: 'mine' }),
  validate(getMineSchema),
  MinesController.getById
);

router.post(
  '/',
  requirePermission('MINES_CREATE', { scope: 'organization' }),
  validate(createMineSchema),
  MinesController.create
);

router.put(
  '/:id',
  requirePermission('MINES_UPDATE', { scope: 'mine' }),
  validate(updateMineSchema),
  MinesController.update
);

router.delete(
  '/:id',
  requirePermission('MINES_DELETE', { scope: 'mine' }),
  validate(getMineSchema),
  MinesController.delete
);

export default router;
