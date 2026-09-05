import PermissionsService from './permissions.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class PermissionsController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'created_at']);
    const filters = {
      search: req.query.search,
    };
    const { permissions, meta } = await PermissionsService.listPermissions(pagination, filters);
    return ApiResponse.success(res, permissions, 'Permissions retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const perm = await PermissionsService.getPermissionById(req.params.id);
    return ApiResponse.success(res, perm, 'Permission details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const perm = await PermissionsService.createPermission(req.body, req.user, ipAddress);
    return ApiResponse.created(res, perm, 'Permission created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const perm = await PermissionsService.updatePermission(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, perm, 'Permission updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await PermissionsService.deletePermission(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Permission deleted successfully');
  });
}

export default PermissionsController;
