import db from '../../config/db.js';

export class EnvironmentRepository {
  static async getObservations({ mine_ids, is_super_admin, parameter_type, status, from_date, to_date, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];

    if (!is_super_admin && mine_ids?.length) {
      where.push(`eo.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (parameter_type) { where.push('eo.parameter_type = ?'); params.push(parameter_type); }
    if (status)         { where.push('eo.status = ?'); params.push(status); }
    if (from_date)      { where.push('eo.observed_at >= ?'); params.push(from_date); }
    if (to_date)        { where.push('eo.observed_at <= ?'); params.push(to_date); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT eo.*, m.name AS mine_name, u.first_name, u.last_name
       FROM env_observations eo
       JOIN mines m ON eo.mine_id = m.id
       JOIN users u ON eo.observer_id = u.id
       ${w}
       ORDER BY eo.observed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM env_observations eo ${w}`, params
    );

    return { rows, total };
  }

  static async createObservation(data) {
    const mine_id = data.mine_id || 1;
    const observer_id = data.observer_id || 1;
    const parameter_type = data.parameter_type || data.parameter_name || 'METHANE';
    const value = data.value !== undefined ? data.value : (data.measured_value !== undefined ? data.measured_value : 0);
    const unit = data.unit || '';
    const status = data.status || 'NORMAL';
    const gps_lat = data.gps_lat || data.latitude || null;
    const gps_lng = data.gps_lng || data.longitude || null;
    const photo_url = data.photo_url || null;
    
    // Auto-compute status against thresholds if not provided
    let finalStatus = status;
    if (!data.status) {
      const [thresholds] = await db.query(
        `SELECT * FROM env_thresholds WHERE mine_id = ? AND parameter_type = ?`,
        [mine_id, parameter_type]
      );
      if (thresholds.length > 0) {
        const t = thresholds[0];
        const numVal = parseFloat(value);
        if ((t.max_value !== null && numVal > parseFloat(t.max_value)) ||
            (t.min_value !== null && numVal < parseFloat(t.min_value))) {
          finalStatus = 'THRESHOLD_EXCEEDED';
        }
      }
    }

    const [r] = await db.query(
      `INSERT INTO env_observations (mine_id, observer_id, parameter_type, value, unit, status, gps_lat, gps_lng, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mine_id, observer_id, parameter_type, value, unit, finalStatus, gps_lat, gps_lng, photo_url]
    );
    return r.insertId;
  }

  static async getThresholds(mine_ids, is_super_admin) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`et.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT et.*, m.name AS mine_name
       FROM env_thresholds et
       JOIN mines m ON et.mine_id = m.id
       ${w}
       ORDER BY et.mine_id, et.parameter_type`,
      params
    );
    return rows;
  }

  static async upsertThreshold(data) {
    const { mine_id, parameter_type, min_value, max_value, unit, alert_on_breach, created_by } = data;
    const [existing] = await db.query(
      `SELECT id FROM env_thresholds WHERE mine_id = ? AND parameter_type = ?`,
      [mine_id, parameter_type]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE env_thresholds SET min_value = ?, max_value = ?, unit = ?, alert_on_breach = ? WHERE id = ?`,
        [min_value, max_value, unit, alert_on_breach !== false, existing[0].id]
      );
      return existing[0].id;
    } else {
      const [r] = await db.query(
        `INSERT INTO env_thresholds (mine_id, parameter_type, min_value, max_value, unit, alert_on_breach, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [mine_id, parameter_type, min_value, max_value, unit, alert_on_breach !== false, created_by]
      );
      return r.insertId;
    }
  }

  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[statusCounts]] = await db.query(
      `SELECT
        COUNT(*) AS total_readings,
        SUM(CASE WHEN status='NORMAL' THEN 1 ELSE 0 END) AS normal_count,
        SUM(CASE WHEN status='THRESHOLD_EXCEEDED' THEN 1 ELSE 0 END) AS exceeded_count,
        SUM(CASE WHEN status='CRITICAL' THEN 1 ELSE 0 END) AS critical_count,
        SUM(CASE WHEN observed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS last_24h_count
       FROM env_observations ${w}`, p
    ).catch(() => [[{ total_readings: 0, normal_count: 0, exceeded_count: 0, critical_count: 0, last_24h_count: 0 }]]);

    // Average readings per parameter in last 24h
    const [parameterAverages] = await db.query(
      `SELECT parameter_type, AVG(value) AS avg_value, MAX(unit) AS unit, COUNT(*) AS count
       FROM env_observations
       ${w ? w + ' AND ' : 'WHERE '} observed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY parameter_type`, p
    ).catch(() => [[]]);

    return {
      ...statusCounts,
      parameter_averages: parameterAverages,
    };
  }
}

export default EnvironmentRepository;
