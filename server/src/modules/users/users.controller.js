import UsersService from './users.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class UsersController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'username', 'email', 'employee_code', 'status', 'created_at', 'last_login_at']);
    const filters = {
      status: req.query.status,
      search: req.query.search,
      employee_code: req.query.employee_code,
      email: req.query.email,
    };
    const { users, meta } = await UsersService.listUsers(pagination, filters);
    return ApiResponse.success(res, users, 'Users retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const user = await UsersService.getUserById(req.params.id);
    return ApiResponse.success(res, user, 'User details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const user = await UsersService.createUser(req.body, req.user, ipAddress);
    return ApiResponse.created(res, user, 'User created successfully');
  });

  static update = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const user = await UsersService.updateUser(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, user, 'User updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await UsersService.deleteUser(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'User deactivated successfully');
  });

  static getUserSessions = asyncHandler(async (req, res) => {
    const sessions = await UsersService.getUserSessions(req.params.id, req.user);
    return ApiResponse.success(res, sessions, 'User sessions retrieved successfully');
  });
}

export default UsersController;
