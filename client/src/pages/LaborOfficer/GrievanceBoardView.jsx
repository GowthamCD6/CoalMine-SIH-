import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, Search, Filter, Shield, UserX, Send, Check, X,
  FileText, CornerDownRight, AlertOctagon, User, Lock
} from 'lucide-react';
import { api } from '../../services/api.js';

const PriorityBadge = ({ priority }) => {
  const map = {
    HIGH:   { bg: '#fee2e2', text: '#dc2626', label: 'High Priority', icon: AlertTriangle },
    MEDIUM: { bg: '#fef3c7', text: '#d97706', label: 'Medium Priority', icon: Clock },
    LOW:    { bg: '#f1f5f9', text: '#64748b', label: 'Low Priority', icon: CheckCircle2 },
  };
  const c = map[priority] || { bg: '#f1f5f9', text: '#475569', label: priority };
  const Icon = c.icon;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '6px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.72rem', fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      {Icon && <Icon size={11} />}
      {c.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    SUBMITTED:           { bg: '#fef3c7', text: '#92400e', label: 'Submitted', icon: Clock },
    ASSIGNED:            { bg: '#e0e7ff', text: '#3730a3', label: 'Assigned', icon: User },
    UNDER_INVESTIGATION: { bg: '#dbeafe', text: '#1e40af', label: 'Under Investigation', icon: Search },
    RESOLVED:            { bg: '#dcfce7', text: '#166534', label: 'Resolved', icon: CheckCircle2 },
    CLOSED:              { bg: '#f1f5f9', text: '#475569', label: 'Closed', icon: Lock },
    REOPENED:            { bg: '#fee2e2', text: '#991b1b', label: 'Reopened', icon: RefreshCw },
  };
  const c = map[status] || { bg: '#f1f5f9', text: '#475569', label: status };
  const Icon = c.icon;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700',
      display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      {Icon && <Icon size={12} />}
      {c.label}
    </span>
  );
};

