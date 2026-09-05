import AuthService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const user = await AuthService.register(req.body, ipAddress);
    return ApiResponse.created(res, user, 'User registered successfully');
  });

  static login = asyncHandler(async (req, res) => {
    const { login, password, device_id } = req.body;
    const ip_address = getClientIp(req);
    const user_agent = req.headers['user-agent'] || null;

    const result = await AuthService.login(login, password, {
      device_id,
      ip_address,
      user_agent,
    });

    return ApiResponse.success(res, result, 'Login successful');
  });

  static refresh = asyncHandler(async (req, res) => {
    const { refresh_token, device_id } = req.body;
    const ip_address = getClientIp(req);
    const user_agent = req.headers['user-agent'] || null;

    const result = await AuthService.refresh(refresh_token, {
      device_id,
      ip_address,
      user_agent,
    });

    return ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  static logout = asyncHandler(async (req, res) => {
    const { refresh_token, session_id } = req.body;
    const ipAddress = getClientIp(req);

    const result = await AuthService.logout({
      refreshToken: refresh_token,
      sessionId: session_id,
      userId: req.user?.id,
      ipAddress,
    });

    return ApiResponse.success(res, result, 'Logout successful');
  });

  static getMe = asyncHandler(async (req, res) => {
    const userDetails = await AuthService.getCurrentUser(req.user.id);
    return ApiResponse.success(res, userDetails, 'Profile retrieved successfully');
  });
}

export default AuthController;
