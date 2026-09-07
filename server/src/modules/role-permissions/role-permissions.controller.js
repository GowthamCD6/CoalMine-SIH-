import RolePermissionsService from './role-permissions.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class RolePermissionsController {
  static list = asyncHandler(async (req, res) => {
    const result = await RolePermissionsService.getRolePermissions(req.params.roleId);
    return ApiResponse.success(res, result, 'Role permissions retrieved successfully');
  });

  static attach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await RolePermissionsService.attachPermission(
      req.params.roleId,
      req.body.permission_id,
      req.user,
      ipAddress
    );
    return ApiResponse.created(res, result, 'Permission attached to role successfully');
  });

  static detach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await RolePermissionsService.detachPermission(
      req.params.roleId,
      req.params.permissionId,
      req.user,
      ipAddress
    );
    return ApiResponse.success(res, result, 'Permission detached from role successfully');
  });
}

export default RolePermissionsController;
