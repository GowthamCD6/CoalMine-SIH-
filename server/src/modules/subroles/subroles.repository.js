import db from '../../config/db.js';

export class SubrolesRepository {
  static async findAll({ role_id, status, search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (role_id) {
      whereClauses.push('sr.role_id = ?');
      params.push(role_id);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('sr.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(sr.name LIKE ? OR sr.code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM subroles sr ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        sr.id, sr.role_id, r.name AS role_name, r.code AS role_code,
        r.organization_id, o.name AS organization_name,
        r.mine_id, m.name AS mine_name,
        sr.name, sr.code, sr.description, sr.status, sr.created_at, sr.updated_at
      FROM subroles sr
      JOIN roles r ON sr.role_id = r.id
      JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN mines m ON r.mine_id = m.id
      ${whereSql}
      ORDER BY sr.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        sr.id, sr.role_id, r.name AS role_name, r.code AS role_code,
        r.organization_id, o.name AS organization_name,
        r.mine_id, m.name AS mine_name,
        sr.name, sr.code, sr.description, sr.status, sr.created_at, sr.updated_at
       FROM subroles sr
       JOIN roles r ON sr.role_id = r.id
       JOIN organizations o ON r.organization_id = o.id
       LEFT JOIN mines m ON r.mine_id = m.id
       WHERE sr.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByRoleAndCode(roleId, code) {
    const [rows] = await db.query(
      'SELECT * FROM subroles WHERE role_id = ? AND code = ?',
      [roleId, code]
    );
    return rows[0] || null;
  }

  static async create({ role_id, name, code, description, status }) {
    const [result] = await db.query(
      'INSERT INTO subroles (role_id, name, code, description, status) VALUES (?, ?, ?, ?, ?)',
      [role_id, name, code, description || null, status]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields[k] === undefined ? null : fields[k]));

    await db.query(`UPDATE subroles SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE subroles SET status = ? WHERE id = ?', [status, id]);
  }
}

export default SubrolesRepository;
