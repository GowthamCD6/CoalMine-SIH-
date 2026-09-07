import express from 'express';
import ProductionController from './production.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary KPI
router.get('/summary', ProductionController.summary);

// Production Reports
router.get('/reports', ProductionController.listReports);
router.post('/reports', ProductionController.createReport);

// Production Targets
router.get('/targets', ProductionController.listTargets);
router.post('/targets', ProductionController.createTarget);

// Operational Issues
router.get('/issues', ProductionController.listIssues);
router.post('/issues', ProductionController.createIssue);
router.put('/issues/:id/status', ProductionController.updateIssueStatus);

export default router;
