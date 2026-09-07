import db from '../../config/db.js';

export class PagesRepository {
  static async findAll({ status, parent_id, type, search, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'ALL') {
      whereClauses.push('p.status = ?');
      params.push(status);
    }

    if (parent_id !== undefined) {
      if (parent_id === null) {
        whereClauses.push('p.parent_id IS NULL');
      } else {
        whereClauses.push('p.parent_id = ?');
        params.push(parent_id);
      }
    }

    if (type) {
      whereClauses.push('p.type = ?');
      params.push(type);
    }

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.code LIKE ? OR p.route LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM pages p ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        p.id, p.name, p.code, p.route, p.parent_id, parent.name AS parent_name,
        p.icon, p.sort_order, p.type, p.status, p.created_at, p.updated_at
      FROM pages p
      LEFT JOIN pages parent ON p.parent_id = parent.id
      ${whereSql}
      ORDER BY p.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        p.id, p.name, p.code, p.route, p.parent_id, parent.name AS parent_name,
        p.icon, p.sort_order, p.type, p.status, p.created_at, p.updated_at
       FROM pages p
       LEFT JOIN pages parent ON p.parent_id = parent.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.query(
      'SELECT id, name, code, route, parent_id, icon, sort_order, type, status, created_at, updated_at FROM pages WHERE code = ?',
      [code]
    );
    return rows[0] || null;
  }

  static async getAllActivePagesWithPermissions() {
    const sql = `
      SELECT 
        p.id, p.name, p.code, p.route, p.parent_id, p.icon, p.sort_order, p.type, p.status,
        perm.id AS permission_id, perm.code AS permission_code
      FROM pages p
      LEFT JOIN page_permissions pp ON p.id = pp.page_id
      LEFT JOIN permissions perm ON pp.permission_id = perm.id
      WHERE p.status = 'ACTIVE'
      ORDER BY p.sort_order ASC, p.id ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async create({ name, code, route, parent_id, icon, sort_order, type, status }) {
    const [result] = await db.query(
      'INSERT INTO pages (name, code, route, parent_id, icon, sort_order, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, code, route || null, parent_id || null, icon || null, sort_order || 0, type, status]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields[k] === undefined ? null : fields[k]));

    await db.query(`UPDATE pages SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE pages SET status = ? WHERE id = ?', [status, id]);
  }
}

export default PagesRepository;
