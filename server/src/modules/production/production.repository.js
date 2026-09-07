import db from '../../config/db.js';

export class ProductionRepository {
  // Production Reports
  static async getReports({ mine_ids, is_super_admin, shift, status, from_date, to_date, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`pr.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (shift)     { where.push('pr.shift = ?'); params.push(shift); }
    if (status)    { where.push('pr.status = ?'); params.push(status); }
    if (from_date) { where.push('pr.report_date >= ?'); params.push(from_date); }
    if (to_date)   { where.push('pr.report_date <= ?'); params.push(to_date); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT pr.*, m.name AS mine_name, u.first_name, u.last_name
       FROM production_reports pr
       JOIN mines m ON pr.mine_id = m.id
       JOIN users u ON pr.supervisor_id = u.id
       ${w}
       ORDER BY pr.report_date DESC, pr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM production_reports pr ${w}`, params
    );

    return { rows, total };
  }

  static async createReport(data) {
    const { mine_id, supervisor_id, report_date, shift, target_tonnes, actual_tonnes, equipment_downtime_hrs, remarks, status } = data;
    const [r] = await db.query(
      `INSERT INTO production_reports (mine_id, supervisor_id, report_date, shift, target_tonnes, actual_tonnes, equipment_downtime_hrs, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        actual_tonnes = VALUES(actual_tonnes),
        target_tonnes = VALUES(target_tonnes),
        equipment_downtime_hrs = VALUES(equipment_downtime_hrs),
        remarks = VALUES(remarks),
        status = VALUES(status)`,
      [mine_id, supervisor_id, report_date, shift || 'MORNING', target_tonnes || 0, actual_tonnes, equipment_downtime_hrs || 0, remarks || null, status || 'SUBMITTED']
    );
    return r.insertId;
  }

  // Targets
  static async getTargets(mine_ids, is_super_admin) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`pt.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT pt.*, m.name AS mine_name, u.first_name, u.last_name
       FROM production_targets pt
       JOIN mines m ON pt.mine_id = m.id
       LEFT JOIN users u ON pt.set_by = u.id
       ${w}
       ORDER BY pt.created_at DESC`,
      params
    );
    return rows;
  }

  static async createTarget(data) {
    const { mine_id, period_type, period_value, target_tonnes, set_by } = data;
    const [r] = await db.query(
      `INSERT INTO production_targets (mine_id, period_type, period_value, target_tonnes, set_by)
       VALUES (?, ?, ?, ?, ?)`,
      [mine_id, period_type || 'MONTHLY', period_value, target_tonnes, set_by]
    );
    return r.insertId;
  }

  // Operational Issues
  static async getIssues({ mine_ids, is_super_admin, issue_type, severity, status, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`oi.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (issue_type) { where.push('oi.issue_type = ?'); params.push(issue_type); }
    if (severity)   { where.push('oi.severity = ?'); params.push(severity); }
    if (status)     { where.push('oi.status = ?'); params.push(status); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT oi.*, m.name AS mine_name, u.first_name, u.last_name
       FROM operational_issues oi
       JOIN mines m ON oi.mine_id = m.id
       JOIN users u ON oi.reported_by = u.id
       ${w}
       ORDER BY oi.reported_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM operational_issues oi ${w}`, params
    );
    return { rows, total };
  }

  static async createIssue(data) {
    const { mine_id, reported_by, issue_type, description, area, severity } = data;
    const [r] = await db.query(
      `INSERT INTO operational_issues (mine_id, reported_by, issue_type, description, area, severity, status)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
      [mine_id, reported_by, issue_type || 'EQUIPMENT', description, area || null, severity || 'MEDIUM']
    );
    return r.insertId;
  }

  static async updateIssueStatus(id, status) {
    const extra = status === 'RESOLVED' ? ', resolved_at = NOW()' : '';
    await db.query(`UPDATE operational_issues SET status = ? ${extra} WHERE id = ?`, [status, id]);
  }

  // Summary KPIs
  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[prodStats]] = await db.query(
      `SELECT
        COALESCE(SUM(actual_tonnes), 0) AS total_actual_tonnes,
        COALESCE(SUM(target_tonnes), 0) AS total_target_tonnes,
        COALESCE(SUM(equipment_downtime_hrs), 0) AS total_downtime_hrs,
        COUNT(*) AS total_reports
       FROM production_reports ${w}`, p
    ).catch(() => [[{ total_actual_tonnes: 0, total_target_tonnes: 0, total_downtime_hrs: 0, total_reports: 0 }]]);

    const [[issueStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_issues,
        SUM(CASE WHEN status='OPEN' THEN 1 ELSE 0 END) AS open_issues,
        SUM(CASE WHEN status='IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_issues
       FROM operational_issues ${w}`, p
    ).catch(() => [[{ total_issues: 0, open_issues: 0, in_progress_issues: 0 }]]);

    const achievementRate = prodStats.total_target_tonnes > 0
      ? Math.round((prodStats.total_actual_tonnes / prodStats.total_target_tonnes) * 100)
      : 100;

    return {
      ...prodStats,
      ...issueStats,
      achievement_rate: achievementRate,
    };
  }
}

export default ProductionRepository;
