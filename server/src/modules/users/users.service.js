import bcrypt from 'bcryptjs';
import UsersRepository from './users.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class UsersService {
  static async listUsers(pagination, filters) {
    const { total, rows } = await UsersRepository.findAll({
      status: filters.status,
      search: filters.search,
      employee_code: filters.employee_code,
      email: filters.email,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { users: rows, meta };
  }

  static async getUserById(id) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }
    return user;
  }

  static async createUser(data, actor = {}, ipAddress = null) {
    const existing = await UsersRepository.findByUsernameOrEmail(data.username, data.email);
    if (existing) {
      throw ApiError.conflict('A user with this username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const userId = await UsersRepository.create({
      ...data,
      password_hash,
    });

    const createdUser = await UsersRepository.findById(userId);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.USER,
      entityId: userId,
      newData: createdUser,
      ipAddress,
    });

    return createdUser;
  }

  static async updateUser(id, data, actor = {}, ipAddress = null) {
    const oldUser = await this.getUserById(id);

    if (data.username || data.email) {
      const targetUsername = data.username || oldUser.username;
      const targetEmail = data.email || oldUser.email;
      const existing = await UsersRepository.findByUsernameOrEmail(targetUsername, targetEmail);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict('A user with this username or email already exists');
      }
    }

    const updateFields = { ...data };
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password_hash = await bcrypt.hash(data.password, salt);
      delete updateFields.password;
    }

    await UsersRepository.update(id, updateFields);
    const updatedUser = await UsersRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.USER,
      entityId: Number(id),
      oldData: oldUser,
      newData: updatedUser,
      ipAddress,
    });

    return updatedUser;
  }

  static async deleteUser(id, actor = {}, ipAddress = null) {
    const oldUser = await this.getUserById(id);

    await UsersRepository.setStatus(id, STATUS.INACTIVE);
    const updatedUser = await UsersRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.USER,
      entityId: Number(id),
      oldData: oldUser,
      newData: updatedUser,
      ipAddress,
    });

    return { message: 'User deactivated successfully' };
  }

  static async getUserSessions(userId, requestingUser) {
    // If not self, ensure requesting user has USERS_READ or AUDIT permissions
    await this.getUserById(userId);
    const sessions = await UsersRepository.getUserSessions(userId);
    return sessions;
  }
}

export default UsersService;
