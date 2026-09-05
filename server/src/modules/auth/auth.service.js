import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../../config/env.js';
import AuthRepository from './auth.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { getUserEffectivePermissions } from '../../middlewares/rbac.middleware.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const parseDurationToMs = (durationStr) => {
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 's') return val * 1000;
  if (unit === 'm') return val * 60 * 1000;
  if (unit === 'h') return val * 60 * 60 * 1000;
  if (unit === 'd') return val * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
};

export class AuthService {
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, salt: crypto.randomBytes(16).toString('hex') },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  static async register(userData, ipAddress = null) {
    const existing = await AuthRepository.findUserByEmailOrUsername(userData.email);
    if (existing) {
      throw ApiError.conflict('A user with this email or username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    const userId = await AuthRepository.createUser({
      ...userData,
      password_hash,
    });

    await logAudit({
      userId,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.USER,
      entityId: userId,
      newData: { id: userId, username: userData.username, email: userData.email },
      ipAddress,
    });

    const user = await AuthRepository.findUserById(userId);
    return user;
  }

  static async login(login, password, meta = {}) {
    const { device_id, ip_address, user_agent } = meta;
    const user = await AuthRepository.findUserByEmailOrUsername(login);

    if (!user) {
      throw ApiError.unauthorized('Invalid login credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw ApiError.forbidden('User account is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid login credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id);
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRY));

    await AuthRepository.createSession({
      user_id: user.id,
      refresh_token_hash: tokenHash,
      device_id,
      ip_address,
      user_agent,
      expires_at: expiresAt,
    });

    await AuthRepository.updateLastLogin(user.id);

    await logAudit({
      userId: user.id,
      action: AUDIT_ACTION.LOGIN,
      entityType: ENTITY_TYPE.USER_SESSION,
      newData: { device_id, ip_address, user_agent },
      ipAddress: ip_address,
    });

    const { password_hash, ...sanitizedUser } = user;

    return {
      user: sanitizedUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRY,
      },
    };
  }

  static async refresh(refreshToken, meta = {}) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const session = await AuthRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw ApiError.unauthorized('Refresh token session has been revoked or expired');
    }

    // Revoke old session (Rotation)
    await AuthRepository.revokeSession(session.id);

    // Issue new token pair
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(decoded.userId);
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRY));

    await AuthRepository.createSession({
      user_id: decoded.userId,
      refresh_token_hash: newTokenHash,
      device_id: meta.device_id || session.device_id,
      ip_address: meta.ip_address || session.ip_address,
      user_agent: meta.user_agent || session.user_agent,
      expires_at: expiresAt,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRY,
      },
    };
  }

  static async logout({ refreshToken, sessionId, userId, ipAddress }) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await AuthRepository.revokeSessionByTokenHash(tokenHash);
    } else if (sessionId) {
      await AuthRepository.revokeSession(sessionId);
    }

    await logAudit({
      userId,
      action: AUDIT_ACTION.LOGOUT,
      entityType: ENTITY_TYPE.USER_SESSION,
      newData: { sessionId },
      ipAddress,
    });

    return { message: 'Logged out successfully' };
  }

  static async getCurrentUser(userId) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const subroles = await AuthRepository.getUserSubrolesWithScope(userId);
    const permissions = await getUserEffectivePermissions(userId);

    return {
      ...user,
      subroles,
      permissions,
    };
  }
}

export default AuthService;
