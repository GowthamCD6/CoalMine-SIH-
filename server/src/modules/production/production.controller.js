import { ProductionService } from './production.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class ProductionController {
  static listReports = asyncHandler(async (req, res) => {
    const { shift, status, from_date, to_date, limit, offset } = req.query;
    const data = await ProductionService.listReports(req.user.id, {
      shift,
      status,
      from_date,
      to_date,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createReport = asyncHandler(async (req, res) => {
    const data = await ProductionService.createReport(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static listTargets = asyncHandler(async (req, res) => {
    const data = await ProductionService.listTargets(req.user.id);
    res.json({ success: true, data });
  });

  static createTarget = asyncHandler(async (req, res) => {
    const data = await ProductionService.createTarget(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static listIssues = asyncHandler(async (req, res) => {
    const { issue_type, severity, status, limit, offset } = req.query;
    const data = await ProductionService.listIssues(req.user.id, {
      issue_type,
      severity,
      status,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createIssue = asyncHandler(async (req, res) => {
    const data = await ProductionService.createIssue(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static updateIssueStatus = asyncHandler(async (req, res) => {
    const data = await ProductionService.updateIssueStatus(req.user.id, req.params.id, req.body.status);
    res.json({ success: true, data });
  });

  static summary = asyncHandler(async (req, res) => {
    const data = await ProductionService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default ProductionController;
