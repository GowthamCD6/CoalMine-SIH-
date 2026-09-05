import db from '../../config/db.js';

export class RolesRepository {
  static async findAll({ organization_id, mine_id, status, search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (organization_id) {
      whereClauses.push('r.organization_id = ?');
      params.push(organization_id);
    }

    if (mine_id) {
      whereClauses.push('r.mine_id = ?');
      params.push(mine_id);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('r.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(r.name LIKE ? OR r.code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM roles r ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        r.id, r.organization_id, o.name AS organization_name, o.code AS organization_code,
        r.mine_id, m.name AS mine_name, m.code AS mine_code,
        r.name, r.code, r.description, r.status, r.created_at, r.updated_at
      FROM roles r
      JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN mines m ON r.mine_id = m.id
      ${whereSql}
      ORDER BY r.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        r.id, r.organization_id, o.name AS organization_name, o.code AS organization_code,
        r.mine_id, m.name AS mine_name, m.code AS mine_code,
        r.name, r.code, r.description, r.status, r.created_at, r.updated_at
       FROM roles r
       JOIN organizations o ON r.organization_id = o.id
       LEFT JOIN mines m ON r.mine_id = m.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByScopeAndCode(organizationId, mineId, code) {
    const [rows] = await db.query(
      'SELECT * FROM roles WHERE organization_id = ? AND ((mine_id IS NULL AND ? IS NULL) OR mine_id = ?) AND code = ?',
      [organizationId, mineId, mineId, code]
    );
    return rows[0] || null;
  }

  static async create({ organization_id, mine_id, name, code, description, status }) {
    const [result] = await db.query(
      'INSERT INTO roles (organization_id, mine_id, name, code, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [organization_id, mine_id || null, name, code, description || null, status]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields[k] === undefined ? null : fields[k]));

    await db.query(`UPDATE roles SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE roles SET status = ? WHERE id = ?', [status, id]);
  }
}

export default RolesRepository;
