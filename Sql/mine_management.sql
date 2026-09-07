/*
 Navicat Premium Dump SQL

 Source Server         : sih
 Source Server Type    : TiDB
 Source Server Version : 80011 (8.0.11-TiDB-v8.5.3-serverless)
 Source Host           : gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000
 Source Schema         : mine_management

 Target Server Type    : TiDB
 Target Server Version : 80011 (8.0.11-TiDB-v8.5.3-serverless)
 File Encoding         : 65001

 Date: 07/09/2026 19:54:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attendance_logs
-- ----------------------------
DROP TABLE IF EXISTS `attendance_logs`;
CREATE TABLE `attendance_logs`  (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `shift` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `mine_site` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `date` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'Present - On Time',
  `confidence` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '98.5%',
  `verification_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'AI Facial Biometrics (ResNet-18)',
  `dgms_form_b` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'VERIFIED_COMPLIANT',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_log_worker`(`worker_id` ASC) USING BTREE,
  INDEX `idx_log_date`(`date` ASC) USING BTREE,
  INDEX `idx_log_shift`(`shift` ASC) USING BTREE
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for attendance_workers
-- ----------------------------
DROP TABLE IF EXISTS `attendance_workers`;
CREATE TABLE `attendance_workers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `worker_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Underground Drill Operator',
  `shift` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Morning Shift (06:00 - 14:00)',
  `mine_site` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Dhanbad Central Pit #4 (Seam IX)',
  `photo_url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `rfid_tag` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `registered_at` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_worker_id`(`worker_id` ASC) USING BTREE,
  INDEX `idx_shift`(`shift` ASC) USING BTREE,
  UNIQUE INDEX `worker_id`(`worker_id` ASC) USING BTREE
) AUTO_INCREMENT = 60001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NULL DEFAULT NULL,
  `organization_id` bigint NULL DEFAULT NULL,
  `mine_id` bigint NULL DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `entity_id` bigint NULL DEFAULT NULL,
  `old_data` json NULL,
  `new_data` json NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_audit_logs_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_audit_logs_organization_id`(`organization_id` ASC) USING BTREE,
  INDEX `idx_audit_logs_mine_id`(`mine_id` ASC) USING BTREE,
  INDEX `idx_audit_logs_action`(`action` ASC) USING BTREE,
  INDEX `idx_audit_logs_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_audit_logs_entity`(`entity_type` ASC, `entity_id` ASC) USING BTREE,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_audit_logs_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_audit_logs_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 330001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for complaint_comments
-- ----------------------------
DROP TABLE IF EXISTS `complaint_comments`;
CREATE TABLE `complaint_comments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_internal` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_comments_complaint`(`complaint_id` ASC) USING BTREE,
  INDEX `fk_comments_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_comments_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for complaint_history
-- ----------------------------
DROP TABLE IF EXISTS `complaint_history`;
CREATE TABLE `complaint_history`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `from_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `to_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `from_assignee_id` bigint NULL DEFAULT NULL,
  `to_assignee_id` bigint NULL DEFAULT NULL,
  `performed_by` bigint NULL DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_history_complaint`(`complaint_id` ASC) USING BTREE,
  INDEX `idx_history_action`(`action` ASC) USING BTREE,
  INDEX `fk_history_perf_user`(`performed_by` ASC) USING BTREE,
  CONSTRAINT `fk_history_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_history_perf_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for complaints
-- ----------------------------
DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SUBMITTED',
  `organization_id` bigint NULL DEFAULT NULL,
  `mine_id` bigint NULL DEFAULT NULL,
  `submitted_by` bigint NOT NULL,
  `current_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MINE_ADMIN',
  `current_assignee_id` bigint NULL DEFAULT NULL,
  `sla_deadline` datetime NOT NULL,
  `first_response_at` datetime NULL DEFAULT NULL,
  `resolved_at` datetime NULL DEFAULT NULL,
  `closed_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_complaint_number`(`complaint_number` ASC) USING BTREE,
  INDEX `idx_complaints_mine`(`mine_id` ASC) USING BTREE,
  INDEX `idx_complaints_org`(`organization_id` ASC) USING BTREE,
  INDEX `idx_complaints_submitter`(`submitted_by` ASC) USING BTREE,
  INDEX `idx_complaints_status`(`status` ASC) USING BTREE,
  INDEX `idx_complaints_level`(`current_level` ASC) USING BTREE,
  INDEX `idx_complaints_sla`(`sla_deadline` ASC) USING BTREE,
  INDEX `fk_complaints_assignee`(`current_assignee_id` ASC) USING BTREE,
  CONSTRAINT `fk_complaints_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_complaints_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_complaints_submitter` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_complaints_assignee` FOREIGN KEY (`current_assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for material_inward_logs
-- ----------------------------
DROP TABLE IF EXISTS `material_inward_logs`;
CREATE TABLE `material_inward_logs`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `consignment_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `organization_id` bigint NOT NULL,
  `mine_id` bigint NOT NULL,
  `material_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'EXPLOSIVES, FUEL_LUBRICANTS, HEAVY_SPARES, CONVEYOR_BELTING, STRUCTURAL_SUPPORT, SAFETY_PPE, CHEMICALS_REAGENTS, ELECTRICAL',
  `quantity` decimal(12, 2) NOT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'TONS, LITERS, UNITS, METERS, DRUMS, BOXES',
  `challan_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `purchase_order_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `supplier_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `transporter_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `vehicle_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `driver_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `driver_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `entry_gate` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `gross_weight_tons` decimal(10, 2) NULL DEFAULT NULL,
  `tare_weight_tons` decimal(10, 2) NULL DEFAULT NULL,
  `net_weight_tons` decimal(10, 2) NULL DEFAULT NULL,
  `inspection_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'PASSED' COMMENT 'PASSED, PENDING, CONDITIONAL, REJECTED',
  `inspected_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `logged_by_user_id` bigint NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_consignment_number`(`consignment_number` ASC) USING BTREE,
  INDEX `idx_mat_org_mine`(`organization_id` ASC, `mine_id` ASC) USING BTREE,
  INDEX `idx_mat_category`(`category` ASC) USING BTREE,
  INDEX `idx_mat_status`(`inspection_status` ASC) USING BTREE,
  INDEX `idx_mat_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_mat_logged_by`(`logged_by_user_id` ASC) USING BTREE,
  INDEX `fk_mat_mine`(`mine_id` ASC) USING BTREE,
  CONSTRAINT `fk_mat_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_user` FOREIGN KEY (`logged_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for mines
-- ----------------------------
DROP TABLE IF EXISTS `mines`;
CREATE TABLE `mines`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `organization_id` bigint NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `mine_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'OPEN_CAST / UNDERGROUND / MIXED',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_mines_org_code`(`organization_id` ASC, `code` ASC) USING BTREE,
  INDEX `idx_mines_organization_id`(`organization_id` ASC) USING BTREE,
  INDEX `idx_mines_mine_type`(`mine_type` ASC) USING BTREE,
  INDEX `idx_mines_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_mines_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 60002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for organizations
-- ----------------------------
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_organizations_code`(`code` ASC) USING BTREE,
  INDEX `idx_organizations_status`(`status` ASC) USING BTREE
) AUTO_INCREMENT = 30002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for page_permissions
-- ----------------------------
DROP TABLE IF EXISTS `page_permissions`;
CREATE TABLE `page_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `page_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_page_permissions`(`page_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `fk_page_permissions_permission`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_page_permissions_page` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_page_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for pages
-- ----------------------------
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `route` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `parent_id` bigint NULL DEFAULT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'PAGE / MENU / GROUP',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_pages_code`(`code` ASC) USING BTREE,
  INDEX `idx_pages_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_pages_status`(`status` ASC) USING BTREE,
  INDEX `idx_pages_sort_order`(`sort_order` ASC) USING BTREE,
  CONSTRAINT `fk_pages_parent` FOREIGN KEY (`parent_id`) REFERENCES `pages` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 60002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_permissions_code`(`code` ASC) USING BTREE
) AUTO_INCREMENT = 60002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_role_permissions`(`role_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `idx_role_permissions_role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_role_permissions_permission_id`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 90001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `organization_id` bigint NULL DEFAULT NULL,
  `mine_id` bigint NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_roles_org_mine_code`(`organization_id` ASC, `mine_id` ASC, `code` ASC) USING BTREE,
  INDEX `idx_roles_organization_id`(`organization_id` ASC) USING BTREE,
  INDEX `idx_roles_mine_id`(`mine_id` ASC) USING BTREE,
  INDEX `idx_roles_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_roles_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_roles_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 60002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for subrole_permissions
-- ----------------------------
DROP TABLE IF EXISTS `subrole_permissions`;
CREATE TABLE `subrole_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subrole_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_subrole_permissions`(`subrole_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `idx_subrole_permissions_subrole_id`(`subrole_id` ASC) USING BTREE,
  INDEX `idx_subrole_permissions_permission_id`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_subrole_permissions_subrole` FOREIGN KEY (`subrole_id`) REFERENCES `subroles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_subrole_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 90001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for subroles
-- ----------------------------
DROP TABLE IF EXISTS `subroles`;
CREATE TABLE `subroles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_subroles_role_code`(`role_id` ASC, `code` ASC) USING BTREE,
  INDEX `idx_subroles_role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_subroles_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_subroles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 60002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `refresh_token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `device_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `expires_at` datetime NULL DEFAULT NULL,
  `revoked_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_sessions_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_sessions_device_id`(`device_id` ASC) USING BTREE,
  INDEX `idx_user_sessions_expires_at`(`expires_at` ASC) USING BTREE,
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 330001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for user_subroles
-- ----------------------------
DROP TABLE IF EXISTS `user_subroles`;
CREATE TABLE `user_subroles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `subrole_id` bigint NOT NULL,
  `assigned_by` bigint NULL DEFAULT NULL,
  `assigned_at` datetime NULL DEFAULT NULL,
  `expires_at` datetime NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_user_subroles`(`user_id` ASC, `subrole_id` ASC) USING BTREE,
  INDEX `idx_user_subroles_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_subroles_subrole_id`(`subrole_id` ASC) USING BTREE,
  INDEX `idx_user_subroles_status`(`status` ASC) USING BTREE,
  INDEX `fk_user_subroles_assigned_by`(`assigned_by` ASC) USING BTREE,
  CONSTRAINT `fk_user_subroles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_subroles_subrole` FOREIGN KEY (`subrole_id`) REFERENCES `subroles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_subroles_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 90001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `employee_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_users_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uq_users_email`(`email` ASC) USING BTREE,
  INDEX `idx_users_employee_code`(`employee_code` ASC) USING BTREE,
  INDEX `idx_users_status`(`status` ASC) USING BTREE
) AUTO_INCREMENT = 90001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

SET FOREIGN_KEY_CHECKS = 1;
