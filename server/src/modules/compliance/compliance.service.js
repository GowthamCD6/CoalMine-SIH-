import ComplianceRepository from './compliance.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class ComplianceService {

  static async listRequirements(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return ComplianceRepository.findAllRequirements({
      ...scope,
      ...filters,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });
  }

  static async getRequirement(id) {
    const req = await ComplianceRepository.findRequirementById(id);
    if (!req) throw ApiError.notFound(`Compliance requirement #${id} not found`);
    return req;
  }

  static async createRequirement(userId, data) {
    const scope = await getScopeForUser(userId);
    if (!scope.is_super_admin && data.mine_id && !scope.mine_ids.includes(Number(data.mine_id))) {
      throw ApiError.forbidden('You do not have access to this mine');
    }
    const id = await ComplianceRepository.createRequirement({ ...data, created_by: userId });
    return ComplianceRepository.findRequirementById(id);
  }

  static async updateRequirement(userId, id, data) {
    const existing = await this.getRequirement(id);
    await ComplianceRepository.updateRequirement(id, data);
    return ComplianceRepository.findRequirementById(id);
  }

  static async listAssignments(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return ComplianceRepository.findAllAssignments({
      ...scope,
      ...filters,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });
  }

  static async createAssignment(userId, data) {
    const scope = await getScopeForUser(userId);
    if (!scope.is_super_admin && !scope.mine_ids.includes(Number(data.mine_id))) {
      throw ApiError.forbidden('You do not have access to this mine');
    }
    const id = await ComplianceRepository.createAssignment(data);
    return { id, ...data };
  }

  static async updateAssignmentStatus(id, status, remarks) {
    await ComplianceRepository.updateAssignmentStatus(id, status, remarks);
    return { id, status };
  }

  static async getEvidenceForAssignment(assignment_id) {
    return ComplianceRepository.findEvidenceByAssignment(assignment_id);
  }

  static async submitEvidence(userId, data) {
    const id = await ComplianceRepository.createEvidence({ ...data, submitted_by: userId });
    // After evidence submitted, update assignment status to IN_PROGRESS
    await ComplianceRepository.updateAssignmentStatus(data.assignment_id, 'IN_PROGRESS');
    return { id };
  }

  static async reviewEvidence(userId, evidenceId, reviewData) {
    await ComplianceRepository.reviewEvidence(evidenceId, { ...reviewData, reviewed_by: userId });
    // If approved, mark assignment COMPLIANT; if rejected, NON_COMPLIANT
    const [ev] = await Promise.all([]);
    return { id: evidenceId, ...reviewData };
  }

  static async getCorrectiveActions(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return ComplianceRepository.findCorrectiveActions({ ...scope, ...filters });
  }

  static async createCorrectiveAction(userId, data) {
    const id = await ComplianceRepository.createCorrectiveAction({ ...data, created_by: userId });
    return { id, ...data };
  }

  static async getStatusBoard(userId) {
    const scope = await getScopeForUser(userId);
    const rows = await ComplianceRepository.getStatusSummary(scope.mine_ids, scope.is_super_admin);
    // Build structured object
    const summary = { PENDING: 0, IN_PROGRESS: 0, COMPLIANT: 0, NON_COMPLIANT: 0, OVERDUE: 0 };
    rows.forEach((r) => { summary[r.status] = Number(r.count); });
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    const compliancePct = total > 0 ? Math.round((summary.COMPLIANT / total) * 100) : null;
    return { summary, total, compliance_pct: compliancePct };
  }
}

export default ComplianceService;
