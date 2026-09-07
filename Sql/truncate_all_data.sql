-- ==============================================================================
-- CoalMin / SmartMine — Database Wipe & Reset Script
-- ==============================================================================
-- PURPOSE:
--   Safely truncates all operational, relational, audit, and master tables
--   in the `mine_management` database while preserving table schemas,
--   indexes, foreign key constraints, and collation settings.
--
-- TARGET DATABASE: TiDB Cloud / MySQL 8.0+
-- TABLES COVERED: 41 Tables
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Biometric Attendance & Field Logs
TRUNCATE TABLE `attendance_logs`;
TRUNCATE TABLE `attendance_workers`;

-- 2. Material & Consignment Logistics
TRUNCATE TABLE `material_inward_logs`;

-- 3. Incident Management & CAPA
TRUNCATE TABLE `incident_actions`;
TRUNCATE TABLE `incident_investigations`;
TRUNCATE TABLE `incidents`;

-- 4. Inspection, Safety & Statutory Violations
TRUNCATE TABLE `inspection_checklist_items`;
TRUNCATE TABLE `inspections`;
TRUNCATE TABLE `violations`;
TRUNCATE TABLE `safety_observations`;

-- 5. Environmental Telemetry & Thresholds
TRUNCATE TABLE `env_observations`;
TRUNCATE TABLE `env_thresholds`;

-- 6. Production & Shift Reporting
TRUNCATE TABLE `operational_issues`;
TRUNCATE TABLE `production_reports`;
TRUNCATE TABLE `production_targets`;

-- 7. Contractor Workforce & Contracts
TRUNCATE TABLE `contractor_workers`;
TRUNCATE TABLE `contractor_contracts`;
TRUNCATE TABLE `contractors`;

-- 8. Grievance Redressal & Worker Feedback
TRUNCATE TABLE `grievance_responses`;
TRUNCATE TABLE `grievances`;

-- 9. Governance & Statutory Compliance
TRUNCATE TABLE `compliance_corrective_actions`;
TRUNCATE TABLE `compliance_evidence`;
TRUNCATE TABLE `compliance_assignments`;
TRUNCATE TABLE `compliance_requirements`;

-- 10. Escalation Complaints & Audit
TRUNCATE TABLE `complaint_comments`;
TRUNCATE TABLE `complaint_history`;
TRUNCATE TABLE `complaints`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `notifications`;

-- 11. Sessions & User Role Bindings
TRUNCATE TABLE `user_sessions`;
TRUNCATE TABLE `user_subroles`;

-- 12. Dynamic Page Permissions & Access Rules
TRUNCATE TABLE `page_permissions`;
TRUNCATE TABLE `subrole_permissions`;
TRUNCATE TABLE `role_permissions`;

-- 13. System Users & Personnel
TRUNCATE TABLE `users`;

-- 14. RBAC Hierarchy (Subroles & Roles)
TRUNCATE TABLE `subroles`;
TRUNCATE TABLE `roles`;
TRUNCATE TABLE `permissions`;
TRUNCATE TABLE `pages`;

-- 15. Mine Sites & Subsidiaries
TRUNCATE TABLE `mines`;
TRUNCATE TABLE `organizations`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- End of Data Wipe Script. All 41 tables truncated successfully.
-- ==============================================================================
