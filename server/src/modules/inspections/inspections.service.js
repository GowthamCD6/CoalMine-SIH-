import InspectionsRepository from './inspections.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class InspectionsService {

  static async listInspections(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return InspectionsRepository.findAll({ ...scope, ...filters });
  }

  static async getInspection(id) {
    const r = await InspectionsRepository.findById(id);
    if (!r) throw ApiError.notFound(`Inspection #${id} not found`);
    return r;
  }

  static async createInspection(userId, data) {
    const scope = await getScopeForUser(userId);
    if (!scope.is_super_admin && !scope.mine_ids.includes(Number(data.mine_id))) {
      throw ApiError.forbidden('No access to this mine');
    }
    const id = await InspectionsRepository.create({ ...data, inspector_user_id: data.inspector_user_id || userId });
    return InspectionsRepository.findById(id);
  }

  static async updateStatus(id, status) {
    await InspectionsRepository.updateStatus(id, status);
    return InspectionsRepository.findById(id);
  }

  static async getChecklist(inspection_id) {
    return InspectionsRepository.getChecklist(inspection_id);
  }

  static async addChecklistItem(userId, inspection_id, data) {
    const id = await InspectionsRepository.addChecklistItem({ ...data, inspection_id });
    return { id, ...data };
  }

  // Observations
  static async listObservations(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return InspectionsRepository.findObservations({ ...scope, ...filters });
  }

  static async createObservation(userId, data) {
    const scope = await getScopeForUser(userId);
    if (!scope.is_super_admin && !scope.mine_ids.includes(Number(data.mine_id))) {
      throw ApiError.forbidden('No access to this mine');
    }
    const id = await InspectionsRepository.createObservation({ ...data, observer_user_id: userId });
    return { id, ...data };
  }

  static async resolveObservation(userId, id) {
    await InspectionsRepository.resolveObservation(id, userId);
    return { id, status: 'RESOLVED' };
  }

  // Violations
  static async listViolations(userId, filters = {}) {
    const scope = await getScopeForUser(userId);
    return InspectionsRepository.findViolations({ ...scope, ...filters });
  }

  static async createViolation(userId, data) {
    const id = await InspectionsRepository.createViolation(data);
    return { id, ...data };
  }

  static async updateViolationStatus(userId, id, status) {
    await InspectionsRepository.updateViolationStatus(id, status, userId);
    return { id, status };
  }

  // Summary
  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return InspectionsRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default InspectionsService;
