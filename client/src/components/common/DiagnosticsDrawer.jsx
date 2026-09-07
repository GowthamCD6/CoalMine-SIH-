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
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Code2,
  FileJson,
  Search
} from 'lucide-react';
import { subscribeToApiLogs, getAccessToken } from '../../services/api.js';

export default function DiagnosticsDrawer({ isOpen, onClose, currentUser }) {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'rbac' | 'token'
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  
  // Live Scope Test Tool State
  const [testPermission, setTestPermission] = useState('MINES_CREATE');
  const [testOrgId, setTestOrgId] = useState('1');
  const [testMineId, setTestMineId] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToApiLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  const handleCopy = (text, fieldKey) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEvaluateScope = () => {
    const isSuper =
      currentUser?.username === 'superadmin' ||
      currentUser?.email === 'admin@coalmin.org' ||
      (Array.isArray(currentUser?.permissions) && currentUser.permissions.some(p =>
        typeof p === 'string' ? p === '*' || p === 'ALL_PERMISSIONS' : p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
      )) ||
      currentUser?.subroles?.some(s => s.role_code === 'SUPERADMIN' || s.role_code === 'SUPER_ADMIN' || s.subrole_code === 'CHIEF_ADMIN');
    const userSubroles = currentUser?.subroles || [];

    let granted = false;
    let explanation = '';

    if (isSuper) {
      granted = true;
      explanation = 'Access Granted via Global Superadmin Wildcard (*) clearance.';
    } else {
      const match = userSubroles.find(s => {
        const orgMatch = !testOrgId || !s.organization_id || s.organization_id === Number(testOrgId);
        const mineMatch = !testMineId || !s.mine_id || s.mine_id === Number(testMineId);
        return orgMatch && mineMatch;
      });

      if (match) {
        granted = true;
        explanation = `Access Granted under scope [Org #${match.organization_id || 'All'}, Mine #${match.mine_id || 'All'}] via role '${match.role_name}'.`;
      } else {
        granted = false;
        explanation = `Access Denied (403 Forbidden). Scope requirements not satisfied for Org #${testOrgId || 'Any'} Mine #${testMineId || 'Any'}.`;
      }
    }

    setTestResult({
      granted,
      explanation,
      evaluatedAt: new Date().toLocaleTimeString(),
      checkedRule: `requirePermission('${testPermission}', { scope: '${testMineId ? 'mine' : 'organization'}' })`,
    });
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchSearch = !searchFilter || 
      log.endpoint.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.method.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(log.status).includes(searchFilter);
    const matchMethod = !selectedMethod || log.method === selectedMethod;
    return matchSearch && matchMethod;
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '420px',
      backgroundColor: '#ffffff',
      borderTop: '2px solid #2563eb',
      boxShadow: '0 -10px 25px -5px rgba(15, 23, 42, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      animation: 'slideUp 0.2s ease-out',
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#60a5fa" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Real-Time HTTP Traffic & Payload Inspector
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '4px 12px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: activeTab === 'requests' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              HTTP Requests ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              style={{
                padding: '4px 12px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: activeTab === 'rbac' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Scope Engine Simulator
            </button>
            <button
              onClick={() => setActiveTab('token')}
              style={{
                padding: '4px 12px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: activeTab === 'token' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Active Session JWT
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ padding: '6px', borderRadius: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', backgroundColor: '#f8fafc' }}>
        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter requests by endpoint or status..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
                />
              </div>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
              >
                <option value="">All HTTP Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>
                Click on any request to expand and inspect its <strong>Request Payload</strong> and <strong>Response Data</strong>
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No API requests recorded matching your filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredLogs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const isValidation = log.status === 400;
                  const isForbidden = log.status === 403;
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <div
                      key={log.id}
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: `1px solid ${isExpanded ? '#2563eb' : isSuccess ? '#e2e8f0' : isValidation ? '#fde68a' : '#fecaca'}`,
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? '#eff6ff' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isExpanded ? <ChevronDown size={16} color="#2563eb" /> : <ChevronRight size={16} color="#94a3b8" />}
                          <span style={{
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: log.method === 'GET' ? '#eff6ff' : log.method === 'POST' ? '#f0fdf4' : log.method === 'PUT' ? '#fff7ed' : '#fef2f2',
                            color: log.method === 'GET' ? '#1d4ed8' : log.method === 'POST' ? '#15803d' : log.method === 'PUT' ? '#c2410c' : '#dc2626',
                            fontSize: '0.72rem',
                          }}>
                            {log.method}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                            {log.endpoint}
                          </span>
                          {log.requestPayload && (
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: '#e2e8f0',
                              color: '#334155',
                              fontWeight: 600
                            }}>
                              Payload Body
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            backgroundColor: isSuccess ? '#dcfce7' : isForbidden ? '#fee2e2' : '#fef3c7',
                            color: isSuccess ? '#166534' : isForbidden ? '#991b1b' : '#92400e',
                          }}>
                            {log.status === 0 ? 'NETWORK_ERR' : `HTTP ${log.status}`}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {log.latencyMs}ms
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            {log.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Payload & Response Detail Section */}
                      {isExpanded && (
                        <div style={{
                          padding: '12px 14px',
                          borderTop: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}>
                          {/* URL & Method info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.78rem', color: '#475569', wordBreak: 'break-all' }}>
                              <strong>Target URL:</strong> <code>{log.url}</code>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              Timestamp: {log.isoTimestamp || log.timestamp}
                            </span>
                          </div>

                          {/* Request Payload and Response side-by-side grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
                            {/* Request Payload Box */}
                            <div style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                padding: '6px 10px',
                                backgroundColor: '#f1f5f9',
                                borderBottom: '1px solid #cbd5e1',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                                  📤 Request Payload (Body)
                                </span>
                                {log.requestPayload && (
                                  <button
                                    onClick={() => handleCopy(log.requestPayload, `req-${log.id}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                                  >
                                    {copiedField === `req-${log.id}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                    {copiedField === `req-${log.id}` ? 'Copied' : 'Copy'}
                                  </button>
                                )}
                              </div>
                              <pre style={{
                                margin: 0,
                                padding: '8px 10px',
                                fontSize: '0.75rem',
                                maxHeight: '180px',
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                color: log.requestPayload ? '#0f172a' : '#94a3b8'
                              }}>
                                {log.requestPayload ? JSON.stringify(log.requestPayload, null, 2) : 'No request body payload (Query params only)'}
                              </pre>
                            </div>

                            {/* Response Payload Box */}
                            <div style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                padding: '6px 10px',
                                backgroundColor: '#f1f5f9',
                                borderBottom: '1px solid #cbd5e1',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                                  📥 Response Data (HTTP {log.status})
                                </span>
                                {log.response && (
                                  <button
                                    onClick={() => handleCopy(log.response, `res-${log.id}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                                  >
                                    {copiedField === `res-${log.id}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                    {copiedField === `res-${log.id}` ? 'Copied' : 'Copy'}
                                  </button>
                                )}
                              </div>
                              <pre style={{
                                margin: 0,
                                padding: '8px 10px',
                                fontSize: '0.75rem',
                                maxHeight: '180px',
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                color: isSuccess ? '#0f172a' : '#991b1b'
                              }}>
                                {log.response ? JSON.stringify(log.response, null, 2) : 'No response content'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RBAC SIMULATOR TAB */}
        {activeTab === 'rbac' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              Simulate how the backend RBAC middleware evaluates scope clearance for <strong>{currentUser?.username || 'Current User'}</strong>.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Permission Code
                </label>
                <select
                  value={testPermission}
                  onChange={(e) => setTestPermission(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="MINES_CREATE">MINES_CREATE</option>
                  <option value="MINES_READ">MINES_READ</option>
                  <option value="ORGANIZATIONS_CREATE">ORGANIZATIONS_CREATE</option>
                  <option value="USERS_CREATE">USERS_CREATE</option>
                  <option value="ROLES_CREATE">ROLES_CREATE</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Target Organization ID
                </label>
                <input
                  type="number"
                  value={testOrgId}
                  onChange={(e) => setTestOrgId(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Target Mine ID (Optional)
                </label>
                <input
                  type="number"
                  value={testMineId}
                  onChange={(e) => setTestMineId(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <button
              onClick={handleEvaluateScope}
              style={{
                alignSelf: 'flex-start',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Evaluate Scope Access
            </button>

            {testResult && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: testResult.granted ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${testResult.granted ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.82rem'
              }}>
                {testResult.granted ? <CheckCircle2 size={18} color="#16a34a" /> : <ShieldAlert size={18} color="#dc2626" />}
                <div>
                  <div style={{ fontWeight: 700, color: testResult.granted ? '#166534' : '#991b1b' }}>
                    {testResult.granted ? 'Access Allowed' : 'Access Denied'}
                  </div>
                  <div style={{ color: '#334155', marginTop: '2px' }}>{testResult.explanation}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOKEN TAB */}
        {activeTab === 'token' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              JWT Bearer Access Token stored for the current session:
            </div>
            <pre style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
              margin: 0,
              fontFamily: 'monospace'
            }}>
              {getAccessToken() || 'No active JWT token found in localStorage.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
