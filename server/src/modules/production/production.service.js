import { ProductionRepository } from './production.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';

export class ProductionService {
  static async listReports(userId, filters) {
    const scope = await getScopeForUser(userId);
    return ProductionRepository.getReports({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async createReport(userId, data) {
    const id = await ProductionRepository.createReport({
      supervisor_id: userId,
      ...data,
    });
    return { id, ...data };
  }

  static async listTargets(userId) {
    const scope = await getScopeForUser(userId);
    return ProductionRepository.getTargets(scope.mine_ids, scope.is_super_admin);
  }

  static async createTarget(userId, data) {
    const id = await ProductionRepository.createTarget({
      set_by: userId,
      ...data,
    });
    return { id, ...data };
  }

  static async listIssues(userId, filters) {
    const scope = await getScopeForUser(userId);
    return ProductionRepository.getIssues({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async createIssue(userId, data) {
    const id = await ProductionRepository.createIssue({
      reported_by: userId,
      ...data,
    });
    return { id, ...data };
  }

  static async updateIssueStatus(userId, id, status) {
    await ProductionRepository.updateIssueStatus(id, status);
    return { id, status };
  }

  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return ProductionRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default ProductionService;
