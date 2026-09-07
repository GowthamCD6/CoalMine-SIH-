import express from 'express';
import PagesController from './pages.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import {
  listPagesSchema,
  getPageSchema,
  createPageSchema,
  updatePageSchema,
} from './pages.validation.js';

const router = express.Router();

router.use(authenticate);

// Tree endpoint available to all authenticated users (returns menu filtered to their permissions)
router.get('/tree', PagesController.getTree);

router.get(
  '/',
  requirePermission('PAGES_READ'),
  validate(listPagesSchema),
  PagesController.list
);

router.get(
  '/:id',
  requirePermission('PAGES_READ'),
  validate(getPageSchema),
  PagesController.getById
);

router.post(
  '/',
  requirePermission('PAGES_MANAGE'),
  validate(createPageSchema),
  PagesController.create
);

router.put(
  '/:id',
  requirePermission('PAGES_MANAGE'),
  validate(updatePageSchema),
  PagesController.update
);

router.delete(
  '/:id',
  requirePermission('PAGES_MANAGE'),
  validate(getPageSchema),
  PagesController.delete
);

export default router;
