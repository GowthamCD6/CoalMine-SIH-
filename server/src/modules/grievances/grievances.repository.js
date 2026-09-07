import db from '../../config/db.js';

export class GrievancesRepository {
  static async getGrievances({ mine_ids, is_super_admin, category, priority, status, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`g.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (category) { where.push('g.category = ?'); params.push(category); }
    if (priority) { where.push('g.priority = ?'); params.push(priority); }
    if (status)   { where.push('g.status = ?'); params.push(status); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT g.*, m.name AS mine_name,
              CASE WHEN g.is_anonymous = 1 THEN 'Anonymous Worker' ELSE CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) END AS submitter_name,
              COUNT(gr.id) AS response_count
       FROM grievances g
       JOIN mines m ON g.mine_id = m.id
       JOIN users u ON g.submitted_by = u.id
       LEFT JOIN grievance_responses gr ON gr.grievance_id = g.id
       ${w}
       GROUP BY g.id
       ORDER BY g.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM grievances g ${w}`, params
    );

    return { rows, total };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT g.*, m.name AS mine_name,
              CASE WHEN g.is_anonymous = 1 THEN 'Anonymous Worker' ELSE CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) END AS submitter_name
       FROM grievances g
       JOIN mines m ON g.mine_id = m.id
       JOIN users u ON g.submitted_by = u.id
       WHERE g.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async createGrievance(data) {
    const { mine_id, submitted_by, is_anonymous, category, title, description, evidence_url, priority } = data;
    const [r] = await db.query(
      `INSERT INTO grievances (mine_id, submitted_by, is_anonymous, category, title, description, evidence_url, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')`,
      [mine_id, submitted_by, is_anonymous ? 1 : 0, category || 'OTHER', title, description, evidence_url || null, priority || 'MEDIUM']
    );
    return r.insertId;
  }

  static async updateStatus(id, status, assigned_to = null) {
    const extra = assigned_to ? ', assigned_to = ?' : '';
    const params = assigned_to ? [status, assigned_to, id] : [status, id];
    await db.query(`UPDATE grievances SET status = ? ${extra} WHERE id = ?`, params);
  }

  static async getResponses(grievance_id) {
    const [rows] = await db.query(
      `SELECT gr.*, u.first_name, u.last_name
       FROM grievance_responses gr
       JOIN users u ON gr.responder_id = u.id
       WHERE gr.grievance_id = ?
       ORDER BY gr.responded_at ASC`,
      [grievance_id]
    );
    return rows;
  }

  static async addResponse(data) {
    const { grievance_id, responder_id, response_text, action_taken } = data;
    const [r] = await db.query(
      `INSERT INTO grievance_responses (grievance_id, responder_id, response_text, action_taken)
       VALUES (?, ?, ?, ?)`,
      [grievance_id, responder_id, response_text, action_taken || null]
    );
    // Auto move to RESOLVED if action was taken, else UNDER_INVESTIGATION
    const newStatus = action_taken ? 'RESOLVED' : 'UNDER_INVESTIGATION';
    await db.query(`UPDATE grievances SET status = ? WHERE id = ?`, [newStatus, grievance_id]);
    return r.insertId;
  }

  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[row]] = await db.query(
      `SELECT
        COUNT(*) AS total_grievances,
        SUM(CASE WHEN status='SUBMITTED' THEN 1 ELSE 0 END) AS pending_triage,
        SUM(CASE WHEN status='UNDER_INVESTIGATION' THEN 1 ELSE 0 END) AS in_investigation,
        SUM(CASE WHEN status='RESOLVED' THEN 1 ELSE 0 END) AS resolved_count,
        SUM(CASE WHEN is_anonymous=1 THEN 1 ELSE 0 END) AS anonymous_count
       FROM grievances ${w}`, p
    ).catch(() => [[{ total_grievances: 0, pending_triage: 0, in_investigation: 0, resolved_count: 0, anonymous_count: 0 }]]);

    return row;
  }
}

export default GrievancesRepository;
