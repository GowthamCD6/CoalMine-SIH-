-- ============================================================
-- SIH26024
-- CORE ORGANIZATION + MINE + USER + RBAC STRUCTURE
-- MySQL 8.0+ DDL
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- ORGANIZATIONS / CORPORATE OFFICES
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(150) NOT NULL,
  `code`          VARCHAR(50)  NOT NULL,
  `status`        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `created_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organizations_code` (`code`),
  KEY `idx_organizations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- MINES
-- Every mine belongs to exactly one organization.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `mines`;
CREATE TABLE `mines` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT,
  `organization_id` BIGINT       NOT NULL,
  `name`            VARCHAR(150) NOT NULL,
  `code`            VARCHAR(50)  NOT NULL,
  `mine_type`       VARCHAR(50)  NOT NULL COMMENT 'OPEN_CAST / UNDERGROUND / MIXED',
  `status`          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `created_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mines_org_code` (`organization_id`, `code`),
  KEY `idx_mines_organization_id` (`organization_id`),
  KEY `idx_mines_mine_type` (`mine_type`),
  KEY `idx_mines_status` (`status`),
  CONSTRAINT `fk_mines_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT,
  `username`       VARCHAR(100) NOT NULL,
  `email`          VARCHAR(150) NOT NULL,
  `password_hash`  VARCHAR(255) NOT NULL,
  `first_name`     VARCHAR(100) NOT NULL,
  `last_name`      VARCHAR(100) DEFAULT NULL,
  `phone`          VARCHAR(20)  DEFAULT NULL,
  `employee_code`  VARCHAR(50)  DEFAULT NULL,
  `status`         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `last_login_at`  DATETIME     DEFAULT NULL,
  `created_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_employee_code` (`employee_code`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- ROLES
-- A role belongs directly to an Organization (mine_id = NULL)
-- or directly to a Mine (organization_id + mine_id set).
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT,
  `organization_id` BIGINT       NOT NULL,
  `mine_id`         BIGINT       DEFAULT NULL,
  `name`            VARCHAR(100) NOT NULL,
  `code`            VARCHAR(50)  NOT NULL,
  `description`     TEXT,
  `status`          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `created_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_org_mine_code` (`organization_id`, `mine_id`, `code`),
  KEY `idx_roles_organization_id` (`organization_id`),
  KEY `idx_roles_mine_id` (`mine_id`),
  KEY `idx_roles_status` (`status`),
  CONSTRAINT `fk_roles_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `fk_roles_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- SUBROLES
-- Every subrole belongs to exactly one role, inheriting its
-- organization/mine scope from that role.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `subroles`;
CREATE TABLE `subroles` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `role_id`     BIGINT       NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `code`        VARCHAR(50)  NOT NULL,
  `description` TEXT,
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subroles_role_code` (`role_id`, `code`),
  KEY `idx_subroles_role_id` (`role_id`),
  KEY `idx_subroles_status` (`status`),
  CONSTRAINT `fk_subroles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- PERMISSIONS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `code`        VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permissions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- ROLE -> PERMISSION
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id`            BIGINT   NOT NULL AUTO_INCREMENT,
  `role_id`       BIGINT   NOT NULL,
  `permission_id` BIGINT   NOT NULL,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_permissions` (`role_id`, `permission_id`),
  KEY `idx_role_permissions_role_id` (`role_id`),
  KEY `idx_role_permissions_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- SUBROLE -> PERMISSION
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `subrole_permissions`;
CREATE TABLE `subrole_permissions` (
  `id`            BIGINT   NOT NULL AUTO_INCREMENT,
  `subrole_id`    BIGINT   NOT NULL,
  `permission_id` BIGINT   NOT NULL,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subrole_permissions` (`subrole_id`, `permission_id`),
  KEY `idx_subrole_permissions_subrole_id` (`subrole_id`),
  KEY `idx_subrole_permissions_permission_id` (`permission_id`),
  CONSTRAINT `fk_subrole_permissions_subrole` FOREIGN KEY (`subrole_id`) REFERENCES `subroles` (`id`),
  CONSTRAINT `fk_subrole_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- USER -> SUBROLE
-- A user is assigned to a subrole; scope (org or mine) is
-- inherited via subrole -> role.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `user_subroles`;
CREATE TABLE `user_subroles` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT      NOT NULL,
  `subrole_id`   BIGINT      NOT NULL,
  `assigned_by`  BIGINT      DEFAULT NULL,
  `assigned_at`  DATETIME    DEFAULT NULL,
  `expires_at`   DATETIME    DEFAULT NULL,
  `status`       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_subroles` (`user_id`, `subrole_id`),
  KEY `idx_user_subroles_user_id` (`user_id`),
  KEY `idx_user_subroles_subrole_id` (`subrole_id`),
  KEY `idx_user_subroles_status` (`status`),
  CONSTRAINT `fk_user_subroles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_user_subroles_subrole` FOREIGN KEY (`subrole_id`) REFERENCES `subroles` (`id`),
  CONSTRAINT `fk_user_subroles_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- PAGES / MENUS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(150) NOT NULL,
  `code`       VARCHAR(100) NOT NULL,
  `route`      VARCHAR(255) DEFAULT NULL,
  `parent_id`  BIGINT       DEFAULT NULL,
  `icon`       VARCHAR(100) DEFAULT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `type`       VARCHAR(30)  NOT NULL COMMENT 'PAGE / MENU / GROUP',
  `status`     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pages_code` (`code`),
  KEY `idx_pages_parent_id` (`parent_id`),
  KEY `idx_pages_status` (`status`),
  KEY `idx_pages_sort_order` (`sort_order`),
  CONSTRAINT `fk_pages_parent` FOREIGN KEY (`parent_id`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- PAGE -> PERMISSION
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `page_permissions`;
CREATE TABLE `page_permissions` (
  `id`            BIGINT   NOT NULL AUTO_INCREMENT,
  `page_id`       BIGINT   NOT NULL,
  `permission_id` BIGINT   NOT NULL,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_permissions` (`page_id`, `permission_id`),
  CONSTRAINT `fk_page_permissions_page` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`),
  CONSTRAINT `fk_page_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- USER SESSIONS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id`                  BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`             BIGINT       NOT NULL,
  `refresh_token_hash`  VARCHAR(255) NOT NULL,
  `device_id`           VARCHAR(255) DEFAULT NULL,
  `ip_address`          VARCHAR(45)  DEFAULT NULL,
  `user_agent`          TEXT,
  `expires_at`          DATETIME     DEFAULT NULL,
  `revoked_at`          DATETIME     DEFAULT NULL,
  `created_at`          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_sessions_user_id` (`user_id`),
  KEY `idx_user_sessions_device_id` (`device_id`),
  KEY `idx_user_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- AUDIT LOGS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`         BIGINT       DEFAULT NULL,
  `organization_id` BIGINT       DEFAULT NULL,
  `mine_id`         BIGINT       DEFAULT NULL,
  `action`          VARCHAR(100) NOT NULL,
  `entity_type`     VARCHAR(100) DEFAULT NULL,
  `entity_id`       BIGINT       DEFAULT NULL,
  `old_data`        JSON         DEFAULT NULL,
  `new_data`        JSON         DEFAULT NULL,
  `ip_address`      VARCHAR(45)  DEFAULT NULL,
  `created_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_organization_id` (`organization_id`),
  KEY `idx_audit_logs_mine_id` (`mine_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  KEY `idx_audit_logs_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_audit_logs_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `fk_audit_logs_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- MATERIAL INWARD LOGS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `material_inward_logs`;
CREATE TABLE `material_inward_logs` (
  `id`                    BIGINT       NOT NULL AUTO_INCREMENT,
  `consignment_number`    VARCHAR(50)  NOT NULL,
  `organization_id`       BIGINT       NOT NULL,
  `mine_id`               BIGINT       NOT NULL,
  `material_name`         VARCHAR(150) NOT NULL,
  `category`              VARCHAR(50)  NOT NULL,
  `quantity`              DECIMAL(12,2) NOT NULL,
  `unit`                  VARCHAR(20)  NOT NULL,
  `challan_number`        VARCHAR(100) NOT NULL,
  `purchase_order_number` VARCHAR(100) DEFAULT NULL,
  `supplier_name`         VARCHAR(150) NOT NULL,
  `transporter_name`      VARCHAR(150) DEFAULT NULL,
  `vehicle_number`        VARCHAR(50)  NOT NULL,
  `driver_name`           VARCHAR(100) DEFAULT NULL,
  `driver_phone`          VARCHAR(20)  DEFAULT NULL,
  `entry_gate`            VARCHAR(100) NOT NULL,
  `gross_weight_tons`     DECIMAL(10,2) DEFAULT NULL,
  `tare_weight_tons`      DECIMAL(10,2) DEFAULT NULL,
  `net_weight_tons`       DECIMAL(10,2) DEFAULT NULL,
  `inspection_status`     VARCHAR(30)  NOT NULL DEFAULT 'PASSED',
  `inspected_by`          VARCHAR(100) DEFAULT NULL,
  `remarks`               TEXT         DEFAULT NULL,
  `logged_by_user_id`     BIGINT       NOT NULL,
  `created_at`            DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_consignment_number` (`consignment_number`),
  KEY `idx_mat_org_mine` (`organization_id`, `mine_id`),
  KEY `idx_mat_category` (`category`),
  KEY `idx_mat_status` (`inspection_status`),
  KEY `idx_mat_created_at` (`created_at`),
  KEY `idx_mat_logged_by` (`logged_by_user_id`),
  CONSTRAINT `fk_mat_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `fk_mat_mine` FOREIGN KEY (`mine_id`) REFERENCES `mines` (`id`),
  CONSTRAINT `fk_mat_user` FOREIGN KEY (`logged_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;