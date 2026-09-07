import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, XCircle, Search, Filter, ChevronRight, MapPin, Eye,
  Check, AlertOctagon, ShieldAlert, ListChecks, Calendar, User,
  X, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { api } from '../../services/api.js';

// ─── Reusable Status Badge ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    SCHEDULED:   { bg: '#e0e7ff', text: '#3730a3', label: '📅 Scheduled' },
    IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', label: '🔵 In Progress' },
    COMPLETED:   { bg: '#dcfce7', text: '#166534', label: '✅ Completed' },
    CANCELLED:   { bg: '#f1f5f9', text: '#475569', label: '⚪ Cancelled' },
    OVERDUE:     { bg: '#fee2e2', text: '#991b1b', label: '🔴 Overdue' },
    OPEN:        { bg: '#fef3c7', text: '#92400e', label: '⚠️ Open' },
    RESOLVED:    { bg: '#dcfce7', text: '#166534', label: '✅ Resolved' },
    CLOSED:      { bg: '#f1f5f9', text: '#475569', label: '🔒 Closed' },
    UNDER_REVIEW:{ bg: '#ede9fe', text: '#5b21b6', label: '🔍 Review' },
  };
  const c = map[status] || { bg: '#f1f5f9', text: '#475569', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>{c.label}</span>
  );
};

const SeverityBadge = ({ severity }) => {
  const map = {
    LOW:      { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    MEDIUM:   { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    HIGH:     { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
    CRITICAL: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  };
  const c = map[severity] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '6px',
      backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: '0.72rem', fontWeight: '700'
    }}>{severity}</span>
  );
};

