import db from '../config/db.js';
import logger from '../utils/logger.js';

export const logAudit = async ({
  userId = null,
  organizationId = null,
  mineId = null,
  action,
  entityType = null,
  entityId = null,
  oldData = null,
  newData = null,
  ipAddress = null,
}) => {
  try {
    const sql = `
      INSERT INTO audit_logs (
        user_id, organization_id, mine_id, action, entity_type, entity_id, old_data, new_data, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      organizationId,
      mineId,
      action,
      entityType,
      entityId,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
      ipAddress,
    ];

    await db.query(sql, params);
  } catch (error) {
    logger.error('Failed to create audit log entry:', { error: error.message, action, entityType, entityId });
    // Non-blocking for client request, but logged
  }
};

export const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || null;
};

export default {
  logAudit,
  getClientIp,
};
