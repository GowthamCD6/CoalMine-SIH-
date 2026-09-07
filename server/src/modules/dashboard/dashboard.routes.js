import express from 'express';
import DashboardController from './dashboard.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Mine-level KPIs — ?mine_id=N to filter to specific mine
router.get('/mine', DashboardController.getMineDashboard);

// Corporate dashboard — cross-mine aggregation for org-level users
router.get('/corporate', DashboardController.getCorporateDashboard);

// Regulatory dashboard — compliance status for authority users
router.get('/regulatory', DashboardController.getRegulatoryDashboard);

export default router;
