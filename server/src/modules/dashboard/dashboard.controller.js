import { DashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class DashboardController {
  static getMineDashboard = asyncHandler(async (req, res) => {
    const mine_id = req.query.mine_id || null;
    const data = await DashboardService.getMineDashboard(req.user.id, mine_id);
    res.status(200).json({ success: true, data });
  });

  static getCorporateDashboard = asyncHandler(async (req, res) => {
    const data = await DashboardService.getCorporateDashboard(req.user.id);
    res.status(200).json({ success: true, data });
  });

  static getRegulatoryDashboard = asyncHandler(async (req, res) => {
    const data = await DashboardService.getRegulatoryDashboard(req.user.id);
    res.status(200).json({ success: true, data });
  });
}

export default DashboardController;
