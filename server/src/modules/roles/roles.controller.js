import RolesService from './roles.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class RolesController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'status', 'created_at']);
    const filters = {
      organization_id: req.query.organization_id,
      mine_id: req.query.mine_id,
      status: req.query.status,
      search: req.query.search,
    };
    const { roles, meta } = await RolesService.listRoles(pagination, filters);
    return ApiResponse.success(res, roles, 'Roles retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const role = await RolesService.getRoleById(req.params.id);
    return ApiResponse.success(res, role, 'Role details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const role = await RolesService.createRole(req.body, req.user, ipAddress);
    return ApiResponse.created(res, role, 'Role created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const role = await RolesService.updateRole(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, role, 'Role updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await RolesService.deleteRole(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Role deactivated successfully');
  });
}

export default RolesController;
