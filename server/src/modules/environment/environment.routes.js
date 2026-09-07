import express from 'express';
import EnvironmentController from './environment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary & KPI analytics
router.get('/summary', EnvironmentController.summary);

// Observations
router.get('/observations', EnvironmentController.listObservations);
router.post('/observations', EnvironmentController.createObservation);

// Thresholds
router.get('/thresholds', EnvironmentController.listThresholds);
router.post('/thresholds', EnvironmentController.upsertThreshold);

export default router;
