import { IncidentsService } from './incidents.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class IncidentsController {
  static list = asyncHandler(async (req, res) => {
    const { status, category, severity, from_date, to_date, limit, offset } = req.query;
    const data = await IncidentsService.listIncidents(req.user.id, {
      status,
      category,
      severity,
      from_date,
      to_date,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static getOne = asyncHandler(async (req, res) => {
    const data = await IncidentsService.getIncident(req.params.id);
    res.json({ success: true, data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await IncidentsService.createIncident(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await IncidentsService.updateStatus(req.user.id, req.params.id, req.body.status);
    res.json({ success: true, data });
  });

  static addInvestigation = asyncHandler(async (req, res) => {
    const data = await IncidentsService.addInvestigation(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static getInvestigations = asyncHandler(async (req, res) => {
    const data = await IncidentsService.getInvestigations(req.params.id);
    res.json({ success: true, data });
  });

  static addAction = asyncHandler(async (req, res) => {
    const data = await IncidentsService.addAction(req.params.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static getActions = asyncHandler(async (req, res) => {
    const data = await IncidentsService.getActions(req.params.id);
    res.json({ success: true, data });
  });

  static updateActionStatus = asyncHandler(async (req, res) => {
    const data = await IncidentsService.updateActionStatus(req.user.id, req.params.actionId, req.body.status);
    res.json({ success: true, data });
  });

  static summary = asyncHandler(async (req, res) => {
    const data = await IncidentsService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default IncidentsController;
