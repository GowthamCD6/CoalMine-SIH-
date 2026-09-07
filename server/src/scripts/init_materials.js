import db from '../config/db.js';

export const setupMaterialsTableAndSeed = async () => {
  console.log('🔄 Initializing Material Inward Logs schema and data...');

  // 1. Create table material_inward_logs
  await db.query(`
    CREATE TABLE IF NOT EXISTS material_inward_logs (
      id BIGINT NOT NULL AUTO_INCREMENT,
      consignment_number VARCHAR(50) NOT NULL,
      organization_id BIGINT NOT NULL,
      mine_id BIGINT NOT NULL,
      material_name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL COMMENT 'EXPLOSIVES, FUEL_LUBRICANTS, HEAVY_SPARES, CONVEYOR_BELTING, STRUCTURAL_SUPPORT, SAFETY_PPE, CHEMICALS_REAGENTS, ELECTRICAL',
      quantity DECIMAL(12, 2) NOT NULL,
      unit VARCHAR(20) NOT NULL COMMENT 'TONS, LITERS, UNITS, METERS, DRUMS, BOXES',
      challan_number VARCHAR(100) NOT NULL,
      purchase_order_number VARCHAR(100) DEFAULT NULL,
      supplier_name VARCHAR(150) NOT NULL,
      transporter_name VARCHAR(150) DEFAULT NULL,
      vehicle_number VARCHAR(50) NOT NULL,
      driver_name VARCHAR(100) DEFAULT NULL,
      driver_phone VARCHAR(20) DEFAULT NULL,
      entry_gate VARCHAR(100) NOT NULL,
      gross_weight_tons DECIMAL(10, 2) DEFAULT NULL,
      tare_weight_tons DECIMAL(10, 2) DEFAULT NULL,
      net_weight_tons DECIMAL(10, 2) DEFAULT NULL,
      inspection_status VARCHAR(30) NOT NULL DEFAULT 'PASSED' COMMENT 'PASSED, PENDING, CONDITIONAL, REJECTED',
      inspected_by VARCHAR(100) DEFAULT NULL,
      remarks TEXT DEFAULT NULL,
      logged_by_user_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_consignment_number (consignment_number),
      KEY idx_mat_org_mine (organization_id, mine_id),
      KEY idx_mat_category (category),
      KEY idx_mat_status (inspection_status),
      KEY idx_mat_created_at (created_at),
      KEY idx_mat_logged_by (logged_by_user_id),
      CONSTRAINT fk_mat_org FOREIGN KEY (organization_id) REFERENCES organizations (id),
      CONSTRAINT fk_mat_mine FOREIGN KEY (mine_id) REFERENCES mines (id),
      CONSTRAINT fk_mat_user FOREIGN KEY (logged_by_user_id) REFERENCES users (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅ Table material_inward_logs verified.');

  // 2. Add Materials Permissions
  const materialPerms = [
    { name: 'Read Material Logs', code: 'MATERIALS_READ', description: 'View material inward consignments and branch quantities' },
    { name: 'Log Inward Materials', code: 'MATERIALS_CREATE', description: 'Log incoming materials at gate/station' },
    { name: 'Update Material Logs', code: 'MATERIALS_UPDATE', description: 'Modify consignment details' },
    { name: 'Delete Material Logs', code: 'MATERIALS_DELETE', description: 'Deactivate/delete material logs (Admin only)' },
    { name: 'Inspect & Approve Materials', code: 'MATERIALS_APPROVE', description: 'Certify quality inspection status' },
  ];

  for (const p of materialPerms) {
    await db.query(`
      INSERT INTO permissions (name, code, description)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
    `, [p.name, p.code, p.description]);
  }

  // 3. Grant permissions across all existing roles & subroles
  // All roles get MATERIALS_READ and MATERIALS_CREATE
  const [roles] = await db.query('SELECT id, code FROM roles');
  const [subroles] = await db.query('SELECT id, code, role_id FROM subroles');
  const [perms] = await db.query('SELECT id, code FROM permissions WHERE code LIKE "MATERIALS_%"');
  const permMap = perms.reduce((acc, p) => ({ ...acc, [p.code]: p.id }), {});

  for (const role of roles) {
    // Every role gets READ & CREATE
    await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, permMap.MATERIALS_READ]);
    await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, permMap.MATERIALS_CREATE]);

    // Admins & Safety Officers get UPDATE & APPROVE
    if (role.code.includes('ADMIN') || role.code.includes('SAFETY') || role.code.includes('SUPER')) {
      await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, permMap.MATERIALS_UPDATE]);
      await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, permMap.MATERIALS_APPROVE]);
    }
    // Only Super Admin and Org/Mine Admins get DELETE
    if (role.code.includes('ADMIN') || role.code.includes('SUPER')) {
      await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, permMap.MATERIALS_DELETE]);
    }
  }

  for (const sub of subroles) {
    await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [sub.id, permMap.MATERIALS_READ]);
    await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [sub.id, permMap.MATERIALS_CREATE]);
    if (sub.code.includes('ADMIN') || sub.code.includes('ROOT') || sub.code.includes('SAFETY')) {
      await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [sub.id, permMap.MATERIALS_UPDATE]);
      await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [sub.id, permMap.MATERIALS_APPROVE]);
    }
    if (sub.code.includes('ADMIN') || sub.code.includes('ROOT')) {
      await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [sub.id, permMap.MATERIALS_DELETE]);
    }
  }

  // 4. Ensure navigation page exists
  await db.query(`
    INSERT INTO pages (name, code, route, parent_id, icon, sort_order, type, status)
    VALUES ('Material Inward Logs', 'PAGE_MATERIALS', '/materials', NULL, 'Truck', 8, 'PAGE', 'ACTIVE')
    ON DUPLICATE KEY UPDATE name = VALUES(name), route = VALUES(route), status = 'ACTIVE'
  `);

  console.log('✅ RBAC permissions & Navigation page updated.');

  // 5. Seed realistic sample material inward entries
  const [existingLogs] = await db.query('SELECT COUNT(*) AS count FROM material_inward_logs');
  if (existingLogs[0].count === 0) {
    console.log('📦 Seeding sample inward material consignments across branches...');

    // Find sample user IDs
    const [superUser] = await db.query('SELECT id FROM users WHERE username = "superadmin" LIMIT 1');
    const [mineAdmin] = await db.query('SELECT id FROM users WHERE username = "rj_mine_admin" LIMIT 1');
    const [safetyUser] = await db.query('SELECT id FROM users WHERE username = "rj_safety_officer" LIMIT 1');
    const [engUser] = await db.query('SELECT id FROM users WHERE username = "rj_engineer" LIMIT 1');

    const defaultUserId = superUser?.[0]?.id || 1;
    const rjAdminId = mineAdmin?.[0]?.id || defaultUserId;
    const rjSafetyId = safetyUser?.[0]?.id || defaultUserId;
    const rjEngId = engUser?.[0]?.id || defaultUserId;

    const sampleConsignments = [
      // Rajmahal Open Cast Project (Mine 1, Org 1)
      {
        consignment_number: 'MAT-2026-00101',
        organization_id: 1,
        mine_id: 1,
        material_name: 'Industrial Bulk Emulsion Explosives (SME)',
        category: 'EXPLOSIVES',
        quantity: 32.50,
        unit: 'TONS',
        challan_number: 'DC/SOLAR/2026/8412',
        purchase_order_number: 'PO-ECL-RJ-2026-091',
        supplier_name: 'Solar Industries India Ltd',
        transporter_name: 'Singhania Heavy Haulage',
        vehicle_number: 'JH-04-E-4421',
        driver_name: 'Harpreet Singh',
        driver_phone: '+919811223344',
        entry_gate: 'Gate 4 - Explosives Magazine Depot',
        gross_weight_tons: 48.20,
        tare_weight_tons: 15.70,
        net_weight_tons: 32.50,
        inspection_status: 'PASSED',
        inspected_by: 'Kavita Reddy (Safety Officer)',
        remarks: 'DGMS Explosive storage protocol verified. Magazine temperature 21°C.',
        logged_by_user_id: rjSafetyId,
        created_at: new Date(Date.now() - 3600000 * 4), // 4 hours ago
      },
      {
        consignment_number: 'MAT-2026-00102',
        organization_id: 1,
        mine_id: 1,
        material_name: 'High-Speed Diesel (HSD) for Haul Trucks',
        category: 'FUEL_LUBRICANTS',
        quantity: 24000.00,
        unit: 'LITERS',
        challan_number: 'IOCL/DHAN/2026/9102',
        purchase_order_number: 'PO-ECL-RJ-2026-044',
        supplier_name: 'Indian Oil Corporation Limited',
        transporter_name: 'National Tanker Fleet',
        vehicle_number: 'WB-38-D-7719',
        driver_name: 'Rameshwar Mahato',
        driver_phone: '+919833445566',
        entry_gate: 'Gate 1 - Main North Weighbridge',
        gross_weight_tons: 32.80,
        tare_weight_tons: 12.40,
        net_weight_tons: 20.40,
        inspection_status: 'PASSED',
        inspected_by: 'Manoj Verma (Excavation Eng)',
        remarks: 'Hydrometer density test passed: 835 kg/m3. Decanted to Tank-02.',
        logged_by_user_id: rjEngId,
        created_at: new Date(Date.now() - 3600000 * 8), // 8 hours ago
      },
      {
        consignment_number: 'MAT-2026-00103',
        organization_id: 1,
        mine_id: 1,
        material_name: 'OTR Dumper Radial Tires 27.00R49 (100-Ton Truck)',
        category: 'HEAVY_SPARES',
        quantity: 12.00,
        unit: 'UNITS',
        challan_number: 'BEML/DEL/26/1029',
        purchase_order_number: 'PO-ECL-RJ-2026-118',
        supplier_name: 'BEML Mining Spares Division',
        transporter_name: 'Express Cargo Lines',
        vehicle_number: 'JH-04-C-8812',
        driver_name: 'Anil Kumar Yadav',
        driver_phone: '+919877112233',
        entry_gate: 'Gate 3 - Heavy Equipment Spares Bay',
        gross_weight_tons: 24.50,
        tare_weight_tons: 11.20,
        net_weight_tons: 13.30,
        inspection_status: 'PASSED',
        inspected_by: 'Rajesh Mukherjee (GM)',
        remarks: 'Physical inspection of tread compound and serial numbers verified.',
        logged_by_user_id: rjAdminId,
        created_at: new Date(Date.now() - 3600000 * 20), // 20 hours ago
      },
      {
        consignment_number: 'MAT-2026-00104',
        organization_id: 1,
        mine_id: 1,
        material_name: 'Mining Helmets with Cordless LED Li-ion Caplamps',
        category: 'SAFETY_PPE',
        quantity: 250.00,
        unit: 'UNITS',
        challan_number: '3M/IND/2026/4011',
        purchase_order_number: 'PO-ECL-RJ-2026-150',
        supplier_name: '3M Safety & Personal Protection',
        transporter_name: 'Blue Dart Logistics',
        vehicle_number: 'JH-04-F-3211',
        driver_name: 'Sunil Paswan',
        driver_phone: '+919866554433',
        entry_gate: 'Gate 2 - Central Admin Stores',
        gross_weight_tons: 4.20,
        tare_weight_tons: 3.50,
        net_weight_tons: 0.70,
        inspection_status: 'PASSED',
        inspected_by: 'Kavita Reddy (Safety Officer)',
        remarks: 'DGMS standard approved mark verified on each unit.',
        logged_by_user_id: rjSafetyId,
        created_at: new Date(Date.now() - 3600000 * 30),
      },
      {
        consignment_number: 'MAT-2026-00105',
        organization_id: 1,
        mine_id: 1,
        material_name: 'Cast Boosters Pentolite 400g',
        category: 'EXPLOSIVES',
        quantity: 18.00,
        unit: 'BOXES',
        challan_number: 'PEL/BLAST/2026/092',
        purchase_order_number: 'PO-ECL-RJ-2026-098',
        supplier_name: 'Premier Explosives Ltd',
        transporter_name: 'Secure Ordnance Freight',
        vehicle_number: 'JH-04-E-9012',
        driver_name: 'Gurdeep Singh',
        driver_phone: '+919855443322',
        entry_gate: 'Gate 4 - Explosives Magazine Depot',
        gross_weight_tons: 14.80,
        tare_weight_tons: 7.60,
        net_weight_tons: 7.20,
        inspection_status: 'PENDING',
        inspected_by: null,
        remarks: 'Vehicle arrived at 09:30 AM. Magazine verification in progress by shift in-charge.',
        logged_by_user_id: rjSafetyId,
        created_at: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      },

      // Sonepur Bazari Underground Mine (Mine 2, Org 1)
      {
        consignment_number: 'MAT-2026-00201',
        organization_id: 1,
        mine_id: 2,
        material_name: 'Resin-Anchored Roof Bolts 24mm x 2.4m High Tensile',
        category: 'STRUCTURAL_SUPPORT',
        quantity: 1200.00,
        unit: 'UNITS',
        challan_number: 'TATA/TISCON/2026/711',
        purchase_order_number: 'PO-ECL-SB-2026-031',
        supplier_name: 'Tata Steel Strata Support Systems',
        transporter_name: 'Eastern Heavy Carriers',
        vehicle_number: 'WB-38-A-1102',
        driver_name: 'Baidyanath Roy',
        driver_phone: '+919844332211',
        entry_gate: 'Pit Shaft Gate #1 - Pithead Inward',
        gross_weight_tons: 35.40,
        tare_weight_tons: 14.20,
        net_weight_tons: 21.20,
        inspection_status: 'PASSED',
        inspected_by: 'Sonepur Mine Inspector',
        remarks: 'Tensile test certificate verified (Minimum 240 kN load capacity).',
        logged_by_user_id: defaultUserId,
        created_at: new Date(Date.now() - 3600000 * 12),
      },
      {
        consignment_number: 'MAT-2026-00202',
        organization_id: 1,
        mine_id: 2,
        material_name: 'Conveyor Rubber Belting EP-400/3 (1200mm Width)',
        category: 'CONVEYOR_BELTING',
        quantity: 850.00,
        unit: 'METERS',
        challan_number: 'FENNER/CONV/2026/410',
        purchase_order_number: 'PO-ECL-SB-2026-077',
        supplier_name: 'Fenner Dunlop Conveyor Belts',
        transporter_name: 'Industrial Transport Corp',
        vehicle_number: 'WB-38-C-5612',
        driver_name: 'Prabir Mondal',
        driver_phone: '+919822334455',
        entry_gate: 'Coal Washery Inbound Gate',
        gross_weight_tons: 28.60,
        tare_weight_tons: 13.10,
        net_weight_tons: 15.50,
        inspection_status: 'PASSED',
        inspected_by: 'Shaft Engineer In-charge',
        remarks: 'Fire-resistant anti-static (FRAS) certification attached.',
        logged_by_user_id: defaultUserId,
        created_at: new Date(Date.now() - 3600000 * 18),
      },
      {
        consignment_number: 'MAT-2026-00203',
        organization_id: 1,
        mine_id: 2,
        material_name: 'Hydraulic ISO VG 68 Heavy Industrial Oil',
        category: 'FUEL_LUBRICANTS',
        quantity: 40.00,
        unit: 'DRUMS',
        challan_number: 'CASTROL/IND/2026/884',
        purchase_order_number: 'PO-ECL-SB-2026-092',
        supplier_name: 'Castrol Industrial India',
        transporter_name: 'Bengal Roadways',
        vehicle_number: 'WB-38-E-2234',
        driver_name: 'Subhash Sen',
        driver_phone: '+919811002299',
        entry_gate: 'Main Mechanical Yard Gate',
        gross_weight_tons: 16.20,
        tare_weight_tons: 8.00,
        net_weight_tons: 8.20,
        inspection_status: 'CONDITIONAL',
        inspected_by: 'Assistant Mechanical Engineer',
        remarks: 'Two drums had minor cap seal dents; accepted conditionally after viscosity check.',
        logged_by_user_id: defaultUserId,
        created_at: new Date(Date.now() - 3600000 * 24),
      },
      {
        consignment_number: 'MAT-2026-00204',
        organization_id: 1,
        mine_id: 2,
        material_name: 'Mine Sump Flocculant & Water Neutralization Chemical',
        category: 'CHEMICALS_REAGENTS',
        quantity: 15.00,
        unit: 'TONS',
        challan_number: 'NACL/CHEM/2026/104',
        purchase_order_number: 'PO-ECL-SB-2026-121',
        supplier_name: 'Nalco Water India Chemical Corp',
        transporter_name: 'Hazmat Logistics India',
        vehicle_number: 'WB-38-B-9981',
        driver_name: 'Gopal Soren',
        driver_phone: '+919899887766',
        entry_gate: 'Pithead Inward Gate',
        gross_weight_tons: 26.50,
        tare_weight_tons: 11.50,
        net_weight_tons: 15.00,
        inspection_status: 'PASSED',
        inspected_by: 'Environmental Chemist',
        remarks: 'MSDS verified; safe chemical storage protocol initiated.',
        logged_by_user_id: defaultUserId,
        created_at: new Date(Date.now() - 3600000 * 40),
      },
    ];

    for (const log of sampleConsignments) {
      await db.query(`
        INSERT INTO material_inward_logs (
          consignment_number, organization_id, mine_id, material_name, category,
          quantity, unit, challan_number, purchase_order_number, supplier_name,
          transporter_name, vehicle_number, driver_name, driver_phone, entry_gate,
          gross_weight_tons, tare_weight_tons, net_weight_tons, inspection_status,
          inspected_by, remarks, logged_by_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        log.consignment_number, log.organization_id, log.mine_id, log.material_name, log.category,
        log.quantity, log.unit, log.challan_number, log.purchase_order_number, log.supplier_name,
        log.transporter_name, log.vehicle_number, log.driver_name, log.driver_phone, log.entry_gate,
        log.gross_weight_tons, log.tare_weight_tons, log.net_weight_tons, log.inspection_status,
        log.inspected_by, log.remarks, log.logged_by_user_id, log.created_at
      ]);
    }
    console.log(`✅ Seeded ${sampleConsignments.length} realistic material inward consignments.`);
  } else {
    console.log(`ℹ️ Existing material logs found (${existingLogs[0].count} entries). Skipped re-seeding.`);
  }

  console.log('🎉 Materials module initialization complete.');
};

// If run directly via node
if (process.argv[1]?.includes('init_materials.js')) {
  setupMaterialsTableAndSeed()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to setup materials table:', err);
      process.exit(1);
    });
}
