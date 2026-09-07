import { IncidentsRepository } from './incidents.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class IncidentsService {
  static async listIncidents(userId, filters) {
    const scope = await getScopeForUser(userId);
    return IncidentsRepository.findAll({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async getIncident(id) {
    const incident = await IncidentsRepository.findById(id);
    if (!incident) throw ApiError.notFound('Incident not found');
    const investigations = await IncidentsRepository.getInvestigations(id);
    const actions = await IncidentsRepository.getActions(id);
    return { ...incident, investigations, actions };
  }

  static async createIncident(userId, data) {
    const id = await IncidentsRepository.create({ ...data, reported_by: userId });
    return IncidentsRepository.findById(id);
  }

  static async updateStatus(userId, id, status) {
    await IncidentsRepository.updateStatus(id, status, userId);
    return IncidentsRepository.findById(id);
  }

  static async addInvestigation(userId, incidentId, data) {
    const id = await IncidentsRepository.createInvestigation({
      incident_id: incidentId,
      investigator_id: userId,
      ...data,
    });
    return { id, incident_id: incidentId, ...data };
  }

  static async getInvestigations(incidentId) {
    return IncidentsRepository.getInvestigations(incidentId);
  }

  static async addAction(incidentId, data) {
    const id = await IncidentsRepository.createAction({ incident_id: incidentId, ...data });
    return { id, incident_id: incidentId, ...data };
  }

  static async getActions(incidentId) {
    return IncidentsRepository.getActions(incidentId);
  }

  static async updateActionStatus(userId, actionId, status) {
    await IncidentsRepository.updateActionStatus(actionId, status, userId);
    return { id: actionId, status };
  }

  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return IncidentsRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default IncidentsService;
