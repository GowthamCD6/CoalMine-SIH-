import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const seedDatabase = async () => {
  console.log('🌱 Starting Comprehensive Multi-Tier Database Seeding for SIH26024...\n');

  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Admin@12345', salt);

    // ==========================================
    // 1. SEED PERMISSIONS CATALOG
    // ==========================================
    console.log('🛡️ 1. Seeding Permissions Catalog...');
    const permissions = [
      { name: 'Super Admin All Access', code: '*', description: 'Full unrestricted system-wide clearance' },
      { name: 'Read Organizations', code: 'ORGANIZATIONS_READ', description: 'View organization records' },
      { name: 'Create Organizations', code: 'ORGANIZATIONS_CREATE', description: 'Create new organizations (Super Admin only)' },
      { name: 'Update Organizations', code: 'ORGANIZATIONS_UPDATE', description: 'Edit organization details' },
      { name: 'Delete Organizations', code: 'ORGANIZATIONS_DELETE', description: 'Deactivate organizations (Super Admin only)' },
      { name: 'Read Mines', code: 'MINES_READ', description: 'View mine facilities' },
      { name: 'Create Mines', code: 'MINES_CREATE', description: 'Add new mining sites under organization' },
      { name: 'Update Mines', code: 'MINES_UPDATE', description: 'Update mining site configs' },
      { name: 'Delete Mines', code: 'MINES_DELETE', description: 'Deactivate mining sites' },
      { name: 'Read Users', code: 'USERS_READ', description: 'View personnel directory' },
      { name: 'Create Users', code: 'USERS_CREATE', description: 'Provision new accounts within scope' },
      { name: 'Update Users', code: 'USERS_UPDATE', description: 'Update personnel details within scope' },
      { name: 'Delete Users', code: 'USERS_DELETE', description: 'Deactivate user accounts within scope' },
      { name: 'Manage User Roles', code: 'USERS_MANAGE_ROLES', description: 'Assign/revoke subroles to users within scope' },
      { name: 'Read Roles', code: 'ROLES_READ', description: 'View roles catalog' },
      { name: 'Create Roles', code: 'ROLES_CREATE', description: 'Create organizational or mine roles' },
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

    const permMap = {};
    for (const p of permissions) {
      await db.query(`
        INSERT INTO permissions (name, code, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
      `, [p.name, p.code, p.description]);
      const [r] = await db.query('SELECT id FROM permissions WHERE code = ?', [p.code]);
      permMap[p.code] = r[0].id;
    }

    // ==========================================
    // 2. SEED ORGANIZATIONS
    // ==========================================
    console.log('📦 2. Seeding Organizations (Eastern Coalfields Limited)...');
    await db.query(`
      INSERT INTO organizations (id, name, code, status)
      VALUES (1, 'Eastern Coalfields Limited', 'ECL-HQ', 'ACTIVE')
      ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'ACTIVE'
    `);

    await db.query(`
      INSERT INTO organizations (id, name, code, status)
      VALUES (2, 'Bharat Coking Coal Limited', 'BCCL-HQ', 'ACTIVE')
      ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'ACTIVE'
    `);

    // ==========================================
    // 3. SEED MINES
    // ==========================================
    console.log('⛏️ 3. Seeding Mines (Rajmahal Open Cast & Sonepur Bazari)...');
    await db.query(`
      INSERT INTO mines (id, organization_id, name, code, mine_type, status)
      VALUES (1, 1, 'Rajmahal Open Cast Project', 'RJ-OCP', 'OPEN_CAST', 'ACTIVE')
      ON DUPLICATE KEY UPDATE name = VALUES(name), organization_id = 1, mine_type = 'OPEN_CAST', status = 'ACTIVE'
    `);

    await db.query(`
      INSERT INTO mines (id, organization_id, name, code, mine_type, status)
      VALUES (2, 1, 'Sonepur Bazari Underground Mine', 'SB-UGM', 'UNDERGROUND', 'ACTIVE')
      ON DUPLICATE KEY UPDATE name = VALUES(name), organization_id = 1, mine_type = 'UNDERGROUND', status = 'ACTIVE'
    `);

    // ==========================================
    // 4. HELPER TO CREATE USER / ROLE / SUBROLE
    // ==========================================
    const ensureUser = async ({ username, email, first_name, last_name, employee_code, phone }) => {
      const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing.length > 0) {
        await db.query(`
          UPDATE users 
          SET username = ?, email = ?, password_hash = ?, first_name = ?, last_name = ?, phone = ?, employee_code = ?, status = 'ACTIVE'
          WHERE id = ?
        `, [username, email, defaultPasswordHash, first_name, last_name, phone, employee_code, existing[0].id]);
        return existing[0].id;
      } else {
        const [res] = await db.query(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, phone, employee_code, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [username, email, defaultPasswordHash, first_name, last_name, phone, employee_code]);
        return res.insertId;
      }
    };

    const ensureRole = async ({ organization_id, mine_id = null, name, code, description }) => {
      const [existing] = await db.query('SELECT id FROM roles WHERE code = ? AND organization_id = ?', [code, organization_id]);
      if (existing.length > 0) {
        await db.query(`
          UPDATE roles SET name = ?, mine_id = ?, description = ?, status = 'ACTIVE' WHERE id = ?
        `, [name, mine_id, description, existing[0].id]);
        return existing[0].id;
      } else {
        const [res] = await db.query(`
          INSERT INTO roles (organization_id, mine_id, name, code, description, status)
          VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        `, [organization_id, mine_id, name, code, description]);
        return res.insertId;
      }
    };

    const ensureSubrole = async ({ role_id, name, code, description }) => {
      const [existing] = await db.query('SELECT id FROM subroles WHERE code = ? AND role_id = ?', [code, role_id]);
      if (existing.length > 0) {
        await db.query(`
          UPDATE subroles SET name = ?, description = ?, status = 'ACTIVE' WHERE id = ?
        `, [name, description, existing[0].id]);
        return existing[0].id;
      } else {
        const [res] = await db.query(`
          INSERT INTO subroles (role_id, name, code, description, status)
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `, [role_id, name, code, description]);
        return res.insertId;
      }
    };

    const assignPermsToRole = async (role_id, permCodes) => {
      for (const code of permCodes) {
        const pId = permMap[code];
        if (pId) {
          await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role_id, pId]);
        }
      }
    };

    const assignPermsToSubrole = async (subrole_id, permCodes) => {
      for (const code of permCodes) {
        const pId = permMap[code];
        if (pId) {
          await db.query('INSERT IGNORE INTO subrole_permissions (subrole_id, permission_id) VALUES (?, ?)', [subrole_id, pId]);
        }
      }
    };

    const assignUserToSubrole = async (user_id, subrole_id) => {
      await db.query(`
        INSERT INTO user_subroles (user_id, subrole_id, assigned_by, assigned_at, status)
        VALUES (?, ?, 1, NOW(), 'ACTIVE')
        ON DUPLICATE KEY UPDATE status = 'ACTIVE'
      `, [user_id, subrole_id]);
    };

    // ==========================================
    // 5. TIER 1: SUPER ADMINISTRATOR (GLOBAL)
    // ==========================================
    console.log('👑 5. Seeding Tier 1: Super Administrator...');
    const superAdminUserId = await ensureUser({
      username: 'superadmin',
      email: 'admin@coalmin.org',
      first_name: 'Global',
      last_name: 'Superadmin',
      employee_code: 'SUPER-001',
      phone: '+919999900001',
    });

    // Also ensure jaison account has Super Admin
    const jaisonUserId = await ensureUser({
      username: 'jaison',
      email: 'jaison7373@gmail.com',
      first_name: 'Jaison',
      last_name: 'Administrator',
      employee_code: 'SUPER-002',
      phone: '+919999900002',
    });

    const superAdminRoleId = await ensureRole({
      organization_id: 1,
      mine_id: null,
      name: 'Global Super Administrator',
      code: 'SUPER_ADMIN',
      description: 'Unrestricted system-wide governance authority',
    });

    const superAdminSubroleId = await ensureSubrole({
      role_id: superAdminRoleId,
      name: 'Full Access Root Clearance',
      code: 'FULL_ACCESS_ROOT',
      description: 'Root system clearance',
    });

    await assignPermsToRole(superAdminRoleId, ['*']);
    await assignPermsToSubrole(superAdminSubroleId, ['*']);
    await assignUserToSubrole(superAdminUserId, superAdminSubroleId);
    await assignUserToSubrole(jaisonUserId, superAdminSubroleId);

    // ==========================================
    // 6. TIER 2: ORGANIZATION ADMIN & ORG ROLES (ECL)
    // ==========================================
    console.log('🏢 6. Seeding Tier 2: ECL Organization Admin & Corporate Roles...');
    // 6.1 Org Admin User
    const orgAdminUserId = await ensureUser({
      username: 'ecl_admin',
      email: 'admin@ecl.coalmin.org',
      first_name: 'Vikram',
      last_name: 'Sharma',
      employee_code: 'ECL-DIR-01',
      phone: '+919876500101',
    });

    const orgAdminRoleId = await ensureRole({
      organization_id: 1,
      mine_id: null,
      name: 'ECL Executive Director',
      code: 'ECL_ORG_ADMIN',
      description: 'Organization administrator for Eastern Coalfields Limited (Cannot create other orgs)',
    });

    const orgAdminSubroleId = await ensureSubrole({
      role_id: orgAdminRoleId,
      name: 'ECL Organization Head',
      code: 'ECL_ORG_HEAD',
      description: 'Full management of ECL mines, personnel, and organizational roles',
    });

    // Org Admin permissions: Can read/update own org, manage mines, manage org/mine users, roles, subroles
    const orgAdminPerms = [
      'ORGANIZATIONS_READ',
      'ORGANIZATIONS_UPDATE',
      'MINES_READ',
      'MINES_CREATE',
      'MINES_UPDATE',
      'MINES_DELETE',
      'USERS_READ',
      'USERS_CREATE',
      'USERS_UPDATE',
      'USERS_DELETE',
      'USERS_MANAGE_ROLES',
      'ROLES_READ',
      'ROLES_CREATE',
      'ROLES_UPDATE',
      'ROLES_DELETE',
      'ROLES_MANAGE_PERMISSIONS',
      'SUBROLES_READ',
      'SUBROLES_CREATE',
      'SUBROLES_UPDATE',
      'SUBROLES_DELETE',
      'SUBROLES_MANAGE_PERMISSIONS',
      'PAGES_READ',
      'SESSIONS_READ',
      'SESSIONS_MANAGE',
      'AUDIT_READ',
    ];
    await assignPermsToRole(orgAdminRoleId, orgAdminPerms);
    await assignPermsToSubrole(orgAdminSubroleId, orgAdminPerms);
    await assignUserToSubrole(orgAdminUserId, orgAdminSubroleId);

    // 6.2 Org-Level Specialized Role: Site Advisor & Auditor (Organization-wide)
    const siteAdvisorUserId = await ensureUser({
      username: 'ecl_advisor',
      email: 'advisor@ecl.coalmin.org',
      first_name: 'Ananya',
      last_name: 'Iyer',
      employee_code: 'ECL-ADV-04',
      phone: '+919876500102',
    });

    const siteAdvisorRoleId = await ensureRole({
      organization_id: 1,
      mine_id: null,
      name: 'ECL Corporate Site Advisor',
      code: 'ECL_SITE_ADVISOR',
      description: 'Organization-wide technical advisor and compliance auditor',
    });

    const siteAdvisorSubroleId = await ensureSubrole({
      role_id: siteAdvisorRoleId,
      name: 'Senior Site Advisor Clearance',
      code: 'ECL_SR_ADVISOR',
      description: 'Advisory clearance across all ECL mining sites',
    });

    const advisorPerms = [
      'ORGANIZATIONS_READ',
      'MINES_READ',
      'USERS_READ',
      'ROLES_READ',
      'SUBROLES_READ',
      'PAGES_READ',
      'AUDIT_READ',
    ];
    await assignPermsToRole(siteAdvisorRoleId, advisorPerms);
    await assignPermsToSubrole(siteAdvisorSubroleId, advisorPerms);
    await assignUserToSubrole(siteAdvisorUserId, siteAdvisorSubroleId);

    // ==========================================
    // 7. TIER 3: MINE ADMIN & MINE PERSONNEL (RAJMAHAL MINE #1)
    // ==========================================
    console.log('⛏️ 7. Seeding Tier 3: Rajmahal Mine Admin & Site Personnel...');
    // 7.1 Mine Admin User
    const rjMineAdminUserId = await ensureUser({
      username: 'rj_mine_admin',
      email: 'admin@rajmahal.coalmin.org',
      first_name: 'Rajesh',
      last_name: 'Mukherjee',
      employee_code: 'RJ-MGR-01',
      phone: '+919876500201',
    });

    const rjMineAdminRoleId = await ensureRole({
      organization_id: 1,
      mine_id: 1,
      name: 'Rajmahal Mine General Manager',
      code: 'RJ_MINE_ADMIN',
      description: 'Site manager with full operational control over Rajmahal Open Cast Project',
    });

    const rjMineAdminSubroleId = await ensureSubrole({
      role_id: rjMineAdminRoleId,
      name: 'Rajmahal Mine Head',
      code: 'RJ_MINE_HEAD',
      description: 'Mine-scoped administrative clearance',
    });

    // Mine Admin permissions: Can read/update own mine, manage mine personnel, mine roles & subroles
    const mineAdminPerms = [
      'MINES_READ',
      'MINES_UPDATE',
      'USERS_READ',
      'USERS_CREATE',
      'USERS_UPDATE',
      'USERS_DELETE',
      'USERS_MANAGE_ROLES',
      'ROLES_READ',
      'ROLES_CREATE',
      'ROLES_UPDATE',
      'ROLES_DELETE',
      'ROLES_MANAGE_PERMISSIONS',
      'SUBROLES_READ',
      'SUBROLES_CREATE',
      'SUBROLES_UPDATE',
      'SUBROLES_DELETE',
      'SUBROLES_MANAGE_PERMISSIONS',
      'PAGES_READ',
      'SESSIONS_READ',
      'AUDIT_READ',
    ];
    await assignPermsToRole(rjMineAdminRoleId, mineAdminPerms);
    await assignPermsToSubrole(rjMineAdminSubroleId, mineAdminPerms);
    await assignUserToSubrole(rjMineAdminUserId, rjMineAdminSubroleId);

    // 7.2 Mine Personnel: Safety Officer
    const rjSafetyOfficerUserId = await ensureUser({
      username: 'rj_safety_officer',
      email: 'safety@rajmahal.coalmin.org',
      first_name: 'Kavita',
      last_name: 'Reddy',
      employee_code: 'RJ-SAF-12',
      phone: '+919876500202',
    });

    const rjSafetyRoleId = await ensureRole({
      organization_id: 1,
      mine_id: 1,
      name: 'Rajmahal Shift Safety Officer',
      code: 'RJ_SAFETY_OFFICER',
      description: 'Mine safety inspector and hazard reporting officer',
    });

    const rjSafetySubroleId = await ensureSubrole({
      role_id: rjSafetyRoleId,
      name: 'Safety Inspection Clearance',
      code: 'RJ_SAFETY_INSPECT',
      description: 'Safety logging and site monitoring',
    });

    const safetyPerms = ['MINES_READ', 'USERS_READ', 'PAGES_READ', 'AUDIT_READ'];
    await assignPermsToRole(rjSafetyRoleId, safetyPerms);
    await assignPermsToSubrole(rjSafetySubroleId, safetyPerms);
    await assignUserToSubrole(rjSafetyOfficerUserId, rjSafetySubroleId);

    // 7.3 Mine Personnel: Excavation Engineer
    const rjEngineerUserId = await ensureUser({
      username: 'rj_engineer',
      email: 'engineer@rajmahal.coalmin.org',
      first_name: 'Manoj',
      last_name: 'Verma',
      employee_code: 'RJ-ENG-08',
      phone: '+919876500203',
    });

    const rjEngineerRoleId = await ensureRole({
      organization_id: 1,
      mine_id: 1,
      name: 'Rajmahal Excavation Engineer',
      code: 'RJ_EXCAVATION_ENG',
      description: 'Heavy equipment and blasting operations engineer',
    });

    const rjEngineerSubroleId = await ensureSubrole({
      role_id: rjEngineerRoleId,
      name: 'Excavation Lead Clearance',
      code: 'RJ_EXCAVATION_LEAD',
      description: 'Excavation operations clearance',
    });

    const engineerPerms = ['MINES_READ', 'PAGES_READ'];
    await assignPermsToRole(rjEngineerRoleId, engineerPerms);
    await assignPermsToSubrole(rjEngineerSubroleId, engineerPerms);
    await assignUserToSubrole(rjEngineerUserId, rjEngineerSubroleId);

    // ==========================================
    // 8. SEED NAVIGATION PAGES
    // ==========================================
    console.log('📑 8. Seeding Navigation Pages Hierarchy...');
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

    console.log('\n================================================================');
    console.log('✅ COMPLETE MULTI-TIER DATABASE SEEDING FINISHED!');
    console.log('================================================================');
    console.log('👑 1. SUPER ADMIN (Global Unrestricted Clearance):');
    console.log('   Username:  superadmin   (or jaison)');
    console.log('   Email:     admin@coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('   Authority: Create Organizations, Provision Org Admins, Full Root Clearance');
    console.log('----------------------------------------------------------------');
    console.log('🏢 2. ECL ORGANIZATION ADMIN (Organization Scope #1):');
    console.log('   Username:  ecl_admin');
    console.log('   Email:     admin@ecl.coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('   Authority: Manage ECL, Create Mines, Provision Mine Admins, Create Org Roles');
    console.log('----------------------------------------------------------------');
    console.log('👔 3. ECL CORPORATE SITE ADVISOR (Org-Level Specialist):');
    console.log('   Username:  ecl_advisor');
    console.log('   Email:     advisor@ecl.coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('----------------------------------------------------------------');
    console.log('⛏️ 4. RAJMAHAL MINE ADMIN (Mine Scope #1):');
    console.log('   Username:  rj_mine_admin');
    console.log('   Email:     admin@rajmahal.coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('   Authority: Manage Rajmahal Mine, Create Mine Roles/Subroles, Provision Personnel');
    console.log('----------------------------------------------------------------');
    console.log('👷 5. RAJMAHAL SITE SAFETY OFFICER (Mine Personnel):');
    console.log('   Username:  rj_safety_officer');
    console.log('   Email:     safety@rajmahal.coalmin.org');
    console.log('   Password:  Admin@12345');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedDatabase();
