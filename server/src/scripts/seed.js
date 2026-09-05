import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding for SIH26024...');

  try {
    // 1. Create Default Organization
    console.log('📦 Creating Default Organization...');
    const [orgs] = await db.query("SELECT id FROM organizations WHERE code = 'CIL-HQ'");
    let orgId;
    if (orgs.length > 0) {
      orgId = orgs[0].id;
      await db.query("UPDATE organizations SET name = 'Coal India Limited (Corporate HQ)', status = 'ACTIVE' WHERE id = ?", [orgId]);
    } else {
      const [res] = await db.query(`
        INSERT INTO organizations (name, code, status)
        VALUES ('Coal India Limited (Corporate HQ)', 'CIL-HQ', 'ACTIVE')
      `);
      orgId = res.insertId;
    }

    // 2. Create Default Mine
    console.log('⛏️ Creating Default Mine...');
    const [mines] = await db.query("SELECT id FROM mines WHERE code = 'RJ-OCP' AND organization_id = ?", [orgId]);
    let mineId;
    if (mines.length > 0) {
      mineId = mines[0].id;
      await db.query("UPDATE mines SET name = 'Rajmahal Open Cast Project', status = 'ACTIVE' WHERE id = ?", [mineId]);
    } else {
      const [res] = await db.query(`
        INSERT INTO mines (organization_id, name, code, mine_type, status)
        VALUES (?, 'Rajmahal Open Cast Project', 'RJ-OCP', 'OPEN_CAST', 'ACTIVE')
      `, [orgId]);
      mineId = res.insertId;
    }

    // 3. Create Super Admin User
    console.log('👤 Creating/Updating Super Admin User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@12345', salt);

    const [adminUser] = await db.query("SELECT id FROM users WHERE username = 'superadmin' OR email = 'admin@coalmin.org'");
    let superAdminUserId;
    if (adminUser.length > 0) {
      superAdminUserId = adminUser[0].id;
      await db.query(`
        UPDATE users 
        SET username = 'superadmin', email = 'admin@coalmin.org', password_hash = ?, first_name = 'System', last_name = 'Administrator', status = 'ACTIVE'
        WHERE id = ?
      `, [passwordHash, superAdminUserId]);
    } else {
      const [res] = await db.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, employee_code, status)
        VALUES ('superadmin', 'admin@coalmin.org', ?, 'System', 'Administrator', '+919876543210', 'EMP-0001', 'ACTIVE')
      `, [passwordHash]);
      superAdminUserId = res.insertId;
    }

    // Also update jaison's password to Admin@12345 if present
    await db.query("UPDATE users SET password_hash = ? WHERE username = 'jaison' OR email = 'jaison7373@gmail.com'", [passwordHash]);

    // 4. Seed Standard Permissions Catalog
    console.log('🛡️ Seeding Permissions Catalog...');
    const permissions = [
      { name: 'Super Admin All Access', code: '*', description: 'Full unrestricted system-wide clearance' },
      { name: 'Read Organizations', code: 'ORGANIZATIONS_READ', description: 'View organization records' },
      { name: 'Create Organizations', code: 'ORGANIZATIONS_CREATE', description: 'Create new organizations' },
      { name: 'Update Organizations', code: 'ORGANIZATIONS_UPDATE', description: 'Edit organization details' },
      { name: 'Delete Organizations', code: 'ORGANIZATIONS_DELETE', description: 'Deactivate organizations' },
      { name: 'Read Mines', code: 'MINES_READ', description: 'View mine facilities' },
      { name: 'Create Mines', code: 'MINES_CREATE', description: 'Add new mining sites' },
      { name: 'Update Mines', code: 'MINES_UPDATE', description: 'Update mining site configs' },
      { name: 'Delete Mines', code: 'MINES_DELETE', description: 'Deactivate mining sites' },
      { name: 'Read Users', code: 'USERS_READ', description: 'View personnel directory' },
      { name: 'Create Users', code: 'USERS_CREATE', description: 'Provision new accounts' },
      { name: 'Update Users', code: 'USERS_UPDATE', description: 'Update personnel details' },
      { name: 'Delete Users', code: 'USERS_DELETE', description: 'Deactivate user accounts' },
      { name: 'Manage User Roles', code: 'USERS_MANAGE_ROLES', description: 'Assign/revoke subroles to users' },
      { name: 'Read Roles', code: 'ROLES_READ', description: 'View roles catalog' },
      { name: 'Create Roles', code: 'ROLES_CREATE', description: 'Create organizational roles' },
      { name: 'Update Roles', code: 'ROLES_UPDATE', description: 'Modify roles' },
      { name: 'Delete Roles', code: 'ROLES_DELETE', description: 'Deactivate roles' },
      { name: 'Manage Role Permissions', code: 'ROLES_MANAGE_PERMISSIONS', description: 'Attach permissions to roles' },
      { name: 'Read Subroles', code: 'SUBROLES_READ', description: 'View subroles' },
      { name: 'Create Subroles', code: 'SUBROLES_CREATE', description: 'Add subroles' },
      { name: 'Update Subroles', code: 'SUBROLES_UPDATE', description: 'Update subroles' },
      { name: 'Delete Subroles', code: 'SUBROLES_DELETE', description: 'Deactivate subroles' },
      { name: 'Manage Subrole Permissions', code: 'SUBROLES_MANAGE_PERMISSIONS', description: 'Attach permissions to subroles' },
      { name: 'Read Permissions', code: 'PERMISSIONS_READ', description: 'View catalog of permissions' },
      { name: 'Manage Permissions', code: 'PERMISSIONS_MANAGE', description: 'Add/edit system permissions' },
      { name: 'Read Pages', code: 'PAGES_READ', description: 'View navigation pages' },
      { name: 'Manage Pages', code: 'PAGES_MANAGE', description: 'Create/edit page hierarchy & routes' },
      { name: 'Read Sessions', code: 'SESSIONS_READ', description: 'View active device sessions' },
      { name: 'Manage Sessions', code: 'SESSIONS_MANAGE', description: 'Revoke user sessions' },
      { name: 'Read Audit Logs', code: 'AUDIT_READ', description: 'Query audit trail logs' },
    ];

    for (const p of permissions) {
      await db.query(`
        INSERT INTO permissions (name, code, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
      `, [p.name, p.code, p.description]);
    }

    // 5. Create Super Admin Role & Subrole
    console.log('👑 Creating Super Admin Role & Subrole...');
    const [roles] = await db.query("SELECT id FROM roles WHERE code = 'SUPER_ADMIN' AND organization_id = ?", [orgId]);
    let roleId;
    if (roles.length > 0) {
      roleId = roles[0].id;
    } else {
      const [res] = await db.query(`
        INSERT INTO roles (organization_id, mine_id, name, code, description, status)
        VALUES (?, NULL, 'Super Administrator', 'SUPER_ADMIN', 'Global unrestricted system management role', 'ACTIVE')
      `, [orgId]);
      roleId = res.insertId;
    }

    const [subroles] = await db.query("SELECT id FROM subroles WHERE code = 'FULL_ACCESS' AND role_id = ?", [roleId]);
    let subroleId;
    if (subroles.length > 0) {
      subroleId = subroles[0].id;
    } else {
      const [res] = await db.query(`
        INSERT INTO subroles (role_id, name, code, description, status)
        VALUES (?, 'Full Access Clearance', 'FULL_ACCESS', 'Direct global administrative access clearance', 'ACTIVE')
      `, [roleId]);
      subroleId = res.insertId;
    }

    // 6. Attach Wildcard & All Permissions to Role & Subrole
    console.log('🔗 Attaching Permissions to Super Admin Role...');
    const [starPerm] = await db.query("SELECT id FROM permissions WHERE code = '*'");
    if (starPerm.length > 0) {
      const pId = starPerm[0].id;
      await db.query("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [roleId, pId]);
      await db.query("INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)", [subroleId, pId]);
    }

    // 7. Assign Super Admin User (and any existing users) to Super Admin Subrole
    console.log('👥 Assigning User to Super Admin Subrole...');
    await db.query(`
      INSERT INTO user_subroles (user_id, subrole_id, assigned_by, assigned_at, status)
      VALUES (?, ?, ?, NOW(), 'ACTIVE')
      ON DUPLICATE KEY UPDATE status = 'ACTIVE'
    `, [superAdminUserId, subroleId, superAdminUserId]);

    // Also assign user #1 (jaison) if different
    if (superAdminUserId !== 1) {
      await db.query(`
        INSERT INTO user_subroles (user_id, subrole_id, assigned_by, assigned_at, status)
        VALUES (1, ?, ?, NOW(), 'ACTIVE')
        ON DUPLICATE KEY UPDATE status = 'ACTIVE'
      `, [subroleId, superAdminUserId]);
    }

    // 8. Seed Default Navigation Pages
    console.log('📑 Seeding Default Pages Hierarchy...');
    const pages = [
      { name: 'Dashboard Overview', code: 'PAGE_DASHBOARD', route: '/', parent_id: null, icon: 'Activity', sort_order: 1, type: 'PAGE' },
      { name: 'Organizations', code: 'PAGE_ORGS', route: '/organizations', parent_id: null, icon: 'Building2', sort_order: 2, type: 'PAGE' },
      { name: 'Mines Directory', code: 'PAGE_MINES', route: '/mines', parent_id: null, icon: 'Layers', sort_order: 3, type: 'PAGE' },
      { name: 'Personnel & Users', code: 'PAGE_USERS', route: '/users', parent_id: null, icon: 'Users', sort_order: 4, type: 'PAGE' },
      { name: 'Roles & RBAC', code: 'PAGE_RBAC', route: '/rbac', parent_id: null, icon: 'ShieldCheck', sort_order: 5, type: 'PAGE' },
      { name: 'Pages Hierarchy', code: 'PAGE_PAGES', route: '/pages', parent_id: null, icon: 'FolderTree', sort_order: 6, type: 'PAGE' },
      { name: 'Audit Logs', code: 'PAGE_AUDIT', route: '/audit-logs', parent_id: null, icon: 'FileText', sort_order: 7, type: 'PAGE' },
    ];

    for (const page of pages) {
      await db.query(`
        INSERT INTO pages (name, code, route, parent_id, icon, sort_order, type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE name = VALUES(name), route = VALUES(route), type = VALUES(type), status = 'ACTIVE'
      `, [page.name, page.code, page.route, page.parent_id, page.icon, page.sort_order, page.type]);
    }

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('🔑 SUPER ADMIN LOGIN CREDENTIALS:');
    console.log('   Username:  superadmin');
    console.log('   Email:     admin@coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('----------------------------------------');
    console.log('🔑 JAISON LOGIN CREDENTIALS:');
    console.log('   Username:  jaison');
    console.log('   Email:     jaison7373@gmail.com');
    console.log('   Password:  Admin@12345');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedDatabase();
