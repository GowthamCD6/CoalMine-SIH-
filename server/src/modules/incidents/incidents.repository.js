import db from '../../config/db.js';

export class IncidentsRepository {

  static async findAll({ mine_ids, is_super_admin, status, category, severity, from_date, to_date, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`i.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (status)    { where.push('i.status = ?'); params.push(status); }
    if (category)  { where.push('i.category = ?'); params.push(category); }
    if (severity)  { where.push('i.severity = ?'); params.push(severity); }
    if (from_date) { where.push('i.incident_at >= ?'); params.push(from_date); }
    if (to_date)   { where.push('i.incident_at <= ?'); params.push(to_date); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT i.*, m.name AS mine_name, u.first_name, u.last_name,
              COUNT(ia.id) AS action_count,
              SUM(CASE WHEN ia.status='OPEN' THEN 1 ELSE 0 END) AS open_actions
       FROM incidents i
       JOIN mines m ON i.mine_id = m.id
       JOIN users u ON i.reported_by = u.id
       LEFT JOIN incident_actions ia ON ia.incident_id = i.id
       ${w}
       GROUP BY i.id, m.name, u.first_name, u.last_name
       ORDER BY i.incident_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM incidents i ${w}`, params
    );
    return { rows, total };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT i.*, m.name AS mine_name, u.first_name, u.last_name
       FROM incidents i
       JOIN mines m ON i.mine_id = m.id
       JOIN users u ON i.reported_by = u.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const { mine_id, reported_by, category, title, description, severity, location_area, gps_lat, gps_lng, photo_url, incident_at } = data;
    const [r] = await db.query(
      `INSERT INTO incidents (mine_id, reported_by, category, title, description, severity, location_area, gps_lat, gps_lng, photo_url, incident_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mine_id, reported_by, category || 'SAFETY', title, description, severity || 'MEDIUM',
       location_area || null, gps_lat || null, gps_lng || null, photo_url || null, incident_at || new Date()]
    );
    return r.insertId;
  }

  static async updateStatus(id, status, closed_by = null) {
    const extra = status === 'CLOSED' ? ', closed_by = ?, closed_at = NOW()' : '';
    const params = status === 'CLOSED' ? [status, closed_by, id] : [status, id];
    await db.query(`UPDATE incidents SET status = ? ${extra} WHERE id = ?`, params);
  }

  // Investigations
  static async getInvestigations(incident_id) {
    const [rows] = await db.query(
      `SELECT ii.*, u.first_name, u.last_name FROM incident_investigations ii
       JOIN users u ON ii.investigator_id = u.id
       WHERE ii.incident_id = ? ORDER BY ii.submitted_at DESC`,
      [incident_id]
    );
    return rows;
  }

  static async createInvestigation(data) {
    const { incident_id, investigator_id, root_cause, findings } = data;
    const [r] = await db.query(
      `INSERT INTO incident_investigations (incident_id, investigator_id, root_cause, findings) VALUES (?, ?, ?, ?)`,
      [incident_id, investigator_id, root_cause || null, findings || null]
    );
    // Move incident to UNDER_INVESTIGATION
    await db.query(`UPDATE incidents SET status = 'UNDER_INVESTIGATION' WHERE id = ?`, [incident_id]);
    return r.insertId;
  }

  // Actions
  static async getActions(incident_id) {
    const [rows] = await db.query(
      `SELECT ia.*, u.first_name, u.last_name FROM incident_actions ia
       LEFT JOIN users u ON ia.assigned_to = u.id
       WHERE ia.incident_id = ? ORDER BY ia.deadline ASC`,
      [incident_id]
    );
    return rows;
  }

  static async createAction(data) {
    const { incident_id, action_type, description, assigned_to, deadline } = data;
    const [r] = await db.query(
      `INSERT INTO incident_actions (incident_id, action_type, description, assigned_to, deadline)
       VALUES (?, ?, ?, ?, ?)`,
      [incident_id, action_type || 'CORRECTIVE', description, assigned_to || null, deadline || null]
    );
    return r.insertId;
  }

  static async updateActionStatus(id, status, verified_by = null) {
    const extra = status === 'VERIFIED' ? ', verified_by = ?, verified_at = NOW()' : '';
    const params = status === 'VERIFIED' ? [status, verified_by, id] : [status, id];
    await db.query(`UPDATE incident_actions SET status = ? ${extra} WHERE id = ?`, params);
  }

  // Summary
  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[row]] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='OPEN' THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN status='CLOSED' THEN 1 ELSE 0 END) AS closed_count,
        SUM(CASE WHEN severity IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS high_severity,
        SUM(CASE WHEN incident_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS last_30_days
       FROM incidents ${w}`, p
    ).catch(() => [[{ total: 0, open_count: 0, closed_count: 0, high_severity: 0, last_30_days: 0 }]]);

    return row;
  }
}

export default IncidentsRepository;
