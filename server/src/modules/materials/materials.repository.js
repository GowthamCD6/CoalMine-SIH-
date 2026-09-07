import db from '../../config/db.js';

export class MaterialsRepository {
  static async findAll({
    organization_id,
    mine_id,
    category,
    status,
    search,
    start_date,
    end_date,
    limit,
    offset,
    sort = 'created_at',
    order = 'DESC',
  }) {
    let whereClauses = [];
    let params = [];

    if (organization_id) {
      whereClauses.push('mat.organization_id = ?');
      params.push(organization_id);
    }

    if (mine_id) {
      whereClauses.push('mat.mine_id = ?');
      params.push(mine_id);
    }

    if (category && category !== 'ALL') {
      whereClauses.push('mat.category = ?');
      params.push(category);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('mat.inspection_status = ?');
      params.push(status);
    }

    if (start_date) {
      whereClauses.push('mat.created_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereClauses.push('mat.created_at <= ?');
      params.push(end_date);
    }

    if (search) {
      whereClauses.push(`(
        mat.consignment_number LIKE ? OR
        mat.material_name LIKE ? OR
        mat.challan_number LIKE ? OR
        mat.purchase_order_number LIKE ? OR
        mat.supplier_name LIKE ? OR
        mat.transporter_name LIKE ? OR
        mat.vehicle_number LIKE ? OR
        mat.driver_name LIKE ? OR
        m.name LIKE ?
      )`);
      const searchWildcard = `%${search}%`;
      params.push(
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard,
        searchWildcard
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM material_inward_logs mat
      JOIN mines m ON mat.mine_id = m.id
      ${whereSql}
    `;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    // Safe sorting column whitelist
    const safeSort = ['created_at', 'quantity', 'material_name', 'consignment_number', 'inspection_status'].includes(sort)
      ? `mat.${sort}`
      : 'mat.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataSql = `
      SELECT 
        mat.id,
        mat.consignment_number,
        mat.organization_id,
        o.name AS organization_name,
        o.code AS organization_code,
        mat.mine_id,
        m.name AS mine_name,
        m.code AS mine_code,
        m.mine_type,
        mat.material_name,
        mat.category,
        mat.quantity,
        mat.unit,
        mat.challan_number,
        mat.purchase_order_number,
        mat.supplier_name,
        mat.transporter_name,
        mat.vehicle_number,
        mat.driver_name,
        mat.driver_phone,
        mat.entry_gate,
        mat.gross_weight_tons,
        mat.tare_weight_tons,
        mat.net_weight_tons,
        mat.inspection_status,
        mat.inspected_by,
        mat.remarks,
        mat.logged_by_user_id,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS logged_by_name,
        u.employee_code AS logged_by_employee_code,
        mat.created_at,
        mat.updated_at
      FROM material_inward_logs mat
      JOIN organizations o ON mat.organization_id = o.id
      JOIN mines m ON mat.mine_id = m.id
      JOIN users u ON mat.logged_by_user_id = u.id
      ${whereSql}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    return { total, rows };
  }

  static async findById(id) {
    const sql = `
      SELECT 
        mat.*,
        o.name AS organization_name,
        o.code AS organization_code,
        m.name AS mine_name,
        m.code AS mine_code,
        m.mine_type,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS logged_by_name,
        u.email AS logged_by_email,
        u.employee_code AS logged_by_employee_code
      FROM material_inward_logs mat
      JOIN organizations o ON mat.organization_id = o.id
      JOIN mines m ON mat.mine_id = m.id
      JOIN users u ON mat.logged_by_user_id = u.id
      WHERE mat.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async findByConsignmentNumber(consignmentNumber) {
    const [rows] = await db.query(
      'SELECT id FROM material_inward_logs WHERE consignment_number = ?',
      [consignmentNumber]
    );
    return rows[0] || null;
  }

  static async getSummary({ organization_id, mine_id, category, start_date, end_date }) {
    let whereClauses = [];
    let params = [];

    if (organization_id) {
      whereClauses.push('mat.organization_id = ?');
      params.push(organization_id);
    }

    if (mine_id) {
      whereClauses.push('mat.mine_id = ?');
      params.push(mine_id);
    }

    if (category && category !== 'ALL') {
      whereClauses.push('mat.category = ?');
      params.push(category);
    }

    if (start_date) {
      whereClauses.push('mat.created_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereClauses.push('mat.created_at <= ?');
      params.push(end_date);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Overall counts & weight
    const overallSql = `
      SELECT 
        COUNT(*) AS total_consignments,
        COALESCE(SUM(mat.net_weight_tons), 0) AS total_net_weight_tons
      FROM material_inward_logs mat
      ${whereSql}
    `;
    const [overallRows] = await db.query(overallSql, params);

    // 2. Quantity breakdown grouped by Unit
    const unitSql = `
      SELECT 
        mat.unit,
        COALESCE(SUM(mat.quantity), 0) AS total_quantity,
        COUNT(*) AS count
      FROM material_inward_logs mat
      ${whereSql}
      GROUP BY mat.unit
      ORDER BY total_quantity DESC
    `;
    const [unitRows] = await db.query(unitSql, params);

    // 3. Inspection Status breakdown
    const statusSql = `
      SELECT 
        mat.inspection_status,
        COUNT(*) AS count
      FROM material_inward_logs mat
      ${whereSql}
      GROUP BY mat.inspection_status
    `;
    const [statusRows] = await db.query(statusSql, params);

    // 4. Category breakdown
    const categorySql = `
      SELECT 
        mat.category,
        COUNT(*) AS count,
        COALESCE(SUM(mat.quantity), 0) AS total_quantity,
        COALESCE(SUM(mat.net_weight_tons), 0) AS total_net_weight_tons
      FROM material_inward_logs mat
      ${whereSql}
      GROUP BY mat.category
      ORDER BY count DESC
    `;
    const [categoryRows] = await db.query(categorySql, params);

    // 5. Mine Branch breakdown (especially for Super Admin and Org Admin)
    const branchSql = `
      SELECT 
        m.id AS mine_id,
        m.name AS mine_name,
        m.code AS mine_code,
        o.id AS organization_id,
        o.name AS organization_name,
        COUNT(mat.id) AS total_consignments,
        COALESCE(SUM(mat.net_weight_tons), 0) AS total_net_weight_tons,
        SUM(CASE WHEN mat.inspection_status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN mat.inspection_status = 'PASSED' THEN 1 ELSE 0 END) AS passed_count
      FROM mines m
      JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN material_inward_logs mat ON mat.mine_id = m.id ${whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : ''}
      ${organization_id ? 'WHERE m.organization_id = ?' : ''}
      GROUP BY m.id, m.name, m.code, o.id, o.name
      ORDER BY total_consignments DESC, m.name ASC
    `;
    // If organization_id is set, pass it for the WHERE clause
    const branchParams = organization_id ? [...params, organization_id] : params;
    const [branchRows] = await db.query(branchSql, branchParams);

    // Format results cleanly
    const unitBreakdown = {};
    unitRows.forEach((r) => {
      unitBreakdown[r.unit] = Number(r.total_quantity);
    });

    const statusBreakdown = {
      PASSED: 0,
      PENDING: 0,
      CONDITIONAL: 0,
      REJECTED: 0,
    };
    statusRows.forEach((r) => {
      statusBreakdown[r.inspection_status] = Number(r.count);
    });

    return {
      total_consignments: Number(overallRows[0]?.total_consignments || 0),
      total_net_weight_tons: Number(overallRows[0]?.total_net_weight_tons || 0),
      unit_breakdown: unitBreakdown,
      status_breakdown: statusBreakdown,
      category_breakdown: categoryRows.map((c) => ({
        category: c.category,
        count: Number(c.count),
        total_quantity: Number(c.total_quantity),
        total_net_weight_tons: Number(c.total_net_weight_tons),
      })),
      branch_breakdown: branchRows.map((b) => ({
        mine_id: b.mine_id,
        mine_name: b.mine_name,
        mine_code: b.mine_code,
        organization_id: b.organization_id,
        organization_name: b.organization_name,
        total_consignments: Number(b.total_consignments),
        total_net_weight_tons: Number(b.total_net_weight_tons),
        pending_count: Number(b.pending_count || 0),
        passed_count: Number(b.passed_count || 0),
      })),
    };
  }

  static async create(data) {
    const {
      consignment_number,
      organization_id,
      mine_id,
      material_name,
      category,
      quantity,
      unit,
      challan_number,
      purchase_order_number,
      supplier_name,
      transporter_name,
      vehicle_number,
      driver_name,
      driver_phone,
      entry_gate,
      gross_weight_tons,
      tare_weight_tons,
      net_weight_tons,
      inspection_status,
      inspected_by,
      remarks,
      logged_by_user_id,
    } = data;

    const sql = `
      INSERT INTO material_inward_logs (
        consignment_number, organization_id, mine_id, material_name, category,
        quantity, unit, challan_number, purchase_order_number, supplier_name,
        transporter_name, vehicle_number, driver_name, driver_phone, entry_gate,
        gross_weight_tons, tare_weight_tons, net_weight_tons, inspection_status,
        inspected_by, remarks, logged_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      consignment_number,
      organization_id,
      mine_id,
      material_name,
      category,
      quantity,
      unit,
      challan_number,
      purchase_order_number || null,
      supplier_name,
      transporter_name || null,
      vehicle_number,
      driver_name || null,
      driver_phone || null,
      entry_gate,
      gross_weight_tons || null,
      tare_weight_tons || null,
      net_weight_tons || null,
      inspection_status || 'PASSED',
      inspected_by || null,
      remarks || null,
      logged_by_user_id,
    ]);

    return result.insertId;
  }

  static async updateStatus(id, { inspection_status, inspected_by, remarks }) {
    let updates = ['inspection_status = ?', 'inspected_by = ?'];
    let params = [inspection_status, inspected_by];

    if (remarks !== undefined) {
      updates.push('remarks = ?');
      params.push(remarks);
    }

    params.push(id);
    await db.query(`UPDATE material_inward_logs SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await db.query('DELETE FROM material_inward_logs WHERE id = ?', [id]);
  }
}

export default MaterialsRepository;
