import { GrievancesService } from './grievances.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class GrievancesController {
  static list = asyncHandler(async (req, res) => {
    const { category, priority, status, limit, offset } = req.query;
    const data = await GrievancesService.listGrievances(req.user.id, {
      category,
      priority,
      status,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static getOne = asyncHandler(async (req, res) => {
    const data = await GrievancesService.getGrievance(req.params.id);
    res.json({ success: true, data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await GrievancesService.createGrievance(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await GrievancesService.updateStatus(req.user.id, req.params.id, req.body.status, req.body.assigned_to);
    res.json({ success: true, data });
  });

  static addResponse = asyncHandler(async (req, res) => {
    const data = await GrievancesService.addResponse(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static summary = asyncHandler(async (req, res) => {
    const data = await GrievancesService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default GrievancesController;
