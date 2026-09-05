import express from 'express';
import db from '../../config/db.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { getUserEffectivePermissions } from '../../middlewares/rbac.middleware.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const delegationRouter = express.Router();

delegationRouter.use(authenticate);

const handleDelegationScope = asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const permissions = await getUserEffectivePermissions(actorId);

    const isGlobalSuperAdmin = permissions.some(
      (p) => p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
    );

    const canManageRoles = isGlobalSuperAdmin || permissions.some(
      (p) => p.permission_code === 'USERS_MANAGE_ROLES'
    );

    // Determine actor's scope
    let actorLevel = 'STAFF';
    let actorOrgId = null;
    let actorMineId = null;

    if (isGlobalSuperAdmin) {
      actorLevel = 'SUPERADMIN';
    } else if (canManageRoles) {
      const managePerms = permissions.filter((p) => p.permission_code === 'USERS_MANAGE_ROLES');
      const minePerm = managePerms.find((p) => p.mine_id);
      if (minePerm) {
        actorLevel = 'MINE_ADMIN';
        actorMineId = minePerm.mine_id;
        actorOrgId = minePerm.organization_id;
      } else {
        const orgPerm = managePerms.find((p) => p.organization_id);
        if (orgPerm) {
          actorLevel = 'ORG_ADMIN';
          actorOrgId = orgPerm.organization_id;
        } else {
          actorLevel = 'LIMITED_ADMIN';
        }
      }
    }

    // Fetch all users with their current role mappings
    const [allUsers] = await db.query(
      `SELECT id, username, email, first_name, last_name, employee_code, status, last_login_at
       FROM users ORDER BY id ASC`
    );

    const [userRoles] = await db.query(`
      SELECT 
        usr.user_id,
        sr.id AS subrole_id,
        sr.name AS subrole_name,
        sr.code AS subrole_code,
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,
        r.organization_id,
        r.mine_id,
        o.name AS organization_name,
        m.name AS mine_name
      FROM user_subroles usr
      JOIN subroles sr ON usr.subrole_id = sr.id AND sr.status = 'ACTIVE'
      JOIN roles r ON sr.role_id = r.id AND r.status = 'ACTIVE'
      LEFT JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN mines m ON r.mine_id = m.id
      WHERE usr.status = 'ACTIVE'
        AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
    `);

    // Fetch subroles actor is authorized to grant
    let subrolesQuery = `
      SELECT sr.id, sr.name, sr.code, r.name AS role_name, r.organization_id, r.mine_id, o.name AS organization_name, m.name AS mine_name
      FROM subroles sr
      JOIN roles r ON sr.role_id = r.id
      LEFT JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN mines m ON r.mine_id = m.id
      WHERE sr.status = 'ACTIVE'
    `;
    const queryParams = [];

    if (!isGlobalSuperAdmin) {
      if (actorLevel === 'ORG_ADMIN' && actorOrgId) {
        subrolesQuery += ` AND r.organization_id = ?`;
        queryParams.push(actorOrgId);
      } else if (actorLevel === 'MINE_ADMIN' && actorMineId) {
        subrolesQuery += ` AND r.mine_id = ?`;
        queryParams.push(actorMineId);
      } else {
        subrolesQuery += ` AND 1 = 0`; // No subroles assignable
      }
    }

    const [assignableSubroles] = await db.query(subrolesQuery, queryParams);

    // Group user role mappings by user_id
    const userRoleMap = {};
    userRoles.forEach((ur) => {
      if (!userRoleMap[ur.user_id]) userRoleMap[ur.user_id] = [];
      userRoleMap[ur.user_id].push(ur);
    });

    // Evaluate each user
    const evaluatedUsers = allUsers.map((user) => {
      const roles = userRoleMap[user.id] || [];
      const isSelf = user.id === actorId;

      let isManageable = false;
      let isSubordinate = false;
      let reason = '';

      if (isSelf) {
        isManageable = false;
        reason = 'Cannot delegate access to yourself';
      } else if (!canManageRoles) {
        isManageable = false;
        reason = 'You do not have USERS_MANAGE_ROLES authority';
      } else if (actorLevel === 'SUPERADMIN') {
        const isTargetSuperAdmin = roles.some((r) => r.role_code === 'SUPER_ADMIN');
        if (isTargetSuperAdmin) {
          isManageable = false;
          reason = 'Target is a Peer Global Superadmin';
        } else {
          isManageable = true;
          isSubordinate = true;
          reason = 'Manageable by Global Superadmin';
        }
      } else if (actorLevel === 'ORG_ADMIN') {
        const isTargetSuper = roles.some((r) => r.role_code === 'SUPER_ADMIN');
        const isTargetOrgAdmin = roles.some((r) => r.role_code?.includes('ORG_ADMIN'));
        const belongsToOtherOrg = roles.some(
          (r) => r.organization_id && Number(r.organization_id) !== Number(actorOrgId)
        );

        if (isTargetSuper) {
          isManageable = false;
          reason = 'Target has higher rank (Superadmin)';
        } else if (isTargetOrgAdmin) {
          isManageable = false;
          reason = 'Target has equal rank (Org Admin)';
        } else if (belongsToOtherOrg) {
          isManageable = false;
          reason = 'Target belongs to another Organization';
        } else {
          isManageable = true;
          isSubordinate = true;
          reason = `Subordinate user under your Organization (Org #${actorOrgId})`;
        }
      } else if (actorLevel === 'MINE_ADMIN') {
        const isTargetSuper = roles.some((r) => r.role_code === 'SUPER_ADMIN');
        const isTargetOrg = roles.some((r) => r.role_code?.includes('ORG_ADMIN'));
        const isTargetMineAdmin = roles.some((r) => r.role_code?.includes('MINE_ADMIN'));
        const belongsToOtherMine = roles.some(
          (r) => r.mine_id && Number(r.mine_id) !== Number(actorMineId)
        );

        if (isTargetSuper || isTargetOrg) {
          isManageable = false;
          reason = 'Target has higher rank than Mine Admin';
        } else if (isTargetMineAdmin) {
          isManageable = false;
          reason = 'Target has equal rank (Mine Admin)';
        } else if (belongsToOtherMine) {
          isManageable = false;
          reason = 'Target belongs to another Mine';
        } else {
          isManageable = true;
          isSubordinate = true;
          reason = `Subordinate worker under your Mine (Mine #${actorMineId})`;
        }
      } else {
        isManageable = false;
        reason = 'Insufficient delegation authority';
      }

      return {
        ...user,
        roles,
        is_subordinate: isSubordinate,
        is_manageable: isManageable,
        delegation_reason: reason,
      };
    });

    return ApiResponse.success(res, {
      actor: {
        id: actorId,
        username: req.user.username,
        email: req.user.email,
        level: actorLevel,
        organization_id: actorOrgId,
        mine_id: actorMineId,
        can_manage_access: canManageRoles,
      },
      users: evaluatedUsers,
      assignable_subroles: assignableSubroles,
    }, 'Delegation scope retrieved successfully');
});

delegationRouter.get('/', handleDelegationScope);
delegationRouter.get('/scope', handleDelegationScope);
delegationRouter.get('/delegation-scope', handleDelegationScope);

export default delegationRouter;
