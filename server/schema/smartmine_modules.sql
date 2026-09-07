-- =========================================================
-- SmartMine — Phase 2: Compliance Management Schema
-- Run this against the TiDB/MySQL database
-- =========================================================

-- Statutory compliance requirements (what must be done)
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT DEFAULT NULL COMMENT 'If org-specific, NULL = global',
  mine_id BIGINT DEFAULT NULL COMMENT 'If mine-specific, NULL = applies to all mines in org',
  category ENUM('SAFETY','ENVIRONMENT','PRODUCTION','LABOUR','OTHER') NOT NULL DEFAULT 'SAFETY',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  statutory_reference VARCHAR(255) COMMENT 'Act/Section reference e.g. CMR 1957 Sec 45',
  frequency ENUM('DAILY','WEEKLY','MONTHLY','QUARTERLY','HALF_YEARLY','ANNUALLY','ONE_TIME','AS_REQUIRED') NOT NULL DEFAULT 'MONTHLY',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Scheduled compliance tasks per mine (assignment instances)
CREATE TABLE IF NOT EXISTS compliance_assignments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  requirement_id BIGINT NOT NULL,
  mine_id BIGINT NOT NULL,
  assigned_user_id BIGINT COMMENT 'Responsible officer',
  due_date DATE NOT NULL,
  status ENUM('PENDING','IN_PROGRESS','COMPLIANT','NON_COMPLIANT','OVERDUE') NOT NULL DEFAULT 'PENDING',
  remarks TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Evidence and document submissions for compliance
