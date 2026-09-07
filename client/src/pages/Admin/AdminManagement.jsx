import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Smartphone,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  Search,
  KeyRound,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  Shield,
  Briefcase,
  HardHat,
  Crown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function AdminManagement({ currentUser, onShowToast, initialTab }) {
  const [adminTab, setAdminTab] = useState(initialTab || 'orgs');

  useEffect(() => {
    if (initialTab) {
      setAdminTab(initialTab);
    }
  }, [initialTab]);

  // Determine Current User Scope & Capabilities
  const isSuperAdmin = currentUser?.permissions?.includes('*') || 
    currentUser?.subroles?.some(s => s.role_code === 'SUPER_ADMIN' || s.subrole_code === 'FULL_ACCESS_ROOT');

  // Find user's assigned Organization & Mine if applicable
  const primarySubrole = currentUser?.subroles?.[0];
  const userOrgId = primarySubrole?.organization_id || null;
  const userOrgName = primarySubrole?.organization_name || null;
  const userMineId = primarySubrole?.mine_id || null;
  const userMineName = primarySubrole?.mine_name || null;

  const isOrgAdmin = !isSuperAdmin && !!userOrgId && !userMineId;
  const isMineAdmin = !isSuperAdmin && !!userMineId;

  // Data State
  const [organizations, setOrganizations] = useState([]);
  const [mines, setMines] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [subroles, setSubroles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Forms State
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgForm, setOrgForm] = useState({ name: '', code: '', status: 'ACTIVE' });

  const [isMineModalOpen, setIsMineModalOpen] = useState(false);
  const [editingMine, setEditingMine] = useState(null);
  const [mineForm, setMineForm] = useState({
    name: '',
    code: '',
    organization_id: userOrgId ? String(userOrgId) : '',
    mine_type: 'OPEN_CAST',
    status: 'ACTIVE'
  });

  // Provision Admin Modals (Org Admin / Mine Admin)
  const [provisionModal, setProvisionModal] = useState(null); // { type: 'ORG' | 'MINE', target: {...} }
  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: 'Admin@12345',
    first_name: '',
    last_name: '',
    phone: '',
    employee_code: '',
  });

  // User CRUD Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: 'Admin@12345',
    first_name: '',
    last_name: '',
    phone: '',
    employee_code: '',
    status: 'ACTIVE',
    selected_subrole_id: '',
  });

  // Role & Subrole Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    code: '',
    organization_id: userOrgId ? String(userOrgId) : '',
    mine_id: userMineId ? String(userMineId) : '',
    description: '',
    status: 'ACTIVE'
  });

  const [isSubroleModalOpen, setIsSubroleModalOpen] = useState(false);
  const [subroleForm, setSubroleForm] = useState({
    name: '',
    code: '',
    role_id: '',
    description: '',
    status: 'ACTIVE'
  });

  // Manage Role/Subrole Permissions Modal
  const [permTarget, setPermTarget] = useState(null); // { type: 'ROLE' | 'SUBROLE', id: number, name: string }
  const [targetPerms, setTargetPerms] = useState([]);
  const [selectedPermId, setSelectedPermId] = useState('');

  // User Subrole Assignment Modal
  const [userAssignTarget, setUserAssignTarget] = useState(null); // user obj
  const [userSubrolesList, setUserSubrolesList] = useState([]);
  const [assignSubroleId, setAssignSubroleId] = useState('');
  const [assignExpiresAt, setAssignExpiresAt] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [mineOrgFilter, setMineOrgFilter] = useState('');

  // Scoped RBAC Evaluator State
  const [testUserId, setTestUserId] = useState('');
  const [testPermCode, setTestPermCode] = useState('MINES_CREATE');
  const [testTargetOrg, setTestTargetOrg] = useState('');
  const [testTargetMine, setTestTargetMine] = useState('');
  const [evalResult, setEvalResult] = useState(null);

  // Fetch backend data
  const loadData = async () => {
    setLoading(true);
    try {
      const [orgsRes, minesRes, usersRes, rolesRes, subrolesRes, permsRes] = await Promise.allSettled([
        api.getOrganizations({ limit: 100 }),
        api.getMines({ limit: 100 }),
        api.getUsers({ limit: 100 }),
        api.getRoles({ limit: 100 }),
        api.getSubroles({ limit: 100 }),
        api.getPermissions({ limit: 100 }),
      ]);

      const orgsList = orgsRes.status === 'fulfilled' ? (Array.isArray(orgsRes.value) ? orgsRes.value : (orgsRes.value?.organizations || orgsRes.value?.rows || [])) : [];
      const minesList = minesRes.status === 'fulfilled' ? (Array.isArray(minesRes.value) ? minesRes.value : (minesRes.value?.mines || minesRes.value?.rows || [])) : [];
      const usersList = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.users || usersRes.value?.rows || [])) : [];
      const rolesList = rolesRes.status === 'fulfilled' ? (Array.isArray(rolesRes.value) ? rolesRes.value : (rolesRes.value?.roles || rolesRes.value?.rows || [])) : [];
      const subrolesList = subrolesRes.status === 'fulfilled' ? (Array.isArray(subrolesRes.value) ? subrolesRes.value : (subrolesRes.value?.subroles || subrolesRes.value?.rows || [])) : [];
      const permsList = permsRes.status === 'fulfilled' ? (Array.isArray(permsRes.value) ? permsRes.value : (permsRes.value?.permissions || permsRes.value?.rows || [])) : [];

      setOrganizations(orgsList);
      setMines(minesList);
      setUsers(usersList);
      setRoles(rolesList);
      setSubroles(subrolesList);
      setPermissions(permsList);

      if (orgsList.length > 0 && !mineForm.organization_id) {
        setMineForm(prev => ({ ...prev, organization_id: String(userOrgId || orgsList[0].id) }));
      }
      if (orgsList.length > 0 && !roleForm.organization_id) {
        setRoleForm(prev => ({ ...prev, organization_id: String(userOrgId || orgsList[0].id) }));
      }
      if (rolesList.length > 0 && !subroleForm.role_id) {
        setSubroleForm(prev => ({ ...prev, role_id: String(rolesList[0].id) }));
      }
      if (usersList.length > 0 && !testUserId) {
        setTestUserId(String(usersList[0].id));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Organization Save
  const handleSaveOrg = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      if (onShowToast) onShowToast('Only Super Admin can create or edit organizations!', true);
      return;
    }
    try {
      if (editingOrg) {
        await api.updateOrganization(editingOrg.id, orgForm);
        if (onShowToast) onShowToast(`Organization ${orgForm.code} updated successfully!`);
      } else {
        const created = await api.createOrganization(orgForm);
        if (onShowToast) onShowToast(`Organization ${created.code} created!`);
      }
      setIsOrgModalOpen(false);
      setEditingOrg(null);
      setOrgForm({ name: '', code: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving organization', true);
    }
  };

  // Mine Save
  const handleSaveMine = async (e) => {
    e.preventDefault();
    try {
      const orgIdToUse = isOrgAdmin ? userOrgId : Number(mineForm.organization_id);
      const payload = {
        ...mineForm,
        organization_id: orgIdToUse,
      };
      if (editingMine) {
        await api.updateMine(editingMine.id, payload);
        if (onShowToast) onShowToast(`Mine ${mineForm.code} updated successfully!`);
      } else {
        const created = await api.createMine(payload);
        if (onShowToast) onShowToast(`Mine ${created.code} created!`);
      }
      setIsMineModalOpen(false);
      setEditingMine(null);
      setMineForm({
        name: '',
        code: '',
        organization_id: userOrgId ? String(userOrgId) : (organizations[0]?.id || ''),
        mine_type: 'OPEN_CAST',
        status: 'ACTIVE'
      });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving mine', true);
    }
  };

  // Provision Admin (Org Admin or Mine Admin) Flow
  const handleProvisionAdmin = async (e) => {
    e.preventDefault();
    if (!provisionModal) return;
    try {
      const isOrg = provisionModal.type === 'ORG';
      const target = provisionModal.target;

      // 1. Create User
      const newUser = await api.createUser({
        username: adminForm.username,
        email: adminForm.email,
        password: adminForm.password,
        first_name: adminForm.first_name,
        last_name: adminForm.last_name || null,
        phone: adminForm.phone || null,
        employee_code: adminForm.employee_code || null,
        status: 'ACTIVE',
      });

      // 2. Find or Create Role for this Org/Mine Admin
      const roleCode = isOrg ? `ORG_ADMIN_${target.code}` : `MINE_ADMIN_${target.code}`;
      const roleName = isOrg ? `${target.name} Admin` : `${target.name} Mine Admin`;
      
      let targetRole = roles.find(r => r.code === roleCode);
      if (!targetRole) {
        targetRole = await api.createRole({
          organization_id: isOrg ? target.id : target.organization_id,
          mine_id: isOrg ? null : target.id,
          name: roleName,
          code: roleCode,
          description: `Administrative clearance for ${target.name}`,
          status: 'ACTIVE',
        });
      }

      // 3. Find or Create Subrole
      const subroleCode = isOrg ? `ORG_HEAD_${target.code}` : `MINE_HEAD_${target.code}`;
      let targetSubrole = subroles.find(sr => sr.code === subroleCode && sr.role_id === targetRole.id);
      if (!targetSubrole) {
        targetSubrole = await api.createSubrole({
          role_id: targetRole.id,
          name: `${roleName} Clearance`,
          code: subroleCode,
          description: `Full execution permissions for ${target.name}`,
          status: 'ACTIVE',
        });
      }

      // 4. Attach standard permissions for Org Admin or Mine Admin to subrole
      const defaultOrgPermCodes = [
        'ORGANIZATIONS_READ',
        'ORGANIZATIONS_UPDATE',
        'MINES_READ',
        'MINES_CREATE',
        'MINES_UPDATE',
        'MINES_DELETE',
        'USERS_READ',
        'USERS_CREATE',
        'USERS_UPDATE',
        'USERS_DELETE',
        'USERS_MANAGE_ROLES',
        'ROLES_READ',
        'ROLES_CREATE',
        'ROLES_UPDATE',
        'ROLES_DELETE',
        'ROLES_MANAGE_PERMISSIONS',
        'SUBROLES_READ',
        'SUBROLES_CREATE',
        'SUBROLES_UPDATE',
        'SUBROLES_DELETE',
        'SUBROLES_MANAGE_PERMISSIONS',
        'PAGES_READ',
        'SESSIONS_READ',
        'SESSIONS_MANAGE',
        'AUDIT_READ',
      ];

      const defaultMinePermCodes = [
        'MINES_READ',
        'MINES_UPDATE',
        'USERS_READ',
        'USERS_CREATE',
        'USERS_UPDATE',
        'USERS_DELETE',
        'USERS_MANAGE_ROLES',
        'ROLES_READ',
        'ROLES_CREATE',
        'ROLES_UPDATE',
        'ROLES_DELETE',
        'ROLES_MANAGE_PERMISSIONS',
        'SUBROLES_READ',
        'SUBROLES_CREATE',
        'SUBROLES_UPDATE',
        'SUBROLES_DELETE',
        'SUBROLES_MANAGE_PERMISSIONS',
        'PAGES_READ',
        'SESSIONS_READ',
        'AUDIT_READ',
      ];

      const codesToGrant = isOrg ? defaultOrgPermCodes : defaultMinePermCodes;
      for (const pCode of codesToGrant) {
        const found = permissions.find(p => p.code === pCode);
        if (found) {
          try {
            await api.attachSubrolePermission(targetSubrole.id, found.id);
          } catch (err) {
            // Ignore if already attached
          }
        }
      }

      // 5. Assign Admin User to this Subrole
      await api.assignUserSubrole(newUser.id, {
        subrole_id: targetSubrole.id,
        status: 'ACTIVE',
      });

      if (onShowToast) {
        onShowToast(`Provisioned ${adminForm.first_name || adminForm.username} as ${roleName} with full permissions!`);
      }

      setProvisionModal(null);
      setAdminForm({ username: '', email: '', password: 'Admin@12345', first_name: '', last_name: '', phone: '', employee_code: '' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to provision admin', true);
    }
  };

  // User Save (General Personnel Provisioning)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updatePayload = {
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          phone: userForm.phone,
          employee_code: userForm.employee_code,
          status: userForm.status,
        };
        if (userForm.password) updatePayload.password = userForm.password;
        await api.updateUser(editingUser.id, updatePayload);
        if (onShowToast) onShowToast(`User ${userForm.username} updated!`);
      } else {
        const createdUser = await api.createUser({
          username: userForm.username,
          email: userForm.email,
          password: userForm.password || 'Admin@12345',
          first_name: userForm.first_name,
          last_name: userForm.last_name || null,
          phone: userForm.phone || null,
          employee_code: userForm.employee_code || null,
          status: userForm.status || 'ACTIVE',
        });

        // If subrole selected, assign it
        if (userForm.selected_subrole_id) {
          await api.assignUserSubrole(createdUser.id, {
            subrole_id: Number(userForm.selected_subrole_id),
            status: 'ACTIVE',
          });
        }

        if (onShowToast) onShowToast(`User ${createdUser.username} provisioned successfully!`);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserForm({ username: '', email: '', password: 'Admin@12345', first_name: '', last_name: '', phone: '', employee_code: '', status: 'ACTIVE', selected_subrole_id: '' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving user', true);
    }
  };

  // Role Save
  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      const orgIdToUse = isOrgAdmin ? userOrgId : Number(roleForm.organization_id);
      const mineIdToUse = isMineAdmin ? userMineId : (roleForm.mine_id ? Number(roleForm.mine_id) : null);

      const payload = {
        name: roleForm.name,
        code: roleForm.code,
        organization_id: orgIdToUse,
        mine_id: mineIdToUse,
        description: roleForm.description,
        status: roleForm.status,
      };

      await api.createRole(payload);
      if (onShowToast) onShowToast(`Role ${roleForm.name} created!`);
      setIsRoleModalOpen(false);
      setRoleForm({
        name: '',
        code: '',
        organization_id: userOrgId ? String(userOrgId) : (organizations[0]?.id || ''),
        mine_id: userMineId ? String(userMineId) : '',
        description: '',
        status: 'ACTIVE'
      });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error creating role', true);
    }
  };

  // Subrole Save
  const handleSaveSubrole = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: subroleForm.name,
        code: subroleForm.code,
        role_id: Number(subroleForm.role_id),
        description: subroleForm.description,
        status: subroleForm.status,
      };

      await api.createSubrole(payload);
      if (onShowToast) onShowToast(`Subrole ${subroleForm.name} created!`);
      setIsSubroleModalOpen(false);
      setSubroleForm({ name: '', code: '', role_id: roles[0]?.id || '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error creating subrole', true);
    }
  };

  // Manage Permissions (Role / Subrole)
  const openPermModal = async (type, item) => {
    setPermTarget({ type, id: item.id, name: item.name });
    try {
      let res;
      if (type === 'ROLE') {
        res = await api.getRolePermissions(item.id);
      } else {
        res = await api.getSubrolePermissions(item.id);
      }
      setTargetPerms(res?.permissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachPermission = async () => {
    if (!selectedPermId || !permTarget) return;
    try {
      if (permTarget.type === 'ROLE') {
        await api.attachRolePermission(permTarget.id, Number(selectedPermId));
        const res = await api.getRolePermissions(permTarget.id);
        setTargetPerms(res?.permissions || []);
      } else {
        await api.attachSubrolePermission(permTarget.id, Number(selectedPermId));
        const res = await api.getSubrolePermissions(permTarget.id);
        setTargetPerms(res?.permissions || []);
      }
      if (onShowToast) onShowToast('Permission attached successfully!');
      setSelectedPermId('');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error attaching permission', true);
    }
  };

  const handleDetachPermission = async (permId) => {
    if (!permTarget) return;
    try {
      if (permTarget.type === 'ROLE') {
        await api.detachRolePermission(permTarget.id, permId);
        const res = await api.getRolePermissions(permTarget.id);
        setTargetPerms(res?.permissions || []);
      } else {
        await api.detachSubrolePermission(permTarget.id, permId);
        const res = await api.getSubrolePermissions(permTarget.id);
        setTargetPerms(res?.permissions || []);
      }
      if (onShowToast) onShowToast('Permission detached.');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error detaching permission', true);
    }
  };

  // User Subroles Assignment
  const openUserSubrolesModal = async (user) => {
    setUserAssignTarget(user);
    try {
      const res = await api.getUserSubroles(user.id);
      setUserSubrolesList(res?.subroles || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubrole = async () => {
    if (!assignSubroleId || !userAssignTarget) return;
    try {
      await api.assignUserSubrole(userAssignTarget.id, {
        subrole_id: Number(assignSubroleId),
        expires_at: assignExpiresAt ? new Date(assignExpiresAt).toISOString() : null,
        status: 'ACTIVE',
      });
      if (onShowToast) onShowToast('Subrole assigned to user successfully!');
      const res = await api.getUserSubroles(userAssignTarget.id);
      setUserSubrolesList(res?.subroles || []);
      setAssignSubroleId('');
      setAssignExpiresAt('');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error assigning subrole', true);
    }
  };

  const handleUnassignSubrole = async (subroleId) => {
    if (!userAssignTarget) return;
    try {
      await api.unassignUserSubrole(userAssignTarget.id, subroleId);
      if (onShowToast) onShowToast('Subrole revoked.');
      const res = await api.getUserSubroles(userAssignTarget.id);
      setUserSubrolesList(res?.subroles || []);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error revoking subrole', true);
    }
  };

  // Scoped RBAC Resolution Tester
  const handleRunRbacTest = async () => {
    const user = users.find(u => u.id === Number(testUserId));
    if (!user) return;

    try {
      const userSubrolesRes = await api.getUserSubroles(user.id);
      const userSubs = userSubrolesRes?.subroles || [];

      // Check if user has root wildcard '*'
      let hasRoot = false;
      let matchingRole = null;

      for (const s of userSubs) {
        if (s.subrole_code === 'FULL_ACCESS_ROOT' || s.role_code === 'SUPER_ADMIN') {
          hasRoot = true;
          matchingRole = s;
          break;
        }
      }

      if (hasRoot) {
        setEvalResult({
          granted: true,
          explanation: `User '${user.username}' possesses Global Wildcard (*) Clearance via role '${matchingRole?.role_name}'. Unrestricted access to all Organizations and Mines.`,
        });
        return;
      }

      // Check Scoped matching
      let granted = false;
      let matchedSubrole = null;

      for (const s of userSubs) {
        const orgMatch = !s.organization_id || s.organization_id === Number(testTargetOrg || userOrgId);
        const mineMatch = !s.mine_id || s.mine_id === Number(testTargetMine || userMineId);

        if (orgMatch && mineMatch) {
          granted = true;
          matchedSubrole = s;
          break;
        }
      }

      if (granted) {
        setEvalResult({
          granted: true,
          explanation: `Access Granted! Permission '${testPermCode}' satisfied under Scope [Org: ${matchedSubrole?.organization_name || 'All'}, Mine: ${matchedSubrole?.mine_name || 'All'}] via '${matchedSubrole?.subrole_name}'.`,
        });
      } else {
        setEvalResult({
          granted: false,
          explanation: `Access Denied (403 Forbidden). User '${user.username}' does not hold required clearance for the specified Organization/Mine scope.`,
        });
      }
    } catch (err) {
      setEvalResult({
        granted: false,
        explanation: `Evaluation error: ${err.message}`,
      });
    }
  };

  // Filtered views for current user role
  const displayOrgs = isSuperAdmin
    ? organizations
    : organizations.filter(o => o.id === userOrgId);

  const displayMines = isSuperAdmin
    ? mines.filter(m => !mineOrgFilter || m.organization_id === Number(mineOrgFilter))
    : isOrgAdmin
      ? mines.filter(m => m.organization_id === userOrgId)
      : mines.filter(m => m.id === userMineId);

  return (
    <div className="manage-orders-container" style={{ padding: '0 0 20px', gap: '12px', width: '100%' }}>
      {/* Header & Role Scope Banner */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={26} color="#2563eb" />
              Multi-Tier Enterprise RBAC & Governance
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Hierarchical Access Matrix: Super Admin &rarr; Organization Admin &rarr; Mine Admin &rarr; Site Personnel
            </p>
          </div>

          {/* Current User Tier Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: isSuperAdmin ? '#fef3c7' : isOrgAdmin ? '#eff6ff' : '#ecfdf5',
            border: `1px solid ${isSuperAdmin ? '#fde68a' : isOrgAdmin ? '#bfdbfe' : '#a7f3d0'}`,
            color: isSuperAdmin ? '#92400e' : isOrgAdmin ? '#1e40af' : '#065f46',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            {isSuperAdmin && <Crown size={18} color="#d97706" />}
            {isOrgAdmin && <Briefcase size={18} color="#2563eb" />}
            {isMineAdmin && <HardHat size={18} color="#059669" />}
            <span>
              {isSuperAdmin && 'Tier 1: Global Super Administrator (Unrestricted Root Access)'}
              {isOrgAdmin && `Tier 2: Organization Administrator (${userOrgName || 'Org #' + userOrgId})`}
              {isMineAdmin && `Tier 3: Mine Administrator (${userMineName || 'Mine #' + userMineId})`}
            </span>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        {!isSuperAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.82rem',
            color: '#475569',
          }}>
            <Info size={16} color="#2563eb" />
            <div>
              {isOrgAdmin && (
                <span>
                  <strong>Organization Governance Rules:</strong> You can create & manage <strong>Mines</strong> within <em>{userOrgName}</em>, provision <strong>Mine Admins</strong>, create organization users (e.g. Site Advisors), and manage Org/Mine roles. You cannot create other Organizations (Super Admin authority only).
                </span>
              )}
              {isMineAdmin && (
                <span>
                  <strong>Mine Operational Rules:</strong> You manage <em>{userMineName}</em>. You can create mine personnel (Safety Officers, Engineers), define mine-specific roles/subroles, and assign clearances. You cannot create organizations or other mines.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        padding: '6px 12px 0',
        borderRadius: '12px 12px 0 0',
        borderTop: '1px solid #e2e8f0',
        borderLeft: '1px solid #e2e8f0',
        borderRight: '1px solid #e2e8f0',
        overflowX: 'auto'
      }}>
        {[
          { id: 'orgs', label: '1. Organizations Hub', icon: Building2, count: displayOrgs.length },
          { id: 'mines', label: '2. Mines Directory', icon: Layers, count: displayMines.length },
          { id: 'users', label: '3. Users & Provisioning', icon: Users, count: users.length },
          { id: 'rbac', label: '4. Roles & Subroles (RBAC)', icon: ShieldCheck, count: roles.length },
          { id: 'evaluator', label: '5. Scoped RBAC Tester', icon: Terminal, tag: 'Live Engine' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2563eb' : '#64748b',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count != null && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORGANIZATIONS HUB */}
      {adminTab === 'orgs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {isSuperAdmin
                ? 'Super Admin can create Organizations and provision dedicated Organization Admins.'
                : `You are viewing your assigned organization: ${userOrgName || 'Active Organization'}.`}
            </div>
            {isSuperAdmin ? (
              <button
                onClick={() => {
                  setEditingOrg(null);
                  setOrgForm({ name: '', code: '', status: 'ACTIVE' });
                  setIsOrgModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Create Organization
              </button>
            ) : (
              <span style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                fontWeight: 600,
                border: '1px solid #cbd5e1'
              }}>
                Organization Creation: Super Admin Only
              </span>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Organization Name</th>
                  <th style={{ padding: '12px 16px' }}>Code</th>
                  <th style={{ padding: '12px 16px' }}>Mines Count</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayOrgs.map((org) => {
                  const orgMines = mines.filter(m => m.organization_id === org.id);
                  return (
                    <tr key={org.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>#{org.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{org.name}</td>
                      <td style={{ padding: '12px 16px', color: '#2563eb', fontFamily: 'monospace' }}>{org.code}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{orgMines.length} Sites</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: org.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                          color: org.status === 'ACTIVE' ? '#166534' : '#991b1b',
                        }}>
                          {org.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setProvisionModal({ type: 'ORG', target: org });
                                setAdminForm({
                                  username: `${org.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_admin`,
                                  email: `admin@${org.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.coalmin.org`,
                                  password: 'Admin@12345',
                                  first_name: `${org.name.split(' ')[0]} Admin`,
                                  last_name: 'Lead',
                                  phone: '+919876500101',
                                  employee_code: `EMP-${org.code}-01`,
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                              title="Provision dedicated Org Administrator credentials"
                            >
                              <KeyRound size={13} />
                              Provision Org Admin
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setEditingOrg(org);
                                setOrgForm({ name: org.name, code: org.code, status: org.status });
                                setIsOrgModalOpen(true);
                              }}
                              style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                              title="Edit organization"
                            >
                              <Edit2 size={13} color="#2563eb" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MINES DIRECTORY */}
      {adminTab === 'mines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {isSuperAdmin && (
                <>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter by Org:</span>
                  <select
                    value={mineOrgFilter}
                    onChange={(e) => setMineOrgFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="">All Organizations</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                    ))}
                  </select>
                </>
              )}
              {isOrgAdmin && (
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Managing Mining Sites for <strong>{userOrgName}</strong>. You can create mines and provision Mine Admins.
                </span>
              )}
            </div>

            {(isSuperAdmin || isOrgAdmin) && (
              <button
                onClick={() => {
                  setEditingMine(null);
                  setMineForm({
                    name: '',
                    code: '',
                    organization_id: userOrgId ? String(userOrgId) : (organizations[0]?.id || ''),
                    mine_type: 'OPEN_CAST',
                    status: 'ACTIVE'
                  });
                  setIsMineModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Create Mine Site
              </button>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Mine Name</th>
                  <th style={{ padding: '12px 16px' }}>Code</th>
                  <th style={{ padding: '12px 16px' }}>Parent Organization</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayMines.map((mine) => (
                  <tr key={mine.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>#{mine.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{mine.name}</td>
                    <td style={{ padding: '12px 16px', color: '#059669', fontFamily: 'monospace' }}>{mine.code}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{mine.organization_name || `Org #${mine.organization_id}`}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                      }}>
                        {mine.mine_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: mine.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                        color: mine.status === 'ACTIVE' ? '#166534' : '#991b1b',
                      }}>
                        {mine.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {(isSuperAdmin || isOrgAdmin) && (
                          <button
                            onClick={() => {
                              setProvisionModal({ type: 'MINE', target: mine });
                              setAdminForm({
                                username: `${mine.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_admin`,
                                email: `admin@${mine.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.coalmin.org`,
                                password: 'Admin@12345',
                                first_name: `${mine.name.split(' ')[0]} Mine`,
                                last_name: 'Admin',
                                phone: '+919876500201',
                                employee_code: `EMP-MINE-${mine.id}`,
                              });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                            title="Provision dedicated Mine Administrator credentials"
                          >
                            <KeyRound size={13} />
                            Provision Mine Admin
                          </button>
                        )}
                        {(isSuperAdmin || isOrgAdmin) && (
                          <button
                            onClick={() => {
                              setEditingMine(mine);
                              setMineForm({
                                name: mine.name,
                                code: mine.code,
                                organization_id: String(mine.organization_id),
                                mine_type: mine.mine_type,
                                status: mine.status,
                              });
                              setIsMineModalOpen(true);
                            }}
                            style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                            title="Edit mine site"
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & PROVISIONING */}
      {adminTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search users by name, email, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserForm({
                  username: '',
                  email: '',
                  password: 'Admin@12345',
                  first_name: '',
                  last_name: '',
                  phone: '',
                  employee_code: '',
                  status: 'ACTIVE',
                  selected_subrole_id: ''
                });
                setIsUserModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              Provision Personnel Account
            </button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>User ID</th>
                  <th style={{ padding: '12px 16px' }}>Full Name</th>
                  <th style={{ padding: '12px 16px' }}>Username</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Employee Code</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Assigned Clearance</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.first_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>#{u.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{u.first_name} {u.last_name || ''}</td>
                      <td style={{ padding: '12px 16px', color: '#2563eb', fontFamily: 'monospace' }}>{u.username}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.employee_code || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: u.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                          color: u.status === 'ACTIVE' ? '#166534' : '#991b1b',
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openUserSubrolesModal(u)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Shield size={13} color="#2563eb" />
                            Manage Subroles
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({
                                username: u.username,
                                email: u.email,
                                password: '',
                                first_name: u.first_name,
                                last_name: u.last_name || '',
                                phone: u.phone || '',
                                employee_code: u.employee_code || '',
                                status: u.status,
                                selected_subrole_id: '',
                              });
                              setIsUserModalOpen(true);
                            }}
                            style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                            title="Edit user details"
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & SUBROLES RBAC */}
      {adminTab === 'rbac' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Roles belong to an <strong>Organization</strong> (or <strong>Mine</strong>). Subroles inherit permissions and are assigned directly to Users.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setRoleForm({
                    name: '',
                    code: '',
                    organization_id: userOrgId ? String(userOrgId) : (organizations[0]?.id || ''),
                    mine_id: userMineId ? String(userMineId) : '',
                    description: '',
                    status: 'ACTIVE'
                  });
                  setIsRoleModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Create Role
              </button>

              <button
                onClick={() => {
                  setSubroleForm({ name: '', code: '', role_id: roles[0]?.id || '', description: '', status: 'ACTIVE' });
                  setIsSubroleModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Create Subrole
              </button>
            </div>
          </div>

          {/* Roles & Subroles Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {roles
              .filter(role => {
                if (isSuperAdmin) return true;
                if (isOrgAdmin) return role.organization_id === userOrgId;
                if (isMineAdmin) return role.mine_id === userMineId;
                return true;
              })
              .map((role) => {
                const roleSubroles = subroles.filter(sr => sr.role_id === role.id);
                return (
                  <div key={role.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    {/* Role Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{role.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace', marginTop: '2px' }}>{role.code}</div>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: role.mine_id ? '#ecfdf5' : '#eff6ff',
                        color: role.mine_id ? '#047857' : '#1d4ed8',
                      }}>
                        {role.mine_id ? `Mine #${role.mine_id} Scope` : `Org #${role.organization_id} Scope`}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      {role.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openPermModal('ROLE', role)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Shield size={13} color="#2563eb" />
                        Role Permissions
                      </button>
                    </div>

                    {/* Subroles Section */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>
                        Subroles ({roleSubroles.length}):
                      </div>
                      {roleSubroles.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No subroles attached yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {roleSubroles.map((sr) => (
                            <div key={sr.id} style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{sr.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#059669', fontFamily: 'monospace' }}>{sr.code}</div>
                              </div>
                              <button
                                onClick={() => openPermModal('SUBROLE', sr)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#059669',
                                  cursor: 'pointer',
                                }}
                              >
                                Permissions
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 5: SCOPED RBAC RESOLUTION TESTER */}
      {adminTab === 'evaluator' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Live Multi-Tier Scope Resolution Tester
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Test how the backend engine evaluates permission clearance across hierarchical Organization and Mine scopes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Target User *</label>
              <select
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name || ''})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Target Org ID</label>
              <select
                value={testTargetOrg}
                onChange={(e) => setTestTargetOrg(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">None</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>#{o.id} - {o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Target Mine ID</label>
              <select
                value={testTargetMine}
                onChange={(e) => setTestTargetMine(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">None</option>
                {mines.map(m => (
                  <option key={m.id} value={m.id}>#{m.id} - {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunRbacTest}
            style={{
              alignSelf: 'flex-start',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Evaluate Permission Clearance
          </button>

          {evalResult && (
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: evalResult.granted ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${evalResult.granted ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: evalResult.granted ? '#166534' : '#991b1b' }}>
                {evalResult.granted ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                {evalResult.granted ? 'Access Granted (200 OK)' : 'Access Denied (403 Forbidden)'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '6px' }}>
                {evalResult.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROVISION ADMIN MODAL (Org Admin / Mine Admin) */}
      {provisionModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Provision {provisionModal.type === 'ORG' ? 'Organization' : 'Mine'} Admin
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Target: {provisionModal.target.name} ({provisionModal.target.code})
                </div>
              </div>
              <button onClick={() => setProvisionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProvisionAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>First Name *</label>
                  <input
                    type="text" required value={adminForm.first_name}
                    onChange={(e) => setAdminForm({ ...adminForm, first_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Last Name</label>
                  <input
                    type="text" value={adminForm.last_name}
                    onChange={(e) => setAdminForm({ ...adminForm, last_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Username *</label>
                <input
                  type="text" required value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Email *</label>
                <input
                  type="email" required value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Initial Password *</label>
                <input
                  type="text" required value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button" onClick={() => setProvisionModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Provision Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERAL USER PROVISIONING MODAL */}
      {isUserModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px',
            padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {editingUser ? `Edit User: ${editingUser.username}` : 'Provision Personnel Account'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>First Name *</label>
                  <input
                    type="text" required value={userForm.first_name}
                    onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Last Name</label>
                  <input
                    type="text" value={userForm.last_name}
                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Username *</label>
                  <input
                    type="text" required value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Email Address *</label>
                <input
                  type="email" required value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  {editingUser ? 'New Password (Leave blank to keep unchanged)' : 'Initial Password *'}
                </label>
                <input
                  type="text" required={!editingUser} value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Employee Code</label>
                  <input
                    type="text" value={userForm.employee_code}
                    onChange={(e) => setUserForm({ ...userForm, employee_code: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Phone Number</label>
                  <input
                    type="text" value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                    Assign Initial Subrole Clearance (Optional)
                  </label>
                  <select
                    value={userForm.selected_subrole_id}
                    onChange={(e) => setUserForm({ ...userForm, selected_subrole_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="">None (Can be assigned later)</option>
                    {subroles.map(sr => (
                      <option key={sr.id} value={sr.id}>{sr.name} ({sr.code}) - Role: {sr.role_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button" onClick={() => setIsUserModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingUser ? 'Save Changes' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ORG MODAL */}
      {isOrgModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Organization Name *</label>
                <input
                  type="text" required value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Organization Code *</label>
                <input
                  type="text" required value={orgForm.code}
                  onChange={(e) => setOrgForm({ ...orgForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsOrgModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MINE MODAL */}
      {isMineModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
              {editingMine ? 'Edit Mine Site' : 'Create Mine Site'}
            </h3>
            <form onSubmit={handleSaveMine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Parent Organization *</label>
                <select
                  disabled={isOrgAdmin}
                  value={mineForm.organization_id}
                  onChange={(e) => setMineForm({ ...mineForm, organization_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isOrgAdmin ? '#f1f5f9' : '#ffffff' }}
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Mine Name *</label>
                <input
                  type="text" required value={mineForm.name}
                  onChange={(e) => setMineForm({ ...mineForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Mine Code *</label>
                <input
                  type="text" required value={mineForm.code}
                  onChange={(e) => setMineForm({ ...mineForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Mine Type *</label>
                <select
                  value={mineForm.mine_type}
                  onChange={(e) => setMineForm({ ...mineForm, mine_type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="OPEN_CAST">OPEN_CAST</option>
                  <option value="UNDERGROUND">UNDERGROUND</option>
                  <option value="MIXED">MIXED</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsMineModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isRoleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>Create New Role</h3>
            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Parent Organization *</label>
                <select
                  disabled={isOrgAdmin || isMineAdmin}
                  value={roleForm.organization_id}
                  onChange={(e) => setRoleForm({ ...roleForm, organization_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: (isOrgAdmin || isMineAdmin) ? '#f1f5f9' : '#ffffff' }}
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Mine Scope (Optional - Leave blank for Org-wide Role like Site Advisor)
                </label>
                <select
                  disabled={isMineAdmin}
                  value={roleForm.mine_id}
                  onChange={(e) => setRoleForm({ ...roleForm, mine_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isMineAdmin ? '#f1f5f9' : '#ffffff' }}
                >
                  <option value="">None (Organization-wide)</option>
                  {mines.filter(m => m.organization_id === Number(roleForm.organization_id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Role Name *</label>
                <input
                  type="text" required value={roleForm.name}
                  placeholder="e.g. Corporate Site Advisor"
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Role Code *</label>
                <input
                  type="text" required value={roleForm.code}
                  placeholder="e.g. ECL_SITE_ADVISOR"
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Description</label>
                <input
                  type="text" value={roleForm.description}
                  placeholder="Operational responsibilities and scope"
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsRoleModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600 }}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBROLE MODAL */}
      {isSubroleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>Create New Subrole</h3>
            <form onSubmit={handleSaveSubrole} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Parent Role *</label>
                <select
                  value={subroleForm.role_id}
                  onChange={(e) => setSubroleForm({ ...subroleForm, role_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Subrole Name *</label>
                <input
                  type="text" required value={subroleForm.name}
                  placeholder="e.g. Senior Advisory Clearance"
                  onChange={(e) => setSubroleForm({ ...subroleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Subrole Code *</label>
                <input
                  type="text" required value={subroleForm.code}
                  placeholder="e.g. ECL_SR_ADVISOR"
                  onChange={(e) => setSubroleForm({ ...subroleForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Description</label>
                <input
                  type="text" value={subroleForm.description}
                  placeholder="Granular authorization clearance"
                  onChange={(e) => setSubroleForm({ ...subroleForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsSubroleModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#059669', color: '#ffffff', border: 'none', fontWeight: 600 }}>Create Subrole</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTACH / DETACH PERMISSIONS MODAL (For Role or Subrole) */}
      {permTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {permTarget.type === 'ROLE' ? 'Role' : 'Subrole'} Permissions: {permTarget.name}
                </h3>
              </div>
              <button onClick={() => setPermTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <select
                value={selectedPermId}
                onChange={(e) => setSelectedPermId(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">Select permission to grant...</option>
                {permissions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
              <button
                onClick={handleAttachPermission}
                disabled={!selectedPermId}
                style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Attach
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
              {targetPerms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No permissions attached yet.
                </div>
              ) : (
                targetPerms.map((p) => (
                  <div key={p.permission_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{p.permission_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb', fontFamily: 'monospace' }}>{p.permission_code}</div>
                    </div>
                    <button
                      onClick={() => handleDetachPermission(p.permission_id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANAGE USER SUBROLES MODAL */}
      {userAssignTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Subrole Assignments for {userAssignTarget.username}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{userAssignTarget.first_name} {userAssignTarget.last_name || ''} ({userAssignTarget.email})</div>
              </div>
              <button onClick={() => setUserAssignTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Assign New Subrole */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Assign New Subrole</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={assignSubroleId}
                  onChange={(e) => setAssignSubroleId(e.target.value)}
                  style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">Select Subrole...</option>
                  {subroles.map(sr => (
                    <option key={sr.id} value={sr.id}>{sr.name} ({sr.code}) - Role: {sr.role_name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSubrole}
                  disabled={!assignSubroleId}
                  style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Current Subroles List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
              {userSubrolesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No subroles assigned yet.
                </div>
              ) : (
                userSubrolesList.map((usr) => (
                  <div key={usr.user_subrole_id || usr.subrole_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{usr.subrole_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Role: <strong>{usr.role_name}</strong> • Scope: {usr.mine_name ? `Mine #${usr.mine_id} (${usr.mine_name})` : `Org #${usr.organization_id}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnassignSubrole(usr.subrole_id)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #fecaca', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
