import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Filter, 
  RefreshCw, 
  Eye, 
  X, 
  Calendar, 
  User, 
  Building2, 
  Copy, 
  Check, 
  Search, 
  Terminal, 
  Code2, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  ShieldAlert, 
  CheckCircle2,
  Lock,
  KeyRound,
  Activity,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Download,
  ExternalLink,
  MapPin,
  FolderDown
} from 'lucide-react';
import { api, subscribeToApiLogs, getAccessToken } from '../../services/api.js';

export default function AuditLogsView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('live_payloads'); // 'live_payloads' | 'db_audit' | 'rbac_sim' | 'jwt_session'

  // DB Audit Logs State
  const [dbLogs, setDbLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [selectedDbLog, setSelectedDbLog] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dbSearch, setDbSearch] = useState('');

  // Live Network API Payloads State
  const [networkLogs, setNetworkLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [networkSearch, setNetworkSearch] = useState('');
  const [networkMethodFilter, setNetworkMethodFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Photo Evidence Upload Logs State
  const [photoLogs, setPhotoLogs] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoSearch, setPhotoSearch] = useState('');
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // RBAC Simulator State
  const [simPermission, setSimPermission] = useState('MINES_CREATE');
  const [simOrgId, setSimOrgId] = useState('1');
  const [simMineId, setSimMineId] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchDbLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 25,
        sort: 'created_at',
        order: 'DESC',
      };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;

      const res = await api.getAuditLogs(params);
      const items = Array.isArray(res) ? res : (res?.logs || res?.rows || []);
      setDbLogs(items);
      if (res?.meta) setMeta(res.meta);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load database audit logs', true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const me = await api.getMe();
      setCurrentUser(me);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchPhotoLogs = async () => {
    setLoadingPhotos(true);
    try {
      const res = await api.getUploadLogs();
      const logs = res?.data?.logs || res?.logs || [];
      setPhotoLogs(Array.isArray(logs) ? logs : []);
    } catch (e) {
      console.warn('Failed to load upload photo logs:', e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchDbLogs(1);
    fetchCurrentUser();
    fetchPhotoLogs();
  }, [actionFilter, entityFilter]);

  // Subscribe to live API network traffic
  useEffect(() => {
    const unsubscribe = subscribeToApiLogs((logs) => {
      setNetworkLogs(logs);
    });
    return unsubscribe;
  }, []);

  const handleCopy = (data, key) => {
    const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(str);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulator = () => {
    const isSuper = currentUser?.permissions?.includes('*');
    const userSubroles = currentUser?.subroles || [];

    let granted = false;
    let explanation = '';

    if (isSuper) {
      granted = true;
      explanation = `Access Granted via Global Superadmin Wildcard (*) clearance. Unrestricted execution across all Organizations and Mines.`;
    } else {
      const match = userSubroles.find(s => {
        const orgMatch = !simOrgId || !s.organization_id || s.organization_id === Number(simOrgId);
        const mineMatch = !simMineId || !s.mine_id || s.mine_id === Number(simMineId);
        return orgMatch && mineMatch;
      });

      if (match) {
        granted = true;
        explanation = `Access Granted under scope [Org #${match.organization_id || 'All'}, Mine #${match.mine_id || 'All'}] via role '${match.role_name}'.`;
      } else {
        granted = false;
        explanation = `Access Denied (403 Forbidden). User does not hold clearance for Org #${simOrgId || 'Any'} Mine #${simMineId || 'Any'}.`;
      }
    }

    setSimResult({
      granted,
      explanation,
      evaluatedAt: new Date().toLocaleTimeString(),
      checkedRule: `requirePermission('${simPermission}', { scope: '${simMineId ? 'mine' : 'organization'}' })`,
    });
  };

  // Filtered DB logs
  const filteredDbLogs = dbLogs.filter(log => {
    if (!dbSearch) return true;
    const term = dbSearch.toLowerCase();
    return (
      (log.username && log.username.toLowerCase().includes(term)) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(term)) ||
      String(log.entity_id).includes(term)
    );
  });

  // Filtered Live Network logs
  const filteredNetworkLogs = networkLogs.filter(log => {
    const matchSearch = !networkSearch || 
      log.endpoint.toLowerCase().includes(networkSearch.toLowerCase()) ||
      log.method.toLowerCase().includes(networkSearch.toLowerCase()) ||
      String(log.status).includes(networkSearch);
    const matchMethod = !networkMethodFilter || log.method === networkMethodFilter;
    return matchSearch && matchMethod;
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={26} color="#2563eb" />
              Full Page Audit Logs & HTTP Payload Inspector
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Inspect live HTTP request bodies & response payloads in real-time, query database audit logs, and simulate RBAC evaluation rules.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
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
            { id: 'live_payloads', label: '1. Real-Time HTTP Traffic & Payloads', icon: Terminal, count: networkLogs.length },
            { id: 'db_audit', label: '2. Immutable Database Audit Trail', icon: FileText, count: meta.total || dbLogs.length },
            { id: 'photo_logs', label: '3. Optical Hazard Photos (/uploads)', icon: Camera, count: photoLogs.length },
            { id: 'rbac_sim', label: '4. RBAC Scope Simulator', icon: ShieldAlert },
            { id: 'jwt_session', label: '5. Active Session Token', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
      </div>

      {/* TAB 1: REAL-TIME HTTP TRAFFIC & REQUEST/RESPONSE PAYLOAD INSPECTOR */}
      {activeTab === 'live_payloads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search live requests by URL, method, status..."
                value={networkSearch}
                onChange={(e) => setNetworkSearch(e.target.value)}
                style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <select
              value={networkMethodFilter}
              onChange={(e) => setNetworkMethodFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}
            >
              <option value="">All HTTP Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>
              Click on any row below to expand and view the full <strong>Request Payload (Body)</strong> and <strong>Response Data</strong>
            </span>
          </div>

          {/* Requests Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredNetworkLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                No HTTP network requests logged yet. Perform operations (e.g. creating mines, listing users) to view real-time traffic.
              </div>
            ) : (
              filteredNetworkLogs.map((log) => {
                const isSuccess = log.status >= 200 && log.status < 300;
                const isValidation = log.status === 400;
                const isForbidden = log.status === 403;
                const isExpanded = expandedLogId === log.id;

                return (
                  <div
                    key={log.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${isExpanded ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Summary Header Row */}
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isExpanded ? <ChevronDown size={18} color="#2563eb" /> : <ChevronRight size={18} color="#94a3b8" />}
                        <span style={{
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: log.method === 'GET' ? '#eff6ff' : log.method === 'POST' ? '#f0fdf4' : log.method === 'PUT' ? '#fff7ed' : '#fef2f2',
                          color: log.method === 'GET' ? '#1d4ed8' : log.method === 'POST' ? '#15803d' : log.method === 'PUT' ? '#c2410c' : '#dc2626',
                          fontSize: '0.75rem',
                        }}>
                          {log.method}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          {log.endpoint}
                        </span>
                        {log.requestPayload && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#e2e8f0',
                            color: '#334155',
                            fontWeight: 700
                          }}>
                            Request Body Attached
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          backgroundColor: isSuccess ? '#dcfce7' : isForbidden ? '#fee2e2' : '#fef3c7',
                          color: isSuccess ? '#166534' : isForbidden ? '#991b1b' : '#92400e',
                        }}>
                          HTTP {log.status}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {log.latencyMs}ms
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                          {log.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Side-by-Side Request & Response Payload Inspector */}
                    {isExpanded && (
                      <div style={{
                        padding: '1.25rem',
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                            <strong>Full URL:</strong> <code style={{ color: '#2563eb' }}>{log.url}</code>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Captured: {log.isoTimestamp || log.timestamp}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
                          {/* Request Payload Card */}
                          <div style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: '#f1f5f9',
                              borderBottom: '1px solid #cbd5e1',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                                📤 Request Payload (Body)
                              </span>
                              {log.requestPayload && (
                                <button
                                  onClick={() => handleCopy(log.requestPayload, `req-${log.id}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {copiedKey === `req-${log.id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                  {copiedKey === `req-${log.id}` ? 'Copied' : 'Copy JSON'}
                                </button>
                              )}
                            </div>
                            <pre style={{
                              margin: 0,
                              padding: '12px',
                              fontSize: '0.8rem',
                              maxHeight: '260px',
                              overflowY: 'auto',
                              fontFamily: 'monospace',
                              color: log.requestPayload ? '#0f172a' : '#94a3b8',
                              backgroundColor: '#ffffff'
                            }}>
                              {log.requestPayload ? JSON.stringify(log.requestPayload, null, 2) : '// No Request Body (GET/DELETE query params only)'}
                            </pre>
                          </div>

                          {/* Response Payload Card */}
                          <div style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: '#f1f5f9',
                              borderBottom: '1px solid #cbd5e1',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                                📥 Response Data (HTTP {log.status})
                              </span>
                              {log.response && (
                                <button
                                  onClick={() => handleCopy(log.response, `res-${log.id}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {copiedKey === `res-${log.id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                  {copiedKey === `res-${log.id}` ? 'Copied' : 'Copy JSON'}
                                </button>
                              )}
                            </div>
                            <pre style={{
                              margin: 0,
                              padding: '12px',
                              fontSize: '0.8rem',
                              maxHeight: '260px',
                              overflowY: 'auto',
                              fontFamily: 'monospace',
                              color: isSuccess ? '#0f172a' : '#991b1b',
                              backgroundColor: '#ffffff'
                            }}>
                              {log.response ? JSON.stringify(log.response, null, 2) : '// No response body content'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE DATABASE AUDIT TRAIL */}
      {activeTab === 'db_audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* DB Filters Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by actor, entity, IP..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: '#64748b' }} />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="ASSIGN">ASSIGN</option>
                <option value="UNASSIGN">UNASSIGN</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="REVOKE">REVOKE</option>
              </select>

              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="">All Entities</option>
                <option value="ORGANIZATION">ORGANIZATION</option>
                <option value="MINE">MINE</option>
                <option value="USER">USER</option>
                <option value="ROLE">ROLE</option>
                <option value="SUBROLE">SUBROLE</option>
                <option value="PERMISSION">PERMISSION</option>
                <option value="ROLE_PERMISSION">ROLE_PERMISSION</option>
                <option value="SUBROLE_PERMISSION">SUBROLE_PERMISSION</option>
                <option value="USER_SUBROLE">USER_SUBROLE</option>
                <option value="PAGE">PAGE</option>
                <option value="USER_SESSION">USER_SESSION</option>
              </select>
            </div>

            {(actionFilter || entityFilter || dbSearch) && (
              <button
                onClick={() => {
                  setActionFilter('');
                  setEntityFilter('');
                  setDbSearch('');
                }}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}

            <button
              onClick={() => fetchDbLogs(meta.page)}
              disabled={loading}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Audit Log Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Audit ID</th>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                  <th style={{ padding: '12px 16px' }}>Entity Type</th>
                  <th style={{ padding: '12px 16px' }}>Target ID</th>
                  <th style={{ padding: '12px 16px' }}>Actor</th>
                  <th style={{ padding: '12px 16px' }}>IP Address</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Snapshot Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredDbLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                      {loading ? 'Loading audit records...' : 'No audit records match the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredDbLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>#{log.id}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            log.action === 'CREATE' ? '#dcfce7' :
                            log.action === 'UPDATE' ? '#fef3c7' :
                            log.action === 'DELETE' || log.action === 'REVOKE' ? '#fee2e2' : '#e0e7ff',
                          color:
                            log.action === 'CREATE' ? '#166534' :
                            log.action === 'UPDATE' ? '#92400e' :
                            log.action === 'DELETE' || log.action === 'REVOKE' ? '#991b1b' : '#3730a3',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                        {log.entity_type || 'SYSTEM'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {log.entity_id ? `#${log.entity_id}` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {log.username ? `${log.username}` : (log.user_id ? `User #${log.user_id}` : 'System / Root')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {log.ip_address || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedDbLog(log)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          Inspect State
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OPTICAL HAZARD PHOTO EVIDENCE & UPLOADS LOGS */}
      {activeTab === 'photo_logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Banner */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1px solid #a7f3d0'
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Storage Directory: server/uploads/
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {photoLogs.length} Verified Evidence Photos
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Subterranean Optical Hazard Evidence Logs
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Captured by worker cameras and field units. Physical files are saved on disk in <code>server/uploads/</code> and served live.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchPhotoLogs}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} className={loadingPhotos ? 'spin' : ''} />
                Refresh Logs
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search photo logs by category, filename, worker, or zone..."
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Photo Cards Grid */}
          {photoLogs.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '3rem',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <Camera size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#475569' }}>No Photo Evidence Logs Found</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Take photos using the Mobile App Hazard Camera to store images in the <code>uploads/</code> directory.
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {photoLogs
                .filter((p) => {
                  const q = photoSearch.toLowerCase();
                  return (
                    !photoSearch ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.file_name || '').toLowerCase().includes(q) ||
                    (p.reporter || '').toLowerCase().includes(q) ||
                    (p.location || '').toLowerCase().includes(q) ||
                    (p.zone_tag || '').toLowerCase().includes(q)
                  );
                })
                .map((log) => {
                  const fullUrl = `http://localhost:5001${log.photo_url || `/uploads/${log.file_name}`}`;
                  return (
                    <div
                      key={log.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Image Preview Container */}
                      <div
                        onClick={() => setSelectedPhoto(log)}
                        style={{
                          height: '200px',
                          backgroundColor: '#0f172a',
                          position: 'relative',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={fullUrl}
                          alt={log.category || 'Hazard Evidence'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '6px',
                          color: '#94a3b8',
                          fontSize: '0.8rem',
                        }}>
                          <ImageIcon size={32} />
                          <span>Photo Record ({log.file_name})</span>
                        </div>

                        {/* Top Watermark Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          {log.depth || '-120m'} • {log.zone_tag || log.location || 'Shaft 4'}
                        </div>

                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Eye size={12} />
                          Click to Expand
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                          }}>
                            {log.category || 'Hazard Evidence'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {log.uploaded_at ? new Date(log.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>

                        {/* File path tag */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #f1f5f9',
                          fontSize: '0.75rem',
                          color: '#475569',
                          fontFamily: 'monospace',
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                            📁 {log.file_path || `uploads/${log.file_name}`}
                          </span>
                          <span style={{ color: '#059669', fontWeight: 600 }}>{log.file_size || 'Verified'}</span>
                        </div>

                        {log.notes && (
                          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                            {log.notes}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Worker: <strong>{log.reporter || 'Field Worker'}</strong>
                          </div>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#2563eb',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={12} />
                            Full View
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Modal Lightbox for Full Image Preview */}
          {selectedPhoto && (
            <div
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  maxWidth: '750px',
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedPhoto.category || 'Hazard Evidence Photo'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Disk Path: server/uploads/{selectedPhoto.file_name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ height: '420px', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`http://localhost:5001${selectedPhoto.photo_url || `/uploads/${selectedPhoto.file_name}`}`}
                    alt="Full View"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    <div>📍 Location: <strong>{selectedPhoto.location || selectedPhoto.zone_tag}</strong> ({selectedPhoto.depth || '-120m'})</div>
                    <div>👤 Reporter: <strong>{selectedPhoto.reporter}</strong> ({selectedPhoto.reporter_code || 'EMP'})</div>
                  </div>
                  <a
                    href={`http://localhost:5001${selectedPhoto.photo_url || `/uploads/${selectedPhoto.file_name}`}`}
                    target="_blank"
                    download={selectedPhoto.file_name}
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <Download size={14} /> Download Evidence
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RBAC SIMULATOR */}
      {activeTab === 'rbac_sim' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Live Scope Resolution Simulator
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Test how backend RBAC middleware evaluates clearance for active account <strong>{currentUser?.username}</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Permission Code
              </label>
              <select
                value={simPermission}
                onChange={(e) => setSimPermission(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="MINES_CREATE">MINES_CREATE</option>
                <option value="MINES_READ">MINES_READ</option>
                <option value="ORGANIZATIONS_CREATE">ORGANIZATIONS_CREATE</option>
                <option value="USERS_CREATE">USERS_CREATE</option>
                <option value="ROLES_CREATE">ROLES_CREATE</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Target Organization ID
              </label>
              <input
                type="number"
                value={simOrgId}
                onChange={(e) => setSimOrgId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Target Mine ID (Optional)
              </label>
              <input
                type="number"
                value={simMineId}
                onChange={(e) => setSimMineId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="e.g. 1"
              />
            </div>
          </div>

          <button
            onClick={handleRunSimulator}
            style={{
              alignSelf: 'flex-start',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Evaluate Permission Access
          </button>

          {simResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: simResult.granted ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${simResult.granted ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              {simResult.granted ? <CheckCircle2 size={20} color="#16a34a" /> : <ShieldAlert size={20} color="#dc2626" />}
              <div>
                <div style={{ fontWeight: 700, color: simResult.granted ? '#166534' : '#991b1b' }}>
                  {simResult.granted ? 'Access Granted (200 OK)' : 'Access Denied (403 Forbidden)'}
                </div>
                <div style={{ color: '#334155', marginTop: '2px' }}>{simResult.explanation}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACTIVE SESSION JWT TOKEN */}
      {activeTab === 'jwt_session' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Active JWT Bearer Access Token
            </span>
            <button
              onClick={() => handleCopy(getAccessToken(), 'jwt-token')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {copiedKey === 'jwt-token' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              {copiedKey === 'jwt-token' ? 'Copied' : 'Copy Token'}
            </button>
          </div>
          <pre style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.8rem',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            margin: 0,
            fontFamily: 'monospace',
            color: '#334155'
          }}>
            {getAccessToken() || 'No active JWT token found in localStorage.'}
          </pre>
        </div>
      )}

      {/* DB AUDIT JSON STATE INSPECTOR MODAL */}
      {selectedDbLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Audit Record #{selectedDbLog.id} &bull; {selectedDbLog.action} {selectedDbLog.entity_type}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Recorded at {selectedDbLog.created_at ? new Date(selectedDbLog.created_at).toLocaleString() : 'N/A'} by {selectedDbLog.username || 'System'}
                </div>
              </div>
              <button
                onClick={() => setSelectedDbLog(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedDbLog.old_data && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
                      Previous State (old_data snapshot):
                    </span>
                    <button
                      onClick={() => handleCopy(selectedDbLog.old_data, 'modal-old')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedKey === 'modal-old' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      {copiedKey === 'modal-old' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(typeof selectedDbLog.old_data === 'string' ? JSON.parse(selectedDbLog.old_data) : selectedDbLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedDbLog.new_data && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
                      Mutated / New State (new_data snapshot):
                    </span>
                    <button
                      onClick={() => handleCopy(selectedDbLog.new_data, 'modal-new')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedKey === 'modal-new' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      {copiedKey === 'modal-new' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(typeof selectedDbLog.new_data === 'string' ? JSON.parse(selectedDbLog.new_data) : selectedDbLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setSelectedDbLog(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
