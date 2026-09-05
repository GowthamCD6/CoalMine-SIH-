import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { subscribeToApiLogs, getAccessToken } from '../../services/api.js';

export default function DiagnosticsDrawer({ isOpen, onClose, currentUser }) {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'rbac' | 'token'
  
  // Live Scope Test Tool State
  const [testPermission, setTestPermission] = useState('mines:manage');
  const [testOrgId, setTestOrgId] = useState('1');
  const [testMineId, setTestMineId] = useState('2');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToApiLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  const handleEvaluateScope = () => {
    // Client-side mirror of rbac.middleware.js logic
    const userRole = currentUser?.role || 'Superadmin';
    const userScope = currentUser?.scope_type || 'GLOBAL';
    const userOrg = currentUser?.organization_id;
    const userMine = currentUser?.mine_id;

    let granted = false;
    let reason = '';

    if (userScope === 'GLOBAL' || userRole === 'Superadmin') {
      granted = true;
      reason = 'Granted via Global Superadmin authority';
    } else if (userScope === 'ORGANIZATION') {
      if (Number(testOrgId) === Number(userOrg)) {
        granted = true;
        reason = `Granted: User organization (#${userOrg}) matches target organization (#${testOrgId})`;
      } else {
        granted = false;
        reason = `Denied: Scope mismatch. User belongs to Org #${userOrg}, target is Org #${testOrgId}`;
      }
    } else if (userScope === 'MINE') {
      if (Number(testMineId) === Number(userMine)) {
        granted = true;
        reason = `Granted: User mine assignment (#${userMine}) matches target mine (#${testMineId})`;
      } else {
        granted = false;
        reason = `Denied: Scope mismatch. User restricted to Mine #${userMine}, target is Mine #${testMineId}`;
      }
    }

    setTestResult({
      granted,
      reason,
      evaluatedAt: new Date().toLocaleTimeString(),
      checkedRule: `requirePermission('${testPermission}', { scope: '${testMineId ? 'mine' : 'organization'}' })`,
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '380px',
      backgroundColor: '#ffffff',
      borderTop: '2px solid var(--primary)',
      boxShadow: '0 -10px 25px -5px rgba(15, 23, 42, 0.15)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.25s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', margin: 0 }}>API & RBAC Scope Diagnostics Console</h3>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                backgroundColor: activeTab === 'requests' ? '#ffffff' : 'transparent',
                color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'requests' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              HTTP Requests ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                backgroundColor: activeTab === 'rbac' ? '#ffffff' : 'transparent',
                color: activeTab === 'rbac' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'rbac' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              RBAC Scope Evaluator
            </button>
            <button
              onClick={() => setActiveTab('token')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                backgroundColor: activeTab === 'token' ? '#ffffff' : 'transparent',
                color: activeTab === 'token' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'token' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              JWT Session Info
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        {activeTab === 'requests' && (
          <div>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No API requests logged yet. Perform actions like fetching or updating data to observe requests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const isValidation = log.status === 400;
                  const isForbidden = log.status === 403;

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSuccess ? '#f8fafc' : isValidation ? '#fffbeb' : '#fef2f2',
                        border: `1px solid ${isSuccess ? 'var(--border-subtle)' : isValidation ? 'var(--warning-border)' : 'var(--danger-border)'}`,
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: log.method === 'GET' ? '#eff6ff' : log.method === 'POST' ? '#f0fdf4' : '#fff7ed',
                            color: log.method === 'GET' ? '#1d4ed8' : log.method === 'POST' ? '#15803d' : '#c2410c',
                            fontSize: '0.7rem',
                          }}>
                            {log.method}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                            {log.endpoint}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            backgroundColor: isSuccess ? 'var(--success-light)' : 'var(--danger-light)',
                            color: isSuccess ? 'var(--success-text)' : 'var(--danger-text)',
                          }}>
                            {log.status === 0 ? 'NETWORK_ERR' : `HTTP ${log.status}`}
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            {log.latencyMs}ms
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                            {log.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Error details breakdown */}
                      {log.response?.error?.details && (
                        <div style={{
                          backgroundColor: '#ffffff',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--warning-border)',
                          marginTop: '4px',
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--warning-text)' }}>Validation Issues:</span>
                          <ul style={{ paddingLeft: '1.2rem', marginTop: '2px', color: 'var(--text-body)' }}>
                            {log.response.error.details.map((issue, idx) => (
                              <li key={idx}>
                                <code>{issue.field}</code>: {issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rbac' && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Simulate and test how <code>server/src/middlewares/rbac.middleware.js</code> checks permissions with Organization vs Mine scoping for the active user.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Permission Code
                </label>
                <select
                  value={testPermission}
                  onChange={(e) => setTestPermission(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                >
                  <option value="mines:manage">mines:manage</option>
                  <option value="organizations:manage">organizations:manage</option>
                  <option value="users:manage">users:manage</option>
                  <option value="emergency:broadcast">emergency:broadcast</option>
                  <option value="inspections:create">inspections:create</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Organization ID
                </label>
                <input
                  type="number"
                  value={testOrgId}
                  onChange={(e) => setTestOrgId(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Mine ID
                </label>
                <input
                  type="number"
                  value={testMineId}
                  onChange={(e) => setTestMineId(e.target.value)}
                  className="input-white"
                  style={{ height: '38px', fontSize: '0.8rem' }}
                  placeholder="e.g. 2"
                />
              </div>

              <button
                onClick={handleEvaluateScope}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                Evaluate Access
              </button>
            </div>

            {testResult && (
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: testResult.granted ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${testResult.granted ? 'var(--success-border)' : 'var(--danger-border)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                {testResult.granted ? (
                  <CheckCircle2 size={22} color="var(--success)" />
                ) : (
                  <ShieldAlert size={22} color="var(--danger)" />
                )}
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: testResult.granted ? 'var(--success-text)' : 'var(--danger-text)',
                    marginBottom: '2px',
                  }}>
                    {testResult.granted ? 'ACCESS GRANTED (200 OK)' : 'ACCESS DENIED (403 FORBIDDEN)'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginBottom: '4px' }}>
                    {testResult.reason}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Rule Evaluated: {testResult.checkedRule} • At {testResult.evaluatedAt}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'token' && (
          <div style={{ fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Current User Session:</strong> {currentUser?.username || 'Guest'} ({currentUser?.role || 'None'})
            </div>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              JWT Bearer Access Token in LocalStorage:
            </div>
            <pre style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              overflowX: 'auto',
              fontFamily: 'monospace',
              color: 'var(--primary)',
            }}>
              {getAccessToken() || 'No active JWT token stored (using mock fallback)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
