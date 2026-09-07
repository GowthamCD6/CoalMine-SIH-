import UserSubrolesService from './user-subroles.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class UserSubrolesController {
  static listUserSubroles = asyncHandler(async (req, res) => {
    const result = await UserSubrolesService.getUserSubroles(req.params.userId);
    return ApiResponse.success(res, result, "User's subroles retrieved successfully");
  });

  static listSubroleUsers = asyncHandler(async (req, res) => {
    const result = await UserSubrolesService.getSubroleUsers(req.params.subroleId);
    return ApiResponse.success(res, result, 'Subrole users retrieved successfully');
  });

  static assign = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await UserSubrolesService.assignSubrole(
      req.params.userId,
      req.body,
      req.user,
      ipAddress
    );
    return ApiResponse.created(res, result, 'Subrole assigned to user successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await UserSubrolesService.updateAssignment(
      req.params.userId,
      req.params.subroleId,
      req.body,
      req.user,
      ipAddress
    );
    return ApiResponse.success(res, result, 'Subrole assignment updated successfully');
  });

  static unassign = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await UserSubrolesService.unassignSubrole(
      req.params.userId,
      req.params.subroleId,
      req.user,
      ipAddress
    );
    return ApiResponse.success(res, result, 'Subrole assignment revoked successfully');
  });
}

export default UserSubrolesController;
