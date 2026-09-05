import RolesRepository from './roles.repository.js';
import OrganizationsRepository from '../organizations/organizations.repository.js';
import MinesRepository from '../mines/mines.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class RolesService {
  static async listRoles(pagination, filters) {
    const { total, rows } = await RolesRepository.findAll({
      organization_id: filters.organization_id,
      mine_id: filters.mine_id,
      status: filters.status,
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { roles: rows, meta };
  }

  static async getRoleById(id) {
    const role = await RolesRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(`Role with ID ${id} not found`);
    }
    return role;
  }

  static async createRole(data, actor = {}, ipAddress = null) {
    // Validate organization
    const org = await OrganizationsRepository.findById(data.organization_id);
    if (!org) {
      throw ApiError.badRequest(`Organization with ID ${data.organization_id} does not exist`);
    }

    // Validate mine if provided
    if (data.mine_id) {
      const mine = await MinesRepository.findById(data.mine_id);
      if (!mine) {
        throw ApiError.badRequest(`Mine with ID ${data.mine_id} does not exist`);
      }
      if (Number(mine.organization_id) !== Number(data.organization_id)) {
        throw ApiError.badRequest(`Mine with ID ${data.mine_id} does not belong to organization ID ${data.organization_id}`);
      }
    }

    const existing = await RolesRepository.findByScopeAndCode(data.organization_id, data.mine_id || null, data.code);
    if (existing) {
      throw ApiError.conflict(`Role with code '${data.code}' already exists in this scope`);
    }

    const roleId = await RolesRepository.create(data);
    const createdRole = await RolesRepository.findById(roleId);

    await logAudit({
      userId: actor.id,
      organizationId: data.organization_id,
      mineId: data.mine_id || null,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.ROLE,
      entityId: roleId,
      newData: createdRole,
      ipAddress,
    });

    return createdRole;
  }

  static async updateRole(id, data, actor = {}, ipAddress = null) {
    const oldRole = await this.getRoleById(id);

    const targetOrgId = data.organization_id || oldRole.organization_id;
    const targetMineId = data.mine_id !== undefined ? data.mine_id : oldRole.mine_id;

    if (data.organization_id && data.organization_id !== oldRole.organization_id) {
      const org = await OrganizationsRepository.findById(data.organization_id);
      if (!org) {
        throw ApiError.badRequest(`Organization with ID ${data.organization_id} does not exist`);
      }
    }

    if (targetMineId) {
      const mine = await MinesRepository.findById(targetMineId);
      if (!mine) {
        throw ApiError.badRequest(`Mine with ID ${targetMineId} does not exist`);
      }
      if (Number(mine.organization_id) !== Number(targetOrgId)) {
        throw ApiError.badRequest(`Mine with ID ${targetMineId} does not belong to organization ID ${targetOrgId}`);
      }
    }

    const targetCode = data.code || oldRole.code;
    if (data.code || data.organization_id || data.mine_id !== undefined) {
      const existing = await RolesRepository.findByScopeAndCode(targetOrgId, targetMineId, targetCode);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Role with code '${targetCode}' already exists in this scope`);
      }
    }

    await RolesRepository.update(id, data);
    const updatedRole = await RolesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: updatedRole.organization_id,
      mineId: updatedRole.mine_id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.ROLE,
      entityId: Number(id),
      oldData: oldRole,
      newData: updatedRole,
      ipAddress,
    });

    return updatedRole;
  }

  static async deleteRole(id, actor = {}, ipAddress = null) {
    const oldRole = await this.getRoleById(id);

    await RolesRepository.setStatus(id, STATUS.INACTIVE);
    const updatedRole = await RolesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: oldRole.organization_id,
      mineId: oldRole.mine_id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.ROLE,
      entityId: Number(id),
      oldData: oldRole,
      newData: updatedRole,
      ipAddress,
    });

    return { message: 'Role deactivated successfully' };
  }
}

export default RolesService;
