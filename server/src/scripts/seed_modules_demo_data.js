import db from '../config/db.js';

async function seedDemoData() {
  console.log('🌱 Seeding realistic demonstration data for SmartMine modules...');

  // 1. Get first mine & user
  const [mines] = await db.query('SELECT id FROM mines LIMIT 2');
  const [users] = await db.query('SELECT id FROM users LIMIT 2');
  const [orgs] = await db.query('SELECT id FROM organizations LIMIT 1');

  if (!mines.length || !users.length) {
    console.error('Mines or users not found.');
    process.exit(1);
  }

  const mineId1 = mines[0].id;
  const mineId2 = mines[1] ? mines[1].id : mineId1;
  const userId = users[0].id;
  const orgId = orgs[0]?.id || 1;

  // 2. Inspections & Checklist
  console.log('Seeding Inspections...');
  const [insp1] = await db.query(`
    INSERT INTO inspections (mine_id, inspector_user_id, inspection_type, area, description, scheduled_at, status)
    VALUES (?, ?, 'SAFETY', 'Pit 4 - Coal Face A', 'Statutory quarterly DGMS mechanical & roof support inspection', DATE_SUB(NOW(), INTERVAL 2 DAY), 'IN_PROGRESS')
  `, [mineId1, userId]);

  const [insp2] = await db.query(`
    INSERT INTO inspections (mine_id, inspector_user_id, inspection_type, area, description, scheduled_at, status)
    VALUES (?, ?, 'ROUTINE', 'Main Ventilation Incline', 'Bi-weekly air velocity and methane sensor audit', DATE_ADD(NOW(), INTERVAL 1 DAY), 'SCHEDULED')
  `, [mineId2, userId]);

  if (insp1.insertId) {
    await db.query(`
      INSERT INTO inspection_checklist_items (inspection_id, item_text, status, severity, remarks)
      VALUES
        (?, 'Hydraulic roof support chocks pressure check', 'OK', 'LOW', 'Chocks holding at 350 bar nominal'),
        (?, 'Emergency egress signage and lighting intact', 'OK', 'LOW', 'Luminance compliant with CMR standards'),
        (?, 'Haul truck brake retarder fluid level', 'ISSUE', 'HIGH', 'Hydraulic fluid leak on Dumper #14')
    `, [insp1.insertId, insp1.insertId, insp1.insertId]);
  }

  // 3. Safety Observations
  console.log('Seeding Safety Observations...');
  await db.query(`
    INSERT INTO safety_observations (mine_id, observer_user_id, area, description, severity, status)
    VALUES
      (?, ?, 'Conveyor Belt Siding 2', 'Belt roller bearing overheating above 75 deg C near drive drum', 'HIGH', 'OPEN'),
      (?, ?, 'Substation 3 Entrance', 'Missing warning signage on high-voltage transformer cage', 'MEDIUM', 'OPEN'),
      (?, ?, 'Workshop Bay 1', 'Oil spill cleaned and absorbent applied', 'LOW', 'RESOLVED')
  `, [mineId1, userId, mineId1, userId, mineId2, userId]);

  // 4. Statutory Violations
  console.log('Seeding Violations...');
  await db.query(`
    INSERT INTO violations (mine_id, type, description, severity, deadline, status)
    VALUES
      (?, 'SAFETY', 'DGMS Circular 2024/04 - Dust suppression water mist nozzles clogged on Secondary Crusher', 'HIGH', DATE_ADD(NOW(), INTERVAL 5 DAY), 'OPEN'),
      (?, 'STATUTORY', 'Non-functional backup siren on evacuation alarm station #2', 'MEDIUM', DATE_ADD(NOW(), INTERVAL 3 DAY), 'IN_PROGRESS')
  `, [mineId1, mineId2]);

  // 5. Incidents & Investigations & CAPA
  console.log('Seeding Incidents & CAPA...');
  const [inc1] = await db.query(`
    INSERT INTO incidents (mine_id, reported_by, category, title, description, severity, location_area, incident_at, status)
    VALUES (?, ?, 'EQUIPMENT', 'Dumper D-104 Tire Blowout on Haul Road Ramp', 'Rear dual tyre burst while descending haul road incline with 50T coal payload. Operator brought vehicle to controlled stop using berm. No personnel injuries.', 'HIGH', 'Main Incline Ramp South', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CORRECTIVE_ACTION')
  `, [mineId1, userId]);

  if (inc1.insertId) {
    await db.query(`
      INSERT INTO incident_investigations (incident_id, investigator_id, root_cause, findings)
      VALUES (?, ?, 'Tire carcass fatigue exacerbated by rock spillage on ramp road', 'Tire pressure log indicated 5 psi under-inflation combined with sharp sandstone debris from haulage truck spillage.')
    `, [inc1.insertId, userId]);

    await db.query(`
      INSERT INTO incident_actions (incident_id, action_type, description, deadline, status)
      VALUES
        (?, 'CORRECTIVE', 'Deploy motor grader for mandatory 2-hour rock removal cycle on ramp roads', DATE_ADD(NOW(), INTERVAL 2 DAY), 'IN_PROGRESS'),
        (?, 'PREVENTIVE', 'Install automatic tyre pressure monitoring sensor (TPMS) on all 85T haulers', DATE_ADD(NOW(), INTERVAL 14 DAY), 'OPEN')
    `, [inc1.insertId, inc1.insertId]);
  }

  // 6. Environmental Monitoring Readings
  console.log('Seeding Environmental Observations...');
  await db.query(`
    INSERT INTO env_observations (mine_id, observer_id, parameter_type, value, unit, status)
    VALUES
      (?, ?, 'AIR_DUST', 84.5, 'µg/m³', 'NORMAL'),
      (?, ?, 'WATER_QUALITY', 7.2, 'pH', 'NORMAL'),
      (?, ?, 'NOISE', 89.2, 'dB', 'THRESHOLD_EXCEEDED'),
      (?, ?, 'METHANE', 0.12, '%', 'NORMAL'),
      (?, ?, 'CO2', 1200, 'ppm', 'NORMAL'),
      (?, ?, 'TEMPERATURE', 31.4, '°C', 'NORMAL')
  `, [mineId1, userId, mineId1, userId, mineId1, userId, mineId1, userId, mineId1, userId, mineId1, userId]);

  // 7. Production Shift Reports & Targets
  console.log('Seeding Production Output & Targets...');
  await db.query(`
    INSERT INTO production_targets (mine_id, period_type, period_value, target_tonnes, set_by)
    VALUES
      (?, 'MONTHLY', '2026-09', 45000.00, ?),
      (?, 'MONTHLY', '2026-09', 32000.00, ?)
  `, [mineId1, userId, mineId2, userId]);

  await db.query(`
    INSERT INTO production_reports (mine_id, supervisor_id, report_date, shift, target_tonnes, actual_tonnes, equipment_downtime_hrs, remarks, status)
    VALUES
      (?, ?, CURRENT_DATE, 'MORNING', 750.00, 810.50, 0.5, 'Smooth dragline and shovel operations, exceeded target', 'SUBMITTED'),
      (?, ?, CURRENT_DATE, 'AFTERNOON', 750.00, 720.00, 1.2, 'Conveyor feeder belt chute jam caused 70 min stoppage', 'SUBMITTED'),
      (?, ?, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'NIGHT', 600.00, 640.00, 0.0, 'Full production cycle completed', 'SUBMITTED')
    ON DUPLICATE KEY UPDATE actual_tonnes = VALUES(actual_tonnes)
  `, [mineId1, userId, mineId1, userId, mineId1, userId]);

  await db.query(`
    INSERT INTO operational_issues (mine_id, reported_by, issue_type, description, area, severity, status)
    VALUES
      (?, ?, 'EQUIPMENT', 'Hydraulic hose rupture on Shovel SH-08 boom cylinder', 'Pit 2 Overburden Face', 'HIGH', 'IN_PROGRESS'),
      (?, ?, 'WEATHER', 'Intermittent heavy rain causing silt accumulation at Sump 4', 'Deep Pit Sump Area', 'MEDIUM', 'OPEN')
  `, [mineId1, userId, mineId1, userId]);

  // 8. Contractors, Contracts & Workers
  console.log('Seeding Contractors & Workforce...');
  const [c1] = await db.query(`
    INSERT INTO contractors (org_id, company_name, registration_number, contact_person, contact_phone, contact_email, status)
    VALUES (?, 'Bharat Earth Movers & Haulage Ltd', 'U10100WB2018PLC092144', 'Anil Deshmukh', '+91 98310 54321', 'contact@beml-contractors.in', 'ACTIVE')
  `, [orgId]);

  if (c1.insertId) {
    await db.query(`
      INSERT INTO contractor_contracts (contractor_id, mine_id, work_description, start_date, end_date, status)
      VALUES (?, ?, 'Overburden excavation, loading and dumper dispatch across Pit 4 & 5', '2026-01-01', '2026-12-31', 'ACTIVE')
    `, [c1.insertId, mineId1]);

    await db.query(`
      INSERT INTO contractor_workers (contractor_id, mine_id, full_name, id_number, role, training_status, assigned_area, status)
      VALUES
        (?, ?, 'Subhash Mondal', 'BEML-OP-041', 'Heavy Dumper Operator', 'CERTIFIED', 'Pit 4 Haul Road', 'ACTIVE'),
        (?, ?, 'Prakash Gope', 'BEML-DR-018', 'Drill Rig Assistant', 'CERTIFIED', 'Drilling Bench C', 'ACTIVE'),
        (?, ?, 'Raju Majhi', 'BEML-MT-092', 'Belt Conveyor Attendant', 'PENDING', 'Siding Transfer Tower', 'ACTIVE')
    `, [c1.insertId, mineId1, c1.insertId, mineId1, c1.insertId, mineId1]);
  }

  // 9. Grievances
  console.log('Seeding Grievances...');
  const [grv1] = await db.query(`
    INSERT INTO grievances (mine_id, submitted_by, is_anonymous, category, title, description, priority, status)
    VALUES (?, ?, 1, 'SAFETY', 'Inadequate ventilation at Stope 3 Crosscut', 'Airflow is sluggish and heat is accumulating during afternoon blasting shift. Request auxiliary fan installation immediately.', 'HIGH', 'UNDER_INVESTIGATION')
  `, [mineId1, userId]);

  if (grv1.insertId) {
    await db.query(`
      INSERT INTO grievance_responses (grievance_id, responder_id, response_text, action_taken)
      VALUES (?, ?, 'Ventilation officer inspected Stope 3 crosscut on Sept 6. Anemometer reading showed 0.3 m/s below standard.', 'Ordered 15 kW auxiliary axial fan deployment from Central Store. Ducting installation scheduled for Sept 8.')
    `, [grv1.insertId, userId]);
  }

  console.log('🎉 Demo data seeded successfully for all SmartMine modules!');
  process.exit(0);
}

seedDemoData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
