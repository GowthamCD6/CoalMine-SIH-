/**
 * usePermissions — derives permission checks and scope from the currentUser object
 * returned by /api/v1/auth/me.
 *
 * Usage:
 *   const { hasPermission, scope, isSuperAdmin } = usePermissions(currentUser);
 *   if (hasPermission('compliance:read')) { ... }
 */
export function usePermissions(currentUser) {
  if (!currentUser) {
    return {
      hasPermission: () => false,
      scope: { is_super_admin: false, org_ids: [], mine_ids: [], is_regulatory: false },
      isSuperAdmin: false,
      isRegulatory: false,
    };
  }

  // Build a Set of permission codes from the array returned by /auth/me
  const permissionCodes = new Set();
  const permissions = currentUser.permissions || [];

  if (Array.isArray(permissions)) {
    permissions.forEach((p) => {
      if (p.permission_code) permissionCodes.add(p.permission_code);
    });
  }

  const isSuperAdmin =
    permissionCodes.has('*') || permissionCodes.has('ALL_PERMISSIONS');

  // Derive scope from subroles
  const subroles = currentUser.subroles || [];
  const orgIds = new Set();
  const mineIds = new Set();
  let isRegulatory = false;

  subroles.forEach((sr) => {
    if (sr.organization_id) orgIds.add(Number(sr.organization_id));
    if (sr.mine_id) mineIds.add(Number(sr.mine_id));
    if (!sr.organization_id && !sr.mine_id) isRegulatory = true;
  });

  const scope = {
    is_super_admin: isSuperAdmin,
    org_ids: [...orgIds],
    mine_ids: [...mineIds],
    is_regulatory: isRegulatory,
  };

  /**
   * Returns true if the user has the given permission code,
   * or is a super admin.
   */
  const hasPermission = (code) => {
    if (isSuperAdmin) return true;
    return permissionCodes.has(code);
  };

  /**
   * Returns the dashboard type this user should land on.
   * Priority: super_admin > regulatory > corporate (org-level) > mine-level
   */
  const getDashboardType = () => {
    if (isSuperAdmin) return 'admin';
    if (isRegulatory) return 'regulatory';
    if (orgIds.size > 0 && mineIds.size === 0) return 'corporate';
    return 'mine';
  };

  return {
    hasPermission,
    scope,
    isSuperAdmin,
    isRegulatory,
    getDashboardType,
    permissionCodes,
  };
}

export default usePermissions;
