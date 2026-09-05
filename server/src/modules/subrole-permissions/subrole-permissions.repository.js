import db from '../../config/db.js';

export class SubrolePermissionsRepository {
  static async findBySubroleId(subroleId) {
    const sql = `
      SELECT 
        srp.id AS subrole_permission_id,
        srp.subrole_id,
        srp.permission_id,
        p.name AS permission_name,
        p.code AS permission_code,
        p.description AS permission_description,
        srp.created_at
      FROM subrole_permissions srp
      JOIN permissions p ON srp.permission_id = p.id
      WHERE srp.subrole_id = ?
      ORDER BY p.code ASC
    `;
    const [rows] = await db.query(sql, [subroleId]);
    return rows;
  }

  static async findMapping(subroleId, permissionId) {
    const [rows] = await db.query(
      'SELECT * FROM subrole_permissions WHERE subrole_id = ? AND permission_id = ?',
      [subroleId, permissionId]
    );
    return rows[0] || null;
  }

  static async attach(subroleId, permissionId) {
    const [result] = await db.query(
      'INSERT INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)',
      [subroleId, permissionId]
    );
    return result.insertId;
  }

  static async detach(subroleId, permissionId) {
    const [result] = await db.query(
      'DELETE FROM subrole_permissions WHERE subrole_id = ? AND permission_id = ?',
      [subroleId, permissionId]
    );
    return result.affectedRows > 0;
  }
}

export default SubrolePermissionsRepository;
