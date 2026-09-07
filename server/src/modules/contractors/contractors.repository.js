import db from '../../config/db.js';

export class ContractorsRepository {
  // Contractors
  static async getContractors({ org_id, status, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (org_id) { where.push('c.org_id = ?'); params.push(org_id); }
    if (status) { where.push('c.status = ?'); params.push(status); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT c.*, o.name AS org_name,
              COUNT(DISTINCT cc.id) AS active_contracts_count,
              COUNT(DISTINCT cw.id) AS workers_count
       FROM contractors c
       JOIN organizations o ON c.org_id = o.id
       LEFT JOIN contractor_contracts cc ON cc.contractor_id = c.id AND cc.status = 'ACTIVE'
       LEFT JOIN contractor_workers cw ON cw.contractor_id = c.id AND cw.status = 'ACTIVE'
       ${w}
       GROUP BY c.id
       ORDER BY c.company_name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM contractors c ${w}`, params
    );

    return { rows, total };
  }

  static async createContractor(data) {
    const { org_id, company_name, registration_number, contact_person, contact_phone, contact_email, status } = data;
    const [r] = await db.query(
      `INSERT INTO contractors (org_id, company_name, registration_number, contact_person, contact_phone, contact_email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [org_id, company_name, registration_number || null, contact_person || null, contact_phone || null, contact_email || null, status || 'ACTIVE']
    );
    return r.insertId;
  }

  // Contracts
  static async getContracts({ mine_ids, is_super_admin, contractor_id, status, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`cc.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (contractor_id) { where.push('cc.contractor_id = ?'); params.push(contractor_id); }
    if (status)        { where.push('cc.status = ?'); params.push(status); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT cc.*, c.company_name, m.name AS mine_name
       FROM contractor_contracts cc
       JOIN contractors c ON cc.contractor_id = c.id
       JOIN mines m ON cc.mine_id = m.id
       ${w}
       ORDER BY cc.start_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM contractor_contracts cc ${w}`, params
    );

    return { rows, total };
  }

  static async createContract(data) {
    const { contractor_id, mine_id, work_description, start_date, end_date, document_url, status } = data;
    const [r] = await db.query(
      `INSERT INTO contractor_contracts (contractor_id, mine_id, work_description, start_date, end_date, document_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contractor_id, mine_id, work_description || null, start_date, end_date || null, document_url || null, status || 'ACTIVE']
    );
    return r.insertId;
  }

  // Workers
  static async getWorkers({ mine_ids, is_super_admin, contractor_id, training_status, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (!is_super_admin && mine_ids?.length) {
      where.push(`cw.mine_id IN (${mine_ids.map(() => '?').join(',')})`);
      params.push(...mine_ids);
    }
    if (contractor_id)    { where.push('cw.contractor_id = ?'); params.push(contractor_id); }
    if (training_status)  { where.push('cw.training_status = ?'); params.push(training_status); }

    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT cw.*, c.company_name, m.name AS mine_name
       FROM contractor_workers cw
       JOIN contractors c ON cw.contractor_id = c.id
       JOIN mines m ON cw.mine_id = m.id
       ${w}
       ORDER BY cw.full_name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM contractor_workers cw ${w}`, params
    );

    return { rows, total };
  }

  static async createWorker(data) {
    const { contractor_id, mine_id, full_name, id_number, role, training_status, assigned_area, status } = data;
    const [r] = await db.query(
      `INSERT INTO contractor_workers (contractor_id, mine_id, full_name, id_number, role, training_status, assigned_area, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contractor_id, mine_id, full_name, id_number || null, role || null, training_status || 'PENDING', assigned_area || null, status || 'ACTIVE']
    );
    return r.insertId;
  }

  // Summary KPIs
  static async getSummary(mine_ids, is_super_admin) {
    const w = (!is_super_admin && mine_ids?.length)
      ? `WHERE mine_id IN (${mine_ids.map(() => '?').join(',')})`
      : '';
    const p = (!is_super_admin && mine_ids?.length) ? mine_ids : [];

    const [[contractorCounts]] = await db.query(
      `SELECT
        COUNT(*) AS total_contractors,
        SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) AS active_contractors,
        SUM(CASE WHEN status='BLACKLISTED' THEN 1 ELSE 0 END) AS blacklisted_contractors
       FROM contractors`
    ).catch(() => [[{ total_contractors: 0, active_contractors: 0, blacklisted_contractors: 0 }]]);

    const [[contractCounts]] = await db.query(
      `SELECT
        COUNT(*) AS total_contracts,
        SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) AS active_contracts
       FROM contractor_contracts ${w}`, p
    ).catch(() => [[{ total_contracts: 0, active_contracts: 0 }]]);

    const [[workerCounts]] = await db.query(
      `SELECT
        COUNT(*) AS total_workers,
        SUM(CASE WHEN training_status='CERTIFIED' THEN 1 ELSE 0 END) AS certified_workers,
        SUM(CASE WHEN training_status='PENDING' THEN 1 ELSE 0 END) AS pending_training_workers
       FROM contractor_workers ${w}`, p
    ).catch(() => [[{ total_workers: 0, certified_workers: 0, pending_training_workers: 0 }]]);

    const trainingCompliancePct = workerCounts.total_workers > 0
      ? Math.round((workerCounts.certified_workers / workerCounts.total_workers) * 100)
      : 100;

    return {
      ...contractorCounts,
      ...contractCounts,
      ...workerCounts,
      training_compliance_pct: trainingCompliancePct,
    };
  }
}

export default ContractorsRepository;
