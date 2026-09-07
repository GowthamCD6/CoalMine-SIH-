import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import db from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is required');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Invalid authorization header format');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired', [], 'TOKEN_EXPIRED');
    }
    throw new ApiError(401, 'Invalid access token', [], 'INVALID_TOKEN');
  }

  // Check if user exists and is active in DB
  const [users] = await db.query(
    'SELECT id, username, email, first_name, last_name, employee_code, status FROM users WHERE id = ?',
    [decoded.userId]
  );

  if (!users || users.length === 0) {
    throw ApiError.unauthorized('User associated with token no longer exists');
  }

  const user = users[0];
  req.user = user;
  next();
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, employee_code, status FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (users && users.length > 0 && users[0].status === 'ACTIVE') {
      req.user = users[0];
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
});

export default authenticate;

