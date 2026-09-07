import React, { useState, useEffect, useCallback } from 'react';
import {
  Pickaxe, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, Search, Filter, TrendingUp, Calendar, User,
  Wrench, Activity, AlertOctagon, Target, Zap, CloudRain,
  X, Check
} from 'lucide-react';
import { api } from '../../services/api.js';

const ShiftBadge = ({ shift }) => {
  const map = {
    MORNING:   { bg: '#fef3c7', text: '#92400e', label: '🌅 Morning' },
    AFTERNOON: { bg: '#e0f2fe', text: '#0369a1', label: '☀️ Afternoon' },
    NIGHT:     { bg: '#ede9fe', text: '#5b21b6', label: '🌙 Night' },
  };
  const c = map[shift] || { bg: '#f1f5f9', text: '#475569', label: shift };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700'
    }}>{c.label}</span>
  );
};

export default function ProductionDashboardView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'targets' | 'issues'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [targets, setTargets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [mines, setMines] = useState([]);

  // Filters
  const [shiftFilter, setShiftFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Load mines list
  useEffect(() => {
    api.getMines({ limit: 100 })
      .then(res => setMines(Array.isArray(res) ? res : res?.data || res?.rows || []))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, repRes, targRes, issRes] = await Promise.all([
        api.getProductionSummary().catch(() => null),
        api.getProductionReports({ shift: shiftFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
        api.getProductionTargets().catch(() => []),
        api.getOperationalIssues({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes?.data || sumRes || null);
      setReports(repRes?.data?.rows || repRes?.data || repRes?.rows || (Array.isArray(repRes) ? repRes : []));
      setTargets(targRes?.data || targRes || (Array.isArray(targRes) ? targRes : []));
      setIssues(issRes?.data?.rows || issRes?.data || issRes?.rows || (Array.isArray(issRes) ? issRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load production data', true);
    } finally {
      setLoading(false);
    }
  }, [shiftFilter, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveIssue = async (id) => {
    try {
      await api.updateOperationalIssueStatus(id, 'RESOLVED');
      if (onShowToast) onShowToast('Operational issue marked resolved');
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const filteredReports = reports.filter(r =>
    (r.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.shift || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.remarks || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIssues = issues.filter(i =>
    (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.issue_type || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Pickaxe size={24} color="#d97706" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Production & Mining Operations
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Shift-wise coal dispatch logging, target tracking, machinery downtime, and bottleneck remediation.
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
            onClick={() => setShowTargetModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#334155' }}
          >
            <Target size={16} /> Set Targets
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fee2e2', color: '#dc2626' }}
          >
            <AlertTriangle size={16} /> Log Issue
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#d97706', color: '#fff' }}
          >
            <Plus size={16} /> Record Shift Output
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
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pickaxe size={22} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {Number(summary?.total_actual_tonnes || 0).toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tonnes</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Coal Produced</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #dcfce7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              {summary?.achievement_rate || 100}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Achievement</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
              {Number(summary?.total_downtime_hrs || 0).toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Hrs</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Equipment Downtime</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #ffedd5', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#ea580c" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c' }}>
              {summary?.open_issues ?? issues.filter(i => i.status === 'OPEN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Bottlenecks</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'reports', label: 'Shift Output Logs', count: reports.length, icon: Pickaxe },
            { key: 'targets', label: 'Production Targets', count: targets.length, icon: Target },
            { key: 'issues', label: 'Operational Bottlenecks', count: issues.length, icon: AlertTriangle },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchTerm(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                color: activeTab === key ? '#d97706' : 'var(--text-muted)',
                borderBottom: activeTab === key ? '3px solid #d97706' : '3px solid transparent',
                transition: 'all 0.2s', marginBottom: '-2px'
              }}
            >
              <Icon size={18} />
              {label}
              <span style={{
                fontSize: '0.72rem', padding: '2px 7px', borderRadius: '99px',
                backgroundColor: activeTab === key ? '#fef3c7' : '#f1f5f9',
                color: activeTab === key ? '#d97706' : '#64748b'
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

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

      {/* ─── TAB 1: SHIFT REPORTS ─── */}
      {activeTab === 'reports' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Date & Shift</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine Facility</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Actual Output</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Target</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Downtime</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Supervisor</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {new Date(r.report_date).toLocaleDateString()}
                    </div>
                    <div style={{ marginTop: '2px' }}><ShiftBadge shift={r.shift} /></div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{r.mine_name || `Mine #${r.mine_id}`}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>
                      {Number(r.actual_tonnes).toLocaleString()} T
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#64748b' }}>
                    {r.target_tonnes ? `${Number(r.target_tonnes).toLocaleString()} T` : '--'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px',
                      backgroundColor: r.equipment_downtime_hrs > 0 ? '#fee2e2' : '#f1f5f9',
                      color: r.equipment_downtime_hrs > 0 ? '#dc2626' : '#64748b',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {r.equipment_downtime_hrs} hrs
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {r.first_name ? `${r.first_name} ${r.last_name || ''}` : `User #${r.supervisor_id}`}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                    {r.remarks || 'Normal shift operations'}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No shift reports logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 2: TARGETS ─── */}
      {activeTab === 'targets' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine Facility</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Period Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Period</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Target (Tonnes)</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Configured Date</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {t.mine_name || `Mine #${t.mine_id}`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700 }}>
                      {t.period_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {t.period_value}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {Number(t.target_tonnes).toLocaleString()} T
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {targets.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No production targets set. Click "Set Targets" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 3: OPERATIONAL ISSUES ─── */}
      {activeTab === 'issues' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Issue ID / Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine & Area</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((iss) => (
                <tr key={iss.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{iss.id} • {iss.issue_type}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{iss.mine_name || `Mine #${iss.mine_id}`}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{iss.area || 'General Area'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '280px', fontSize: '0.85rem' }}>
                    {iss.description}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px',
                      backgroundColor: iss.severity === 'HIGH' ? '#fee2e2' : '#fef3c7',
                      color: iss.severity === 'HIGH' ? '#dc2626' : '#d97706',
                      fontSize: '0.72rem', fontWeight: 700
                    }}>
                      {iss.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: iss.status === 'RESOLVED' ? '#dcfce7' : '#fef3c7',
                      color: iss.status === 'RESOLVED' ? '#166534' : '#92400e',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {iss.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {iss.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveIssue(iss.id)}
                        className="sleek-btn"
                        style={{ padding: '5px 10px', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}
                      >
                        <Check size={14} style={{ marginRight: '4px' }} /> Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No operational issues logged. All equipment operating smoothly.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── MODAL: RECORD SHIFT OUTPUT ─── */}
      {showReportModal && (
        <RecordShiftModal
          mines={mines}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            if (onShowToast) onShowToast('Shift production logged');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: SET TARGET ─── */}
      {showTargetModal && (
        <SetTargetModal
          mines={mines}
          onClose={() => setShowTargetModal(false)}
          onSuccess={() => {
            setShowTargetModal(false);
            if (onShowToast) onShowToast('Target saved');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: REPORT OPERATIONAL ISSUE ─── */}
      {showIssueModal && (
        <ReportIssueModal
          mines={mines}
          onClose={() => setShowIssueModal(false)}
          onSuccess={() => {
            setShowIssueModal(false);
            if (onShowToast) onShowToast('Issue reported');
            loadData();
          }}
        />
      )}

    </div>
  );
}

// ─── Sub-Modal: Record Shift ──────────────────────────────────────────────────
function RecordShiftModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState('MORNING');
  const [actualTonnes, setActualTonnes] = useState('');
  const [targetTonnes, setTargetTonnes] = useState('');
  const [downtimeHrs, setDowntimeHrs] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !actualTonnes) return;
    setSubmitting(true);
    try {
      await api.createProductionReport({
        mine_id: mineId,
        report_date: reportDate,
        shift,
        actual_tonnes: parseFloat(actualTonnes),
        target_tonnes: targetTonnes ? parseFloat(targetTonnes) : 0,
        equipment_downtime_hrs: parseFloat(downtimeHrs) || 0,
        remarks,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to record shift');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Record Shift Output</h2>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Report Date</label>
              <input type="date" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={reportDate} onChange={e => setReportDate(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Shift</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={shift} onChange={e => setShift(e.target.value)}>
                <option value="MORNING">Morning (06:00 - 14:00)</option>
                <option value="AFTERNOON">Afternoon (14:00 - 22:00)</option>
                <option value="NIGHT">Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Actual (Tonnes) *</label>
              <input type="number" step="any" className="sleek-input" placeholder="e.g. 450" style={{ width: '100%', marginTop: '4px' }} value={actualTonnes} onChange={e => setActualTonnes(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Target (Tonnes)</label>
              <input type="number" step="any" className="sleek-input" placeholder="e.g. 500" style={{ width: '100%', marginTop: '4px' }} value={targetTonnes} onChange={e => setTargetTonnes(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Downtime (Hrs)</label>
              <input type="number" step="any" className="sleek-input" placeholder="0" style={{ width: '100%', marginTop: '4px' }} value={downtimeHrs} onChange={e => setDowntimeHrs(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Operational Remarks</label>
            <textarea className="sleek-input" rows="2" placeholder="e.g. Shovel 3 hydraulic maintenance 1.5h..." style={{ width: '100%', marginTop: '4px' }} value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#d97706', color: '#fff' }}>
              {submitting ? 'Recording...' : 'Record Output'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Set Target ────────────────────────────────────────────────────
function SetTargetModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [periodType, setPeriodType] = useState('MONTHLY');
  const [periodValue, setPeriodValue] = useState(new Date().toISOString().slice(0, 7)); // '2026-09'
  const [targetTonnes, setTargetTonnes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !targetTonnes) return;
    setSubmitting(true);
    try {
      await api.createProductionTarget({
        mine_id: mineId,
        period_type: periodType,
        period_value: periodValue,
        target_tonnes: parseFloat(targetTonnes),
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to set target');
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
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Set Production Target</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Site</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Period Type</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={periodType} onChange={e => setPeriodType(e.target.value)}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annual</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Period Code</label>
              <input type="text" className="sleek-input" placeholder="e.g. 2026-09" style={{ width: '100%', marginTop: '4px' }} value={periodValue} onChange={e => setPeriodValue(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Target Output (Tonnes) *</label>
            <input type="number" step="any" className="sleek-input" placeholder="e.g. 15000" style={{ width: '100%', marginTop: '4px' }} value={targetTonnes} onChange={e => setTargetTonnes(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              {submitting ? 'Saving...' : 'Set Target'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Report Issue ──────────────────────────────────────────────────
function ReportIssueModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [issueType, setIssueType] = useState('EQUIPMENT');
  const [severity, setSeverity] = useState('MEDIUM');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createOperationalIssue({
        mine_id: mineId,
        issue_type: issueType,
        severity,
        area,
        description,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to report issue');
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
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>Log Operational Bottleneck</h2>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Issue Category</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={issueType} onChange={e => setIssueType(e.target.value)}>
                <option value="EQUIPMENT">Equipment Breakdown</option>
                <option value="POWER">Power Supply Fault</option>
                <option value="SAFETY">Safety Stoppage</option>
                <option value="WEATHER">Heavy Rain / Weather</option>
                <option value="PERSONNEL">Staff Shortage</option>
                <option value="OTHER">Other Operational Issue</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Severity</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Halts Line)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Location / Sector</label>
            <input type="text" className="sleek-input" placeholder="e.g. Coal Washery Feeder #2" style={{ width: '100%', marginTop: '4px' }} value={area} onChange={e => setArea(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Issue Description *</label>
            <textarea className="sleek-input" rows="3" placeholder="Describe breakdown, affected machines, parts needed..." style={{ width: '100%', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#dc2626', color: '#fff' }}>
              {submitting ? 'Logging...' : 'Log Issue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
