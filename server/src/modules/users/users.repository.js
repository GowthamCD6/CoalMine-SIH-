import db from '../../config/db.js';

export class UsersRepository {
  static async findAll({ status, search, employee_code, email, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'ALL') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (employee_code) {
      whereClauses.push('employee_code = ?');
      params.push(employee_code);
    }

    if (email) {
      whereClauses.push('email = ?');
      params.push(email);
    }

    if (search) {
      whereClauses.push('(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR employee_code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM users ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT id, username, email, first_name, last_name, phone, employee_code, status, last_login_at, created_at, updated_at
      FROM users
      ${whereSql}
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, username, email, first_name, last_name, phone, employee_code, status, last_login_at, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUsernameOrEmail(username, email) {
    const [rows] = await db.query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    return rows[0] || null;
  }

  static async create(userData) {
    const { username, email, password_hash, first_name, last_name, phone, employee_code, status } = userData;
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, employee_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, first_name, last_name || null, phone || null, employee_code || null, status || 'ACTIVE']
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);

    await db.query(`UPDATE users SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  static async setStatus(id, status) {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  }

  static async getUserSessions(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, device_id, ip_address, user_agent, expires_at, revoked_at, created_at
       FROM user_sessions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

export default UsersRepository;
