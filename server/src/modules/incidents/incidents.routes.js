import express from 'express';
import IncidentsController from './incidents.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary KPIs (before /:id)
router.get('/summary', IncidentsController.summary);

// Incidents CRUD
router.get('/', IncidentsController.list);
router.post('/', IncidentsController.create);
router.get('/:id', IncidentsController.getOne);
router.put('/:id/status', IncidentsController.updateStatus);

// Investigations
router.get('/:id/investigations', IncidentsController.getInvestigations);
router.post('/:id/investigations', IncidentsController.addInvestigation);

// Actions
router.get('/:id/actions', IncidentsController.getActions);
router.post('/:id/actions', IncidentsController.addAction);
router.put('/:id/actions/:actionId/status', IncidentsController.updateActionStatus);

export default router;
