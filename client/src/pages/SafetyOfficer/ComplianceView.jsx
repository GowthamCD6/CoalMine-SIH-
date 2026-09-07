import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck, Plus, RefreshCw, Shield, AlertTriangle, CheckCircle2,
  Clock, XCircle, Search, Filter, ChevronDown, Paperclip, Wrench,
  Eye, Edit2, BrainCircuit, ClipboardList, Calendar, X
} from 'lucide-react';
import { api } from '../../services/api.js';

// ─── Reusable Status Badge ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    COMPLIANT:     { bg: '#dcfce7', text: '#166534', label: '✅ Compliant' },
    NON_COMPLIANT: { bg: '#fee2e2', text: '#991b1b', label: '❌ Non-Compliant' },
    OVERDUE:       { bg: '#fef2f2', text: '#dc2626', label: '🔴 Overdue' },
    PENDING:       { bg: '#f1f5f9', text: '#475569', label: '⏳ Pending' },
    IN_PROGRESS:   { bg: '#dbeafe', text: '#1e40af', label: '🔵 In Progress' },
  };
  const c = map[status] || { bg: '#f1f5f9', text: '#475569', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700',
    }}>{c.label}</span>
  );
};

const FreqBadge = ({ freq }) => {
  const colors = { DAILY: '#6366f1', WEEKLY: '#8b5cf6', MONTHLY: '#0891b2', QUARTERLY: '#0d9488', ANNUALLY: '#16a34a' };
  const color = colors[freq] || '#64748b';
  return (
    <span style={{ padding: '1px 8px', borderRadius: '4px', backgroundColor: color + '15', color, fontSize: '0.72rem', fontWeight: '700' }}>
      {freq}
    </span>
  );
};

