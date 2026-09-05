import db from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUserEffectivePermissions = async (userId) => {
  const sql = `
    SELECT 
      p.id AS permission_id,
      p.code AS permission_code,
      p.name AS permission_name,
      r.organization_id,
      r.mine_id,
      sr.id AS subrole_id,
      sr.name AS subrole_name,
      r.id AS role_id,
      r.name AS role_name,
      'SUBROLE' AS source
    FROM user_subroles usr
    JOIN subroles sr ON usr.subrole_id = sr.id AND sr.status = 'ACTIVE'
    JOIN roles r ON sr.role_id = r.id AND r.status = 'ACTIVE'
    JOIN subrole_permissions srp ON sr.id = srp.subrole_id
    JOIN permissions p ON srp.permission_id = p.id
    WHERE usr.user_id = ?
      AND usr.status = 'ACTIVE'
      AND (usr.expires_at IS NULL OR usr.expires_at > NOW())

    UNION

    SELECT 
      p.id AS permission_id,
      p.code AS permission_code,
      p.name AS permission_name,
      r.organization_id,
      r.mine_id,
      sr.id AS subrole_id,
      sr.name AS subrole_name,
      r.id AS role_id,
      r.name AS role_name,
      'ROLE' AS source
    FROM user_subroles usr
    JOIN subroles sr ON usr.subrole_id = sr.id AND sr.status = 'ACTIVE'
    JOIN roles r ON sr.role_id = r.id AND r.status = 'ACTIVE'
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE usr.user_id = ?
      AND usr.status = 'ACTIVE'
      AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
  `;

  const [rows] = await db.query(sql, [userId, userId]);
  return rows;
};

export const requirePermission = (permissionCode, options = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Cache resolved permissions on req for this request lifecycle
    if (!req.resolvedPermissions) {
      req.resolvedPermissions = await getUserEffectivePermissions(req.user.id);
    }

    const permissions = req.resolvedPermissions;

    // Filter permissions matching the required permission code or superadmin '*'
    const matching = permissions.filter(
      (p) => p.permission_code === permissionCode || p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
    );

    if (matching.length === 0) {
      throw ApiError.forbidden(`Missing required permission: ${permissionCode}`);
    }

    // Check scope if required
    const scopeType = options.scope; // 'organization' | 'mine' | undefined
    if (scopeType) {
      let targetOrgId = options.getOrganizationId 
        ? options.getOrganizationId(req) 
        : (req.params?.organization_id || req.params?.organizationId || req.params?.id || req.body?.organization_id || req.query?.organization_id);
      let targetMineId = options.getMineId 
        ? options.getMineId(req) 
        : (req.params?.mine_id || req.params?.mineId || (scopeType === 'mine' ? req.params?.id : null) || req.body?.mine_id || req.query?.mine_id);

      if (scopeType === 'organization' && targetOrgId) {
        targetOrgId = Number(targetOrgId);
        const hasOrgAccess = matching.some((p) => Number(p.organization_id) === targetOrgId);
        if (!hasOrgAccess) {
          throw ApiError.forbidden(`Permission '${permissionCode}' is not granted for organization ID ${targetOrgId}`);
        }
      }

      if (scopeType === 'mine' && targetMineId) {
        targetMineId = Number(targetMineId);
        // Find mine's org to check org-level inheritance
        const [mineRows] = await db.query('SELECT organization_id FROM mines WHERE id = ?', [targetMineId]);
        const mineOrgId = mineRows && mineRows[0] ? Number(mineRows[0].organization_id) : null;

        const hasMineAccess = matching.some((p) => {
          // If permission is role/subrole specifically on this mine
          if (p.mine_id && Number(p.mine_id) === targetMineId) return true;
          // If permission is organization-wide (mine_id IS NULL) on the mine's parent org
          if (!p.mine_id && mineOrgId && Number(p.organization_id) === mineOrgId) return true;
          return false;
        });

        if (!hasMineAccess) {
          throw ApiError.forbidden(`Permission '${permissionCode}' is not granted for mine ID ${targetMineId}`);
        }
      }
    }

    next();
  });
};

export default {
  getUserEffectivePermissions,
  requirePermission,
};