export default function GrievanceBoardView({ onShowToast }) {
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [mines, setMines] = useState([]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [responses, setResponses] = useState([]);

  // Response form
  const [responseText, setResponseText] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  // Load mines
  useEffect(() => {
    api.getMines({ limit: 100 })
      .then(res => setMines(Array.isArray(res) ? res : res?.data || res?.rows || []))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, grvRes] = await Promise.all([
        api.getGrievancesSummary().catch(() => null),
        api.getGrievances({ category: categoryFilter || undefined, status: statusFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setSummary(sumRes?.data || sumRes || null);
      setGrievances(grvRes?.data?.rows || grvRes?.data || grvRes?.rows || (Array.isArray(grvRes) ? grvRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load grievances', true);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = async (g) => {
    setSelectedGrievance(g);
    try {
      const full = await api.getGrievance(g.id);
      setSelectedGrievance(full?.data || full || g);
      setResponses(full?.data?.responses || full?.responses || []);
    } catch {
      setResponses([]);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim() || !selectedGrievance) return;
    try {
      await api.addGrievanceResponse(selectedGrievance.id, {
        response_text: responseText,
        action_taken: actionTaken || undefined,
      });
      setResponseText('');
      setActionTaken('');
      if (onShowToast) onShowToast('Official response & remediation recorded');
      openDetail(selectedGrievance);
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateGrievanceStatus(id, status);
      if (onShowToast) onShowToast(`Grievance marked as ${status}`);
      if (selectedGrievance?.id === id) {
        setSelectedGrievance(prev => ({ ...prev, status }));
      }
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const filtered = grievances.filter(g =>
    (g.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>

      {/* Top Header Bar */}
      <div
        style={{
          padding: '0.65rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>
              Worker Grievance Redressal Board
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              ICC GRIEVANCE REDRESSAL ACTIVE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#d97706',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(217, 119, 6, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} /> File Grievance
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#475569" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.total_grievances || grievances.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Grievances</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
              {summary?.pending_triage ?? grievances.filter(g => g.status === 'SUBMITTED').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Triage</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e0e7ff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>
              {summary?.in_investigation ?? grievances.filter(g => g.status === 'UNDER_INVESTIGATION').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Under Investigation</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #dcfce7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              {summary?.resolved_count ?? grievances.filter(g => g.status === 'RESOLVED').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Remediated / Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="sleek-input"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
          >
            <option value="">All Categories</option>
            <option value="WAGES">Wages & Pay</option>
            <option value="SAFETY">Safety Issue</option>
            <option value="FACILITIES">Camp Facilities</option>
            <option value="DISCRIMINATION">Discrimination</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="sleek-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '170px' }}
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="sleek-input"
            placeholder="Search grievances, category, mine..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Grievances Table */}
      <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Grievance / Subject</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine Facility</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Submitter / Source</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Priority</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{g.id} • {g.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {g.description}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  {g.mine_name || `Mine #${g.mine_id}`}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.75rem', fontWeight: 700 }}>
                    {g.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                  {g.is_anonymous ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b21a8', fontWeight: 700 }}>
                      <UserX size={14} /> Anonymous
                    </span>
                  ) : (
                    <span>{g.submitter_name}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <PriorityBadge priority={g.priority} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={g.status} />
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => openDetail(g)}
                    className="sleek-btn"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                  >
                    Respond & Remediate
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No grievances matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL: FILE GRIEVANCE ─── */}
      {showSubmitModal && (
        <SubmitGrievanceModal
          mines={mines}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            if (onShowToast) onShowToast('Grievance registered in ledger');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: GRIEVANCE DETAIL & RESOLUTION ─── */}
      {selectedGrievance && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Grievance #{selectedGrievance.id}: {selectedGrievance.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedGrievance.mine_name} • Category: {selectedGrievance.category} • Submitted: {new Date(selectedGrievance.submitted_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Status Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
              <StatusBadge status={selectedGrievance.status} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {selectedGrievance.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedGrievance.id, 'UNDER_INVESTIGATION')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff' }}
                  >
                    Open Investigation
                  </button>
                )}
                {selectedGrievance.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedGrievance.id, 'RESOLVED')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff' }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Grievance Statement */}
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.88rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                GRIEVANCE STATEMENT ({selectedGrievance.is_anonymous ? 'CONFIDENTIAL WHISTLEBLOWER' : selectedGrievance.submitter_name}):
              </div>
              {selectedGrievance.description}
            </div>

            {/* Response Timeline */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
              Remediation Timeline & Responses ({responses.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {responses.map((res) => (
                <div key={res.id} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{res.response_text}</div>
                  {res.action_taken && (
                    <div style={{ fontSize: '0.8rem', color: '#166534', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px', marginTop: '6px' }}>
                      <strong>Action Taken:</strong> {res.action_taken}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                    Officer: {res.first_name} {res.last_name || ''} • {new Date(res.responded_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {responses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}>
                  No responses logged yet.
                </div>
              )}
            </div>

            {/* Submit Response Form */}
            <form onSubmit={handleAddResponse} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Record Official Response / Corrective Action</div>
              <textarea
                className="sleek-input"
                rows="2"
                placeholder="Findings and official explanation to worker..."
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                style={{ fontSize: '0.85rem' }}
                required
              />
              <input
                type="text"
                className="sleek-input"
                placeholder="Corrective Action Taken (e.g. Wage arrears paid in Payroll Batch #4)"
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                className="sleek-btn"
                style={{ alignSelf: 'flex-end', backgroundColor: '#d97706', color: '#fff', fontSize: '0.82rem' }}
              >
                Submit Resolution
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Sub-Modal: Submit Grievance ─────────────────────────────────────────────
function SubmitGrievanceModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [category, setCategory] = useState('WAGES');
  const [priority, setPriority] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createGrievance({
        mine_id: mineId,
        category,
        priority,
        title,
        description,
        is_anonymous: isAnonymous,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>File Worker Grievance</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Facility</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Category</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="WAGES">Wages & Pay</option>
                <option value="SAFETY">Safety Complaint</option>
                <option value="FACILITIES">Sanitation & Water</option>
                <option value="DISCRIMINATION">Discrimination</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Priority Level</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High Urgency</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Subject / Brief Title *</label>
            <input type="text" className="sleek-input" placeholder="e.g. Overtime pay not credited for August" style={{ width: '100%', marginTop: '4px' }} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Detailed Complaint Statement *</label>
            <textarea className="sleek-input" rows="4" placeholder="Provide factual details, dates, shift, individuals involved..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
            <input
              type="checkbox"
              id="anon-check"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="anon-check" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b21a8', cursor: 'pointer' }}>
              Protect Identity: Submit as Anonymous Whistleblower
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#d97706', color: '#fff' }}>
              {submitting ? 'Submitting...' : 'Register Grievance'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
