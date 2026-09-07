import UserSubrolesRepository from './user-subroles.repository.js';
import UsersRepository from '../users/users.repository.js';
import SubrolesRepository from '../subroles/subroles.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class UserSubrolesService {
  static async getUserSubroles(userId) {
    const user = await UsersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(`User with ID ${userId} not found`);
    }

    const subroles = await UserSubrolesRepository.findUserSubroles(userId);
    return { user, subroles };
  }

  static async getSubroleUsers(subroleId) {
    const subrole = await SubrolesRepository.findById(subroleId);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${subroleId} not found`);
    }

    const users = await UserSubrolesRepository.findSubroleUsers(subroleId);
    return { subrole, users };
  }

  static async assignSubrole(userId, data, actor = {}, ipAddress = null) {
    const user = await UsersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(`User with ID ${userId} not found`);
    }

    const subrole = await SubrolesRepository.findById(data.subrole_id);
    if (!subrole) {
      throw ApiError.notFound(`Subrole with ID ${data.subrole_id} not found`);
    }

    const oldMapping = await UserSubrolesRepository.findMapping(userId, data.subrole_id);

    await UserSubrolesRepository.assign({
      user_id: Number(userId),
      subrole_id: Number(data.subrole_id),
      assigned_by: actor.id || null,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
      status: data.status || STATUS.ACTIVE,
    });

    const newMapping = await UserSubrolesRepository.findMapping(userId, data.subrole_id);

    await logAudit({
      userId: actor.id,
      organizationId: subrole.organization_id,
      mineId: subrole.mine_id,
      action: AUDIT_ACTION.ASSIGN,
      entityType: ENTITY_TYPE.USER_SUBROLE,
      entityId: newMapping.id,
      oldData: oldMapping,
      newData: newMapping,
      ipAddress,
    });

    return newMapping;
  }

  static async updateAssignment(userId, subroleId, data, actor = {}, ipAddress = null) {
    const mapping = await UserSubrolesRepository.findMapping(userId, subroleId);
    if (!mapping) {
      throw ApiError.notFound('Subrole assignment for this user does not exist');
    }

    const subrole = await SubrolesRepository.findById(subroleId);

    const updateFields = { ...data };
    if (data.expires_at !== undefined) {
      updateFields.expires_at = data.expires_at ? new Date(data.expires_at) : null;
    }

    await UserSubrolesRepository.update(userId, subroleId, updateFields);
    const updatedMapping = await UserSubrolesRepository.findMapping(userId, subroleId);

    await logAudit({
      userId: actor.id,
      organizationId: subrole?.organization_id,
      mineId: subrole?.mine_id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.USER_SUBROLE,
      entityId: mapping.id,
      oldData: mapping,
      newData: updatedMapping,
      ipAddress,
    });

    return updatedMapping;
  }

  static async unassignSubrole(userId, subroleId, actor = {}, ipAddress = null) {
    const mapping = await UserSubrolesRepository.findMapping(userId, subroleId);
    if (!mapping) {
      throw ApiError.notFound('Subrole assignment for this user does not exist');
    }

    const subrole = await SubrolesRepository.findById(subroleId);

    await UserSubrolesRepository.setStatus(userId, subroleId, STATUS.INACTIVE);
    const updatedMapping = await UserSubrolesRepository.findMapping(userId, subroleId);

    await logAudit({
      userId: actor.id,
      organizationId: subrole?.organization_id,
      mineId: subrole?.mine_id,
      action: AUDIT_ACTION.UNASSIGN,
      entityType: ENTITY_TYPE.USER_SUBROLE,
      entityId: mapping.id,
      oldData: mapping,
      newData: updatedMapping,
      ipAddress,
    });

    return { message: 'Subrole assignment revoked successfully' };
  }
}

export default UserSubrolesService;
