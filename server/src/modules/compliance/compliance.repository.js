import db from '../../config/db.js';

export class ComplianceRepository {

  // ─── Requirements ────────────────────────────────────────────────────────

  static async findAllRequirements({ mine_ids, org_ids, is_super_admin, category, status = 'ACTIVE', limit = 50, offset = 0 }) {
    let where = ['cr.status = ?'];
    const params = [status];

    if (!is_super_admin) {
      const mineClause = mine_ids?.length
        ? `(cr.mine_id IN (${mine_ids.map(() => '?').join(',')}) OR cr.mine_id IS NULL)`
        : 'cr.mine_id IS NULL';
      const orgClause = org_ids?.length
        ? `(cr.org_id IN (${org_ids.map(() => '?').join(',')}) OR cr.org_id IS NULL)`
        : 'cr.org_id IS NULL';
      where.push(`(${mineClause} AND ${orgClause})`);
      if (mine_ids?.length) params.push(...mine_ids);
      if (org_ids?.length) params.push(...org_ids);
    }
    if (category) { where.push('cr.category = ?'); params.push(category); }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT cr.*, o.name AS org_name, m.name AS mine_name, u.first_name, u.last_name
       FROM compliance_requirements cr
       LEFT JOIN organizations o ON cr.org_id = o.id
       LEFT JOIN mines m ON cr.mine_id = m.id
       LEFT JOIN users u ON cr.created_by = u.id
       ${whereStr}
       ORDER BY cr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM compliance_requirements cr ${whereStr}`,
      params
    );
    return { rows, total };
  }

  static async findRequirementById(id) {
    const [rows] = await db.query(
      `SELECT cr.*, o.name AS org_name, m.name AS mine_name
       FROM compliance_requirements cr
       LEFT JOIN organizations o ON cr.org_id = o.id
       LEFT JOIN mines m ON cr.mine_id = m.id
       WHERE cr.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async createRequirement(data) {
    const { org_id, mine_id, category, title, description, statutory_reference, frequency, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO compliance_requirements (org_id, mine_id, category, title, description, statutory_reference, frequency, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [org_id || null, mine_id || null, category, title, description || null, statutory_reference || null, frequency, created_by || null]
    );
    return result.insertId;
  }

  static async updateRequirement(id, data) {
    const fields = [];
    const params = [];
    ['category', 'title', 'description', 'statutory_reference', 'frequency', 'status'].forEach((f) => {
      if (data[f] !== undefined) { fields.push(`${f} = ?`); params.push(data[f]); }
    });
    if (fields.length === 0) return;
    params.push(id);
    await db.query(`UPDATE compliance_requirements SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  // ─── Assignments ──────────────────────────────────────────────────────────

  static async findAllAssignments({ mine_ids, is_super_admin, status, from_date, to_date, limit = 50, offset = 0 }) {
    let where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`ca.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (status) { where.push('ca.status = ?'); params.push(status); }
    if (from_date) { where.push('ca.due_date >= ?'); params.push(from_date); }
    if (to_date) { where.push('ca.due_date <= ?'); params.push(to_date); }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT ca.*, cr.title AS requirement_title, cr.category, cr.frequency,
              m.name AS mine_name, u.first_name, u.last_name
       FROM compliance_assignments ca
       JOIN compliance_requirements cr ON ca.requirement_id = cr.id
       JOIN mines m ON ca.mine_id = m.id
       LEFT JOIN users u ON ca.assigned_user_id = u.id
       ${whereStr}
       ORDER BY ca.due_date ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM compliance_assignments ca ${whereStr}`,
      params
    );
    return { rows, total };
  }

  static async createAssignment(data) {
    const { requirement_id, mine_id, assigned_user_id, due_date, remarks } = data;
    const [result] = await db.query(
      `INSERT INTO compliance_assignments (requirement_id, mine_id, assigned_user_id, due_date, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [requirement_id, mine_id, assigned_user_id || null, due_date, remarks || null]
    );
    return result.insertId;
  }

  static async updateAssignmentStatus(id, status, remarks = null) {
    await db.query(
      `UPDATE compliance_assignments SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ?`,
      [status, remarks, id]
    );
  }

  // ─── Evidence ─────────────────────────────────────────────────────────────

  static async findEvidenceByAssignment(assignment_id) {
    const [rows] = await db.query(
      `SELECT ce.*, u.first_name, u.last_name, u.username
       FROM compliance_evidence ce
       JOIN users u ON ce.submitted_by = u.id
       WHERE ce.assignment_id = ?
       ORDER BY ce.submitted_at DESC`,
      [assignment_id]
    );
    return rows;
  }

  static async createEvidence(data) {
    const { assignment_id, file_name, file_path, file_type, ocr_extracted_text, submitted_by } = data;
    const [result] = await db.query(
      `INSERT INTO compliance_evidence (assignment_id, file_name, file_path, file_type, ocr_extracted_text, submitted_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assignment_id, file_name || null, file_path || null, file_type || null, ocr_extracted_text || null, submitted_by]
    );
    return result.insertId;
  }

  static async reviewEvidence(id, { review_status, review_remarks, reviewed_by }) {
    await db.query(
      `UPDATE compliance_evidence SET review_status = ?, review_remarks = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [review_status, review_remarks || null, reviewed_by, id]
    );
  }

  // ─── Corrective Actions ───────────────────────────────────────────────────

  static async findCorrectiveActions({ assignment_id, mine_ids, is_super_admin, status }) {
    let where = [];
    const params = [];
    if (assignment_id) { where.push('cca.assignment_id = ?'); params.push(assignment_id); }
    if (status) { where.push('cca.status = ?'); params.push(status); }
    if (!is_super_admin && mine_ids?.length) {
      where.push(`ca.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT cca.*, ca.mine_id, u.first_name, u.last_name
       FROM compliance_corrective_actions cca
       JOIN compliance_assignments ca ON cca.assignment_id = ca.id
       LEFT JOIN users u ON cca.assigned_to = u.id
       ${whereStr}
       ORDER BY cca.deadline ASC`,
      params
    );
    return rows;
  }

  static async createCorrectiveAction(data) {
    const { assignment_id, description, assigned_to, deadline, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO compliance_corrective_actions (assignment_id, description, assigned_to, deadline, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [assignment_id, description, assigned_to || null, deadline || null, created_by || null]
    );
    return result.insertId;
  }

  // ─── Status Board ─────────────────────────────────────────────────────────

  static async getStatusSummary(mine_ids, is_super_admin) {
    let where = '';
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where = `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`;
      params.push(...mine_ids);
    }
    const [rows] = await db.query(
      `SELECT
        status,
        COUNT(*) AS count
       FROM compliance_assignments
       ${where}
       GROUP BY status`,
      params
    );
    return rows;
  }
}

export default ComplianceRepository;