CREATE TABLE IF NOT EXISTS compliance_evidence (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(512),
  file_type VARCHAR(50),
  ocr_extracted_text MEDIUMTEXT COMMENT 'Text extracted by OCR from scanned documents',
  submitted_by BIGINT NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  review_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by BIGINT,
  reviewed_at DATETIME,
  review_remarks TEXT,
  FOREIGN KEY (assignment_id) REFERENCES compliance_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Corrective actions for non-compliant assignments
CREATE TABLE IF NOT EXISTS compliance_corrective_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  assigned_to BIGINT COMMENT 'User responsible for the corrective action',
  deadline DATE,
  status ENUM('OPEN','IN_PROGRESS','COMPLETED','OVERDUE','VERIFIED') NOT NULL DEFAULT 'OPEN',
  verified_by BIGINT,
  verified_at DATETIME,
  verified_remarks TEXT,
  created_by BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES compliance_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- Phase 3: Inspection & Safety Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  inspector_user_id BIGINT NOT NULL,
  inspection_type ENUM('ROUTINE','SAFETY','EQUIPMENT','ENVIRONMENT','STATUTORY','SURPRISE') NOT NULL DEFAULT 'ROUTINE',
  area VARCHAR(255) COMMENT 'Mine zone/area inspected',
  description TEXT,
  scheduled_at DATETIME NOT NULL,
  completed_at DATETIME,
  status ENUM('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS inspection_checklist_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  inspection_id BIGINT NOT NULL,
  item_text TEXT NOT NULL,
  status ENUM('OK','ISSUE','NA') NOT NULL DEFAULT 'OK',
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT NULL,
  evidence_url VARCHAR(512),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS safety_observations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  observer_user_id BIGINT NOT NULL,
  area VARCHAR(255),
  description TEXT NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  photo_url VARCHAR(512),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('OPEN','UNDER_REVIEW','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  resolved_by BIGINT,
  resolved_at DATETIME,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (observer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS violations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  inspection_id BIGINT DEFAULT NULL,
  observation_id BIGINT DEFAULT NULL,
  mine_id BIGINT NOT NULL,
  type ENUM('SAFETY','ENVIRONMENT','LABOUR','OPERATIONAL','STATUTORY') NOT NULL DEFAULT 'SAFETY',
  description TEXT NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  assigned_to BIGINT,
  deadline DATE,
  status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED','OVERDUE') NOT NULL DEFAULT 'OPEN',
  closed_by BIGINT,
  closed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE SET NULL,
  FOREIGN KEY (observation_id) REFERENCES safety_observations(id) ON DELETE SET NULL,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- Phase 4: Incident Management Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS incidents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  reported_by BIGINT NOT NULL,
  category ENUM('SAFETY','ENVIRONMENTAL','OPERATIONAL','LABOUR','EQUIPMENT','FIRE','OTHER') NOT NULL DEFAULT 'SAFETY',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  location_area VARCHAR(255),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  photo_url VARCHAR(512),
  incident_at DATETIME NOT NULL,
  status ENUM('OPEN','UNDER_INVESTIGATION','CORRECTIVE_ACTION','CLOSED') NOT NULL DEFAULT 'OPEN',
  closed_by BIGINT,
  closed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS incident_investigations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  incident_id BIGINT NOT NULL,
  investigator_id BIGINT NOT NULL,
  root_cause TEXT,
  findings TEXT,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (investigator_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS incident_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  incident_id BIGINT NOT NULL,
  action_type ENUM('CORRECTIVE','PREVENTIVE') NOT NULL DEFAULT 'CORRECTIVE',
  description TEXT NOT NULL,
  assigned_to BIGINT,
  deadline DATE,
  status ENUM('OPEN','IN_PROGRESS','COMPLETED','VERIFIED','OVERDUE') NOT NULL DEFAULT 'OPEN',
  verified_by BIGINT,
  verified_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- Phase 5: Environmental Monitoring Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS env_thresholds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  parameter_type ENUM('AIR_DUST','WATER_QUALITY','NOISE','METHANE','CO2','TEMPERATURE','OTHER') NOT NULL,
  min_value DECIMAL(10,4),
  max_value DECIMAL(10,4),
  unit VARCHAR(50),
  alert_on_breach BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS env_observations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  observer_id BIGINT NOT NULL,
  parameter_type ENUM('AIR_DUST','WATER_QUALITY','NOISE','METHANE','CO2','TEMPERATURE','OTHER') NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(50),
  status ENUM('NORMAL','THRESHOLD_EXCEEDED','CRITICAL') NOT NULL DEFAULT 'NORMAL',
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  photo_url VARCHAR(512),
  observed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (observer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- =========================================================
-- Phase 6: Production & Operations Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS production_targets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  period_type ENUM('DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUALLY') NOT NULL DEFAULT 'MONTHLY',
  period_value VARCHAR(20) COMMENT 'e.g. "2026-09" for monthly, "2026-W36" for weekly',
  target_tonnes DECIMAL(12,2) NOT NULL,
  set_by BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (set_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS production_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  supervisor_id BIGINT NOT NULL,
  report_date DATE NOT NULL,
  shift ENUM('MORNING','AFTERNOON','NIGHT') NOT NULL DEFAULT 'MORNING',
  target_tonnes DECIMAL(12,2),
  actual_tonnes DECIMAL(12,2) NOT NULL,
  equipment_downtime_hrs DECIMAL(6,2) DEFAULT 0,
  remarks TEXT,
  status ENUM('DRAFT','SUBMITTED','REVIEWED') NOT NULL DEFAULT 'SUBMITTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_production_mine_date_shift (mine_id, report_date, shift)
);

CREATE TABLE IF NOT EXISTS operational_issues (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  reported_by BIGINT NOT NULL,
  issue_type ENUM('EQUIPMENT','POWER','SAFETY','WEATHER','PERSONNEL','OTHER') NOT NULL DEFAULT 'EQUIPMENT',
  description TEXT NOT NULL,
  area VARCHAR(255),
  severity ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('OPEN','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'OPEN',
  resolved_at DATETIME,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- =========================================================
-- Phase 7: Contractor Management Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS contractors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id BIGINT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  contact_person VARCHAR(150),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(150),
  status ENUM('ACTIVE','INACTIVE','BLACKLISTED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contractor_contracts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  contractor_id BIGINT NOT NULL,
  mine_id BIGINT NOT NULL,
  work_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  document_url VARCHAR(512),
  status ENUM('ACTIVE','EXPIRED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contractor_workers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  contractor_id BIGINT NOT NULL,
  mine_id BIGINT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  id_number VARCHAR(100),
  role VARCHAR(100),
  training_status ENUM('CERTIFIED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  assigned_area VARCHAR(255),
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  face_encoding TEXT COMMENT 'JSON face descriptor for biometric attendance',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE
);

-- =========================================================
-- Phase 8: Grievance Management Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS grievances (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mine_id BIGINT NOT NULL,
  submitted_by BIGINT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  category ENUM('WAGES','SAFETY','FACILITIES','DISCRIMINATION','HARASSMENT','OTHER') NOT NULL DEFAULT 'OTHER',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  evidence_url VARCHAR(512),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('SUBMITTED','ASSIGNED','UNDER_INVESTIGATION','RESOLVED','CLOSED','REOPENED') NOT NULL DEFAULT 'SUBMITTED',
  assigned_to BIGINT,
  FOREIGN KEY (mine_id) REFERENCES mines(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS grievance_responses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  grievance_id BIGINT NOT NULL,
  responder_id BIGINT NOT NULL,
  response_text TEXT NOT NULL,
  action_taken TEXT,
  responded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- =========================================================
-- Phase 12: Notifications Schema
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type ENUM('COMPLIANCE','INSPECTION','INCIDENT','VIOLATION','EMERGENCY','GRIEVANCE','SYSTEM','AI_ALERT') NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(100) COMMENT 'e.g. compliance_assignments',
  entity_id BIGINT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
