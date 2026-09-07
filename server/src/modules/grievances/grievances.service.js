import { GrievancesRepository } from './grievances.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class GrievancesService {
  static async listGrievances(userId, filters) {
    const scope = await getScopeForUser(userId);
    return GrievancesRepository.getGrievances({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async getGrievance(id) {
    const grievance = await GrievancesRepository.findById(id);
    if (!grievance) throw ApiError.notFound('Grievance not found');
    const responses = await GrievancesRepository.getResponses(id);
    return { ...grievance, responses };
  }

  static async createGrievance(userId, data) {
    const id = await GrievancesRepository.createGrievance({
      submitted_by: userId,
      ...data,
    });
    return GrievancesRepository.findById(id);
  }

  static async updateStatus(userId, id, status, assigned_to) {
    await GrievancesRepository.updateStatus(id, status, assigned_to);
    return GrievancesRepository.findById(id);
  }

  static async addResponse(userId, grievanceId, data) {
    const id = await GrievancesRepository.addResponse({
      grievance_id: grievanceId,
      responder_id: userId,
      ...data,
    });
    return { id, grievance_id: grievanceId, ...data };
  }

  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return GrievancesRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default GrievancesService;
