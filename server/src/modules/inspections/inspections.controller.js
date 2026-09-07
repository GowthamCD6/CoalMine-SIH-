import { InspectionsService } from './inspections.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class InspectionsController {
  // Inspections
  static list = asyncHandler(async (req, res) => {
    const { status, type, from_date, to_date, limit, offset } = req.query;
    const data = await InspectionsService.listInspections(req.user.id, { status, type, from_date, to_date, limit: +limit || 50, offset: +offset || 0 });
    res.json({ success: true, data });
  });

  static getOne = asyncHandler(async (req, res) => {
    const data = await InspectionsService.getInspection(req.params.id);
    res.json({ success: true, data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await InspectionsService.createInspection(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await InspectionsService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data });
  });

  // Checklist
  static getChecklist = asyncHandler(async (req, res) => {
    const data = await InspectionsService.getChecklist(req.params.id);
    res.json({ success: true, data });
  });

  static addChecklistItem = asyncHandler(async (req, res) => {
    const data = await InspectionsService.addChecklistItem(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data });
  });

  // Observations
  static listObservations = asyncHandler(async (req, res) => {
    const { status, severity, limit, offset } = req.query;
    const data = await InspectionsService.listObservations(req.user.id, { status, severity, limit: +limit || 50, offset: +offset || 0 });
    res.json({ success: true, data });
  });

  static createObservation = asyncHandler(async (req, res) => {
    const data = await InspectionsService.createObservation(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static resolveObservation = asyncHandler(async (req, res) => {
    const data = await InspectionsService.resolveObservation(req.user.id, req.params.id);
    res.json({ success: true, data });
  });

  // Violations
  static listViolations = asyncHandler(async (req, res) => {
    const { status, severity, limit, offset } = req.query;
    const data = await InspectionsService.listViolations(req.user.id, { status, severity, limit: +limit || 50, offset: +offset || 0 });
    res.json({ success: true, data });
  });

  static createViolation = asyncHandler(async (req, res) => {
    const data = await InspectionsService.createViolation(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateViolationStatus = asyncHandler(async (req, res) => {
    const data = await InspectionsService.updateViolationStatus(req.user.id, req.params.id, req.body.status);
    res.json({ success: true, data });
  });

  // Summary
  static summary = asyncHandler(async (req, res) => {
    const data = await InspectionsService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default InspectionsController;
