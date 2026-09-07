-- ==============================================================================
-- CoalMin / SmartMine — Comprehensive Demonstration & Production Sample Data
-- ==============================================================================
-- TARGET DATABASE: TiDB Cloud / MySQL 8.0+
-- ALL PASSWORDS (Default): Admin@12345
-- BCRYPT HASH: $2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Organizations (Coal Subsidiaries & Apex Bodies)
-- -----------------------------------------------------------------------------
INSERT INTO `organizations` (`id`, `name`, `code`, `status`, `created_at`) VALUES
  (1, 'Coal India Limited (Apex HQ)', 'CIL', 'ACTIVE', NOW()),
  (2, 'Eastern Coalfields Limited', 'ECL', 'ACTIVE', NOW()),
  (3, 'Bharat Coking Coal Limited', 'BCCL', 'ACTIVE', NOW()),
  (4, 'Central Coalfields Limited', 'CCL', 'ACTIVE', NOW()),
  (5, 'Western Coalfields Limited', 'WCL', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 2. Mines Directory (Open Cast, Underground & Mechanised Sites)
-- -----------------------------------------------------------------------------
INSERT INTO `mines` (`id`, `organization_id`, `name`, `code`, `mine_type`, `status`, `created_at`) VALUES
  (1, 2, 'Rajmahal Open Cast Project', 'ECL-RJM-01', 'OPEN_CAST', 'ACTIVE', NOW()),
  (2, 2, 'Jhanjra Underground Mechanised Mine', 'ECL-JHJ-02', 'UNDERGROUND', 'ACTIVE', NOW()),
  (3, 2, 'Sodepur Underground Colliery', 'ECL-SDP-03', 'UNDERGROUND', 'ACTIVE', NOW()),
  (4, 3, 'Moonidih Deep Underground Mine', 'BCCL-MND-01', 'UNDERGROUND', 'ACTIVE', NOW()),
  (5, 3, 'Kusunda Open Cast Mine', 'BCCL-KSD-02', 'OPEN_CAST', 'ACTIVE', NOW()),
  (6, 4, 'Piparwar Open Cast Pit', 'CCL-PPR-01', 'OPEN_CAST', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 3. Roles Hierarchy
-- -----------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `organization_id`, `mine_id`, `name`, `code`, `description`, `status`, `created_at`) VALUES
  (1, NULL, NULL, 'Super Administrator', 'SUPERADMIN', 'Apex governance, full platform oversight, and system configuration', 'ACTIVE', NOW()),
  (2, 2, NULL, 'Subsidiary Corporate Admin', 'ORG_ADMIN', 'Executive subsidiary oversight, ESG compliance review, and multi-mine dispatch monitoring', 'ACTIVE', NOW()),
  (3, 2, 1, 'Mine Project General Manager', 'MINE_ADMIN', 'Colliery Agent & General Manager managing daily pit operations, safety adherence, and statutory compliance', 'ACTIVE', NOW()),
  (4, 2, 1, 'Safety & Inspection Officer', 'SAFETY_OFFICER', 'DGMS statutory safety auditor, risk analysis in-charge, hazard response, and CCTV monitoring', 'ACTIVE', NOW()),
  (5, 2, 1, 'Labor & Welfare Officer', 'LABOR_OFFICER', 'Workforce biometric attendance, DGMS Form B compliance, contractor verification, and grievance resolution', 'ACTIVE', NOW()),
  (6, 2, 1, 'Materials & Explosives Officer', 'STORE_OFFICER', 'PESO explosive magazine records, diesel inventory, heavy equipment spares, and gate inward logistics', 'ACTIVE', NOW()),
  (7, 2, 1, 'Shift Production Supervisor', 'SUPERVISOR', 'Daily shift extraction targets, face operations, equipment availability, and downtime mitigation', 'ACTIVE', NOW()),
  (8, 2, 1, 'Equipment & Drill Operator', 'WORKER', 'Frontline heavy machinery operator (Dumpers, Continuous Miners, Shovels) and field reporting', 'ACTIVE', NOW()),
  (9, NULL, NULL, 'DGMS Regulatory Auditor', 'REGULATORY_OFFICER', 'Statutory oversight officer from Directorate General of Mines Safety conducting statutory inspections', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 4. Subroles (Fine-Grained Operational Assignments)
-- -----------------------------------------------------------------------------
INSERT INTO `subroles` (`id`, `role_id`, `name`, `code`, `description`, `status`, `created_at`) VALUES
  (1, 1, 'Chief Governance Director', 'CHIEF_ADMIN', 'System Chief Administrator with unrestricted privileges', 'ACTIVE', NOW()),
  (2, 2, 'Subsidiary Director (Technical)', 'DIR_TECH', 'Subsidiary Technical Director for ECL operations', 'ACTIVE', NOW()),
  (3, 3, 'Colliery Agent & Manager', 'COLLIERY_AGENT', 'Statutory Colliery Agent under CMR 2017', 'ACTIVE', NOW()),
  (4, 4, 'Statutory Safety Inspector', 'DGMS_INSPECTOR', 'Certified mine safety auditor for pit faces and haul roads', 'ACTIVE', NOW()),
  (5, 5, 'Chief Welfare Officer', 'WELFARE_OFFICER', 'Workforce personnel manager and labor welfare head', 'ACTIVE', NOW()),
  (6, 6, 'Chief Store Keeper (Explosives & Fuel)', 'STORE_KEEPER', 'PESO explosive controller and inward material verification head', 'ACTIVE', NOW()),
  (7, 7, 'Shift In-Charge (Mining)', 'SHIFT_INCHARGE', 'Supervises bench extraction, dragline operations, and dumper cycles', 'ACTIVE', NOW()),
  (8, 8, 'Continuous Miner Operator', 'CM_OPERATOR', 'Operator for high-capacity underground continuous miner machinery', 'ACTIVE', NOW()),
  (9, 9, 'DGMS Zonal Auditor', 'ZONAL_AUDITOR', 'Regional regulatory inspector conducting surprise statutory safety audits', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 5. Permissions (RBAC Master Granular List)
-- -----------------------------------------------------------------------------
INSERT INTO `permissions` (`id`, `name`, `code`, `description`, `created_at`) VALUES
  (1, 'Super Admin All Access', '*', 'Unrestricted global access to all features and APIs', NOW()),
  (2, 'Read Organizations', 'ORGANIZATIONS_READ', 'View coal organizations and subsidiaries directory', NOW()),
  (3, 'Create Organizations', 'ORGANIZATIONS_CREATE', 'Add new coal subsidiary organizations', NOW()),
  (4, 'Update Organizations', 'ORGANIZATIONS_UPDATE', 'Modify organization profiles and metadata', NOW()),
  (5, 'Delete Organizations', 'ORGANIZATIONS_DELETE', 'Deactivate or purge organizations', NOW()),
  (6, 'Read Mines', 'MINES_READ', 'View mines, pit boundaries, and operational status', NOW()),
  (7, 'Create Mines', 'MINES_CREATE', 'Register new mine projects and collieries', NOW()),
  (8, 'Update Mines', 'MINES_UPDATE', 'Modify mine technical details and boundaries', NOW()),
  (9, 'Delete Mines', 'MINES_DELETE', 'Decommission or remove mine entities', NOW()),
  (10, 'Read Users', 'USERS_READ', 'View personnel and user accounts', NOW()),
  (11, 'Create Users', 'USERS_CREATE', 'Provision new user accounts and credentials', NOW()),
  (12, 'Update Users', 'USERS_UPDATE', 'Update personnel profiles and statuses', NOW()),
  (13, 'Delete Users', 'USERS_DELETE', 'Suspend or delete user accounts', NOW()),
  (14, 'Manage User Roles', 'USERS_MANAGE_ROLES', 'Assign and revoke user roles and subroles', NOW()),
  (15, 'Read Roles', 'ROLES_READ', 'View role catalog and permission allocations', NOW()),
  (16, 'Create Roles', 'ROLES_CREATE', 'Define new operational roles', NOW()),
  (17, 'Update Roles', 'ROLES_UPDATE', 'Modify role descriptions and privileges', NOW()),
  (18, 'Delete Roles', 'ROLES_DELETE', 'Remove obsolete roles', NOW()),
  (19, 'Manage Role Permissions', 'ROLES_MANAGE_PERMISSIONS', 'Map granular permissions to roles', NOW()),
  (20, 'Read Subroles', 'SUBROLES_READ', 'View specialized subrole catalog', NOW()),
  (21, 'Create Subroles', 'SUBROLES_CREATE', 'Define new specialized subroles', NOW()),
  (22, 'Update Subroles', 'SUBROLES_UPDATE', 'Modify subrole titles and responsibilities', NOW()),
  (23, 'Delete Subroles', 'SUBROLES_DELETE', 'Deactivate subroles', NOW()),
  (24, 'Manage Subrole Permissions', 'SUBROLES_MANAGE_PERMISSIONS', 'Configure permissions bound to subroles', NOW()),
  (25, 'Read Permissions', 'PERMISSIONS_READ', 'View master permission registry', NOW()),
  (26, 'Manage Permissions', 'PERMISSIONS_MANAGE', 'Configure platform permissions', NOW()),
  (27, 'Read Pages', 'PAGES_READ', 'View navigation pages and hierarchy', NOW()),
  (28, 'Manage Pages', 'PAGES_MANAGE', 'Create, update and configure page routes', NOW()),
  (29, 'Read Sessions', 'SESSIONS_READ', 'Inspect active user login sessions', NOW()),
  (30, 'Manage Sessions', 'SESSIONS_MANAGE', 'Terminate and revoke user sessions', NOW()),
  (31, 'Read Audit Logs', 'AUDIT_READ', 'Audit security logs and operational history', NOW()),
  (30002, 'Read Material Logs', 'MATERIALS_READ', 'View inward consignments and inventory logs', NOW()),
  (30003, 'Log Inward Materials', 'MATERIALS_CREATE', 'Record new material inward gate entries', NOW()),
  (30004, 'Update Material Logs', 'MATERIALS_UPDATE', 'Update consignment inspections and gross weights', NOW()),
  (30005, 'Delete Material Logs', 'MATERIALS_DELETE', 'Purge erroneous consignment entries', NOW()),
  (30006, 'Inspect & Approve Materials', 'MATERIALS_APPROVE', 'Quality sign-off and weight verification', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 6. Role Permissions (Core RBAC Grants)
-- -----------------------------------------------------------------------------
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`) VALUES
  (1, 1, NOW()),  -- SUPERADMIN has wildcard *
  -- ORG_ADMIN (Role 2)
  (2, 2, NOW()), (2, 6, NOW()), (2, 10, NOW()), (2, 15, NOW()), (2, 20, NOW()), (2, 27, NOW()), (2, 31, NOW()), (2, 30002, NOW()),
  -- MINE_ADMIN (Role 3)
  (3, 6, NOW()), (3, 8, NOW()), (3, 10, NOW()), (3, 11, NOW()), (3, 12, NOW()), (3, 14, NOW()), (3, 27, NOW()), (3, 31, NOW()), (3, 30002, NOW()), (3, 30003, NOW()), (3, 30004, NOW()), (3, 30006, NOW()),
  -- SAFETY_OFFICER (Role 4)
  (4, 6, NOW()), (4, 10, NOW()), (4, 27, NOW()), (4, 31, NOW()),
  -- LABOR_OFFICER (Role 5)
  (5, 6, NOW()), (5, 10, NOW()), (5, 11, NOW()), (5, 12, NOW()), (5, 27, NOW()),
  -- STORE_OFFICER (Role 6)
  (6, 6, NOW()), (6, 27, NOW()), (6, 30002, NOW()), (6, 30003, NOW()), (6, 30004, NOW()), (6, 30006, NOW()),
  -- SUPERVISOR (Role 7)
  (7, 6, NOW()), (7, 10, NOW()), (7, 27, NOW()),
  -- WORKER (Role 8)
  (8, 6, NOW()), (8, 27, NOW()),
  -- REGULATORY_OFFICER (Role 9)
  (9, 2, NOW()), (9, 6, NOW()), (9, 10, NOW()), (9, 27, NOW()), (9, 31, NOW())
ON DUPLICATE KEY UPDATE `permission_id` = VALUES(`permission_id`);

-- -----------------------------------------------------------------------------
-- 7. Subrole Permissions (Direct Delegation)
-- -----------------------------------------------------------------------------
INSERT INTO `subrole_permissions` (`subrole_id`, `permission_id`, `created_at`) VALUES
  (1, 1, NOW()),
  (2, 2, NOW()), (2, 6, NOW()), (2, 10, NOW()), (2, 31, NOW()),
  (3, 6, NOW()), (3, 10, NOW()), (3, 14, NOW()), (3, 31, NOW()),
  (4, 6, NOW()), (4, 31, NOW()),
  (5, 6, NOW()), (5, 10, NOW()),
  (6, 6, NOW()), (6, 30002, NOW()), (6, 30003, NOW()), (6, 30004, NOW()), (6, 30006, NOW()),
  (7, 6, NOW()),
  (8, 6, NOW()),
  (9, 2, NOW()), (9, 6, NOW()), (9, 31, NOW())
ON DUPLICATE KEY UPDATE `permission_id` = VALUES(`permission_id`);

-- -----------------------------------------------------------------------------
-- 8. Pages Hierarchy & Navigation Routes
-- -----------------------------------------------------------------------------
INSERT INTO `pages` (`id`, `name`, `code`, `route`, `parent_id`, `icon`, `sort_order`, `type`, `status`, `created_at`) VALUES
  (1, 'System Overview & Health', 'PAGE_DASHBOARD', '/dashboard', NULL, 'LayoutDashboard', 1, 'PAGE', 'ACTIVE', NOW()),
  (2, 'Mine Operations Dashboard', 'PAGE_MINE_DASH', '/mine-dashboard', NULL, 'Pickaxe', 2, 'PAGE', 'ACTIVE', NOW()),
  (3, 'Corporate Subsidiary Dashboard', 'PAGE_CORP_DASH', '/corporate-dashboard', NULL, 'Building2', 3, 'PAGE', 'ACTIVE', NOW()),
  (4, 'DGMS Regulatory Dashboard', 'PAGE_REG_DASH', '/regulatory-dashboard', NULL, 'Landmark', 4, 'PAGE', 'ACTIVE', NOW()),
  (5, 'GIS Command Map', 'PAGE_COMMAND_MAP', '/command-map', NULL, 'Map', 5, 'PAGE', 'ACTIVE', NOW()),
  (6, 'AI Risk Analytics', 'PAGE_ANALYTICS', '/analytics', NULL, 'BrainCircuit', 6, 'PAGE', 'ACTIVE', NOW()),
  (7, 'Compliance Hub', 'PAGE_COMPLIANCE', '/compliance', NULL, 'Shield', 7, 'PAGE', 'ACTIVE', NOW()),
  (8, 'Inspections & Violations', 'PAGE_INSPECTIONS', '/inspections', NULL, 'ClipboardList', 8, 'PAGE', 'ACTIVE', NOW()),
  (9, 'Incident Management', 'PAGE_INCIDENTS', '/incidents', NULL, 'Flame', 9, 'PAGE', 'ACTIVE', NOW()),
  (10, 'AI Smoke CCTV', 'PAGE_SMOKE', '/smoke-detection', NULL, 'Camera', 10, 'PAGE', 'ACTIVE', NOW()),
  (11, 'Environmental Control', 'PAGE_ENVIRONMENT', '/environment', NULL, 'Cloud', 11, 'PAGE', 'ACTIVE', NOW()),
  (12, 'Production & Dispatch', 'PAGE_PRODUCTION', '/production', NULL, 'Pickaxe', 12, 'PAGE', 'ACTIVE', NOW()),
  (13, 'AI Facial Attendance', 'PAGE_ATTENDANCE', '/attendance', NULL, 'UserCheck', 13, 'PAGE', 'ACTIVE', NOW()),
  (14, 'Labor & Safety', 'PAGE_LABOR', '/labor', NULL, 'HardHat', 14, 'PAGE', 'ACTIVE', NOW()),
  (15, 'Contractor Workforce', 'PAGE_CONTRACTORS', '/contractors', NULL, 'Briefcase', 15, 'PAGE', 'ACTIVE', NOW()),
  (16, 'Worker Grievances', 'PAGE_GRIEVANCES', '/grievances', NULL, 'MessageSquare', 16, 'PAGE', 'ACTIVE', NOW()),
  (17, 'Emergency Console', 'PAGE_EMERGENCY', '/emergency', NULL, 'Ambulance', 17, 'PAGE', 'ACTIVE', NOW()),
  (18, 'Resource Allocation', 'PAGE_MATERIALS', '/materials', NULL, 'Tractor', 18, 'PAGE', 'ACTIVE', NOW()),
  (19, 'Emergency Alerts', 'PAGE_ALERTS', '/alerts', NULL, 'ShieldAlert', 19, 'PAGE', 'ACTIVE', NOW()),
  (20, 'Mobile App Simulator', 'PAGE_MOBILE_APP', '/mobile-app', NULL, 'Smartphone', 20, 'PAGE', 'ACTIVE', NOW()),
  (21, 'Organizations & Mines', 'PAGE_ORGS', '/organizations', NULL, 'Building2', 21, 'PAGE', 'ACTIVE', NOW()),
  (22, 'User Directory', 'PAGE_USERS', '/users', NULL, 'Users', 22, 'PAGE', 'ACTIVE', NOW()),
  (23, 'Roles & Subroles (RBAC)', 'PAGE_RBAC', '/rbac', NULL, 'Shield', 23, 'PAGE', 'ACTIVE', NOW()),
  (24, 'Pages & Hierarchy', 'PAGE_PAGES', '/pages', NULL, 'FolderTree', 24, 'PAGE', 'ACTIVE', NOW()),
  (25, 'Audit Log', 'PAGE_AUDIT', '/audit-logs', NULL, 'FileText', 25, 'PAGE', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `route` = VALUES(`route`);

-- -----------------------------------------------------------------------------
-- 9. Page Permissions (Binding Pages to Required Capabilities)
-- -----------------------------------------------------------------------------
INSERT INTO `page_permissions` (`page_id`, `permission_id`, `created_at`) VALUES
  (1, 1, NOW()),
  (2, 6, NOW()),
  (3, 2, NOW()),
  (4, 6, NOW()),
  (5, 6, NOW()),
  (6, 6, NOW()),
  (7, 6, NOW()),
  (8, 6, NOW()),
  (9, 6, NOW()),
  (10, 6, NOW()),
  (11, 6, NOW()),
  (12, 6, NOW()),
  (13, 10, NOW()),
  (14, 10, NOW()),
  (15, 6, NOW()),
  (16, 6, NOW()),
  (17, 6, NOW()),
  (18, 30002, NOW()),
  (19, 6, NOW()),
  (20, 6, NOW()),
  (21, 2, NOW()),
  (22, 10, NOW()),
  (23, 15, NOW()),
  (24, 27, NOW()),
  (25, 31, NOW())
ON DUPLICATE KEY UPDATE `permission_id` = VALUES(`permission_id`);

-- -----------------------------------------------------------------------------
-- 10. Users Catalog (All Passwords = Admin@12345)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `employee_code`, `status`, `created_at`) VALUES
  (1, 'superadmin', 'admin@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'System', 'Superadmin', '+91 98000 00001', 'CIL-HQ-001', 'ACTIVE', NOW()),
  (2, 'ecl.admin', 'ecl.admin@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Siddharth', 'Mukherjee', '+91 98310 11001', 'ECL-EXEC-101', 'ACTIVE', NOW()),
  (3, 'rajmahal.gm', 'gm.rajmahal@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Ramesh', 'Sharma', '+91 94311 22002', 'ECL-RJM-GM01', 'ACTIVE', NOW()),
  (4, 'safety.officer', 'safety.officer@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Dr. Vikram', 'Verma', '+91 94311 33003', 'ECL-RJM-SAF01', 'ACTIVE', NOW()),
  (5, 'labor.officer', 'labor.officer@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Ananya', 'Roy', '+91 94311 44004', 'ECL-RJM-HR01', 'ACTIVE', NOW()),
  (6, 'store.officer', 'store.officer@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Rajesh', 'Kumar', '+91 94311 55005', 'ECL-RJM-MAT01', 'ACTIVE', NOW()),
  (7, 'shift.supervisor', 'supervisor@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Manoj', 'Tiwari', '+91 94311 66006', 'ECL-RJM-SUP01', 'ACTIVE', NOW()),
  (8, 'worker.mondal', 'worker.mondal@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Subhash', 'Mondal', '+91 94311 77007', 'ECL-W-4101', 'ACTIVE', NOW()),
  (9, 'dgms.inspector', 'inspector.dgms@coalmin.org', '$2b$10$n.BvSRUY1xu83Ay9HT1p3OPoZ6mFGDh6VSVcZ3pk6vLeQ4mpkYFUa', 'Arun', 'Bose', '+91 94311 88008', 'DGMS-ER-042', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`);

-- -----------------------------------------------------------------------------
-- 11. User Subroles Assignment (Dynamic Hierarchical Roles)
-- -----------------------------------------------------------------------------
INSERT INTO `user_subroles` (`user_id`, `subrole_id`, `assigned_by`, `assigned_at`, `status`) VALUES
  (1, 1, 1, NOW(), 'ACTIVE'),
  (2, 2, 1, NOW(), 'ACTIVE'),
  (3, 3, 1, NOW(), 'ACTIVE'),
  (4, 4, 3, NOW(), 'ACTIVE'),
  (5, 5, 3, NOW(), 'ACTIVE'),
  (6, 6, 3, NOW(), 'ACTIVE'),
  (7, 7, 3, NOW(), 'ACTIVE'),
  (8, 8, 3, NOW(), 'ACTIVE'),
  (9, 9, 1, NOW(), 'ACTIVE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- 12. Attendance Workers & Biometric Roster
-- -----------------------------------------------------------------------------
INSERT INTO `attendance_workers` (`id`, `worker_id`, `name`, `role`, `shift`, `mine_site`, `photo_url`, `rfid_tag`, `registered_at`, `created_at`) VALUES
  (1, 'W-1001', 'Subhash Mondal', 'Underground Drill Operator', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'RFID-RJM-001', '2026-01-15', NOW()),
  (2, 'W-1002', 'Prakash Gope', 'Continuous Miner Operator', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'RFID-RJM-002', '2026-01-15', NOW()),
  (3, 'W-1003', 'Raju Majhi', 'Conveyor Belt Attendant', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'RFID-RJM-003', '2026-02-01', NOW()),
  (4, 'W-1004', 'Dinesh Soren', 'Heavy Dumper Operator (85T)', 'Afternoon Shift (14:00 - 22:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'RFID-RJM-004', '2026-02-10', NOW()),
  (5, 'W-1005', 'Bikram Hansda', 'Shovel Operator (10m³ Bucket)', 'Afternoon Shift (14:00 - 22:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'RFID-RJM-005', '2026-02-12', NOW()),
  (6, 'W-1006', 'Sanjay Mahato', 'Explosive Magazine Helper', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'RFID-RJM-006', '2026-02-20', NOW()),
  (7, 'W-1007', 'Kishore Murmu', 'Ventilation & Methane Sentry', 'Night Shift (22:00 - 06:00)', 'Jhanjra Underground Mechanised Mine', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'RFID-JHJ-001', '2026-03-01', NOW()),
  (8, 'W-1008', 'Amit Kumar Tudu', 'Roof Bolter & Support Tech', 'Morning Shift (06:00 - 14:00)', 'Jhanjra Underground Mechanised Mine', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'RFID-JHJ-002', '2026-03-05', NOW()),
  (9, 'W-1009', 'Naveen Bauri', 'Diesel Locomotive Driver', 'Afternoon Shift (14:00 - 22:00)', 'Moonidih Deep Underground Mine', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'RFID-MND-001', '2026-03-10', NOW()),
  (10, 'W-1010', 'Debabrata Das', 'High-Wall Drill Assistant', 'Morning Shift (06:00 - 14:00)', 'Kusunda Open Cast Mine', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'RFID-KSD-001', '2026-03-12', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 13. Attendance Logs (AI Facial Biometrics & DGMS Form B Verification)
-- -----------------------------------------------------------------------------
INSERT INTO `attendance_logs` (`id`, `worker_id`, `name`, `role`, `shift`, `mine_site`, `date`, `time`, `status`, `confidence`, `verification_type`, `dgms_form_b`, `created_at`) VALUES
  ('ATT-20260907-001', 'W-1001', 'Subhash Mondal', 'Underground Drill Operator', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', '2026-09-07', '05:52:14', 'Present - On Time', '99.4%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-002', 'W-1002', 'Prakash Gope', 'Continuous Miner Operator', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', '2026-09-07', '05:54:30', 'Present - On Time', '98.8%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-003', 'W-1003', 'Raju Majhi', 'Conveyor Belt Attendant', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', '2026-09-07', '05:58:05', 'Present - On Time', '97.6%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-004', 'W-1006', 'Sanjay Mahato', 'Explosive Magazine Helper', 'Morning Shift (06:00 - 14:00)', 'Rajmahal Open Cast Project', '2026-09-07', '06:01:22', 'Present - Late (1 min)', '99.1%', 'Dual Biometric (Face + RFID)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-005', 'W-1008', 'Amit Kumar Tudu', 'Roof Bolter & Support Tech', 'Morning Shift (06:00 - 14:00)', 'Jhanjra Underground Mechanised Mine', '2026-09-07', '05:48:50', 'Present - On Time', '98.9%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-006', 'W-1010', 'Debabrata Das', 'High-Wall Drill Assistant', 'Morning Shift (06:00 - 14:00)', 'Kusunda Open Cast Mine', '2026-09-07', '05:55:10', 'Present - On Time', '99.3%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-007', 'W-1004', 'Dinesh Soren', 'Heavy Dumper Operator (85T)', 'Afternoon Shift (14:00 - 22:00)', 'Rajmahal Open Cast Project', '2026-09-07', '13:50:02', 'Present - On Time', '98.7%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW()),
  ('ATT-20260907-008', 'W-1005', 'Bikram Hansda', 'Shovel Operator (10m³ Bucket)', 'Afternoon Shift (14:00 - 22:00)', 'Rajmahal Open Cast Project', '2026-09-07', '13:55:40', 'Present - On Time', '99.0%', 'AI Facial Biometrics (ResNet-18)', 'VERIFIED_COMPLIANT', NOW())
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- 14. Statutory Compliance Requirements (DGMS, CPCB & Labor Laws)
-- -----------------------------------------------------------------------------
INSERT INTO `compliance_requirements` (`id`, `org_id`, `mine_id`, `category`, `title`, `description`, `statutory_reference`, `frequency`, `status`, `created_by`, `created_at`) VALUES
  (1, 2, NULL, 'SAFETY', 'Quarterly Mechanical & Electrical DGMS Audit', 'Comprehensive audit of underground winders, haulage gears, flameproof electrical switchgear, and safety interlocks.', 'CMR 2017 Reg 74 & 182', 'QUARTERLY', 'ACTIVE', 4, NOW()),
  (2, 2, 1, 'SAFETY', 'Continuous Pit Slope Stability Radar Monitoring', 'High-resolution radar scanning of overburden dump slopes and high-wall faces to detect ground displacement > 5mm/day.', 'DGMS Circular No. 02 of 2024', 'DAILY', 'ACTIVE', 4, NOW()),
  (3, 2, 2, 'SAFETY', 'Main Mechanical Ventilation Airway Anemometer Audit', 'Verification of air circulation velocity, quantity (> 6 m³/min per person), and methane concentration (< 0.5% in return airway).', 'CMR 2017 Reg 153', 'WEEKLY', 'ACTIVE', 4, NOW()),
  (4, 2, NULL, 'ENVIRONMENT', 'Zero Liquid Discharge (ZLD) Effluent Analysis', 'Laboratory water quality test of mine sump discharge, settling pond effluent (pH 6.5-8.5, TSS < 100 mg/L).', 'Water (Prevention & Control of Pollution) Act 1974', 'MONTHLY', 'ACTIVE', 4, NOW()),
  (5, 2, NULL, 'ENVIRONMENT', 'Continuous Ambient Air Quality Monitoring (CAAQM)', 'Calibration of PM10 and PM2.5 real-time particulate analyzers at lease boundary stations.', 'Air (Prevention & Control of Pollution) Act 1981', 'MONTHLY', 'ACTIVE', 4, NOW()),
  (6, 2, 1, 'PRODUCTION', 'Monthly Mine Plan Extraction Envelope Survey', '3D drone LiDAR photogrammetry volumetric comparison of active bench extraction versus approved mine closure plan.', 'Mineral Conservation & Development Rules 2017', 'MONTHLY', 'ACTIVE', 3, NOW()),
  (7, 2, NULL, 'LABOUR', 'Statutory Creche and Sanitation Facilities Verification', 'Audit of pit-head bathing cubicles, clean drinking water coolers, first-aid posts, and certified creche caretakers.', 'Mines Creche Rules 1966 Sec 4', 'HALF_YEARLY', 'ACTIVE', 5, NOW()),
  (8, 2, 1, 'SAFETY', 'PESO Explosive Magazine Ledger Reconciliation', 'Physical inventory count of slurry cartridges, ammonium nitrate boosters, and electronic detonators against Form 31 register.', 'Petroleum and Explosives Safety Rules 2008', 'WEEKLY', 'ACTIVE', 6, NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- -----------------------------------------------------------------------------
-- 15. Compliance Assignments (Mine Site Task Instances)
-- -----------------------------------------------------------------------------
INSERT INTO `compliance_assignments` (`id`, `requirement_id`, `mine_id`, `assigned_user_id`, `due_date`, `status`, `remarks`, `created_at`) VALUES
  (1, 1, 1, 4, '2026-09-15', 'IN_PROGRESS', 'Inspection team constituted. Surface winder cables tested on Sept 3.', NOW()),
  (2, 2, 1, 4, '2026-09-08', 'COMPLIANT', 'Ground radar telemetry stable. Max displacement 1.2 mm across North Wall.', NOW()),
  (3, 3, 2, 4, '2026-09-10', 'PENDING', 'Scheduled for Tuesday morning shift with mechanical ventilation deputy.', NOW()),
  (4, 4, 1, 4, '2026-09-20', 'IN_PROGRESS', 'Samples dispatched to Central Mining & Fuel Research Institute (CSIR-CIMFR).', NOW()),
  (5, 5, 1, 4, '2026-08-31', 'OVERDUE', 'Calibration gas cylinder delivery delayed by vendor.', NOW()),
  (6, 6, 1, 3, '2026-09-30', 'PENDING', 'Drone pilot flight clearance received from DGCA.', NOW()),
  (7, 7, 1, 5, '2026-09-25', 'COMPLIANT', 'All 4 pithead facilities inspected and certified compliant with welfare norms.', NOW()),
  (8, 8, 1, 6, '2026-09-09', 'COMPLIANT', 'Magazine stock matched with physical inward records. Zero variance.', NOW())
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- 16. Compliance Evidence Submissions
-- -----------------------------------------------------------------------------
INSERT INTO `compliance_evidence` (`id`, `assignment_id`, `file_name`, `file_path`, `file_type`, `ocr_extracted_text`, `submitted_by`, `review_status`, `reviewed_by`, `reviewed_at`, `review_remarks`, `submitted_at`) VALUES
  (1, 2, 'Slope_Radar_Telemetry_Report_07Sep2026.pdf', '/uploads/compliance/slope_telemetry_07sep2026.pdf', 'application/pdf', 'GROUND STABILITY AUDIT: Rajmahal Pit 4 North Bench. Total scan duration: 24.0 hrs. Velocity range: 0.05 to 1.2 mm/day. Factor of Safety calculated: 1.48 (Nominal compliant >= 1.30). Signed: Chief Geologist.', 4, 'APPROVED', 3, NOW(), 'Meets DGMS Circular safety threshold standards.', NOW()),
  (2, 8, 'PESO_Magazine_Physical_Count_Form31.pdf', '/uploads/compliance/peso_ledger_07sep2026.pdf', 'application/pdf', 'MAGAZINE RECONCILIATION: Slurry Cartridge 83mm: 2,400 kg. Cast Boosters 400g: 500 units. Nonel Shocktube 12m: 1,200 units. Physical count verified by Magazine Incharge and CISF Guard.', 6, 'APPROVED', 3, NOW(), 'Approved and signed into PESO digital portal.', NOW())
ON DUPLICATE KEY UPDATE `file_name` = VALUES(`file_name`);

-- -----------------------------------------------------------------------------
-- 17. Compliance Corrective Actions (CAPA)
-- -----------------------------------------------------------------------------
INSERT INTO `compliance_corrective_actions` (`id`, `assignment_id`, `description`, `assigned_to`, `deadline`, `status`, `verified_by`, `verified_at`, `verified_remarks`, `created_by`, `created_at`) VALUES
  (1, 5, 'Expedite calibration gas cylinder dispatch from Durgapur depot via dedicated vehicle.', 6, '2026-09-10', 'IN_PROGRESS', NULL, NULL, NULL, 4, NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 18. Mine Inspections (DGMS, Internal Safety & Equipment)
-- -----------------------------------------------------------------------------
INSERT INTO `inspections` (`id`, `mine_id`, `inspector_user_id`, `inspection_type`, `area`, `description`, `scheduled_at`, `completed_at`, `status`, `created_at`) VALUES
  (1, 1, 4, 'SAFETY', 'Pit 4 - Active Coal Bench Seam VII', 'Quarterly DGMS structural integrity, haul road berm height, and dumper traffic control audit.', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'COMPLETED', NOW()),
  (2, 2, 4, 'STATUTORY', 'Ventilation Incline & Continuous Miner Face', 'CMR 2017 statutory bi-weekly methane, air velocity, and roof bolt torque audit.', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 'IN_PROGRESS', NOW()),
  (3, 1, 4, 'EQUIPMENT', 'Central Heavy Earthmoving Workshop', 'Inspection of hydraulic braking circuits and fire suppression canisters on 85T dumpers.', DATE_ADD(NOW(), INTERVAL 2 DAY), NULL, 'SCHEDULED', NOW()),
  (4, 1, 9, 'SURPRISE', 'Main Explosive Magazine & Siding Bench', 'Surprise regulatory audit by DGMS Zonal Director on explosive handling and perimeter security.', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'COMPLETED', NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 19. Inspection Checklist Items
-- -----------------------------------------------------------------------------
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `item_text`, `status`, `severity`, `gps_lat`, `gps_lng`, `remarks`, `timestamp`) VALUES
  (1, 1, 'Haul road safety berm height equal to wheel diameter of largest vehicle (2.8m)', 'OK', 'LOW', 25.0482000, 87.3512000, 'Berm height verified at 3.0m along entire 4.2 km haul road ramp.', NOW()),
  (2, 1, 'Secondary crusher water mist dust suppression nozzles operating at > 5 bar', 'ISSUE', 'HIGH', 25.0514000, 87.3541000, '3 nozzles clogged on primary conveyor discharge hopper.', NOW()),
  (3, 1, 'Emergency eye-wash and first aid station replenished at Bench 4 shelter', 'OK', 'LOW', 25.0498000, 87.3526000, 'Supplies checked and valid through 2027.', NOW()),
  (4, 2, 'Underground roof bolting torque testing (minimum 250 N-m resistance)', 'OK', 'LOW', 23.6712000, 87.2845000, '12 sampled bolts averaged 285 N-m holding torque.', NOW()),
  (5, 2, 'Continuous methane (CH4) sensor calibration (< 0.5% volume)', 'OK', 'LOW', 23.6734000, 87.2861000, 'Zero drift detected. Reading steady at 0.11% in return airway.', NOW())
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- 20. Safety Observations (Live Hazard Spotting)
-- -----------------------------------------------------------------------------
INSERT INTO `safety_observations` (`id`, `mine_id`, `observer_user_id`, `area`, `description`, `severity`, `gps_lat`, `gps_lng`, `status`, `resolved_by`, `resolved_at`, `timestamp`) VALUES
  (1, 1, 7, 'Conveyor Siding Transfer Tower #2', 'Idler roller bearing exhibiting acoustic vibration and thermal reading of 82 deg C.', 'HIGH', 25.0531000, 87.3562000, 'OPEN', NULL, NULL, NOW()),
  (2, 1, 4, 'Electrical Substation 33kV Yard', 'High voltage danger sign faded and loose fence wire on North perimeter.', 'MEDIUM', 25.0465000, 87.3489000, 'RESOLVED', 3, NOW(), NOW()),
  (3, 2, 8, 'Underground Crosscut 14 West', 'Sluggish water accumulation in drainage ditch causing minor wheel slippage for personnel transporter.', 'LOW', 23.6698000, 87.2831000, 'OPEN', NULL, NULL, NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 21. Violations Catalog
-- -----------------------------------------------------------------------------
INSERT INTO `violations` (`id`, `inspection_id`, `observation_id`, `mine_id`, `type`, `description`, `severity`, `assigned_to`, `deadline`, `status`, `created_at`) VALUES
  (1, 1, NULL, 1, 'SAFETY', 'DGMS Notice Sec 22: Failure to maintain operational automatic dust suppression mist nozzles on Secondary Crusher chute.', 'HIGH', 4, DATE_ADD(NOW(), INTERVAL 3 DAY), 'IN_PROGRESS', NOW()),
  (2, NULL, 1, 1, 'OPERATIONAL', 'Delayed preventive greasing schedule on high-speed conveyor idler bearings exceeding 80 deg C.', 'MEDIUM', 6, DATE_ADD(NOW(), INTERVAL 2 DAY), 'OPEN', NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 22. Incidents & Root Cause Investigations
-- -----------------------------------------------------------------------------
INSERT INTO `incidents` (`id`, `mine_id`, `reported_by`, `category`, `title`, `description`, `severity`, `location_area`, `gps_lat`, `gps_lng`, `incident_at`, `status`, `created_at`) VALUES
  (1, 1, 7, 'EQUIPMENT', 'Haul Truck D-108 Rear Dual Tyre De-beading', 'Rear tyre de-beaded on haul road incline due to sharp rock fragment spillage. Operator steered hauler into safety berm. No injury.', 'HIGH', 'South Haul Road Incline Ramp 3', 25.0475000, 87.3501000, DATE_SUB(NOW(), INTERVAL 1 DAY), 'CORRECTIVE_ACTION', NOW()),
  (2, 2, 4, 'SAFETY', 'Auxiliary Ventilation Duct Tear at Face 7', 'Flexible ventilation ducting snagged during Continuous Miner maneuvering, reducing airflow from 14 m³/min to 8 m³/min.', 'MEDIUM', 'Seam IX Longwall Face', 23.6725000, 87.2850000, DATE_SUB(NOW(), INTERVAL 3 DAY), 'CLOSED', NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `incident_investigations` (`id`, `incident_id`, `investigator_id`, `root_cause`, `findings`, `submitted_at`) VALUES
  (1, 1, 4, 'Sandstone debris dropped from preceding overloaded hauler combined with 8 psi under-inflation.', 'Debris grading schedule was delayed by 90 minutes due to grader shift turnover. Berm design prevented rollover.', NOW()),
  (2, 2, 4, 'Clearance distance between duct hanger chain and machine cable handler was insufficient.', 'Ducting patched with heavy vulcanized canvas sleeve. Hanger points relocated 40cm higher.', NOW())
ON DUPLICATE KEY UPDATE `root_cause` = VALUES(`root_cause`);

INSERT INTO `incident_actions` (`id`, `incident_id`, `action_type`, `description`, `assigned_to`, `deadline`, `status`, `created_at`) VALUES
  (1, 1, 'CORRECTIVE', 'Deploy motor grader for continuous 2-hour sweeping cycle on Ramp 3.', 7, DATE_ADD(NOW(), INTERVAL 1 DAY), 'IN_PROGRESS', NOW()),
  (2, 1, 'PREVENTIVE', 'Install real-time tyre pressure & temperature telemetry sensors on all 85T dumpers.', 6, DATE_ADD(NOW(), INTERVAL 14 DAY), 'OPEN', NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 23. Environmental Monitoring Thresholds & IoT Telemetry
-- -----------------------------------------------------------------------------
INSERT INTO `env_thresholds` (`id`, `mine_id`, `parameter_type`, `min_value`, `max_value`, `unit`, `alert_on_breach`, `created_by`, `created_at`) VALUES
  (1, 1, 'AIR_DUST', 0.0000, 100.0000, 'µg/m³ (PM10)', 1, 4, NOW()),
  (2, 1, 'WATER_QUALITY', 6.5000, 8.5000, 'pH', 1, 4, NOW()),
  (3, 1, 'NOISE', 0.0000, 85.0000, 'dB(A)', 1, 4, NOW()),
  (4, 2, 'METHANE', 0.0000, 0.7500, '% Volume CH4', 1, 4, NOW()),
  (5, 2, 'CO2', 0.0000, 2500.0000, 'ppm', 1, 4, NOW()),
  (6, 1, 'TEMPERATURE', 10.0000, 42.0000, '°C', 1, 4, NOW())
ON DUPLICATE KEY UPDATE `max_value` = VALUES(`max_value`);

INSERT INTO `env_observations` (`id`, `mine_id`, `observer_id`, `parameter_type`, `value`, `unit`, `status`, `gps_lat`, `gps_lng`, `observed_at`) VALUES
  (1, 1, 4, 'AIR_DUST', 76.4000, 'µg/m³', 'NORMAL', 25.0488000, 87.3515000, NOW()),
  (2, 1, 4, 'WATER_QUALITY', 7.3500, 'pH', 'NORMAL', 25.0461000, 87.3482000, NOW()),
  (3, 1, 4, 'NOISE', 89.2000, 'dB(A)', 'THRESHOLD_EXCEEDED', 25.0519000, 87.3548000, NOW()),
  (4, 2, 4, 'METHANE', 0.1200, '% Volume', 'NORMAL', 23.6730000, 87.2858000, NOW()),
  (5, 2, 4, 'CO2', 1150.0000, 'ppm', 'NORMAL', 23.6728000, 87.2852000, NOW()),
  (6, 1, 4, 'TEMPERATURE', 32.8000, '°C', 'NORMAL', 25.0490000, 87.3520000, NOW())
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- -----------------------------------------------------------------------------
-- 24. Production Targets & Shift Output Reports
-- -----------------------------------------------------------------------------
INSERT INTO `production_targets` (`id`, `mine_id`, `period_type`, `period_value`, `target_tonnes`, `set_by`, `created_at`) VALUES
  (1, 1, 'MONTHLY', '2026-09', 150000.00, 3, NOW()),
  (2, 2, 'MONTHLY', '2026-09', 85000.00, 3, NOW()),
  (3, 4, 'MONTHLY', '2026-09', 95000.00, 3, NOW())
ON DUPLICATE KEY UPDATE `target_tonnes` = VALUES(`target_tonnes`);

INSERT INTO `production_reports` (`id`, `mine_id`, `supervisor_id`, `report_date`, `shift`, `target_tonnes`, `actual_tonnes`, `equipment_downtime_hrs`, `remarks`, `status`, `created_at`) VALUES
  (1, 1, 7, CURRENT_DATE, 'MORNING', 2500.00, 2680.50, 0.25, 'Smooth dragline excavation and shovel-dumper matching. Exceeded shift target.', 'SUBMITTED', NOW()),
  (2, 1, 7, CURRENT_DATE, 'AFTERNOON', 2500.00, 2390.00, 1.10, 'Hopper chute blockage caused 45-min stoppage at secondary screening plant.', 'SUBMITTED', NOW()),
  (3, 1, 7, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'NIGHT', 2000.00, 2110.00, 0.00, 'Overnight extraction completed with zero mechanical breakdowns.', 'REVIEWED', NOW()),
  (4, 2, 7, CURRENT_DATE, 'MORNING', 1400.00, 1455.00, 0.50, 'Continuous Miner unit CM-02 extracted Seam IX heading seamlessly.', 'SUBMITTED', NOW())
ON DUPLICATE KEY UPDATE `actual_tonnes` = VALUES(`actual_tonnes`);

-- -----------------------------------------------------------------------------
-- 25. Operational Issues
-- -----------------------------------------------------------------------------
INSERT INTO `operational_issues` (`id`, `mine_id`, `reported_by`, `issue_type`, `description`, `area`, `severity`, `status`, `reported_at`) VALUES
  (1, 1, 7, 'EQUIPMENT', 'Hydraulic boom hose weeping micro-droplets on Electric Rope Shovel SH-04.', 'Pit 4 Bench C', 'MEDIUM', 'IN_PROGRESS', NOW()),
  (2, 1, 7, 'WEATHER', 'Early afternoon heavy downpour required high-capacity submersible pump startup at Sump 2.', 'Deep Sump Catchment', 'LOW', 'RESOLVED', NOW())
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- -----------------------------------------------------------------------------
-- 26. Contractors, Contracts & Workforce
-- -----------------------------------------------------------------------------
INSERT INTO `contractors` (`id`, `org_id`, `company_name`, `registration_number`, `contact_person`, `contact_phone`, `contact_email`, `status`, `created_at`) VALUES
  (1, 2, 'Bharat Earth Logistics & Mining Ltd', 'U10100WB2018PLC092144', 'Anil Deshmukh', '+91 98310 54321', 'contact@beml-contractors.in', 'ACTIVE', NOW()),
  (2, 2, 'Eastern Drillers & Blasting Specialists', 'U10200JH2019PTC048122', 'Ratan Sengupta', '+91 94311 99123', 'info@easterndrillers.com', 'ACTIVE', NOW()),
  (3, 2, 'Apex Mine Safety Technologies Pvt Ltd', 'U72900DL2021PTC384910', 'Deepak Chawla', '+91 98110 33445', 'support@apexminesafety.in', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `company_name` = VALUES(`company_name`);

INSERT INTO `contractor_contracts` (`id`, `contractor_id`, `mine_id`, `work_description`, `start_date`, `end_date`, `status`, `created_at`) VALUES
  (1, 1, 1, 'Overburden excavation, haulage and dumping across Bench 3 & 4 with 85T dumpers.', '2026-01-01', '2026-12-31', 'ACTIVE', NOW()),
  (2, 2, 1, 'Controlled deep hole blasting, vibration monitoring and non-electric initiation systems.', '2026-04-01', '2027-03-31', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `work_description` = VALUES(`work_description`);

INSERT INTO `contractor_workers` (`id`, `contractor_id`, `mine_id`, `full_name`, `id_number`, `role`, `training_status`, `assigned_area`, `status`, `created_at`) VALUES
  (1, 1, 1, 'Suresh Kispotta', 'CONT-BEML-01', 'Heavy Dumper Operator', 'CERTIFIED', 'Haul Road Ramp 3', 'ACTIVE', NOW()),
  (2, 1, 1, 'Govind Karmakar', 'CONT-BEML-02', 'Dozer Operator', 'CERTIFIED', 'Overburden Dump #2', 'ACTIVE', NOW()),
  (3, 2, 1, 'Prabir Paul', 'CONT-EDBS-01', 'Blaster Assistant', 'CERTIFIED', 'Blasting Bench Face A', 'ACTIVE', NOW()),
  (4, 2, 1, 'Madan Murmu', 'CONT-EDBS-02', 'Drill Rig Helper', 'PENDING', 'Highwall Drill Ridge', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- -----------------------------------------------------------------------------
-- 27. Grievances & Redressal Records
-- -----------------------------------------------------------------------------
INSERT INTO `grievances` (`id`, `mine_id`, `submitted_by`, `is_anonymous`, `category`, `title`, `description`, `priority`, `status`, `assigned_to`, `submitted_at`) VALUES
  (1, 1, 8, 0, 'FACILITIES', 'Drinking water dispenser filtration cartridge expired at Shift Shelter #4', 'The UV/RO filter alarm indicator on the drinking water unit has been beeping for 3 days. Personnel are requesting filter replacement.', 'MEDIUM', 'UNDER_INVESTIGATION', 5, NOW()),
  (2, 1, 8, 1, 'SAFETY', 'Haul road lighting luminaire flickering near junction B-3', 'During night shift haulage, two high-mast floodlights intermittently go dark, causing poor driver visibility at sharp haulage turn.', 'HIGH', 'RESOLVED', 4, DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `grievance_responses` (`id`, `grievance_id`, `responder_id`, `response_text`, `action_taken`, `responded_at`) VALUES
  (1, 1, 5, 'Welfare team verified drinking water unit on Sept 7 morning.', 'Replacement 5-micron spun and carbon filters requisitioned from Central Store. Maintenance tech scheduled for installation today.', NOW()),
  (2, 2, 4, 'Electrical maintenance department inspected junction B-3 high-mast tower.', 'Replaced faulty 400W LED driver unit and tightened loose junction box terminal wiring. Luminaire fully operational.', NOW())
ON DUPLICATE KEY UPDATE `response_text` = VALUES(`response_text`);

-- -----------------------------------------------------------------------------
-- 28. Material Inward Logistics (PESO Explosives, Fuel, Spares)
-- -----------------------------------------------------------------------------
INSERT INTO `material_inward_logs` (`id`, `consignment_number`, `organization_id`, `mine_id`, `material_name`, `category`, `quantity`, `unit`, `challan_number`, `purchase_order_number`, `supplier_name`, `transporter_name`, `vehicle_number`, `driver_name`, `driver_phone`, `entry_gate`, `gross_weight_tons`, `tare_weight_tons`, `net_weight_tons`, `inspection_status`, `inspected_by`, `remarks`, `logged_by_user_id`, `created_at`) VALUES
  (1, 'MAT-20260907-001', 2, 1, 'ANFO Booster Slurry Explosives (83mm)', 'EXPLOSIVES', 12.50, 'TONS', 'CHL-PEL-9812', 'PO-CIL-2026-EX88', 'Solar Industries India Ltd', 'PESO Certified Explosive Van Fleet', 'JH-04-E-4512', 'Balwinder Singh', '+91 98120 44332', 'Gate 4 - Explosives Magazine', 22.40, 9.90, 12.50, 'PASSED', 'Rajesh Kumar', 'PESO explosive pass verified. CISF escort signed into Form 31.', 6, NOW()),
  (2, 'MAT-20260907-002', 2, 1, 'High-Speed Bulk Diesel (HSD Grade)', 'FUEL_LUBRICANTS', 24000.00, 'LITERS', 'CHL-IOCL-55201', 'PO-CIL-2026-FL04', 'Indian Oil Corporation Ltd', 'IOCL Tanker Logistics', 'WB-37-B-7890', 'Ranjit Mukherjee', '+91 94340 11223', 'Gate 1 - Fuel Storage Depot', 36.80, 16.40, 20.40, 'PASSED', 'Rajesh Kumar', 'Specific gravity 0.835 at 15 deg C. No water contamination detected.', 6, NOW()),
  (3, 'MAT-20260907-003', 2, 1, 'Heavy Hauler Tyres 27.00R49 (85T Dumper)', 'HEAVY_SPARES', 8.00, 'UNITS', 'CHL-BKT-3341', 'PO-CIL-2026-TY99', 'Balkrishna Industries Ltd (BKT)', 'National Roadways Logistics', 'JH-10-C-6721', 'Sukhdev Yadav', '+91 98350 88771', 'Gate 2 - Central Workshop', 14.50, 8.10, 6.40, 'PASSED', 'Rajesh Kumar', 'Tyre tread depth and serial barcodes recorded in ERP inventory.', 6, NOW()),
  (4, 'MAT-20260907-004', 2, 1, 'EP-800 Multi-Ply Steel Cord Conveyor Belting', 'CONVEYOR_BELTING', 500.00, 'METERS', 'CHL-PHX-1102', 'PO-CIL-2026-CV12', 'Phoenix Conveyor Belts India', 'Phoenix Fleet Express', 'WB-41-D-2345', 'Manas Sen', '+91 98320 66554', 'Gate 3 - Heavy Materials Yard', 11.20, 6.70, 4.50, 'PASSED', 'Rajesh Kumar', 'Belting tensile test certification certified by manufacturer.', 6, NOW()),
  (5, 'MAT-20260907-005', 2, 1, 'Hydraulic Roof Support Chock Cylinders (350 Bar)', 'STRUCTURAL_SUPPORT', 12.00, 'UNITS', 'CHL-LNT-7741', 'PO-CIL-2026-RS09', 'Larsen & Toubro Heavy Engineering', 'L&T Dedicated Logistics', 'MH-12-Q-9912', 'Gajanan Patil', '+91 98220 33221', 'Gate 3 - Heavy Materials Yard', 18.60, 11.20, 7.40, 'PASSED', 'Rajesh Kumar', 'Factory pressure test cert holding 420 bar hydrostatic pressure verified.', 6, NOW())
ON DUPLICATE KEY UPDATE `inspection_status` = VALUES(`inspection_status`);

-- -----------------------------------------------------------------------------
-- 29. System & Emergency Notifications
-- -----------------------------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `entity_type`, `entity_id`, `is_read`, `created_at`) VALUES
  (1, 1, 'SYSTEM', 'Smart Governance Engine Online', 'Cloud TiDB synchronization and AI computer vision services initialized successfully.', 'SYSTEM', 1, 1, NOW()),
  (2, 4, 'COMPLIANCE', 'Statutory Slope Radar Audit Compliant', 'Rajmahal Pit 4 displacement radar telemetry evaluated compliant under DGMS standards.', 'compliance_assignments', 2, 0, NOW()),
  (3, 4, 'INCIDENT', 'Incident Report Filed: D-108 Hauler Tyre', 'Corrective grading deployed on South Haul Road Incline Ramp 3.', 'incidents', 1, 0, NOW()),
  (4, 6, 'SYSTEM', 'Explosive Consignment Received at Magazine', '12.5 T ANFO slurry boosters safely unloaded and verified in Form 31 register.', 'material_inward_logs', 1, 1, NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- -----------------------------------------------------------------------------
-- 30. Grievance Escalation & Complaints
-- -----------------------------------------------------------------------------
INSERT INTO `complaints` (`id`, `complaint_number`, `title`, `description`, `category`, `priority`, `status`, `organization_id`, `mine_id`, `submitted_by`, `current_level`, `current_assignee_id`, `sla_deadline`, `created_at`) VALUES
  (1, 'CMP-2026-001', 'Delayed Overtime Calculation for Continuous Miner Operators', 'Shift overtime for Sunday August 30 maintenance cycle has not reflected in provisional payslip.', 'PAYROLL', 'MEDIUM', 'IN_PROGRESS', 2, 1, 8, 'MINE_ADMIN', 5, DATE_ADD(NOW(), INTERVAL 3 DAY), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- End of Sample Data Script. All relational modules populated with realistic data.
-- ==============================================================================