// ─── KPI Cards Row ───────────────────────────────────────────────────────────
function StatusBoard({ board, loading }) {
  if (loading) return <div style={{ height: '80px', borderRadius: '12px', backgroundColor: '#f1f5f9' }} />;
  const { summary = {}, compliance_pct } = board || {};
  const cards = [
    { key: 'COMPLIANT', label: 'Compliant', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
    { key: 'NON_COMPLIANT', label: 'Non-Compliant', color: '#dc2626', bg: '#fee2e2', icon: XCircle },
    { key: 'OVERDUE', label: 'Overdue', color: '#d97706', bg: '#fef3c7', icon: AlertTriangle },
    { key: 'PENDING', label: 'Pending', color: '#64748b', bg: '#f1f5f9', icon: Clock },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#2563eb', bg: '#dbeafe', icon: ClipboardList },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
      {cards.map(({ key, label, color, bg, icon: Icon }) => (
        <div key={key} style={{
          backgroundColor: '#ffffff', border: `1px solid ${bg}`,
          borderRadius: '12px', padding: '1rem',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{summary[key] || 0}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Assignment Detail Modal ─────────────────────────────────────────────────
function AssignmentModal({ assignment, onClose, onStatusChange, onShowToast }) {
  const [evidence, setEvidence] = useState([]);
  const [status, setStatus] = useState(assignment.status);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAssignmentEvidence(assignment.id)
      .then((res) => setEvidence(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, [assignment.id]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.updateAssignmentStatus(assignment.id, { status, remarks });
      if (onShowToast) onShowToast('Status updated successfully');
      onStatusChange();
      onClose();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Update failed', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{assignment.requirement_title}</h3>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FreqBadge freq={assignment.frequency} />
              <StatusBadge status={assignment.status} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <div><span style={{ color: '#64748b' }}>Mine:</span> <strong>{assignment.mine_name}</strong></div>
          <div><span style={{ color: '#64748b' }}>Due:</span> <strong style={{ color: assignment.status === 'OVERDUE' ? '#dc2626' : '#0f172a' }}>{assignment.due_date}</strong></div>
          <div><span style={{ color: '#64748b' }}>Assigned to:</span> <strong>{assignment.first_name ? `${assignment.first_name} ${assignment.last_name}` : 'Unassigned'}</strong></div>
          <div><span style={{ color: '#64748b' }}>Category:</span> <strong>{assignment.category}</strong></div>
        </div>

        {/* Evidence */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
            Evidence Submitted ({evidence.length})
          </h4>
          {evidence.length === 0 ? (
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
              No evidence submitted yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {evidence.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Paperclip size={14} color="#64748b" />
                  <span style={{ flex: 1, fontSize: '0.82rem', color: '#0f172a' }}>{ev.file_name || 'Document'}</span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: ev.review_status === 'APPROVED' ? '#dcfce7' : ev.review_status === 'REJECTED' ? '#fee2e2' : '#f1f5f9', color: ev.review_status === 'APPROVED' ? '#166534' : ev.review_status === 'REJECTED' ? '#991b1b' : '#475569', fontWeight: '600' }}>
                    {ev.review_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Status */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Update Status</h4>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              {['PENDING', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Add remarks (optional)…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ComplianceView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'requirements'
  const [board, setBoard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const loadAll = useCallback(async () => {
    setBoardLoading(true);
    setLoading(true);
    try {
      const [boardRes, assignRes, reqRes] = await Promise.allSettled([
        api.getComplianceStatus(),
        api.getComplianceAssignments({ status: filterStatus || undefined, limit: 100 }),
        api.getComplianceRequirements({ limit: 100 }),
      ]);

      if (boardRes.status === 'fulfilled') setBoard(boardRes.value?.data || boardRes.value);
      if (assignRes.status === 'fulfilled') {
        const d = assignRes.value;
        setAssignments(Array.isArray(d) ? d : (d?.rows || d?.assignments || []));
      }
      if (reqRes.status === 'fulfilled') {
        const d = reqRes.value;
        setRequirements(Array.isArray(d) ? d : (d?.rows || d?.requirements || []));
      }
    } catch (err) {
      if (onShowToast) onShowToast('Failed to load compliance data', true);
    } finally {
      setBoardLoading(false);
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filteredAssignments = assignments.filter((a) =>
    (!search || (a.requirement_title + a.mine_name).toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || a.status === filterStatus)
  );

  const filteredRequirements = requirements.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="#2563eb" />
            AI Statutory & Compliance Hub
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Track statutory requirements, assignments, evidence, and corrective actions across all mine sites.
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
            color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Status Board */}
      <StatusBoard board={board} loading={boardLoading} />

      {/* Tabs + Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
          {[
            { key: 'assignments', label: 'Assignments', icon: ClipboardList },
            { key: 'requirements', label: 'Requirements', icon: FileCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px', border: 'none',
                backgroundColor: activeTab === key ? '#ffffff' : 'transparent',
                fontWeight: '600', fontSize: '0.85rem',
                color: activeTab === key ? '#0f172a' : '#64748b',
                cursor: 'pointer', boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '200px' }}
            />
          </div>
          {activeTab === 'assignments' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              {['PENDING', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'OVERDUE'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading assignments…</div>
          ) : filteredAssignments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <ClipboardList size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
              <div>No compliance assignments found.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                {board?.total === 0 ? 'The compliance requirements need to be set up first.' : 'Try adjusting your filters.'}
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Requirement</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mine</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Frequency</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Due Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Assigned To</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{a.requirement_title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{a.category}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.mine_name}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><FreqBadge freq={a.frequency} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: a.status === 'OVERDUE' ? '#dc2626' : '#0f172a', fontWeight: a.status === 'OVERDUE' ? '700' : '400' }}>
                      {a.due_date ? new Date(a.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><StatusBadge status={a.status} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>
                      {a.first_name ? `${a.first_name} ${a.last_name}` : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Requirements Table */}
      {activeTab === 'requirements' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading requirements…</div>
          ) : filteredRequirements.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <FileCheck size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
              <div>No compliance requirements defined yet.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Super Admins can add requirements from the RBAC management panel.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Statutory Reference</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Frequency</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Scope</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{r.title}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.category}</td>
                    <td style={{ padding: '14px 16px', color: '#2563eb', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.statutory_reference || '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><FreqBadge freq={r.frequency} /></td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.8rem' }}>
                      {r.mine_name ? `Mine: ${r.mine_name}` : r.org_name ? `Org: ${r.org_name}` : '🌐 Global'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: r.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: r.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onStatusChange={loadAll}
          onShowToast={onShowToast}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
