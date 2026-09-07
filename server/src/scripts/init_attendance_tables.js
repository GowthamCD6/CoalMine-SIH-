import db from '../config/db.js';

export async function initAttendanceDb() {
  console.log('🔄 Initializing Attendance System tables in TiDB...');
  try {
    // 1. Attendance Workers Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_workers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(128) NOT NULL DEFAULT 'Underground Drill Operator',
        shift VARCHAR(128) NOT NULL DEFAULT 'Morning Shift (06:00 - 14:00)',
        mine_site VARCHAR(255) NOT NULL DEFAULT 'Dhanbad Central Pit #4 (Seam IX)',
        photo_url LONGTEXT,
        rfid_tag VARCHAR(64),
        registered_at VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_worker_id (worker_id),
        INDEX idx_shift (shift)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Attendance Logs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id VARCHAR(128) PRIMARY KEY,
        worker_id VARCHAR(64) NOT NULL,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(128),
        shift VARCHAR(128),
        mine_site VARCHAR(255),
        date VARCHAR(32) NOT NULL,
        time VARCHAR(32) NOT NULL,
        status VARCHAR(64) DEFAULT 'Present - On Time',
        confidence VARCHAR(32) DEFAULT '98.5%',
        verification_type VARCHAR(128) DEFAULT 'AI Facial Biometrics (ResNet-18)',
        dgms_form_b VARCHAR(64) DEFAULT 'VERIFIED_COMPLIANT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_log_worker (worker_id),
        INDEX idx_log_date (date),
        INDEX idx_log_shift (shift)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ attendance_workers and attendance_logs tables verified/created in TiDB!');

    // Seed default workers if table is empty
    const [existing] = await db.query('SELECT COUNT(*) as count FROM attendance_workers');
    if (existing[0]?.count === 0) {
      console.log('🌱 Seeding initial attendance workers in TiDB...');
      const seedWorkers = [
        ['EMP-7729', 'Ramesh Sharma', 'Underground Drill Operator', 'Morning Shift (06:00 - 14:00)', 'Dhanbad Central Pit #4 (Seam IX)', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces', 'RFID-7729-D4', '2026-09-01'],
        ['EMP-4102', 'Sunil Soren', 'Roof Bolting Crew Lead', 'Morning Shift (06:00 - 14:00)', 'Shaft 4 • Level 3 (-120m)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', 'RFID-4102-S3', '2026-09-02'],
        ['EMP-8812', 'Vikram Singh', 'Ventilation & Gas Sentry', 'Morning Shift (06:00 - 14:00)', 'Ventilation Shaft 1 (-90m)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', 'RFID-8812-V1', '2026-09-03'],
        ['EMP-3301', 'Amit Mondal', 'Continuous Miner Operator', 'Evening Shift (14:00 - 22:00)', 'Zone B - Level 4 Deep (-150m)', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces', 'RFID-3301-Z4', '2026-09-03'],
        ['EMP-6623', 'Deepak Bauri', 'Blasting Assistant & Explosives Handler', 'Evening Shift (14:00 - 22:00)', 'Sector C - Face 5 (-180m)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces', 'RFID-6623-SC', '2026-09-04'],
        ['EMP-2208', 'Pooja Sharma', 'Surface Dispatch Clerk', 'General Shift (08:00 - 16:30)', 'Surface Pit 2 / Haulage Yard (0m)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces', 'RFID-2208-P2', '2026-09-05']
      ];

      for (const w of seedWorkers) {
        await db.query(`
          INSERT INTO attendance_workers (worker_id, name, role, shift, mine_site, photo_url, rfid_tag, registered_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name)
        `, w);
      }
      console.log('✅ Default miners seeded in TiDB database!');
    }

    return true;
  } catch (err) {
    console.error('❌ Error initializing attendance DB:', err.message);
    return false;
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('init_attendance_tables.js')) {
  initAttendanceDb().then(() => process.exit(0)).catch(() => process.exit(1));
}
