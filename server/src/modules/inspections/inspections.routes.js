import express from 'express';
import InspectionsController from './inspections.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary KPIs
router.get('/summary', InspectionsController.summary);

// Observations (must come before /:id)
router.get('/observations', InspectionsController.listObservations);
router.post('/observations', InspectionsController.createObservation);
router.put('/observations/:id/resolve', InspectionsController.resolveObservation);

// Violations (must come before /:id)
router.get('/violations', InspectionsController.listViolations);
router.post('/violations', InspectionsController.createViolation);
router.put('/violations/:id/status', InspectionsController.updateViolationStatus);

// Inspections CRUD
router.get('/', InspectionsController.list);
router.post('/', InspectionsController.create);
router.get('/:id', InspectionsController.getOne);
router.put('/:id/status', InspectionsController.updateStatus);

// Checklist
router.get('/:id/checklist', InspectionsController.getChecklist);
router.post('/:id/checklist', InspectionsController.addChecklistItem);

export default router;
