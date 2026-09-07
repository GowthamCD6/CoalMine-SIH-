import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, XCircle, Search, Filter, ShieldAlert, MapPin,
  Calendar, User, X, FileText, Check, ChevronRight, Activity
} from 'lucide-react';
import { api } from '../../services/api.js';

const StatusBadge = ({ status }) => {
  const map = {
    OPEN:                { bg: '#fee2e2', text: '#991b1b', label: '🔴 Open' },
    UNDER_INVESTIGATION: { bg: '#fef3c7', text: '#92400e', label: '🔍 Under Investigation' },
    CORRECTIVE_ACTION:   { bg: '#dbeafe', text: '#1e40af', label: '🛠️ Action in Progress' },
    CLOSED:              { bg: '#dcfce7', text: '#166534', label: '✅ Closed' },
  };
  const c = map[status] || { bg: '#f1f5f9', text: '#475569', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center'
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

export default function IncidentManagementView({ onShowToast }) {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [mines, setMines] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [actions, setActions] = useState([]);

  // Form states inside detail modal
  const [rootCause, setRootCause] = useState('');
  const [findings, setFindings] = useState('');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionType, setNewActionType] = useState('CORRECTIVE');
  const [newActionDeadline, setNewActionDeadline] = useState('');

  // Load mines list
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
      const [sumRes, incRes] = await Promise.all([
        api.getIncidentsSummary().catch(() => null),
        api.getIncidents({ status: statusFilter || undefined, severity: severityFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setSummary(sumRes?.data || sumRes || null);
      setIncidents(incRes?.data?.rows || incRes?.data || incRes?.rows || (Array.isArray(incRes) ? incRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load incidents', true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openIncidentDetail = async (inc) => {
    setSelectedIncident(inc);
    try {
      const full = await api.getIncident(inc.id);
      setSelectedIncident(full?.data || full || inc);
      setInvestigations(full?.data?.investigations || full?.investigations || []);
      setActions(full?.data?.actions || full?.actions || []);
    } catch {
      setInvestigations([]);
      setActions([]);
    }
  };

  const handleAddInvestigation = async (e) => {
    e.preventDefault();
    if (!rootCause.trim() || !selectedIncident) return;
    try {
      await api.addIncidentInvestigation(selectedIncident.id, {
        root_cause: rootCause,
        findings,
      });
      setRootCause('');
      setFindings('');
      if (onShowToast) onShowToast('Investigation report submitted');
      openIncidentDetail(selectedIncident);
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!newActionDesc.trim() || !selectedIncident) return;
    try {
      await api.addIncidentAction(selectedIncident.id, {
        action_type: newActionType,
        description: newActionDesc,
        deadline: newActionDeadline || undefined,
      });
      setNewActionDesc('');
      setNewActionDeadline('');
      if (onShowToast) onShowToast('Action item assigned');
      openIncidentDetail(selectedIncident);
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleUpdateIncidentStatus = async (id, status) => {
    try {
      await api.updateIncidentStatus(id, status);
      if (onShowToast) onShowToast(`Incident status updated to ${status}`);
      if (selectedIncident?.id === id) {
        setSelectedIncident(prev => ({ ...prev, status }));
      }
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleVerifyAction = async (actionId) => {
    if (!selectedIncident) return;
    try {
      await api.updateIncidentActionStatus(selectedIncident.id, actionId, 'VERIFIED');
      if (onShowToast) onShowToast('Corrective action verified');
      openIncidentDetail(selectedIncident);
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const filtered = incidents.filter(i =>
    (i.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.location_area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldAlert size={24} color="#dc2626" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Incident Management & Investigations
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Report, investigate, and track corrective & preventive actions (CAPA) for mine incidents.
            </p>
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
          <button
            onClick={() => setShowReportModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#dc2626', color: '#fff' }}
          >
            <Plus size={16} /> Report New Incident
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} color="#475569" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.total || incidents.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Incidents</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
              {summary?.open_count ?? incidents.filter(i => i.status === 'OPEN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active / Open</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #ffedd5', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={22} color="#ea580c" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c' }}>
              {summary?.high_severity ?? incidents.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>High / Critical</div>
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
              {summary?.closed_count ?? incidents.filter(i => i.status === 'CLOSED').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Closed & Resolved</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="sleek-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="CORRECTIVE_ACTION">Action in Progress</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            className="sleek-input"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '150px' }}
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="sleek-input"
            placeholder="Search incidents, area, title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Incident / Title</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine & Location</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Severity</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Occurred At</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Actions</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Investigation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{item.id} • {item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>[{item.category}]</span>
                    <span style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.description}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{item.mine_name || `Mine #${item.mine_id}`}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {item.location_area || 'Site Area'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <SeverityBadge severity={item.severity} />
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {item.incident_at ? new Date(item.incident_at).toLocaleString() : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={item.status} />
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px',
                    backgroundColor: item.open_actions > 0 ? '#fee2e2' : '#eff6ff',
                    color: item.open_actions > 0 ? '#dc2626' : '#2563eb',
                    fontSize: '0.75rem', fontWeight: 700
                  }}>
                    {item.action_count ? `${item.action_count} CAPA` : '0 CAPA'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => openIncidentDetail(item)}
                    className="sleek-btn"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                  >
                    Investigate / CAPA
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No incidents recorded matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL: REPORT INCIDENT ─── */}
      {showReportModal && (
        <ReportIncidentModal
          mines={mines}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            if (onShowToast) onShowToast('Incident reported successfully');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: INCIDENT INVESTIGATION & ACTIONS ─── */}
      {selectedIncident && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '750px',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Incident #{selectedIncident.id}: {selectedIncident.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedIncident.mine_name} • {selectedIncident.category} • Occurred: {new Date(selectedIncident.incident_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Status Control Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
              backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
              <StatusBadge status={selectedIncident.status} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {selectedIncident.status === 'OPEN' && (
                  <button
                    onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'UNDER_INVESTIGATION')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#d97706', color: '#fff' }}
                  >
                    Start Investigation
                  </button>
                )}
                {selectedIncident.status === 'UNDER_INVESTIGATION' && (
                  <button
                    onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'CORRECTIVE_ACTION')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff' }}
                  >
                    Action Phase
                  </button>
                )}
                {selectedIncident.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'CLOSED')}
                    className="sleek-btn"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff' }}
                  >
                    Close Incident
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.88rem' }}>
              <strong>Description:</strong> {selectedIncident.description}
            </div>

            {/* Investigations List */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
              Investigation Findings ({investigations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {investigations.map((inv) => (
                <div key={inv.id} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fcfcfd' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                    Root Cause: {inv.root_cause}
                  </div>
                  {inv.findings && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                      {inv.findings}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Investigator: {inv.first_name ? `${inv.first_name} ${inv.last_name || ''}` : `User #${inv.investigator_id}`} • {new Date(inv.submitted_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {investigations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}>
                  No investigation recorded yet.
                </div>
              )}
            </div>

            {/* Submit Investigation Form */}
            <form onSubmit={handleAddInvestigation} style={{ marginBottom: '24px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Add Root Cause Analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  className="sleek-input"
                  placeholder="Primary Root Cause (e.g. Mechanical failure of hydraulic brake)"
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
                <textarea
                  className="sleek-input"
                  rows="2"
                  placeholder="Detailed findings & evidence..."
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  className="sleek-btn"
                  style={{ alignSelf: 'flex-end', backgroundColor: '#d97706', color: '#fff', fontSize: '0.8rem' }}
                >
                  Save Findings
                </button>
              </div>
            </form>

            {/* Corrective Actions Section */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
              Corrective & Preventive Actions (CAPA) ({actions.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {actions.map((act) => (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  backgroundColor: act.status === 'VERIFIED' ? '#f0fdf4' : '#ffffff'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: act.action_type === 'PREVENTIVE' ? '#ede9fe' : '#fee2e2', color: act.action_type === 'PREVENTIVE' ? '#5b21b6' : '#991b1b', marginRight: '6px' }}>
                        {act.action_type}
                      </span>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                      Deadline: {act.deadline ? new Date(act.deadline).toLocaleDateString() : 'N/A'} • Assigned to: {act.first_name ? `${act.first_name} ${act.last_name || ''}` : 'Unassigned'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: act.status === 'VERIFIED' ? '#16a34a' : '#ea580c' }}>
                      {act.status}
                    </span>
                    {act.status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyAction(act.id)}
                        className="sleek-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {actions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}>
                  No corrective actions assigned yet.
                </div>
              )}
            </div>

            {/* Add Action Form */}
            <form onSubmit={handleAddAction} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Assign New Action</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: '8px' }}>
                <input
                  type="text"
                  className="sleek-input"
                  placeholder="Action item description..."
                  value={newActionDesc}
                  onChange={e => setNewActionDesc(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
                <select
                  className="sleek-input"
                  value={newActionType}
                  onChange={e => setNewActionType(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="PREVENTIVE">Preventive</option>
                </select>
                <input
                  type="date"
                  className="sleek-input"
                  value={newActionDeadline}
                  onChange={e => setNewActionDeadline(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>
              <button
                type="submit"
                className="sleek-btn"
                style={{ alignSelf: 'flex-end', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.8rem' }}
              >
                Add Action
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Sub-Modal: Report Incident ──────────────────────────────────────────────
function ReportIncidentModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [category, setCategory] = useState('SAFETY');
  const [severity, setSeverity] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [incidentAt, setIncidentAt] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createIncident({
        mine_id: mineId,
        category,
        severity,
        title,
        description,
        location_area: locationArea,
        incident_at: incidentAt,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to report incident');
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
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>Report Incident</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Site *</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Category</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="SAFETY">Safety</option>
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="LABOUR">Labour</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="FIRE">Fire / Explosion</option>
                <option value="OTHER">Other</option>
              </select>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Location / Area</label>
              <input type="text" className="sleek-input" placeholder="e.g. Coal Seam 3 West" style={{ width: '100%', marginTop: '4px' }} value={locationArea} onChange={e => setLocationArea(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Date & Time Occurred</label>
              <input type="datetime-local" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={incidentAt} onChange={e => setIncidentAt(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Incident Title *</label>
            <input type="text" className="sleek-input" placeholder="Short descriptive title" style={{ width: '100%', marginTop: '4px' }} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Detailed Description *</label>
            <textarea className="sleek-input" rows="4" placeholder="Detail what happened, equipment involved, immediate action taken..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#dc2626', color: '#fff' }}>
              {submitting ? 'Reporting...' : 'Submit Incident Report'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
