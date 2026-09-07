import db from '../../config/db.js';

export class InspectionsRepository {

  // ─── Inspections ──────────────────────────────────────────────────────────
  static async findAll({ mine_ids, is_super_admin, status, type, from_date, to_date, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`i.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (status) { where.push('i.status = ?'); params.push(status); }
    if (type)   { where.push('i.inspection_type = ?'); params.push(type); }
    if (from_date) { where.push('i.scheduled_at >= ?'); params.push(from_date); }
    if (to_date)   { where.push('i.scheduled_at <= ?'); params.push(to_date); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT i.*, m.name AS mine_name, u.first_name, u.last_name, u.username,
              COUNT(ci.id) AS checklist_count,
              SUM(CASE WHEN ci.status = 'ISSUE' THEN 1 ELSE 0 END) AS issues_count
       FROM inspections i
       JOIN mines m ON i.mine_id = m.id
       JOIN users u ON i.inspector_user_id = u.id
       LEFT JOIN inspection_checklist_items ci ON ci.inspection_id = i.id
       ${w}
       GROUP BY i.id, m.name, u.first_name, u.last_name, u.username
       ORDER BY i.scheduled_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM inspections i ${w}`, params
    );
    return { rows, total };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT i.*, m.name AS mine_name, u.first_name, u.last_name
       FROM inspections i
       JOIN mines m ON i.mine_id = m.id
       JOIN users u ON i.inspector_user_id = u.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const { mine_id, inspector_user_id, inspection_type, area, description, scheduled_at } = data;
    const [r] = await db.query(
      `INSERT INTO inspections (mine_id, inspector_user_id, inspection_type, area, description, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mine_id, inspector_user_id, inspection_type || 'ROUTINE', area || null, description || null, scheduled_at]
    );
    return r.insertId;
  }

  static async updateStatus(id, status) {
    const extra = status === 'COMPLETED' ? ', completed_at = NOW()' : '';
    await db.query(`UPDATE inspections SET status = ? ${extra} WHERE id = ?`, [status, id]);
  }

  // ─── Checklist Items ──────────────────────────────────────────────────────
  static async getChecklist(inspection_id) {
    const [rows] = await db.query(
      `SELECT * FROM inspection_checklist_items WHERE inspection_id = ? ORDER BY id ASC`,
      [inspection_id]
    );
    return rows;
  }

  static async addChecklistItem(data) {
    const { inspection_id, item_text, status, severity, gps_lat, gps_lng, remarks, evidence_url } = data;
    const [r] = await db.query(
      `INSERT INTO inspection_checklist_items (inspection_id, item_text, status, severity, gps_lat, gps_lng, remarks, evidence_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id, item_text, status || 'OK', severity || null, gps_lat || null, gps_lng || null, remarks || null, evidence_url || null]
    );
    return r.insertId;
  }

  // ─── Safety Observations ──────────────────────────────────────────────────
  static async findObservations({ mine_ids, is_super_admin, status, severity, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`so.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (status)   { where.push('so.status = ?'); params.push(status); }
    if (severity) { where.push('so.severity = ?'); params.push(severity); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT so.*, m.name AS mine_name, u.first_name, u.last_name
       FROM safety_observations so
       JOIN mines m ON so.mine_id = m.id
       JOIN users u ON so.observer_user_id = u.id
       ${w}
       ORDER BY so.timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM safety_observations so ${w}`, params
    );
    return { rows, total };
  }

  static async createObservation(data) {
    const { mine_id, observer_user_id, area, description, severity, photo_url, gps_lat, gps_lng } = data;
    const [r] = await db.query(
      `INSERT INTO safety_observations (mine_id, observer_user_id, area, description, severity, photo_url, gps_lat, gps_lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [mine_id, observer_user_id, area || null, description, severity || 'MEDIUM', photo_url || null, gps_lat || null, gps_lng || null]
    );
    return r.insertId;
  }

  static async resolveObservation(id, resolved_by) {
    await db.query(
      `UPDATE safety_observations SET status = 'RESOLVED', resolved_by = ?, resolved_at = NOW() WHERE id = ?`,
      [resolved_by, id]
    );
  }

  // ─── Violations ───────────────────────────────────────────────────────────
  static async findViolations({ mine_ids, is_super_admin, status, severity, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`v.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (status)   { where.push('v.status = ?'); params.push(status); }
    if (severity) { where.push('v.severity = ?'); params.push(severity); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT v.*, m.name AS mine_name, u.first_name, u.last_name
       FROM violations v
       JOIN mines m ON v.mine_id = m.id
       LEFT JOIN users u ON v.assigned_to = u.id
       ${w}
       ORDER BY v.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM violations v ${w}`, params
    );
    return { rows, total };
  }

  static async createViolation(data) {
    const { inspection_id, observation_id, mine_id, type, description, severity, assigned_to, deadline } = data;
    const [r] = await db.query(
      `INSERT INTO violations (inspection_id, observation_id, mine_id, type, description, severity, assigned_to, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [inspection_id || null, observation_id || null, mine_id, type || 'SAFETY', description, severity || 'MEDIUM', assigned_to || null, deadline || null]
    );
    return r.insertId;
  }

  static async updateViolationStatus(id, status, closed_by) {
    const extra = status === 'CLOSED' ? ', closed_by = ?, closed_at = NOW()' : '';
    const params = status === 'CLOSED' ? [status, closed_by, id] : [status, id];
    await db.query(`UPDATE violations SET status = ? ${extra} WHERE id = ?`, params);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[insp]] = await db.query(
      `SELECT
        SUM(CASE WHEN status='SCHEDULED' THEN 1 ELSE 0 END) AS scheduled,
        SUM(CASE WHEN status='IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status='OVERDUE' THEN 1 ELSE 0 END) AS overdue,
        COUNT(*) AS total
       FROM inspections ${w}`, p
    ).catch(() => [[{ scheduled: 0, in_progress: 0, completed: 0, overdue: 0, total: 0 }]]);

    const [[viol]] = await db.query(
      `SELECT
        SUM(CASE WHEN status='OPEN' THEN 1 ELSE 0 END) AS open_violations,
        SUM(CASE WHEN severity IN ('HIGH','CRITICAL') AND status='OPEN' THEN 1 ELSE 0 END) AS critical_open,
        COUNT(*) AS total_violations
       FROM violations ${w}`, p
    ).catch(() => [[{ open_violations: 0, critical_open: 0, total_violations: 0 }]]);

    const [[obs]] = await db.query(
      `SELECT COUNT(*) AS total_observations,
        SUM(CASE WHEN status='OPEN' AND severity IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS critical_open
       FROM safety_observations ${w}`, p
    ).catch(() => [[{ total_observations: 0, critical_open: 0 }]]);

    return { inspections: insp, violations: viol, observations: obs };
  }
}

export default InspectionsRepository;
