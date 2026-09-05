import SubrolesRepository from './subroles.repository.js';
import RolesRepository from '../roles/roles.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class SubrolesService {
  static async listSubroles(pagination, filters) {
    const { total, rows } = await SubrolesRepository.findAll({
      role_id: filters.role_id,
      status: filters.status,
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { subroles: rows, meta };
  }

  static async getSubroleById(id) {
    const subrole = await SubrolesRepository.findById(id);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${id} not found`);
    }
    return subrole;
  }

  static async createSubrole(data, actor = {}, ipAddress = null) {
    const parentRole = await RolesRepository.findById(data.role_id);
    if (!parentRole) {
      throw ApiError.badRequest(`Parent role with ID ${data.role_id} does not exist`);
    }

    const existing = await SubrolesRepository.findByRoleAndCode(data.role_id, data.code);
    if (existing) {
      throw ApiError.conflict(`Subrole with code '${data.code}' already exists for this role`);
    }

    const subroleId = await SubrolesRepository.create(data);
    const createdSubrole = await SubrolesRepository.findById(subroleId);

    await logAudit({
      userId: actor.id,
      organizationId: parentRole.organization_id,
      mineId: parentRole.mine_id,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.SUBROLE,
      entityId: subroleId,
      newData: createdSubrole,
      ipAddress,
    });

    return createdSubrole;
  }

  static async updateSubrole(id, data, actor = {}, ipAddress = null) {
    const oldSubrole = await this.getSubroleById(id);

    const targetRoleId = data.role_id || oldSubrole.role_id;
    if (data.role_id && data.role_id !== oldSubrole.role_id) {
      const parentRole = await RolesRepository.findById(data.role_id);
      if (!parentRole) {
        throw ApiError.badRequest(`Parent role with ID ${data.role_id} does not exist`);
      }
    }

    const targetCode = data.code || oldSubrole.code;
    if (data.code || data.role_id) {
      const existing = await SubrolesRepository.findByRoleAndCode(targetRoleId, targetCode);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Subrole with code '${targetCode}' already exists for this role`);
      }
    }

    await SubrolesRepository.update(id, data);
    const updatedSubrole = await SubrolesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: updatedSubrole.organization_id,
      mineId: updatedSubrole.mine_id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.SUBROLE,
      entityId: Number(id),
      oldData: oldSubrole,
      newData: updatedSubrole,
      ipAddress,
    });

    return updatedSubrole;
  }

  static async deleteSubrole(id, actor = {}, ipAddress = null) {
    const oldSubrole = await this.getSubroleById(id);

    await SubrolesRepository.setStatus(id, STATUS.INACTIVE);
    const updatedSubrole = await SubrolesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: oldSubrole.organization_id,
      mineId: oldSubrole.mine_id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.SUBROLE,
      entityId: Number(id),
      oldData: oldSubrole,
      newData: updatedSubrole,
      ipAddress,
    });

    return { message: 'Subrole deactivated successfully' };
  }
}

export default SubrolesService;
