import SubrolePermissionsRepository from './subrole-permissions.repository.js';
import SubrolesRepository from '../subroles/subroles.repository.js';
import PermissionsRepository from '../permissions/permissions.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class SubrolePermissionsService {
  static async getSubrolePermissions(subroleId) {
    const subrole = await SubrolesRepository.findById(subroleId);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${subroleId} not found`);
    }

    const permissions = await SubrolePermissionsRepository.findBySubroleId(subroleId);
    return { subrole, permissions };
  }

  static async attachPermission(subroleId, permissionId, actor = {}, ipAddress = null) {
    const subrole = await SubrolesRepository.findById(subroleId);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${subroleId} not found`);
    }

    const permission = await PermissionsRepository.findById(permissionId);
    if (!permission) {
      throw ApiError.notFound(`Permission with ID ${permissionId} not found`);
    }

    const existing = await SubrolePermissionsRepository.findMapping(subroleId, permissionId);
    if (existing) {
      throw ApiError.conflict('This permission is already assigned to the subrole');
    }

    const id = await SubrolePermissionsRepository.attach(subroleId, permissionId);

    await logAudit({
      userId: actor.id,
      organizationId: subrole.organization_id,
      mineId: subrole.mine_id,
      action: AUDIT_ACTION.ASSIGN,
      entityType: ENTITY_TYPE.SUBROLE_PERMISSION,
      entityId: id,
      newData: { subrole_id: subroleId, permission_id: permissionId, permission_code: permission.code },
      ipAddress,
    });

    return {
      id,
      subrole_id: Number(subroleId),
      permission_id: Number(permissionId),
      permission_code: permission.code,
      permission_name: permission.name,
    };
  }

  static async detachPermission(subroleId, permissionId, actor = {}, ipAddress = null) {
    const subrole = await SubrolesRepository.findById(subroleId);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${subroleId} not found`);
    }

    const existing = await SubrolePermissionsRepository.findMapping(subroleId, permissionId);
    if (!existing) {
      throw ApiError.notFound('Permission is not assigned to this subrole');
    }

    await SubrolePermissionsRepository.detach(subroleId, permissionId);

    await logAudit({
      userId: actor.id,
      organizationId: subrole.organization_id,
      mineId: subrole.mine_id,
      action: AUDIT_ACTION.UNASSIGN,
      entityType: ENTITY_TYPE.SUBROLE_PERMISSION,
      entityId: existing.id,
      oldData: existing,
      ipAddress,
    });

    return { message: 'Permission detached from subrole successfully' };
  }
}

export default SubrolePermissionsService;
