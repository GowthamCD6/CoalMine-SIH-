import PermissionsRepository from './permissions.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class PermissionsService {
  static async listPermissions(pagination, filters) {
    const { total, rows } = await PermissionsRepository.findAll({
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { permissions: rows, meta };
  }

  static async getPermissionById(id) {
    const perm = await PermissionsRepository.findById(id);
    if (!perm) {
      throw ApiError.notFound(`Permission with ID ${id} not found`);
    }
    return perm;
  }

  static async createPermission(data, actor = {}, ipAddress = null) {
    const existing = await PermissionsRepository.findByCode(data.code);
    if (existing) {
      throw ApiError.conflict(`Permission with code '${data.code}' already exists`);
    }

    const permId = await PermissionsRepository.create(data);
    const createdPerm = await PermissionsRepository.findById(permId);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.PERMISSION,
      entityId: permId,
      newData: createdPerm,
      ipAddress,
    });

    return createdPerm;
  }

  static async updatePermission(id, data, actor = {}, ipAddress = null) {
    const oldPerm = await this.getPermissionById(id);

    if (data.code && data.code !== oldPerm.code) {
      const existing = await PermissionsRepository.findByCode(data.code);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Permission with code '${data.code}' already exists`);
      }
    }

    await PermissionsRepository.update(id, data);
    const updatedPerm = await PermissionsRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.PERMISSION,
      entityId: Number(id),
      oldData: oldPerm,
      newData: updatedPerm,
      ipAddress,
    });

    return updatedPerm;
  }

  static async deletePermission(id, actor = {}, ipAddress = null) {
    const oldPerm = await this.getPermissionById(id);

    await PermissionsRepository.delete(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.PERMISSION,
      entityId: Number(id),
      oldData: oldPerm,
      ipAddress,
    });

    return { message: 'Permission deleted successfully' };
  }
}

export default PermissionsService;
