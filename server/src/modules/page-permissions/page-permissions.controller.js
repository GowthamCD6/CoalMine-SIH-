import PagePermissionsService from './page-permissions.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class PagePermissionsController {
  static list = asyncHandler(async (req, res) => {
    const result = await PagePermissionsService.getPagePermissions(req.params.pageId);
    return ApiResponse.success(res, result, 'Page permissions retrieved successfully');
  });

  static attach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await PagePermissionsService.attachPermission(
      req.params.pageId,
      req.body.permission_id,
      req.user,
      ipAddress
    );
    return ApiResponse.created(res, result, 'Permission attached to page successfully');
  });

  static detach = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await PagePermissionsService.detachPermission(
      req.params.pageId,
      req.params.permissionId,
      req.user,
      ipAddress
    );
    return ApiResponse.success(res, result, 'Permission detached from page successfully');
  });
}

export default PagePermissionsController;
