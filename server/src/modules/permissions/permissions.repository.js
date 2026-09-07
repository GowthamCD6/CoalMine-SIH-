import db from '../../config/db.js';

export class PermissionsRepository {
  static async findAll({ search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(name LIKE ? OR code LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM permissions ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT id, name, code, description, created_at, updated_at
      FROM permissions
      ${whereSql}
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, code, description, created_at, updated_at FROM permissions WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.query(
      'SELECT id, name, code, description, created_at, updated_at FROM permissions WHERE code = ?',
      [code]
    );
    return rows[0] || null;
  }

  static async create({ name, code, description }) {
    const [result] = await db.query(
      'INSERT INTO permissions (name, code, description) VALUES (?, ?, ?)',
      [name, code, description || null]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields[k] === undefined ? null : fields[k]));

    await db.query(`UPDATE permissions SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM permissions WHERE id = ?', [id]);
  }
}

export default PermissionsRepository;
