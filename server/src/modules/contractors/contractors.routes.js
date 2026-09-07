import express from 'express';
import ContractorsController from './contractors.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Summary
router.get('/summary', ContractorsController.summary);

// Contractors
router.get('/', ContractorsController.listContractors);
router.post('/', ContractorsController.createContractor);

// Contracts
router.get('/contracts', ContractorsController.listContracts);
router.post('/contracts', ContractorsController.createContract);

// Workers
router.get('/workers', ContractorsController.listWorkers);
router.post('/workers', ContractorsController.createWorker);

export default router;
