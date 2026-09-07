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

  try {
    const [rows] = await db.query(sql, [userId, userId]);
    return rows || [];
  } catch (err) {
    console.error('⚠️ [RBAC] Failed to fetch user effective permissions:', err.message);
    return [];
  }
};

/**
 * Derives the data scope for a user based on their active subrole assignments.
 * Returns: { is_super_admin, org_ids, mine_ids, is_regulatory }
 *
 * - is_super_admin: true if user has '*' or 'ALL_PERMISSIONS' permission
 * - org_ids: list of organization IDs the user has access to (org-level roles)
 * - mine_ids: list of mine IDs the user has direct access to (mine-level roles)
 *   For org-level users, mine_ids is expanded to all mines within permitted orgs
 * - is_regulatory: true if the role has no org_id and no mine_id (platform/regulatory scope)
 */
export const getScopeForUser = async (userId) => {
  const permissions = await getUserEffectivePermissions(userId);

  const isSuperAdmin = permissions.some(
    (p) => p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
  );

  if (isSuperAdmin) {
    return { is_super_admin: true, org_ids: [], mine_ids: [], is_regulatory: false };
  }

  const orgIds = new Set();
  const explicitMineIds = new Set();
  let isRegulatory = false;

  for (const p of permissions) {
    if (!p.organization_id && !p.mine_id) {
      isRegulatory = true;
    }
    if (p.organization_id) orgIds.add(Number(p.organization_id));
    if (p.mine_id) explicitMineIds.add(Number(p.mine_id));
  }

  // Expand org-level users: fetch all mines belonging to permitted orgs
  let expandedMineIds = [...explicitMineIds];
  if (orgIds.size > 0) {
    try {
      const orgIdList = [...orgIds];
      const placeholders = orgIdList.map(() => '?').join(',');
      const [mineRows] = await db.query(
        `SELECT id FROM mines WHERE organization_id IN (${placeholders}) AND status = 'ACTIVE'`,
        orgIdList
      );
      mineRows.forEach((m) => expandedMineIds.push(Number(m.id)));
    } catch (err) {
      console.error('⚠️ [RBAC] Failed to expand org mine IDs:', err.message);
    }
  }

  // Deduplicate
  expandedMineIds = [...new Set(expandedMineIds)];

  return {
    is_super_admin: false,
    org_ids: [...orgIds],
    mine_ids: expandedMineIds,
    is_regulatory: isRegulatory,
  };
};

/**
 * Middleware: injects req.scope into every authenticated request.
 * Must be used AFTER authenticate middleware.
 * Caches scope on req to avoid repeated DB calls per request.
 */
export const injectScope = asyncHandler(async (req, res, next) => {
  if (req.user && !req.scope) {
    req.scope = await getScopeForUser(req.user.id);
  }
  next();
});

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

    // Check if user has global superadmin wildcard '*' or 'ALL_PERMISSIONS'
    const isGlobalSuperAdmin = permissions.some(
      (p) => p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
    );

    if (isGlobalSuperAdmin) {
      return next();
    }

    // Filter permissions matching the required permission code
    const matching = permissions.filter((p) => p.permission_code === permissionCode);

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
  getScopeForUser,
  injectScope,
  requirePermission,
};