export default function InspectionsView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('inspections'); // 'inspections' | 'observations' | 'violations'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [mines, setMines] = useState([]);

  // Data
  const [inspections, setInspections] = useState([]);
  const [observations, setObservations] = useState([]);
  const [violations, setViolations] = useState([]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals
  const [showNewInspection, setShowNewInspection] = useState(false);
  const [showNewObservation, setShowNewObservation] = useState(false);
  const [showNewViolation, setShowNewViolation] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistSeverity, setNewChecklistSeverity] = useState('LOW');

  // Load mines list for dropdowns
  useEffect(() => {
    api.getMines({ limit: 100 })
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || res?.rows || [];
        setMines(list);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, inspRes, obsRes, violRes] = await Promise.all([
        api.getInspectionsSummary().catch(() => null),
        api.getInspections({ status: statusFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
        api.getSafetyObservations({ status: statusFilter || undefined, severity: severityFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
        api.getViolations({ status: statusFilter || undefined, severity: severityFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes?.data || sumRes || null);
      setInspections(inspRes?.data?.rows || inspRes?.data || inspRes?.rows || (Array.isArray(inspRes) ? inspRes : []));
      setObservations(obsRes?.data?.rows || obsRes?.data || obsRes?.rows || (Array.isArray(obsRes) ? obsRes : []));
      setViolations(violRes?.data?.rows || violRes?.data || violRes?.rows || (Array.isArray(violRes) ? violRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load safety data', true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load inspection checklist
  const openInspectionDetail = async (insp) => {
    setSelectedInspection(insp);
    try {
      const res = await api.getInspectionChecklist(insp.id);
      setChecklist(res?.data || res || []);
    } catch {
      setChecklist([]);
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedInspection) return;
    try {
      await api.addInspectionChecklistItem(selectedInspection.id, {
        item_text: newChecklistText,
        status: 'OK',
        severity: newChecklistSeverity,
      });
      setNewChecklistText('');
      const res = await api.getInspectionChecklist(selectedInspection.id);
      setChecklist(res?.data || res || []);
      if (onShowToast) onShowToast('Checklist item recorded');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to add checklist item', true);
    }
  };

  const handleUpdateInspectionStatus = async (id, status) => {
    try {
      await api.updateInspectionStatus(id, status);
      if (onShowToast) onShowToast(`Inspection status updated to ${status}`);
      if (selectedInspection?.id === id) {
        setSelectedInspection(prev => ({ ...prev, status }));
      }
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleResolveObservation = async (id) => {
    try {
      await api.resolveSafetyObservation(id);
      if (onShowToast) onShowToast('Safety observation marked as resolved');
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleUpdateViolationStatus = async (id, status) => {
    try {
      await api.updateViolationStatus(id, status);
      if (onShowToast) onShowToast(`Violation updated to ${status}`);
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  // Filtered lists
  const filteredInspections = inspections.filter(i =>
    (i.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredObservations = observations.filter(o =>
    (o.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredViolations = violations.filter(v =>
    (v.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8))',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ClipboardCheck size={24} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Inspections, Observations & Violations
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Field safety inspection logs, hazard observations, and statutory violation tracking under DGMS guidelines.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadData}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e1' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          {activeTab === 'inspections' && (
            <button
              onClick={() => setShowNewInspection(true)}
              className="sleek-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              <Plus size={16} /> Schedule Inspection
            </button>
          )}
          {activeTab === 'observations' && (
            <button
              onClick={() => setShowNewObservation(true)}
              className="sleek-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#d97706', color: '#fff' }}
            >
              <Plus size={16} /> Report Observation
            </button>
          )}
          {activeTab === 'violations' && (
            <button
              onClick={() => setShowNewViolation(true)}
              className="sleek-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#dc2626', color: '#fff' }}
            >
              <Plus size={16} /> Record Violation
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck size={22} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.total_inspections || inspections.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Inspections</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #fef3c7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
              {summary?.scheduled_inspections ?? inspections.filter(i => i.status === 'SCHEDULED').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scheduled / Pending</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e0e7ff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>
              {summary?.open_observations ?? observations.filter(o => o.status === 'OPEN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Open Observations</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertOctagon size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
              {summary?.open_violations ?? violations.filter(v => v.status === 'OPEN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Violations</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'inspections', label: 'Inspections', count: inspections.length, icon: ClipboardCheck },
            { key: 'observations', label: 'Safety Observations', count: observations.length, icon: AlertTriangle },
            { key: 'violations', label: 'Statutory Violations', count: violations.length, icon: ShieldAlert },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchTerm(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                color: activeTab === key ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === key ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.2s', marginBottom: '-2px'
              }}
            >
              <Icon size={18} />
              {label}
              <span style={{
                fontSize: '0.72rem', padding: '2px 7px', borderRadius: '99px',
                backgroundColor: activeTab === key ? '#eff6ff' : '#f1f5f9',
                color: activeTab === key ? 'var(--primary)' : '#64748b'
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="sleek-input"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* ─── TAB 1: INSPECTIONS ─── */}
      {activeTab === 'inspections' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>ID / Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine & Area</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Inspector</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Scheduled Date</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Checklist</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{item.id} • {item.inspection_type}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.description || 'Routine safety check'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{item.mine_name || `Mine #${item.mine_id}`}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {item.area || 'General Area'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.first_name ? `${item.first_name} ${item.last_name || ''}` : `User #${item.inspector_user_id}`}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px',
                      backgroundColor: item.total_checklist_items > 0 ? '#eff6ff' : '#f8fafc',
                      color: item.total_checklist_items > 0 ? '#2563eb' : '#94a3b8',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {item.checklist_issues > 0 ? `⚠️ ${item.checklist_issues} issues` : `${item.total_checklist_items || 0} items`}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openInspectionDetail(item)}
                      className="sleek-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                    >
                      <ListChecks size={14} style={{ marginRight: '4px' }} /> View / Check
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No inspections found. Schedule a new one to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 2: SAFETY OBSERVATIONS ─── */}
      {activeTab === 'observations' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>ID / Description</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine / Location</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Observer</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Logged Time</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredObservations.map((obs) => (
                <tr key={obs.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Observation #{obs.id}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>{obs.description}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{obs.mine_name || `Mine #${obs.mine_id}`}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{obs.area || 'General Area'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {obs.first_name ? `${obs.first_name} ${obs.last_name || ''}` : `User #${obs.observer_user_id}`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <SeverityBadge severity={obs.severity} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={obs.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(obs.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {obs.status === 'OPEN' && (
                      <button
                        onClick={() => handleResolveObservation(obs.id)}
                        className="sleek-btn"
                        style={{ padding: '5px 10px', fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}
                      >
                        <Check size={14} style={{ marginRight: '4px' }} /> Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredObservations.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No safety observations logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 3: VIOLATIONS ─── */}
      {activeTab === 'violations' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Violation ID / Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine Facility</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Deadline</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#dc2626' }}>VIOLATION #{v.id} • {v.type}</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>{v.description}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{v.mine_name || `Mine #${v.mine_id}`}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <SeverityBadge severity={v.severity} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {v.deadline ? new Date(v.deadline).toLocaleDateString() : 'Immediate'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={v.status} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {v.status !== 'RESOLVED' && v.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleUpdateViolationStatus(v.id, 'RESOLVED')}
                          className="sleek-btn"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}
                        >
                          Resolve
                        </button>
                      )}
                      {v.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleUpdateViolationStatus(v.id, 'CLOSED')}
                          className="sleek-btn"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', backgroundColor: '#f1f5f9', color: '#475569' }}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredViolations.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No statutory violations recorded. All operations clean.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── MODAL: INSPECTION DETAILS & CHECKLIST ─── */}
      {selectedInspection && (
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
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Inspection #{selectedInspection.id} Details
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedInspection.inspection_type} • {selectedInspection.mine_name} ({selectedInspection.area || 'Main Area'})
                </span>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Status Change Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Status:</span>
              <StatusBadge status={selectedInspection.status} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {selectedInspection.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateInspectionStatus(selectedInspection.id, 'IN_PROGRESS')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff' }}
                  >
                    Start Inspection
                  </button>
                )}
                {selectedInspection.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateInspectionStatus(selectedInspection.id, 'COMPLETED')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff' }}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>

            {/* Checklist Section */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListChecks size={18} color="var(--primary)" />
              Inspection Checklist Items ({checklist.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {checklist.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', backgroundColor: item.status === 'ISSUE' ? '#fff7ed' : '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.status === 'OK' ? (
                      <CheckCircle2 size={18} color="#16a34a" />
                    ) : (
                      <AlertTriangle size={18} color="#ea580c" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{item.item_text}</div>
                      {item.remarks && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.remarks}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.severity && <SeverityBadge severity={item.severity} />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.status === 'OK' ? '#16a34a' : '#ea580c' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
              {checklist.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                  No checklist items recorded for this inspection yet.
                </div>
              )}
            </div>

            {/* Add Checklist Item Form */}
            <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="sleek-input"
                placeholder="e.g. Vent shaft flow verified, Roof bolt intact..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <select
                className="sleek-input"
                value={newChecklistSeverity}
                onChange={e => setNewChecklistSeverity(e.target.value)}
                style={{ width: '110px', fontSize: '0.82rem' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <button
                type="submit"
                className="sleek-btn"
                style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.82rem' }}
              >
                Add Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: SCHEDULE NEW INSPECTION ─── */}
      {showNewInspection && (
        <NewInspectionModal
          mines={mines}
          onClose={() => setShowNewInspection(false)}
          onSuccess={() => {
            setShowNewInspection(false);
            if (onShowToast) onShowToast('New inspection scheduled');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: REPORT OBSERVATION ─── */}
      {showNewObservation && (
        <NewObservationModal
          mines={mines}
          onClose={() => setShowNewObservation(false)}
          onSuccess={() => {
            setShowNewObservation(false);
            if (onShowToast) onShowToast('Safety observation submitted');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: RECORD VIOLATION ─── */}
      {showNewViolation && (
        <NewViolationModal
          mines={mines}
          onClose={() => setShowNewViolation(false)}
          onSuccess={() => {
            setShowNewViolation(false);
            if (onShowToast) onShowToast('Statutory violation recorded');
            loadData();
          }}
        />
      )}

    </div>
  );
}

// ─── Sub-Modal: Schedule Inspection ──────────────────────────────────────────
function NewInspectionModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [type, setType] = useState('ROUTINE');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId) return;
    setSubmitting(true);
    try {
      await api.createInspection({
        mine_id: mineId,
        inspection_type: type,
        area,
        description,
        scheduled_at: scheduledAt,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to schedule');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Schedule Safety Inspection</h2>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Inspection Type</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={type} onChange={e => setType(e.target.value)}>
                <option value="ROUTINE">Routine</option>
                <option value="SAFETY">Safety Audit</option>
                <option value="EQUIPMENT">Equipment Check</option>
                <option value="ENVIRONMENT">Environmental</option>
                <option value="STATUTORY">Statutory (DGMS)</option>
                <option value="SURPRISE">Surprise Inspection</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Scheduled Date & Time</label>
              <input type="datetime-local" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Area / Mine Sector</label>
            <input type="text" className="sleek-input" placeholder="e.g. Pit 4 - Haul Road North" style={{ width: '100%', marginTop: '4px' }} value={area} onChange={e => setArea(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Scope & Instructions</label>
            <textarea className="sleek-input" rows="3" placeholder="Describe inspection scope, focus points..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              {submitting ? 'Scheduling...' : 'Schedule Inspection'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Report Observation ───────────────────────────────────────────
function NewObservationModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createSafetyObservation({
        mine_id: mineId,
        area,
        description,
        severity,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to submit observation');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Log Safety Observation</h2>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Area / Section</label>
              <input type="text" className="sleek-input" placeholder="e.g. Conveyor Belt 2" style={{ width: '100%', marginTop: '4px' }} value={area} onChange={e => setArea(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Severity</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Observation Details *</label>
            <textarea className="sleek-input" rows="4" placeholder="Describe unsafe condition or hazard observed..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#d97706', color: '#fff' }}>
              {submitting ? 'Submitting...' : 'Submit Observation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Record Violation ─────────────────────────────────────────────
function NewViolationModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [type, setType] = useState('SAFETY');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createViolation({
        mine_id: mineId,
        type,
        severity,
        description,
        deadline: deadline || undefined,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to record violation');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>Record Statutory Violation</h2>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Violation Category</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={type} onChange={e => setType(e.target.value)}>
                <option value="SAFETY">Safety</option>
                <option value="ENVIRONMENT">Environment</option>
                <option value="LABOUR">Labour</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="STATUTORY">Statutory</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Severity</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Remediation Deadline</label>
            <input type="date" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Violation Details *</label>
            <textarea className="sleek-input" rows="4" placeholder="Detail violation clause, act breach, inspector notice..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#dc2626', color: '#fff' }}>
              {submitting ? 'Recording...' : 'Record Violation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
