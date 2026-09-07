import express from 'express';
import ComplianceController from './compliance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';

const router = express.Router();
router.use(authenticate);

// ─── Compliance Requirements ───────────────────────────────────────────────
router.get('/requirements', ComplianceController.listRequirements);
router.get('/requirements/:id', ComplianceController.getRequirement);
router.post('/requirements', requirePermission('COMPLIANCE_MANAGE'), ComplianceController.createRequirement);
router.put('/requirements/:id', requirePermission('COMPLIANCE_MANAGE'), ComplianceController.updateRequirement);

// ─── Assignments ──────────────────────────────────────────────────────────
router.get('/assignments', ComplianceController.listAssignments);
router.post('/assignments', requirePermission('COMPLIANCE_MANAGE'), ComplianceController.createAssignment);
router.put('/assignments/:id/status', ComplianceController.updateAssignmentStatus);

// ─── Evidence ─────────────────────────────────────────────────────────────
router.get('/assignments/:assignmentId/evidence', ComplianceController.getEvidence);
router.post('/assignments/:assignmentId/evidence', ComplianceController.submitEvidence);
router.put('/evidence/:evidenceId/review', requirePermission('COMPLIANCE_MANAGE'), ComplianceController.reviewEvidence);

// ─── Corrective Actions ───────────────────────────────────────────────────
router.get('/corrective-actions', ComplianceController.listCorrectiveActions);
router.post('/corrective-actions', ComplianceController.createCorrectiveAction);

// ─── Status Board ─────────────────────────────────────────────────────────
router.get('/status', ComplianceController.getStatusBoard);

export default router;
