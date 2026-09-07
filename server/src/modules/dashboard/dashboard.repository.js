import db from '../../config/db.js';

export class DashboardRepository {

  /**
   * Returns high-level KPIs for a single mine (or array of mines for corporate).
   */
  static async getMineStats(mineIds) {
    if (!mineIds || mineIds.length === 0) {
      return this._emptyStats();
    }
    const placeholders = mineIds.map(() => '?').join(',');

    // Compliance stats
    const [complianceRows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'COMPLIANT' THEN 1 ELSE 0 END) AS compliant,
        SUM(CASE WHEN status = 'NON_COMPLIANT' THEN 1 ELSE 0 END) AS non_compliant,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) AS overdue,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending
       FROM compliance_assignments
       WHERE mine_id IN (${placeholders})`,
      mineIds
    ).catch(() => [[{ total: 0, compliant: 0, non_compliant: 0, overdue: 0, pending: 0 }]]);

    // Incident stats (last 30 days)
    const [incidentRows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN severity = 'HIGH' OR severity = 'CRITICAL' THEN 1 ELSE 0 END) AS high_severity,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) AS closed_count
       FROM incidents
       WHERE mine_id IN (${placeholders})
         AND incident_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      mineIds
    ).catch(() => [[{ total: 0, high_severity: 0, open_count: 0, closed_count: 0 }]]);

    // Inspection stats
    const [inspectionRows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) AS overdue
       FROM inspections
       WHERE mine_id IN (${placeholders})
         AND scheduled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      mineIds
    ).catch(() => [[{ total: 0, completed: 0, pending: 0, overdue: 0 }]]);

    // Safety violations (last 30 days)
    const [violationRows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN severity = 'HIGH' OR severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count
       FROM violations
       WHERE mine_id IN (${placeholders})
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      mineIds
    ).catch(() => [[{ total: 0, critical: 0, open_count: 0 }]]);

    // Today's attendance
    const [attendanceRows] = await db.query(
      `SELECT COUNT(*) AS checked_in
       FROM attendance_logs
       WHERE mine_id IN (${placeholders})
         AND DATE(check_in_time) = CURDATE()
         AND check_out_time IS NULL`,
      mineIds
    ).catch(() => [[{ checked_in: 0 }]]);

    // Emergency alerts (active)
    const [alertRows] = await db.query(
      `SELECT COUNT(*) AS active_alerts
       FROM emergency_alerts
       WHERE mine_id IN (${placeholders})
         AND status = 'ACTIVE'`,
      mineIds
    ).catch(() => [[{ active_alerts: 0 }]]);

    return {
      compliance: complianceRows[0] || {},
      incidents: incidentRows[0] || {},
      inspections: inspectionRows[0] || {},
      violations: violationRows[0] || {},
      attendance: attendanceRows[0] || {},
      alerts: alertRows[0] || {},
    };
  }

  /**
   * Returns per-mine summary rows for the corporate dashboard.
   * Each row has mine info + key metrics.
   */
  static async getCorporateMinesSummary(orgIds) {
    // Get all mines for these orgs
    let mineQuery = `
      SELECT m.id, m.name, m.mine_type, m.status, o.name AS org_name
      FROM mines m
      JOIN organizations o ON m.organization_id = o.id
      WHERE m.status = 'ACTIVE'
    `;
    const params = [];
    if (orgIds && orgIds.length > 0) {
      const placeholders = orgIds.map(() => '?').join(',');
      mineQuery += ` AND m.organization_id IN (${placeholders})`;
      params.push(...orgIds);
    }
    const [mines] = await db.query(mineQuery, params).catch(() => [[]]);

    // For each mine, fetch minimal KPIs
    const summaries = await Promise.all(mines.map(async (mine) => {
      const stats = await this.getMineStats([mine.id]);
      const compliancePct = stats.compliance.total > 0
        ? Math.round((stats.compliance.compliant / stats.compliance.total) * 100)
        : null;
      const riskLevel = this._deriveRiskLevel(stats);
      return {
        mine_id: mine.id,
        mine_name: mine.name,
        org_name: mine.org_name,
        mine_type: mine.mine_type,
        compliance_pct: compliancePct,
        open_incidents: stats.incidents.open_count || 0,
        open_violations: stats.violations.open_count || 0,
        active_alerts: stats.alerts.active_alerts || 0,
        risk_level: riskLevel,
      };
    }));

    return summaries;
  }

  /**
   * Returns compliance summary for regulatory dashboard — all mines or specific.
   */
  static async getRegulatoryComplianceSummary(mineIds) {
    const whereClause = mineIds && mineIds.length > 0
      ? `WHERE ca.mine_id IN (${mineIds.map(() => '?').join(',')})`
      : '';

    const [rows] = await db.query(
      `SELECT
        m.id AS mine_id,
        m.name AS mine_name,
        o.name AS org_name,
        COUNT(ca.id) AS total,
        SUM(CASE WHEN ca.status = 'COMPLIANT' THEN 1 ELSE 0 END) AS compliant,
        SUM(CASE WHEN ca.status = 'NON_COMPLIANT' THEN 1 ELSE 0 END) AS non_compliant,
        SUM(CASE WHEN ca.status = 'OVERDUE' THEN 1 ELSE 0 END) AS overdue
       FROM compliance_assignments ca
       JOIN mines m ON ca.mine_id = m.id
       JOIN organizations o ON m.organization_id = o.id
       ${whereClause}
       GROUP BY m.id, m.name, o.name`,
      mineIds || []
    ).catch(() => [[]]);

    return rows;
  }

  static _emptyStats() {
    return {
      compliance: { total: 0, compliant: 0, non_compliant: 0, overdue: 0, pending: 0 },
      incidents: { total: 0, high_severity: 0, open_count: 0, closed_count: 0 },
      inspections: { total: 0, completed: 0, pending: 0, overdue: 0 },
      violations: { total: 0, critical: 0, open_count: 0 },
      attendance: { checked_in: 0 },
      alerts: { active_alerts: 0 },
    };
  }

  static _deriveRiskLevel(stats) {
    const s = stats;
    const score =
      (s.alerts.active_alerts > 0 ? 40 : 0) +
      ((s.incidents.high_severity || 0) * 10) +
      ((s.violations.critical || 0) * 8) +
      ((s.compliance.overdue || 0) * 5);
    if (score >= 40) return 'HIGH';
    if (score >= 20) return 'MEDIUM';
    return 'LOW';
  }
}

export default DashboardRepository;
