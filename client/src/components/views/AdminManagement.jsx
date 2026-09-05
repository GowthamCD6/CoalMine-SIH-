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
  Shield
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function AdminManagement({ currentUser, onShowToast, initialTab }) {
  const [adminTab, setAdminTab] = useState(initialTab || 'orgs');

  useEffect(() => {
    if (initialTab) {
      setAdminTab(initialTab);
    }
  }, [initialTab]);

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
  const [mineForm, setMineForm] = useState({ name: '', code: '', organization_id: '', mine_type: 'OPEN_CAST', status: 'ACTIVE' });

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
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    employee_code: '',
    status: 'ACTIVE',
    selected_subrole_id: '',
  });

  // Role & Subrole Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', code: '', organization_id: '', mine_id: '', description: '', status: 'ACTIVE' });

  const [isSubroleModalOpen, setIsSubroleModalOpen] = useState(false);
  const [subroleForm, setSubroleForm] = useState({ name: '', code: '', role_id: '', description: '', status: 'ACTIVE' });

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

  // Fetch initial backend data
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
        setMineForm(prev => ({ ...prev, organization_id: String(orgsList[0].id) }));
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
      const payload = {
        ...mineForm,
        organization_id: Number(mineForm.organization_id),
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
      setMineForm({ name: '', code: '', organization_id: organizations[0]?.id || '', mine_type: 'OPEN_CAST', status: 'ACTIVE' });
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

      // 4. Assign Admin User to this Subrole
      await api.assignUserSubrole(newUser.id, {
        subrole_id: targetSubrole.id,
        status: 'ACTIVE',
      });

      if (onShowToast) {
        onShowToast(`Provisioned ${adminForm.first_name || adminForm.username} as ${roleName}!`);
      }

      setProvisionModal(null);
      setAdminForm({ username: '', email: '', password: 'Admin@12345', first_name: '', last_name: '', phone: '', employee_code: '' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to provision admin', true);
    }
  };

  // User Save
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

        if (onShowToast) onShowToast(`User ${createdUser.username} provisioned!`);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserForm({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', employee_code: '', status: 'ACTIVE', selected_subrole_id: '' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving user', true);
    }
  };

  // Role Save
  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organization_id: Number(roleForm.organization_id),
        mine_id: roleForm.mine_id ? Number(roleForm.mine_id) : null,
        name: roleForm.name,
        code: roleForm.code.toUpperCase(),
        description: roleForm.description,
        status: roleForm.status,
      };
      await api.createRole(payload);
      if (onShowToast) onShowToast(`Role ${payload.code} created!`);
      setIsRoleModalOpen(false);
      setRoleForm({ name: '', code: '', organization_id: organizations[0]?.id || '', mine_id: '', description: '', status: 'ACTIVE' });
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
        role_id: Number(subroleForm.role_id),
        name: subroleForm.name,
        code: subroleForm.code.toUpperCase(),
        description: subroleForm.description,
        status: subroleForm.status,
      };
      await api.createSubrole(payload);
      if (onShowToast) onShowToast(`Subrole ${payload.code} created!`);
      setIsSubroleModalOpen(false);
      setSubroleForm({ name: '', code: '', role_id: roles[0]?.id || '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error creating subrole', true);
    }
  };

  // Manage Permissions
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
      const userDetails = await api.getUser(user.id);
      const userSubroles = await api.getUserSubroles(user.id);
      const subrolesData = userSubroles?.subroles || [];

      // Check effective permissions
      let hasPerm = false;
      let matchedScope = '';

      if (user.username === 'superadmin' || subrolesData.some(sr => sr.role_code === 'SUPER_ADMIN')) {
        hasPerm = true;
        matchedScope = 'Global Super Administrator clearance (Wildcard *)';
      } else {
        // Check matching role/subrole org and mine scope
        for (const sr of subrolesData) {
          if (testTargetOrg && Number(sr.organization_id) === Number(testTargetOrg)) {
            hasPerm = true;
            matchedScope = `Granted via ${sr.subrole_name} (Role: ${sr.role_name}) scoped to Org #${sr.organization_id}`;
            break;
          }
          if (testTargetMine && Number(sr.mine_id) === Number(testTargetMine)) {
            hasPerm = true;
            matchedScope = `Granted via ${sr.subrole_name} (Role: ${sr.role_name}) scoped to Mine #${sr.mine_id}`;
            break;
          }
        }
      }

      setEvalResult({
        granted: hasPerm,
        explanation: hasPerm ? matchedScope : `Denied (403): User '${user.username}' does not hold clearance for the specified organization/mine scope.`,
        evaluatedUser: user.username,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setEvalResult({
        granted: false,
        explanation: err.message,
        time: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={26} color="#2563eb" />
            Enterprise Multi-Tier Governance & RBAC
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Hierarchical Administration: Super Admin &rarr; Org Admin &rarr; Mine Admin &rarr; Site Personnel
          </p>
        </div>
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
      }}>
        {[
          { id: 'orgs', label: '1. Organizations Hub', icon: Building2, count: organizations.length },
          { id: 'mines', label: '2. Mines Directory', icon: Layers, count: mines.length },
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Super Admin can create Organizations and provision dedicated <strong>Organization Admins</strong>.
            </div>
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
                {organizations.map((org) => {
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
                          <button
                            onClick={() => {
                              setProvisionModal({ type: 'ORG', target: org });
                              setAdminForm({
                                username: `${org.code.toLowerCase()}_admin`,
                                email: `admin@${org.code.toLowerCase()}.coalmin.org`,
                                password: 'Admin@12345',
                                first_name: `${org.code} Admin`,
                                last_name: 'Lead',
                                phone: '+91',
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
                          <button
                            onClick={() => {
                              setEditingOrg(org);
                              setOrgForm({ name: org.name, code: org.code, status: org.status });
                              setIsOrgModalOpen(true);
                            }}
                            style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            </div>
            <button
              onClick={() => {
                setEditingMine(null);
                setMineForm({ name: '', code: '', organization_id: organizations[0]?.id || '', mine_type: 'OPEN_CAST', status: 'ACTIVE' });
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
                {mines
                  .filter(m => !mineOrgFilter || m.organization_id === Number(mineOrgFilter))
                  .map((mine) => (
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
                          <button
                            onClick={() => {
                              setProvisionModal({ type: 'MINE', target: mine });
                              setAdminForm({
                                username: `${mine.code.toLowerCase().replace('-', '_')}_admin`,
                                email: `admin@${mine.code.toLowerCase().replace('-', '')}.coalmin.org`,
                                password: 'Admin@12345',
                                first_name: `${mine.name} Mine`,
                                last_name: 'Admin',
                                phone: '+91',
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

      {/* TAB 3: USERS & PROVISIONING */}
      {adminTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                setUserForm({ username: '', email: '', password: 'Admin@12345', first_name: '', last_name: '', phone: '', employee_code: '', status: 'ACTIVE', selected_subrole_id: '' });
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Roles belong to an <strong>Organization</strong> (or <strong>Mine</strong>). Subroles belong to exactly one Role.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setRoleForm({ name: '', code: '', organization_id: organizations[0]?.id || '', mine_id: '', description: '', status: 'ACTIVE' });
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
            {roles.map((role) => {
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
              Test how the backend engine resolves user clearance across Organization and Mine scopes.
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

      {/* CREATE / EDIT ORG MODAL */}
      {isOrgModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Name *</label>
                <input
                  type="text" required value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Code *</label>
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
                  value={mineForm.organization_id}
                  onChange={(e) => setMineForm({ ...mineForm, organization_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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
                  value={roleForm.organization_id}
                  onChange={(e) => setRoleForm({ ...roleForm, organization_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Mine Scope (Optional - Leave blank for Org-wide)</label>
                <select
                  value={roleForm.mine_id}
                  onChange={(e) => setRoleForm({ ...roleForm, mine_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Role Code *</label>
                <input
                  type="text" required value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Description</label>
                <input
                  type="text" value={roleForm.description}
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
                  onChange={(e) => setSubroleForm({ ...subroleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Subrole Code *</label>
                <input
                  type="text" required value={subroleForm.code}
                  onChange={(e) => setSubroleForm({ ...subroleForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Description</label>
                <input
                  type="text" value={subroleForm.description}
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
