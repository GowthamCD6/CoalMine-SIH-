import db from '../../config/db.js';

export class MinesRepository {
  static async findAll({ organization_id, mine_type, status, search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (organization_id) {
      whereClauses.push('m.organization_id = ?');
      params.push(organization_id);
    }

    if (mine_type) {
      whereClauses.push('m.mine_type = ?');
      params.push(mine_type);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('m.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(m.name LIKE ? OR m.code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM mines m ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        m.id, m.organization_id, o.name AS organization_name, o.code AS organization_code,
        m.name, m.code, m.mine_type, m.status, m.created_at, m.updated_at
      FROM mines m
      JOIN organizations o ON m.organization_id = o.id
      ${whereSql}
      ORDER BY m.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        m.id, m.organization_id, o.name AS organization_name, o.code AS organization_code,
        m.name, m.code, m.mine_type, m.status, m.created_at, m.updated_at
       FROM mines m
       JOIN organizations o ON m.organization_id = o.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByOrgAndCode(organizationId, code) {
    const [rows] = await db.query(
      'SELECT * FROM mines WHERE organization_id = ? AND code = ?',
      [organizationId, code]
    );
    return rows[0] || null;
  }

  static async create({ organization_id, name, code, mine_type, status }) {
    const [result] = await db.query(
      'INSERT INTO mines (organization_id, name, code, mine_type, status) VALUES (?, ?, ?, ?, ?)',
      [organization_id, name, code, mine_type, status]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);

    await db.query(`UPDATE mines SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE mines SET status = ? WHERE id = ?', [status, id]);
  }
}

export default MinesRepository;
