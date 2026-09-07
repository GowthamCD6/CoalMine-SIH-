import UserSessionsService from './user-sessions.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class UserSessionsController {
  static getById = asyncHandler(async (req, res) => {
    const session = await UserSessionsService.getSessionById(req.params.id);
    return ApiResponse.success(res, session, 'Session retrieved successfully');
  });

  static revoke = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await UserSessionsService.revokeSession(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Session revoked successfully');
  });
}

export default UserSessionsController;
