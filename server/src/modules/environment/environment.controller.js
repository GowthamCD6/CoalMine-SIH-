import { EnvironmentService } from './environment.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class EnvironmentController {
  static listObservations = asyncHandler(async (req, res) => {
    const { parameter_type, status, from_date, to_date, limit, offset } = req.query;
    const data = await EnvironmentService.listObservations(req.user.id, {
      parameter_type,
      status,
      from_date,
      to_date,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createObservation = asyncHandler(async (req, res) => {
    const data = await EnvironmentService.createObservation(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static listThresholds = asyncHandler(async (req, res) => {
    const data = await EnvironmentService.listThresholds(req.user.id);
    res.json({ success: true, data });
  });

  static upsertThreshold = asyncHandler(async (req, res) => {
    const data = await EnvironmentService.upsertThreshold(req.user.id, req.body);
    res.json({ success: true, data });
  });

  static summary = asyncHandler(async (req, res) => {
    const data = await EnvironmentService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default EnvironmentController;
