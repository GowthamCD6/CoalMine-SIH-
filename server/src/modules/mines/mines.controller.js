import MinesService from './mines.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class MinesController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'name', 'code', 'mine_type', 'status', 'created_at']);
    const filters = {
      organization_id: req.query.organization_id,
      mine_type: req.query.mine_type,
      status: req.query.status,
      search: req.query.search,
    };
    const { mines, meta } = await MinesService.listMines(pagination, filters);
    return ApiResponse.success(res, mines, 'Mines retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const mine = await MinesService.getMineById(req.params.id);
    return ApiResponse.success(res, mine, 'Mine details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const mine = await MinesService.createMine(req.body, req.user, ipAddress);
    return ApiResponse.created(res, mine, 'Mine created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const mine = await MinesService.updateMine(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, mine, 'Mine updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await MinesService.deleteMine(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Mine deactivated successfully');
  });
}

export default MinesController;
