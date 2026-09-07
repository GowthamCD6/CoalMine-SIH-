import DashboardRepository from './dashboard.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';

export class DashboardService {

  /**
   * Mine-level dashboard — stats for mine(s) the user can access.
   * Optional ?mine_id=N to filter to a specific mine.
   */
  static async getMineDashboard(userId, filterMineId = null) {
    const scope = await getScopeForUser(userId);

    let mineIds;
    if (scope.is_super_admin) {
      // Super admin can query everything; if no filter, use all active mines
      if (filterMineId) {
        mineIds = [Number(filterMineId)];
      } else {
        // Return empty — frontend should pass a mine_id for super admin
        mineIds = [];
      }
    } else if (filterMineId) {
      // Validate the requested mine_id is within user's permitted scope
      const requested = Number(filterMineId);
      if (!scope.mine_ids.includes(requested)) {
        return { error: 'Access denied for this mine' };
      }
      mineIds = [requested];
    } else {
      mineIds = scope.mine_ids;
    }

    const stats = await DashboardRepository.getMineStats(mineIds);
    const compliancePct = stats.compliance.total > 0
      ? Math.round((Number(stats.compliance.compliant) / Number(stats.compliance.total)) * 100)
      : null;

    return {
      scope: { mine_ids: mineIds },
      kpis: {
        compliance_pct: compliancePct,
        compliance: stats.compliance,
        incidents: stats.incidents,
        inspections: stats.inspections,
        violations: stats.violations,
        attendance_today: stats.attendance.checked_in || 0,
        active_alerts: stats.alerts.active_alerts || 0,
      },
    };
  }

  /**
   * Corporate dashboard — per-mine summary table for org-level users.
   */
  static async getCorporateDashboard(userId) {
    const scope = await getScopeForUser(userId);

    const orgIds = scope.is_super_admin ? [] : scope.org_ids;
    const mines = await DashboardRepository.getCorporateMinesSummary(orgIds);

    const totalMines = mines.length;
    const highRiskMines = mines.filter((m) => m.risk_level === 'HIGH').length;
    const avgCompliance = mines.length > 0
      ? Math.round(
          mines.reduce((sum, m) => sum + (m.compliance_pct || 0), 0) / mines.length
        )
      : null;

    return {
      summary: { total_mines: totalMines, high_risk_mines: highRiskMines, avg_compliance_pct: avgCompliance },
      mines,
    };
  }

  /**
   * Regulatory dashboard — compliance table across mines the authority can view.
   */
  static async getRegulatoryDashboard(userId) {
    const scope = await getScopeForUser(userId);

    // Regulatory authorities see mine_ids assigned to them
    const mineIds = scope.is_super_admin ? null : scope.mine_ids;
    const rows = await DashboardRepository.getRegulatoryComplianceSummary(mineIds);

    return { compliance_by_mine: rows };
  }
}

export default DashboardService;
