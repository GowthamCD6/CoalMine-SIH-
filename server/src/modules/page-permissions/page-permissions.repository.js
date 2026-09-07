import db from '../../config/db.js';

export class PagePermissionsRepository {
  static async findByPageId(pageId) {
    const sql = `
      SELECT 
        pp.id AS page_permission_id,
        pp.page_id,
        pp.permission_id,
        p.name AS permission_name,
        p.code AS permission_code,
        p.description AS permission_description,
        pp.created_at
      FROM page_permissions pp
      JOIN permissions p ON pp.permission_id = p.id
      WHERE pp.page_id = ?
      ORDER BY p.code ASC
    `;
    const [rows] = await db.query(sql, [pageId]);
    return rows;
  }

  static async findMapping(pageId, permissionId) {
    const [rows] = await db.query(
      'SELECT * FROM page_permissions WHERE page_id = ? AND permission_id = ?',
      [pageId, permissionId]
    );
    return rows[0] || null;
  }

  static async attach(pageId, permissionId) {
    const [result] = await db.query(
      'INSERT INTO page_permissions (page_id, permission_id) VALUES (?, ?)',
      [pageId, permissionId]
    );
    return result.insertId;
  }

  static async detach(pageId, permissionId) {
    const [result] = await db.query(
      'DELETE FROM page_permissions WHERE page_id = ? AND permission_id = ?',
      [pageId, permissionId]
    );
    return result.affectedRows > 0;
  }
}

export default PagePermissionsRepository;
