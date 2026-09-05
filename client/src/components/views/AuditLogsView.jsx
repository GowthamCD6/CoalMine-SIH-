import React, { useState, useEffect } from 'react';
import { FileText, Filter, RefreshCw, Eye, X, Calendar, User, Building2 } from 'lucide-react';
import { api } from '../../services/api.js';

export default function AuditLogsView({ onShowToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        sort: 'created_at',
        order: 'DESC',
      };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;

      const res = await api.getAuditLogs(params);
      const items = Array.isArray(res) ? res : (res?.logs || res?.rows || []);
      setLogs(items);
      if (res?.meta) setMeta(res.meta);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load audit logs', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, entityFilter]);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#0f172a' }}>Immutable Audit Logs</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            System-wide audit trail with complete JSON snapshot history for every mutation
          </p>
        </div>
        <button
          onClick={() => fetchLogs(meta.page)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Filters:</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            color: '#334155',
          }}
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
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            color: '#334155',
          }}
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

        {(actionFilter || entityFilter) && (
          <button
            onClick={() => {
              setActionFilter('');
              setEntityFilter('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <tr>
              <th style={{ padding: '12px 16px' }}>ID</th>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
              <th style={{ padding: '12px 16px' }}>Entity</th>
              <th style={{ padding: '12px 16px' }}>Entity ID</th>
              <th style={{ padding: '12px 16px' }}>Actor</th>
              <th style={{ padding: '12px 16px' }}>IP Address</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  {loading ? 'Loading audit records...' : 'No audit records match the current criteria.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>#{log.id}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
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
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                    {log.entity_type || 'SYSTEM'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {log.entity_id ? `#${log.entity_id}` : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    {log.username ? `${log.username} (#${log.user_id})` : (log.user_id ? `User #${log.user_id}` : 'Anonymous')}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>
                    {log.ip_address || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#2563eb',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={14} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Inspector Modal */}
      {selectedLog && (
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
            maxWidth: '700px',
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
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                  Audit Record #{selectedLog.id} - {selectedLog.action} {selectedLog.entity_type}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Recorded at {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedLog.old_data && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>
                    Previous State (old_data):
                  </div>
                  <pre style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    margin: 0,
                  }}>
                    {JSON.stringify(typeof selectedLog.old_data === 'string' ? JSON.parse(selectedLog.old_data) : selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16a34a', marginBottom: '6px' }}>
                    New / Mutated State (new_data):
                  </div>
                  <pre style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    margin: 0,
                  }}>
                    {JSON.stringify(typeof selectedLog.new_data === 'string' ? JSON.parse(selectedLog.new_data) : selectedLog.new_data, null, 2)}
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
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
