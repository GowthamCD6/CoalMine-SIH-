import db from '../../config/db.js';

export class AuthRepository {
  static async findUserByEmailOrUsername(login) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [login, login]
    );
    return rows[0] || null;
  }

  static async findUserById(id) {
    const [rows] = await db.query(
      'SELECT id, username, email, first_name, last_name, phone, employee_code, status, last_login_at, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createUser(userData) {
    const { username, email, password_hash, first_name, last_name, phone, employee_code } = userData;
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, employee_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [username, email, password_hash, first_name, last_name || null, phone || null, employee_code || null]
    );
    return result.insertId;
  }

  static async updateLastLogin(userId) {
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
  }

  static async createSession(sessionData) {
    const { user_id, refresh_token_hash, device_id, ip_address, user_agent, expires_at } = sessionData;
    const [result] = await db.query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, device_id, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, refresh_token_hash, device_id || null, ip_address || null, user_agent || null, expires_at]
    );
    return result.insertId;
  }

  static async findSessionByTokenHash(tokenHash) {
    const [rows] = await db.query(
      `SELECT * FROM user_sessions 
       WHERE refresh_token_hash = ? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async revokeSession(sessionId) {
    await db.query('UPDATE user_sessions SET revoked_at = NOW() WHERE id = ?', [sessionId]);
  }

  static async revokeSessionByTokenHash(tokenHash) {
    await db.query('UPDATE user_sessions SET revoked_at = NOW() WHERE refresh_token_hash = ?', [tokenHash]);
  }

  static async getUserSubrolesWithScope(userId) {
    const sql = `
      SELECT 
        usr.id AS user_subrole_id,
        usr.status AS assignment_status,
        usr.expires_at,
        sr.id AS subrole_id,
        sr.name AS subrole_name,
        sr.code AS subrole_code,
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,
        r.organization_id,
        o.name AS organization_name,
        r.mine_id,
        m.name AS mine_name
      FROM user_subroles usr
      JOIN subroles sr ON usr.subrole_id = sr.id
      JOIN roles r ON sr.role_id = r.id
      LEFT JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN mines m ON r.mine_id = m.id
      WHERE usr.user_id = ?
        AND usr.status = 'ACTIVE'
        AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }
}

export default AuthRepository;
