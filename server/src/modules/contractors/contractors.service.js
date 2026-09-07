import { ContractorsRepository } from './contractors.repository.js';
import { getScopeForUser } from '../../middlewares/rbac.middleware.js';

export class ContractorsService {
  static async listContractors(userId, filters) {
    const scope = await getScopeForUser(userId);
    return ContractorsRepository.getContractors({
      org_id: scope.organization_id || undefined,
      ...filters,
    });
  }

  static async createContractor(userId, data) {
    const scope = await getScopeForUser(userId);
    const orgId = data.org_id || scope.organization_id || 1;
    const id = await ContractorsRepository.createContractor({ ...data, org_id: orgId });
    return { id, ...data, org_id: orgId };
  }

  static async listContracts(userId, filters) {
    const scope = await getScopeForUser(userId);
    return ContractorsRepository.getContracts({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async createContract(userId, data) {
    const id = await ContractorsRepository.createContract(data);
    return { id, ...data };
  }

  static async listWorkers(userId, filters) {
    const scope = await getScopeForUser(userId);
    return ContractorsRepository.getWorkers({
      mine_ids: scope.mine_ids,
      is_super_admin: scope.is_super_admin,
      ...filters,
    });
  }

  static async createWorker(userId, data) {
    const id = await ContractorsRepository.createWorker(data);
    return { id, ...data };
  }

  static async getSummary(userId) {
    const scope = await getScopeForUser(userId);
    return ContractorsRepository.getSummary(scope.mine_ids, scope.is_super_admin);
  }
}

export default ContractorsService;
