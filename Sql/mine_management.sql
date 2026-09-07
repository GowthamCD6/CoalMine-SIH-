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

 Date: 07/09/2026 20:59:31
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
) AUTO_INCREMENT = 360001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

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
-- Table structure for compliance_assignments
-- ----------------------------
DROP TABLE IF EXISTS `compliance_assignments`;
CREATE TABLE `compliance_assignments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `requirement_id` bigint NOT NULL,
  `mine_id` bigint NOT NULL,
  `assigned_user_id` bigint NULL DEFAULT NULL COMMENT 'Responsible officer',
  `due_date` date NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLIANT','NON_COMPLIANT','OVERDUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'PENDING',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`requirement_id` ASC) USING BTREE,
  INDEX `fk_2`(`mine_id` ASC) USING BTREE,
  INDEX `fk_3`(`assigned_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`requirement_id`) REFERENCES `compliance_requirements` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for compliance_corrective_actions
-- ----------------------------
DROP TABLE IF EXISTS `compliance_corrective_actions`;
CREATE TABLE `compliance_corrective_actions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assigned_to` bigint NULL DEFAULT NULL COMMENT 'User responsible for the corrective action',
  `deadline` date NULL DEFAULT NULL,
  `status` enum('OPEN','IN_PROGRESS','COMPLETED','OVERDUE','VERIFIED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `verified_by` bigint NULL DEFAULT NULL,
  `verified_at` datetime NULL DEFAULT NULL,
  `verified_remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `created_by` bigint NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`assignment_id` ASC) USING BTREE,
  INDEX `fk_2`(`assigned_to` ASC) USING BTREE,
  INDEX `fk_3`(`verified_by` ASC) USING BTREE,
  INDEX `fk_4`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`assignment_id`) REFERENCES `compliance_assignments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for compliance_evidence
-- ----------------------------
DROP TABLE IF EXISTS `compliance_evidence`;
CREATE TABLE `compliance_evidence`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `file_path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `ocr_extracted_text` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT 'Text extracted by OCR from scanned documents',
  `submitted_by` bigint NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `review_status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'PENDING',
  `reviewed_by` bigint NULL DEFAULT NULL,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `review_remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`assignment_id` ASC) USING BTREE,
  INDEX `fk_2`(`submitted_by` ASC) USING BTREE,
  INDEX `fk_3`(`reviewed_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`assignment_id`) REFERENCES `compliance_assignments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for compliance_requirements
-- ----------------------------
DROP TABLE IF EXISTS `compliance_requirements`;
CREATE TABLE `compliance_requirements`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `org_id` bigint NULL DEFAULT NULL COMMENT 'If org-specific, NULL = global',
  `mine_id` bigint NULL DEFAULT NULL COMMENT 'If mine-specific, NULL = applies to all mines in org',
  `category` enum('SAFETY','ENVIRONMENT','PRODUCTION','LABOUR','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SAFETY',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `statutory_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'Act/Section reference e.g. CMR 1957 Sec 45',
  `frequency` enum('DAILY','WEEKLY','MONTHLY','QUARTERLY','HALF_YEARLY','ANNUALLY','ONE_TIME','AS_REQUIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MONTHLY',
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_by` bigint NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`org_id` ASC) USING BTREE,
  INDEX `fk_2`(`mine_id` ASC) USING BTREE,
  INDEX `fk_3`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for contractor_contracts
-- ----------------------------
DROP TABLE IF EXISTS `contractor_contracts`;
CREATE TABLE `contractor_contracts`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contractor_id` bigint NOT NULL,
  `mine_id` bigint NOT NULL,
  `work_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `start_date` date NOT NULL,
  `end_date` date NULL DEFAULT NULL,
  `document_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` enum('ACTIVE','EXPIRED','TERMINATED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`contractor_id` ASC) USING BTREE,
  INDEX `fk_2`(`mine_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for contractor_workers
-- ----------------------------
DROP TABLE IF EXISTS `contractor_workers`;
CREATE TABLE `contractor_workers`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contractor_id` bigint NOT NULL,
  `mine_id` bigint NOT NULL,
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `id_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `training_status` enum('CERTIFIED','PENDING','EXPIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'PENDING',
  `assigned_area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `face_encoding` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT 'JSON face descriptor for biometric attendance',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`contractor_id` ASC) USING BTREE,
  INDEX `fk_2`(`mine_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for contractors
-- ----------------------------
DROP TABLE IF EXISTS `contractors`;
CREATE TABLE `contractors`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `org_id` bigint NOT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `registration_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `contact_person` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `contact_email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','BLACKLISTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`org_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for env_observations
-- ----------------------------
DROP TABLE IF EXISTS `env_observations`;
CREATE TABLE `env_observations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `observer_id` bigint NOT NULL,
  `parameter_type` enum('AIR_DUST','WATER_QUALITY','NOISE','METHANE','CO2','TEMPERATURE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `value` decimal(10, 4) NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` enum('NORMAL','THRESHOLD_EXCEEDED','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'NORMAL',
  `gps_lat` decimal(10, 7) NULL DEFAULT NULL,
  `gps_lng` decimal(10, 7) NULL DEFAULT NULL,
  `photo_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `observed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`observer_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`observer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for env_thresholds
-- ----------------------------
DROP TABLE IF EXISTS `env_thresholds`;
CREATE TABLE `env_thresholds`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `parameter_type` enum('AIR_DUST','WATER_QUALITY','NOISE','METHANE','CO2','TEMPERATURE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `min_value` decimal(10, 4) NULL DEFAULT NULL,
  `max_value` decimal(10, 4) NULL DEFAULT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `alert_on_breach` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for grievance_responses
-- ----------------------------
DROP TABLE IF EXISTS `grievance_responses`;
CREATE TABLE `grievance_responses`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `grievance_id` bigint NOT NULL,
  `responder_id` bigint NOT NULL,
  `response_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action_taken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `responded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`grievance_id` ASC) USING BTREE,
  INDEX `fk_2`(`responder_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`responder_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for grievances
-- ----------------------------
DROP TABLE IF EXISTS `grievances`;
CREATE TABLE `grievances`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `submitted_by` bigint NOT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `category` enum('WAGES','SAFETY','FACILITIES','DISCRIMINATION','HARASSMENT','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OTHER',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `evidence_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `gps_lat` decimal(10, 7) NULL DEFAULT NULL,
  `gps_lng` decimal(10, 7) NULL DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `priority` enum('LOW','MEDIUM','HIGH') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `status` enum('SUBMITTED','ASSIGNED','UNDER_INVESTIGATION','RESOLVED','CLOSED','REOPENED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SUBMITTED',
  `assigned_to` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`submitted_by` ASC) USING BTREE,
  INDEX `fk_3`(`assigned_to` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for incident_actions
-- ----------------------------
DROP TABLE IF EXISTS `incident_actions`;
CREATE TABLE `incident_actions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `incident_id` bigint NOT NULL,
  `action_type` enum('CORRECTIVE','PREVENTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'CORRECTIVE',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assigned_to` bigint NULL DEFAULT NULL,
  `deadline` date NULL DEFAULT NULL,
  `status` enum('OPEN','IN_PROGRESS','COMPLETED','VERIFIED','OVERDUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `verified_by` bigint NULL DEFAULT NULL,
  `verified_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`incident_id` ASC) USING BTREE,
  INDEX `fk_2`(`assigned_to` ASC) USING BTREE,
  INDEX `fk_3`(`verified_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for incident_investigations
-- ----------------------------
DROP TABLE IF EXISTS `incident_investigations`;
CREATE TABLE `incident_investigations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `incident_id` bigint NOT NULL,
  `investigator_id` bigint NOT NULL,
  `root_cause` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `findings` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`incident_id` ASC) USING BTREE,
  INDEX `fk_2`(`investigator_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`investigator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for incidents
-- ----------------------------
DROP TABLE IF EXISTS `incidents`;
CREATE TABLE `incidents`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `reported_by` bigint NOT NULL,
  `category` enum('SAFETY','ENVIRONMENTAL','OPERATIONAL','LABOUR','EQUIPMENT','FIRE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SAFETY',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `location_area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `gps_lat` decimal(10, 7) NULL DEFAULT NULL,
  `gps_lng` decimal(10, 7) NULL DEFAULT NULL,
  `photo_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `incident_at` datetime NOT NULL,
  `status` enum('OPEN','UNDER_INVESTIGATION','CORRECTIVE_ACTION','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `closed_by` bigint NULL DEFAULT NULL,
  `closed_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`reported_by` ASC) USING BTREE,
  INDEX `fk_3`(`closed_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for inspection_checklist_items
-- ----------------------------
DROP TABLE IF EXISTS `inspection_checklist_items`;
CREATE TABLE `inspection_checklist_items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint NOT NULL,
  `item_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('OK','ISSUE','NA') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OK',
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `evidence_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `gps_lat` decimal(10, 7) NULL DEFAULT NULL,
  `gps_lng` decimal(10, 7) NULL DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`inspection_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for inspections
-- ----------------------------
DROP TABLE IF EXISTS `inspections`;
CREATE TABLE `inspections`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `inspector_user_id` bigint NOT NULL,
  `inspection_type` enum('ROUTINE','SAFETY','EQUIPMENT','ENVIRONMENT','STATUTORY','SURPRISE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'ROUTINE',
  `area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'Mine zone/area inspected',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `scheduled_at` datetime NOT NULL,
  `completed_at` datetime NULL DEFAULT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','OVERDUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SCHEDULED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`inspector_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`inspector_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
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
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` enum('COMPLIANCE','INSPECTION','INCIDENT','VIOLATION','EMERGENCY','GRIEVANCE','SYSTEM','AI_ALERT') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SYSTEM',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'e.g. compliance_assignments',
  `entity_id` bigint NULL DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for operational_issues
-- ----------------------------
DROP TABLE IF EXISTS `operational_issues`;
CREATE TABLE `operational_issues`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `reported_by` bigint NOT NULL,
  `issue_type` enum('EQUIPMENT','POWER','SAFETY','WEATHER','PERSONNEL','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'EQUIPMENT',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `severity` enum('LOW','MEDIUM','HIGH') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `reported_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `resolved_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`reported_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

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
-- Table structure for production_reports
-- ----------------------------
DROP TABLE IF EXISTS `production_reports`;
CREATE TABLE `production_reports`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `supervisor_id` bigint NOT NULL,
  `report_date` date NOT NULL,
  `shift` enum('MORNING','AFTERNOON','NIGHT') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MORNING',
  `target_tonnes` decimal(12, 2) NULL DEFAULT NULL,
  `actual_tonnes` decimal(12, 2) NOT NULL,
  `equipment_downtime_hrs` decimal(6, 2) NULL DEFAULT 0,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `status` enum('DRAFT','SUBMITTED','REVIEWED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SUBMITTED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_production_mine_date_shift`(`mine_id` ASC, `report_date` ASC, `shift` ASC) USING BTREE,
  INDEX `fk_2`(`supervisor_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

-- ----------------------------
-- Table structure for production_targets
-- ----------------------------
DROP TABLE IF EXISTS `production_targets`;
CREATE TABLE `production_targets`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `period_type` enum('DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUALLY') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MONTHLY',
  `period_value` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'e.g. \"2026-09\" for monthly, \"2026-W36\" for weekly',
  `target_tonnes` decimal(12, 2) NOT NULL,
  `set_by` bigint NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`set_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

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
-- Table structure for safety_observations
-- ----------------------------
DROP TABLE IF EXISTS `safety_observations`;
CREATE TABLE `safety_observations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mine_id` bigint NOT NULL,
  `observer_user_id` bigint NOT NULL,
  `area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `photo_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `gps_lat` decimal(10, 7) NULL DEFAULT NULL,
  `gps_lng` decimal(10, 7) NULL DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('OPEN','UNDER_REVIEW','RESOLVED','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `resolved_by` bigint NULL DEFAULT NULL,
  `resolved_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`mine_id` ASC) USING BTREE,
  INDEX `fk_2`(`observer_user_id` ASC) USING BTREE,
  INDEX `fk_3`(`resolved_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`observer_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

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
) AUTO_INCREMENT = 360001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

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

-- ----------------------------
-- Table structure for violations
-- ----------------------------
DROP TABLE IF EXISTS `violations`;
CREATE TABLE `violations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint NULL DEFAULT NULL,
  `observation_id` bigint NULL DEFAULT NULL,
  `mine_id` bigint NOT NULL,
  `type` enum('SAFETY','ENVIRONMENT','LABOUR','OPERATIONAL','STATUTORY') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SAFETY',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'MEDIUM',
  `assigned_to` bigint NULL DEFAULT NULL,
  `deadline` date NULL DEFAULT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED','OVERDUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'OPEN',
  `closed_by` bigint NULL DEFAULT NULL,
  `closed_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`inspection_id` ASC) USING BTREE,
  INDEX `fk_2`(`observation_id` ASC) USING BTREE,
  INDEX `fk_3`(`mine_id` ASC) USING BTREE,
  INDEX `fk_4`(`assigned_to` ASC) USING BTREE,
  INDEX `fk_5`(`closed_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`observation_id`) REFERENCES `safety_observations` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_5` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

SET FOREIGN_KEY_CHECKS = 1;
