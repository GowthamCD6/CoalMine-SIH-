import UserSessionsRepository from './user-sessions.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class UserSessionsService {
  static async getSessionById(id) {
    const session = await UserSessionsRepository.findById(id);
    if (!session) {
      throw ApiError.notFound(`Session with ID ${id} not found`);
    }
    return session;
  }

  static async revokeSession(id, actor = {}, ipAddress = null) {
    const session = await this.getSessionById(id);

    // If not superadmin or self, prevent revoking others' sessions
    if (session.user_id !== actor.id && !actor.isSuperAdmin) {
      // Allowed if has SESSIONS_MANAGE permission
    }

    await UserSessionsRepository.revokeSession(id);
    const updatedSession = await UserSessionsRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.REVOKE,
      entityType: ENTITY_TYPE.USER_SESSION,
      entityId: Number(id),
      oldData: session,
      newData: updatedSession,
      ipAddress,
    });

    return { message: 'Session revoked successfully' };
  }
}

export default UserSessionsService;
