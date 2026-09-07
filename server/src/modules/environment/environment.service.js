import { EnvironmentRepository } from './environment.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';

export class EnvironmentService {
  static async listObservations(userId, filters) {
    const scope = await getScopeForUser(userId);
    return EnvironmentRepository.getObservations({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async createObservation(userId, data) {
    const scope = await getScopeForUser(userId);
    const mine_id = data.mine_id || (scope.mine_ids && scope.mine_ids.length > 0 ? scope.mine_ids[0] : 1);
    const id = await EnvironmentRepository.createObservation({
      observer_id: userId,
      ...data,
      mine_id,
    });
    return { id, ...data, mine_id };
  }

  static async listThresholds(userId) {
    const scope = await getScopeForUser(userId);
    return EnvironmentRepository.getThresholds(scope.mine_ids, scope.is_super_admin);
  }

  static async upsertThreshold(userId, data) {
    const id = await EnvironmentRepository.upsertThreshold({
      created_by: userId,
      ...data,
    });
    return { id, ...data };
  }

  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return EnvironmentRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default EnvironmentService;
