import db from '../../config/db.js';

export class UserSessionsRepository {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, user_id, device_id, ip_address, user_agent, expires_at, revoked_at, created_at
       FROM user_sessions WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async revokeSession(id) {
    const [result] = await db.query(
      'UPDATE user_sessions SET revoked_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default UserSessionsRepository;
