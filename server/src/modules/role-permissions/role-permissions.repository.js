import db from '../../config/db.js';

export class RolePermissionsRepository {
  static async findByRoleId(roleId) {
    const sql = `
      SELECT 
        rp.id AS role_permission_id,
        rp.role_id,
        rp.permission_id,
        p.name AS permission_name,
        p.code AS permission_code,
        p.description AS permission_description,
        rp.created_at
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.code ASC
    `;
    const [rows] = await db.query(sql, [roleId]);
    return rows;
  }

  static async findMapping(roleId, permissionId) {
    const [rows] = await db.query(
      'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [roleId, permissionId]
    );
    return rows[0] || null;
  }

  static async attach(roleId, permissionId) {
    const [result] = await db.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [roleId, permissionId]
    );
    return result.insertId;
  }

  static async detach(roleId, permissionId) {
    const [result] = await db.query(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [roleId, permissionId]
    );
    return result.affectedRows > 0;
  }
}

export default RolePermissionsRepository;
