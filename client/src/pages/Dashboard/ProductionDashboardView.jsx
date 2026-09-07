import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Pickaxe, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, Search, Filter, TrendingUp, Calendar, User,
  Wrench, Activity, AlertOctagon, Target, Zap, CloudRain,
  X, Check, Sunrise, Sun, Moon
} from 'lucide-react';
import { api } from '../../services/api.js';

const ShiftBadge = ({ shift }) => {
  const map = {
    MORNING:   { bg: '#fef3c7', text: '#92400e', label: 'Morning', icon: Sunrise },
    AFTERNOON: { bg: '#e0f2fe', text: '#0369a1', label: 'Afternoon', icon: Sun },
    NIGHT:     { bg: '#ede9fe', text: '#5b21b6', label: 'Night', icon: Moon },
  };
  const c = map[shift] || { bg: '#f1f5f9', text: '#475569', label: shift };
  const Icon = c.icon;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '6px',
      backgroundColor: c.bg,
      color: c.text,
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {Icon && <Icon size={12} />}
      {c.label}
    </span>
  );
};
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

  const toastRef = useRef(onShowToast);
  toastRef.current = onShowToast;

  // Load mines list once
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
      if (toastRef.current) toastRef.current(err.message || 'Failed to load production data', true);
    } finally {
      setLoading(false);
    }
  }, [shiftFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveIssue = async (id) => {
    try {
      await api.updateOperationalIssueStatus(id, 'RESOLVED');
      if (toastRef.current) toastRef.current('Operational issue marked resolved');
      loadData();
    } catch (err) {
      if (toastRef.current) toastRef.current(err.message, true);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '2rem' }}>

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Pickaxe size={26} color="#2563eb" />
            Production & Mining Operations
          </h1>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            title="Refresh production records"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowTargetModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Target size={14} color="#2563eb" />
            <span>Set Targets</span>
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <AlertTriangle size={14} color="#d97706" />
            <span>Log Bottleneck</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Record Shift Output</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            flexShrink: 0,
          }}>
            <Pickaxe size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {Number(summary?.total_actual_tonnes || 0).toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tonnes</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Total Coal Produced</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            flexShrink: 0,
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', lineHeight: 1.1 }}>
              {summary?.achievement_rate || 100}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Target Achievement</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            flexShrink: 0,
          }}>
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {Number(summary?.total_downtime_hrs || 0).toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Hrs</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Equipment Downtime</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
            flexShrink: 0,
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {summary?.open_issues ?? issues.filter(i => i.status === 'OPEN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Active Bottlenecks</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Strip & Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '0 2px',
      }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[
            { key: 'reports', label: 'Shift Output Logs', count: reports.length, icon: Pickaxe },
            { key: 'targets', label: 'Production Targets', count: targets.length, icon: Target },
            { key: 'issues', label: 'Operational Bottlenecks', count: issues.length, icon: AlertTriangle },
          ].map(({ key, label, count, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setActiveTab(key); setSearchTerm(''); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 18px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={isActive ? '#2563eb' : '#64748b'} />
                <span>{label}</span>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                  color: isActive ? '#1d4ed8' : '#64748b',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
          {activeTab === 'reports' && (
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              style={{
                height: '36px',
                padding: '0 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                color: '#334155',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Shifts</option>
              <option value="MORNING">Morning Shift</option>
              <option value="AFTERNOON">Afternoon Shift</option>
              <option value="NIGHT">Night Shift</option>
            </select>
          )}

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'reports' ? 'logs' : activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── TAB 1: SHIFT REPORTS ─── */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
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
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
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
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
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
            <button type="button" onClick={onClose} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
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
            <button type="button" onClick={onClose} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Log Operational Bottleneck</h2>
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
            <button type="button" onClick={onClose} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              {submitting ? 'Logging...' : 'Log Issue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
