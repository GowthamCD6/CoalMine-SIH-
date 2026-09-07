import SubrolesService from './subroles.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class SubrolesController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'status', 'created_at']);
    const filters = {
      role_id: req.query.role_id,
      status: req.query.status,
      search: req.query.search,
    };
    const { subroles, meta } = await SubrolesService.listSubroles(pagination, filters);
    return ApiResponse.success(res, subroles, 'Subroles retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const subrole = await SubrolesService.getSubroleById(req.params.id);
    return ApiResponse.success(res, subrole, 'Subrole details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const subrole = await SubrolesService.createSubrole(req.body, req.user, ipAddress);
    return ApiResponse.created(res, subrole, 'Subrole created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const subrole = await SubrolesService.updateSubrole(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, subrole, 'Subrole updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await SubrolesService.deleteSubrole(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Subrole deactivated successfully');
  });
}

export default SubrolesController;
