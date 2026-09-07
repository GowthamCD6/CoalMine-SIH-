import db from '../../config/db.js';

export class UserSubrolesRepository {
  static async findUserSubroles(userId) {
    const sql = `
      SELECT 
        usr.id AS user_subrole_id,
        usr.user_id,
        usr.subrole_id,
        usr.assigned_by,
        assigner.username AS assigned_by_username,
        usr.assigned_at,
        usr.expires_at,
        usr.status,
        CASE 
          WHEN usr.expires_at IS NOT NULL AND usr.expires_at <= NOW() THEN TRUE 
          ELSE FALSE 
        END AS is_expired,
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
      LEFT JOIN users assigner ON usr.assigned_by = assigner.id
      WHERE usr.user_id = ?
      ORDER BY usr.status ASC, usr.assigned_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }

  static async findSubroleUsers(subroleId) {
    const sql = `
      SELECT 
        usr.id AS user_subrole_id,
        usr.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.employee_code,
        usr.assigned_by,
        usr.assigned_at,
        usr.expires_at,
        usr.status,
        CASE 
          WHEN usr.expires_at IS NOT NULL AND usr.expires_at <= NOW() THEN TRUE 
          ELSE FALSE 
        END AS is_expired
      FROM user_subroles usr
      JOIN users u ON usr.user_id = u.id
      WHERE usr.subrole_id = ?
      ORDER BY usr.status ASC, usr.assigned_at DESC
    `;
    const [rows] = await db.query(sql, [subroleId]);
    return rows;
  }

  static async findMapping(userId, subroleId) {
    const [rows] = await db.query(
      'SELECT * FROM user_subroles WHERE user_id = ? AND subrole_id = ?',
      [userId, subroleId]
    );
    return rows[0] || null;
  }

  static async assign({ user_id, subrole_id, assigned_by, expires_at, status }) {
    const [result] = await db.query(
      `INSERT INTO user_subroles (user_id, subrole_id, assigned_by, assigned_at, expires_at, status)
       VALUES (?, ?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE 
         assigned_by = VALUES(assigned_by),
         assigned_at = NOW(),
         expires_at = VALUES(expires_at),
         status = VALUES(status)`,
      [user_id, subrole_id, assigned_by || null, expires_at || null, status || 'ACTIVE']
    );
    return result.insertId || result.insertId;
  }

  static async update(userId, subroleId, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields[k] === undefined ? null : fields[k]));

    await db.query(`UPDATE user_subroles SET ${setSql} WHERE user_id = ? AND subrole_id = ?`, [...values, userId, subroleId]);
  }

  static async setStatus(userId, subroleId, status) {
    await db.query('UPDATE user_subroles SET status = ? WHERE user_id = ? AND subrole_id = ?', [status, userId, subroleId]);
  }
}

export default UserSubrolesRepository;
