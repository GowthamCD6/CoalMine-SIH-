import db from '../../config/db.js';

export class AuditLogsRepository {
  static async findAll({ user_id, organization_id, mine_id, action, entity_type, startDate, endDate, limit, offset, sort, order }) {
    let whereClauses = [];
    let params = [];

    if (user_id) {
      whereClauses.push('al.user_id = ?');
      params.push(user_id);
    }

    if (organization_id) {
      whereClauses.push('al.organization_id = ?');
      params.push(organization_id);
    }

    if (mine_id) {
      whereClauses.push('al.mine_id = ?');
      params.push(mine_id);
    }

    if (action) {
      whereClauses.push('al.action = ?');
      params.push(action);
    }

    if (entity_type) {
      whereClauses.push('al.entity_type = ?');
      params.push(entity_type);
    }

    if (startDate) {
      whereClauses.push('al.created_at >= ?');
      params.push(new Date(startDate));
    }

    if (endDate) {
      whereClauses.push('al.created_at <= ?');
      params.push(new Date(endDate));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM audit_logs al ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        al.id, al.user_id, u.username, u.email, u.employee_code,
        al.organization_id, o.name AS organization_name,
        al.mine_id, m.name AS mine_name,
        al.action, al.entity_type, al.entity_id,
        al.old_data, al.new_data, al.ip_address, al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN organizations o ON al.organization_id = o.id
      LEFT JOIN mines m ON al.mine_id = m.id
      ${whereSql}
      ORDER BY al.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        al.id, al.user_id, u.username, u.email, u.employee_code,
        al.organization_id, o.name AS organization_name,
        al.mine_id, m.name AS mine_name,
        al.action, al.entity_type, al.entity_id,
        al.old_data, al.new_data, al.ip_address, al.created_at
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       LEFT JOIN organizations o ON al.organization_id = o.id
       LEFT JOIN mines m ON al.mine_id = m.id
       WHERE al.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
}

export default AuditLogsRepository;
