import OrganizationsService from './organizations.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class OrganizationsController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'status', 'created_at']);
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };
    const { organizations, meta } = await OrganizationsService.listOrganizations(pagination, filters);
    return ApiResponse.success(res, organizations, 'Organizations retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const org = await OrganizationsService.getOrganizationById(req.params.id);
    return ApiResponse.success(res, org, 'Organization details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const org = await OrganizationsService.createOrganization(req.body, req.user, ipAddress);
    return ApiResponse.created(res, org, 'Organization created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const org = await OrganizationsService.updateOrganization(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, org, 'Organization updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await OrganizationsService.deleteOrganization(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Organization deactivated successfully');
  });
}

export default OrganizationsController;
