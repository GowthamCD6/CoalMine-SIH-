import express from 'express';
import GrievancesController from './grievances.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary KPI (before /:id)
router.get('/summary', GrievancesController.summary);

// Grievances CRUD
router.get('/', GrievancesController.list);
router.post('/', GrievancesController.create);
router.get('/:id', GrievancesController.getOne);
router.put('/:id/status', GrievancesController.updateStatus);

// Responses & Remediation
router.post('/:id/responses', GrievancesController.addResponse);

export default router;
