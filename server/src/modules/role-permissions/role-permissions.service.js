import RolePermissionsRepository from './role-permissions.repository.js';
import RolesRepository from '../roles/roles.repository.js';
import PermissionsRepository from '../permissions/permissions.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class RolePermissionsService {
  static async getRolePermissions(roleId) {
    const role = await RolesRepository.findById(roleId);
    if (!role) {
      throw ApiError.notFound(`Role with ID ${roleId} not found`);
    }

    const permissions = await RolePermissionsRepository.findByRoleId(roleId);
    return { role, permissions };
  }

  static async attachPermission(roleId, permissionId, actor = {}, ipAddress = null) {
    const role = await RolesRepository.findById(roleId);
    if (!role) {
      throw ApiError.notFound(`Role with ID ${roleId} not found`);
    }

    const permission = await PermissionsRepository.findById(permissionId);
    if (!permission) {
      throw ApiError.notFound(`Permission with ID ${permissionId} not found`);
    }

    const existing = await RolePermissionsRepository.findMapping(roleId, permissionId);
    if (existing) {
      throw ApiError.conflict('This permission is already assigned to the role');
    }

    const id = await RolePermissionsRepository.attach(roleId, permissionId);

    await logAudit({
      userId: actor.id,
      organizationId: role.organization_id,
      mineId: role.mine_id,
      action: AUDIT_ACTION.ASSIGN,
      entityType: ENTITY_TYPE.ROLE_PERMISSION,
      entityId: id,
      newData: { role_id: roleId, permission_id: permissionId, permission_code: permission.code },
      ipAddress,
    });

    return {
      id,
      role_id: Number(roleId),
      permission_id: Number(permissionId),
      permission_code: permission.code,
      permission_name: permission.name,
    };
  }

  static async detachPermission(roleId, permissionId, actor = {}, ipAddress = null) {
    const role = await RolesRepository.findById(roleId);
    if (!role) {
      throw ApiError.notFound(`Role with ID ${roleId} not found`);
    }

    const existing = await RolePermissionsRepository.findMapping(roleId, permissionId);
    if (!existing) {
      throw ApiError.notFound('Permission is not assigned to this role');
    }

    await RolePermissionsRepository.detach(roleId, permissionId);

    await logAudit({
      userId: actor.id,
      organizationId: role.organization_id,
      mineId: role.mine_id,
      action: AUDIT_ACTION.UNASSIGN,
      entityType: ENTITY_TYPE.ROLE_PERMISSION,
      entityId: existing.id,
      oldData: existing,
      ipAddress,
    });

    return { message: 'Permission detached from role successfully' };
  }
}

export default RolePermissionsService;
