import db from '../../config/db.js';

export class OrganizationsRepository {
  static async findAll({ status, search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'ALL') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(name LIKE ? OR code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM organizations ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT id, name, code, status, created_at, updated_at 
      FROM organizations 
      ${whereSql} 
      ORDER BY ${sort} ${order} 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, code, status, created_at, updated_at FROM organizations WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.query(
      'SELECT id, name, code, status, created_at, updated_at FROM organizations WHERE code = ?',
      [code]
    );
    return rows[0] || null;
  }

  static async create({ name, code, status }) {
    const [result] = await db.query(
      'INSERT INTO organizations (name, code, status) VALUES (?, ?, ?)',
      [name, code, status]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);

    await db.query(`UPDATE organizations SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE organizations SET status = ? WHERE id = ?', [status, id]);
  }
}

export default OrganizationsRepository;
