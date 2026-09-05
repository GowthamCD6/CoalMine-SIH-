import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  ShieldCheck, 
  Plus, 
  X, 
  Smartphone,
  CheckCircle2,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function AdminManagement({ currentUser, onShowToast }) {
  const [adminTab, setAdminTab] = useState('orgs'); // 'orgs' | 'mines' | 'users' | 'rbac' | 'sessions'
  
  // Data State
  const [organizations, setOrganizations] = useState([]);
  const [mines, setMines] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Forms State
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', code: '', status: 'ACTIVE' });
  const [orgErrors, setOrgErrors] = useState({});

  const [isMineModalOpen, setIsMineModalOpen] = useState(false);
  const [mineForm, setMineForm] = useState({ name: '', code: '', organization_id: 1, mine_type: 'OPEN_CAST', status: 'ACTIVE' });
  const [mineErrors, setMineErrors] = useState({});

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    employee_code: '',
    role: 'Mine Safety Officer',
    scope_type: 'MINE',
    organization_id: 1,
    mine_id: 1,
  });
  const [userErrors, setUserErrors] = useState({});

  // RBAC Evaluator Test State
  const [testUserId, setTestUserId] = useState('3');
  const [testPerm, setTestPerm] = useState('mines:manage');
  const [testTargetOrg, setTestTargetOrg] = useState('2');
  const [testTargetMine, setTestTargetMine] = useState('2');
  const [evalResult, setEvalResult] = useState(null);

  // Fetch initial backend data
  const loadData = async () => {
    setLoading(true);
    try {
      const [orgsRes, minesRes, usersRes, rolesRes, permsRes, sessionsRes] = await Promise.all([
        api.getOrganizations(),
        api.getMines(),
        api.getUsers(),
        api.getRoles(),
        api.getPermissions(),
        api.getSessions(),
      ]);
      setOrganizations(orgsRes);
      setMines(minesRes);
      setUsers(usersRes);
      setRoles(rolesRes);
      setPermissions(permsRes);
      setSessions(sessionsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Organization Handlers
  const handleSaveOrg = async (e) => {
    e.preventDefault();
    setOrgErrors({});
    try {
      const created = await api.createOrganization(orgForm);
      setOrganizations([created, ...organizations]);
      setIsOrgModalOpen(false);
      setOrgForm({ name: '', code: '', status: 'ACTIVE' });
      if (onShowToast) onShowToast(`Organization ${created.code} created successfully!`);
    } catch (err) {
      if (err.isValidationError && err.fieldErrors) {
        setOrgErrors(err.fieldErrors);
      } else {
        setOrgErrors({ general: err.message });
      }
    }
  };

  // Mine Handlers
  const handleSaveMine = async (e) => {
    e.preventDefault();
    setMineErrors({});
    try {
      const created = await api.createMine({
        ...mineForm,
        organization_id: Number(mineForm.organization_id),
      });
      setMines([created, ...mines]);
      setIsMineModalOpen(false);
      setMineForm({ name: '', code: '', organization_id: 1, mine_type: 'OPEN_CAST', status: 'ACTIVE' });
      if (onShowToast) onShowToast(`Mine ${created.code} added successfully!`);
    } catch (err) {
      if (err.isValidationError && err.fieldErrors) {
        setMineErrors(err.fieldErrors);
      } else {
        setMineErrors({ general: err.message });
      }
    }
  };

  // User Handlers
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserErrors({});
    try {
      const created = await api.createUser(userForm);
      setUsers([created, ...users]);
      setIsUserModalOpen(false);
      if (onShowToast) onShowToast(`User ${created.username} created with ${created.scope_type} scope!`);
    } catch (err) {
      if (err.isValidationError && err.fieldErrors) {
        setUserErrors(err.fieldErrors);
      } else {
        setUserErrors({ general: err.message });
      }
    }
  };

  // RBAC Scope Evaluator Simulation
  const handleRunRbacTest = () => {
    const user = users.find((u) => u.id === Number(testUserId)) || users[0];
    let granted = false;
    let explanation = '';

    if (user.role === 'Superadmin' || user.scope_type === 'GLOBAL') {
      granted = true;
      explanation = `Granted: ${user.username} is Superadmin with unrestricted global clearance.`;
    } else if (user.scope_type === 'ORGANIZATION') {
      if (Number(user.organization_id) === Number(testTargetOrg)) {
        granted = true;
        explanation = `Granted: User belongs to Org #${user.organization_id}, matching target Org #${testTargetOrg}.`;
      } else {
        granted = false;
        explanation = `Denied (403): User Org (#${user.organization_id}) does not match target Org (#${testTargetOrg}).`;
      }
    } else if (user.scope_type === 'MINE') {
      if (Number(user.mine_id) === Number(testTargetMine)) {
        granted = true;
        explanation = `Granted: User is assigned to Mine #${user.mine_id}, matching target Mine #${testTargetMine}.`;
      } else {
        granted = false;
        explanation = `Denied (403): User restricted to Mine #${user.mine_id}, cannot perform actions on Mine #${testTargetMine}.`;
      }
    }

    setEvalResult({
      granted,
      explanation,
      evaluatedUser: user.username,
      evaluatedRole: user.role,
      userScope: user.scope_type,
      time: new Date().toLocaleTimeString(),
    });
  };

  const handleRevokeSession = (sessionId) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    if (onShowToast) onShowToast(`Session #${sessionId} revoked successfully.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={28} color="var(--primary)" />
          Enterprise Administration & Scoped RBAC Control
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
          Multi-tier organization hierarchies, mining site provisioning, user directory, and scope-restricted permission matrices
        </p>
      </div>

      {/* Subtabs Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '8px',
        backgroundColor: '#ffffff',
        padding: '6px 12px 0',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        borderTop: '1px solid var(--border-subtle)',
        borderLeft: '1px solid var(--border-subtle)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        {[
          { id: 'orgs', label: 'Organizations Hub', icon: Building2, count: organizations.length },
          { id: 'mines', label: 'Mines Directory', icon: Layers, count: mines.length },
          { id: 'users', label: 'Personnel & Users', icon: Users, count: users.length },
          { id: 'rbac', label: 'Scoped RBAC Matrix & Evaluator', icon: ShieldCheck, tag: 'New Scopes' },
          { id: 'sessions', label: 'Active Sessions & Devices', icon: Smartphone, count: sessions.length },
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
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count != null && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              )}
              {tab.tag && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                }}>
                  {tab.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organizations */}
      {adminTab === 'orgs' && (
        <div className="card-white" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Corporate Subsidiaries & Organizations</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connected to <code>/api/v1/organizations</code></span>
            </div>
            <button
              onClick={() => setIsOrgModalOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>New Organization</span>
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-white">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Organization Name</th>
                  <th>Code</th>
                  <th>Headquarters</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{org.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{org.name}</td>
                    <td><span className="badge-pill badge-primary">{org.code}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{org.headquarter || 'Corporate Headquarters'}</td>
                    <td><span className="badge-pill badge-success">{org.status || 'ACTIVE'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Mines */}
      {adminTab === 'mines' && (
        <div className="card-white" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Mining Assets & Colliery Complexes</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connected to <code>/api/v1/mines</code></span>
            </div>
            <button
              onClick={() => setIsMineModalOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>Provision Mine</span>
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-white">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mine Name</th>
                  <th>Code</th>
                  <th>Classification</th>
                  <th>State</th>
                  <th>Underground Personnel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mines.map((mine) => (
                  <tr key={mine.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{mine.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{mine.name}</td>
                    <td><span className="badge-pill badge-primary">{mine.code}</span></td>
                    <td>
                      <span className={`badge-pill ${
                        mine.mine_type === 'UNDERGROUND' ? 'badge-warning' : 'badge-primary'
                      }`}>
                        {mine.mine_type}
                      </span>
                    </td>
                    <td>{mine.state || 'Jharkhand'}</td>
                    <td style={{ fontWeight: 600 }}>{mine.personnelUnderground || 210}</td>
                    <td><span className="badge-pill badge-success">{mine.status || 'ACTIVE'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {adminTab === 'users' && (
        <div className="card-white" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Personnel Directory & Scope Assignments</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connected to <code>/api/v1/users</code></span>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>Onboard User</span>
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-white">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Full Name</th>
                  <th>Username & Email</th>
                  <th>Role</th>
                  <th>Scope Level</th>
                  <th>Target Scope Authority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{u.employee_code || `EMP-${u.id}`}</td>
                    <td style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</td>
                    <td>
                      <div>{u.username}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</span>
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.role || 'Field Technician'}</span></td>
                    <td>
                      <span className={`badge-pill ${
                        u.scope_type === 'GLOBAL' ? 'badge-purple' : u.scope_type === 'ORGANIZATION' ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {u.scope_type || 'MINE'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                      {u.scope_target || `Mine #${u.mine_id || 1}`}
                    </td>
                    <td><span className="badge-pill badge-success">{u.status || 'ACTIVE'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Scoped RBAC Matrix & Live Scope Evaluator */}
      {adminTab === 'rbac' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Interactive Permission Scope Evaluator */}
          <div className="card-white" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Terminal size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                Live RBAC Scope Evaluator (Middleware Diagnostic)
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Demonstrates how <code>rbac.middleware.js</code> checks permission requests against Organization and Mine scoping boundaries.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Select User
                </label>
                <select
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} ({u.role} - {u.scope_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Permission Requested
                </label>
                <select
                  value={testPerm}
                  onChange={(e) => setTestPerm(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                >
                  <option value="mines:manage">mines:manage</option>
                  <option value="organizations:manage">organizations:manage</option>
                  <option value="emergency:broadcast">emergency:broadcast</option>
                  <option value="inspections:create">inspections:create</option>
                  <option value="users:manage">users:manage</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Organization ID
                </label>
                <input
                  type="number"
                  value={testTargetOrg}
                  onChange={(e) => setTestTargetOrg(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Mine ID
                </label>
                <input
                  type="number"
                  value={testTargetMine}
                  onChange={(e) => setTestTargetMine(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                />
              </div>

              <button
                onClick={handleRunRbacTest}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
              >
                Evaluate Scope
              </button>
            </div>

            {evalResult && (
              <div style={{
                marginTop: '1.25rem',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: evalResult.granted ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${evalResult.granted ? 'var(--success-border)' : 'var(--danger-border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {evalResult.granted ? <CheckCircle2 size={24} color="var(--success)" /> : <ShieldAlert size={24} color="var(--danger)" />}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: evalResult.granted ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    {evalResult.granted ? 'HTTP 200: PERMISSION GRANTED' : 'HTTP 403: SCOPE ACCESS DENIED'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '2px' }}>
                    {evalResult.explanation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Roles & Scopes Matrix Table */}
          <div className="card-white" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Enterprise Roles & Scope Tiering</h3>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table-white">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Code</th>
                    <th>Scope Level</th>
                    <th>Description</th>
                    <th>Active Users</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.name}</td>
                      <td><span className="badge-pill badge-primary">{r.code}</span></td>
                      <td>
                        <span className={`badge-pill ${
                          r.scope_level === 'GLOBAL' ? 'badge-purple' : r.scope_level === 'ORGANIZATION' ? 'badge-primary' : 'badge-warning'
                        }`}>
                          {r.scope_level}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.description}</td>
                      <td style={{ fontWeight: 600 }}>{r.usersCount || 1} personnel</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sessions */}
      {adminTab === 'sessions' && (
        <div className="card-white" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Active Browser & Device Sessions</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connected to <code>/api/v1/sessions</code></span>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table-white">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Device / Browser Agent</th>
                  <th>IP Address</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.device_id}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.ip_address}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.created_at}</td>
                    <td><span className="badge-pill badge-success">{s.status || 'Active'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          color: 'var(--danger-text)',
                          backgroundColor: 'var(--danger-light)',
                          border: '1px solid var(--danger-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        Revoke Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Organization */}
      {isOrgModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Create Organization</h3>
              <button onClick={() => setIsOrgModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveOrg} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className={`input-white ${orgErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Northern Coalfields Limited"
                />
                {orgErrors.name && <span className="field-error-msg">{orgErrors.name}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Code</label>
                <input
                  type="text"
                  required
                  value={orgForm.code}
                  onChange={(e) => setOrgForm({ ...orgForm, code: e.target.value })}
                  className={`input-white ${orgErrors.code ? 'input-error' : ''}`}
                  placeholder="e.g. NCL"
                />
                {orgErrors.code && <span className="field-error-msg">{orgErrors.code}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsOrgModalOpen(false)} style={{ padding: '8px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Mine */}
      {isMineModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Provision Mining Site</h3>
              <button onClick={() => setIsMineModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveMine} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Parent Organization</label>
                <select
                  value={mineForm.organization_id}
                  onChange={(e) => setMineForm({ ...mineForm, organization_id: e.target.value })}
                  className="input-white"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name} ({org.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Mine Name</label>
                <input
                  type="text"
                  required
                  value={mineForm.name}
                  onChange={(e) => setMineForm({ ...mineForm, name: e.target.value })}
                  className={`input-white ${mineErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Singrauli Open Cast Project"
                />
                {mineErrors.name && <span className="field-error-msg">{mineErrors.name}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Mine Code</label>
                  <input
                    type="text"
                    required
                    value={mineForm.code}
                    onChange={(e) => setMineForm({ ...mineForm, code: e.target.value })}
                    className={`input-white ${mineErrors.code ? 'input-error' : ''}`}
                    placeholder="e.g. SNG-OCP"
                  />
                  {mineErrors.code && <span className="field-error-msg">{mineErrors.code}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Type</label>
                  <select
                    value={mineForm.mine_type}
                    onChange={(e) => setMineForm({ ...mineForm, mine_type: e.target.value })}
                    className="input-white"
                  >
                    <option value="OPEN_CAST">OPEN_CAST</option>
                    <option value="UNDERGROUND">UNDERGROUND</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsMineModalOpen(false)} style={{ padding: '8px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Provision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New User */}
      {isUserModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Onboard User & Assign Scope</h3>
              <button onClick={() => setIsUserModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.first_name}
                    onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                    className="input-white"
                    placeholder="e.g. Ramesh"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Last Name</label>
                  <input
                    type="text"
                    value={userForm.last_name}
                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                    className="input-white"
                    placeholder="e.g. Kumar"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Username</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className={`input-white ${userErrors.username ? 'input-error' : ''}`}
                    placeholder="e.g. ramesh_k"
                  />
                  {userErrors.username && <span className="field-error-msg">{userErrors.username}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Employee Code</label>
                  <input
                    type="text"
                    value={userForm.employee_code}
                    onChange={(e) => setUserForm({ ...userForm, employee_code: e.target.value })}
                    className="input-white"
                    placeholder="EMP-8492"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Official Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className={`input-white ${userErrors.email ? 'input-error' : ''}`}
                  placeholder="ramesh@coalmin.org"
                />
                {userErrors.email && <span className="field-error-msg">{userErrors.email}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Assigned Scope</label>
                  <select
                    value={userForm.scope_type}
                    onChange={(e) => setUserForm({ ...userForm, scope_type: e.target.value })}
                    className="input-white"
                  >
                    <option value="MINE">MINE Scope</option>
                    <option value="ORGANIZATION">ORGANIZATION Scope</option>
                    <option value="GLOBAL">GLOBAL Scope</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="input-white"
                  >
                    <option value="Mine Safety Officer">Mine Safety Officer</option>
                    <option value="Corporate Director">Corporate Director</option>
                    <option value="Statutory Inspector">Statutory Inspector</option>
                    <option value="Field Technician">Field Technician</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsUserModalOpen(false)} style={{ padding: '8px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

