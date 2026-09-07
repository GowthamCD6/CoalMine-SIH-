import { ComplianceService } from './compliance.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class ComplianceController {

  // ─── Requirements ────────────────────────────────────────────────────────
  static listRequirements = asyncHandler(async (req, res) => {
    const { category, status, limit, offset } = req.query;
    const data = await ComplianceService.listRequirements(req.user.id, { category, status, limit: +limit || 50, offset: +offset || 0 });
    res.json({ success: true, data });
  });

  static getRequirement = asyncHandler(async (req, res) => {
    const data = await ComplianceService.getRequirement(req.params.id);
    res.json({ success: true, data });
  });

  static createRequirement = asyncHandler(async (req, res) => {
    const data = await ComplianceService.createRequirement(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateRequirement = asyncHandler(async (req, res) => {
    const data = await ComplianceService.updateRequirement(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  });

  // ─── Assignments ──────────────────────────────────────────────────────────
  static listAssignments = asyncHandler(async (req, res) => {
    const { status, from_date, to_date, limit, offset } = req.query;
    const data = await ComplianceService.listAssignments(req.user.id, { status, from_date, to_date, limit: +limit || 50, offset: +offset || 0 });
    res.json({ success: true, data });
  });

  static createAssignment = asyncHandler(async (req, res) => {
    const data = await ComplianceService.createAssignment(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateAssignmentStatus = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;
    const data = await ComplianceService.updateAssignmentStatus(req.params.id, status, remarks);
    res.json({ success: true, data });
  });

  // ─── Evidence ─────────────────────────────────────────────────────────────
  static getEvidence = asyncHandler(async (req, res) => {
    const data = await ComplianceService.getEvidenceForAssignment(req.params.assignmentId);
    res.json({ success: true, data });
  });

  static submitEvidence = asyncHandler(async (req, res) => {
    const data = await ComplianceService.submitEvidence(req.user.id, { ...req.body, assignment_id: req.params.assignmentId });
    res.status(201).json({ success: true, data });
  });

  static reviewEvidence = asyncHandler(async (req, res) => {
    const data = await ComplianceService.reviewEvidence(req.user.id, req.params.evidenceId, req.body);
    res.json({ success: true, data });
  });

  // ─── Corrective Actions ───────────────────────────────────────────────────
  static listCorrectiveActions = asyncHandler(async (req, res) => {
    const { assignment_id, status } = req.query;
    const data = await ComplianceService.getCorrectiveActions(req.user.id, { assignment_id, status });
    res.json({ success: true, data });
  });

  static createCorrectiveAction = asyncHandler(async (req, res) => {
    const data = await ComplianceService.createCorrectiveAction(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  // ─── Status Board ─────────────────────────────────────────────────────────
  static getStatusBoard = asyncHandler(async (req, res) => {
    const data = await ComplianceService.getStatusBoard(req.user.id);
    res.json({ success: true, data });
  });
}

export default ComplianceController;
