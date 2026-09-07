import PagesService from './pages.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class PagesController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'sort_order', 'status', 'created_at']);
    const filters = {
      status: req.query.status,
      parent_id: req.query.parent_id !== undefined ? (req.query.parent_id === 'null' ? null : Number(req.query.parent_id)) : undefined,
      type: req.query.type,
      search: req.query.search,
    };
    const { pages, meta } = await PagesService.listPages(pagination, filters);
    return ApiResponse.success(res, pages, 'Pages retrieved successfully', 200, meta);
  });

  static getTree = asyncHandler(async (req, res) => {
    const tree = await PagesService.getPageTreeForUser(req.user.id);
    return ApiResponse.success(res, tree, 'Hierarchical menu tree retrieved successfully');
  });

  static getById = asyncHandler(async (req, res) => {
    const page = await PagesService.getPageById(req.params.id);
    return ApiResponse.success(res, page, 'Page details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const page = await PagesService.createPage(req.body, req.user, ipAddress);
    return ApiResponse.created(res, page, 'Page created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const page = await PagesService.updatePage(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, page, 'Page updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await PagesService.deletePage(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Page deactivated successfully');
  });
}

export default PagesController;
