import SubrolePermissionsService from './subrole-permissions.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class SubrolePermissionsController {
  static list = asyncHandler(async (req, res) => {
    const result = await SubrolePermissionsService.getSubrolePermissions(req.params.subroleId);
    return ApiResponse.success(res, result, 'Subrole permissions retrieved successfully');
  });

  static attach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await SubrolePermissionsService.attachPermission(
      req.params.subroleId,
      req.body.permission_id,
      req.user,
      ipAddress
    );
    return ApiResponse.created(res, result, 'Permission attached to subrole successfully');
  });

  static detach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await SubrolePermissionsService.detachPermission(
      req.params.subroleId,
      req.params.permissionId,
      req.user,
      ipAddress
    );
    return ApiResponse.success(res, result, 'Permission detached from subrole successfully');
  });
}

export default SubrolePermissionsController;
