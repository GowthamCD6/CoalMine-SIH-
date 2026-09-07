import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud, Droplets, Wind, AlertTriangle, Activity, CheckCircle2,
  BarChart2, RefreshCw, Plus, Sliders, MapPin, Search,
  Flame, Volume2, Thermometer, ShieldAlert, X, Eye
} from 'lucide-react';
import { api } from '../../services/api.js';

const PARAMETER_CONFIG = {
  AIR_DUST: {
    label: 'Air Dust (PM2.5 / PM10)',
    icon: Wind,
    color: '#0284c7',
    bg: '#e0f2fe',
    defaultUnit: 'µg/m³',
    normalRange: '< 100 µg/m³',
    standard: 'NAAQS 2009',
  },
  WATER_QUALITY: {
    label: 'Water Discharge (pH / TDS)',
    icon: Droplets,
    color: '#059669',
    bg: '#d1fae5',
    defaultUnit: 'pH',
    normalRange: '6.5 - 8.5 pH',
    standard: 'MoEFCC Schedule VI',
  },
  NOISE: {
    label: 'Ambient & Machinery Noise',
    icon: Volume2,
    color: '#d97706',
    bg: '#fef3c7',
    defaultUnit: 'dB',
    normalRange: '< 85 dB',
    standard: 'DGMS Tech Circular',
  },
  METHANE: {
    label: 'Methane Gas (CH4)',
    icon: Flame,
    color: '#dc2626',
    bg: '#fee2e2',
    defaultUnit: '%',
    normalRange: '< 0.5 %',
    standard: 'CMR 1957 Reg 136',
  },
  CO2: {
    label: 'Carbon Dioxide (CO2)',
    icon: Cloud,
    color: '#7c3aed',
    bg: '#ede9fe',
    defaultUnit: 'ppm',
    normalRange: '< 5000 ppm',
    standard: 'DGMS Air Quality Norms',
  },
  TEMPERATURE: {
    label: 'Working Face Temperature',
    icon: Thermometer,
    color: '#ea580c',
    bg: '#ffedd5',
    defaultUnit: '°C',
    normalRange: '< 33.5 °C',
    standard: 'CMR Regulation 142',
  },
};

const StatusBadge = ({ status }) => {
  const map = {
    NORMAL:             { bg: '#dcfce7', text: '#166534', label: 'Normal', icon: CheckCircle2 },
    THRESHOLD_EXCEEDED: { bg: '#fef3c7', text: '#92400e', label: 'Threshold Exceeded', icon: AlertTriangle },
    CRITICAL:           { bg: '#fee2e2', text: '#991b1b', label: 'Critical Breach', icon: ShieldAlert },
  };
  const c = map[status] || { bg: '#f1f5f9', text: '#475569', label: status };
  const Icon = c.icon;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      {Icon && <Icon size={12} />}
      {c.label}
    </span>
  );
};

export default function EnvironmentMonitoringView({ onShowToast }) {
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [summary, setSummary] = useState(null);
  const [mines, setMines] = useState([]);

  // Filters
  const [paramFilter, setParamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);

  // Load mines
  useEffect(() => {
    api.getMines({ limit: 100 })
      .then(res => setMines(Array.isArray(res) ? res : res?.data || res?.rows || []))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, obsRes, threshRes] = await Promise.all([
        api.getEnvSummary().catch(() => null),
        api.getEnvObservations({ parameter_type: paramFilter || undefined, status: statusFilter || undefined, limit: 100 }).catch(() => ({ data: [] })),
        api.getEnvThresholds().catch(() => []),
      ]);

      setSummary(sumRes?.data || sumRes || null);
      setObservations(obsRes?.data?.rows || obsRes?.data || obsRes?.rows || (Array.isArray(obsRes) ? obsRes : []));
      setThresholds(threshRes?.data || threshRes || (Array.isArray(threshRes) ? threshRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load environmental data', true);
    } finally {
      setLoading(false);
    }
  }, [paramFilter, statusFilter, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = observations.filter(o =>
    (o.parameter_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cloud size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>
              Environmental & Pollution Monitoring
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
              MoEFCC & DGMS TELEMETRY
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={loadData}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowThresholdModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Sliders size={15} /> Statutory Limits
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="sleek-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0284c7', color: '#fff', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Plus size={15} /> Log Reading
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <div key={n} style={{
              backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px' }} className="mo-skeleton-cell" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ width: '45px', height: '24px' }} className="mo-skeleton-val" />
                <div style={{ width: '90px', height: '12px' }} className="mo-skeleton-cell" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div style={{
              backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
              border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                  {summary?.normal_count ?? observations.filter(o => o.status === 'NORMAL').length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Normal Parameters</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
              border: '1px solid #fef3c7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
                  {summary?.exceeded_count ?? observations.filter(o => o.status === 'THRESHOLD_EXCEEDED').length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threshold Exceeded</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
              border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={22} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
                  {summary?.critical_count ?? observations.filter(o => o.status === 'CRITICAL').length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Critical Breaches</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
              border: '1px solid #e0f2fe', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={22} color="#0284c7" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>
                  {summary?.total || observations.length || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Monitored Logs</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Parameter Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {Object.entries(PARAMETER_CONFIG).map(([paramKey, cfg]) => {
          const Icon = cfg.icon;
          const paramReadings = observations.filter(o => o.parameter_type === paramKey);
          const latest = paramReadings[0];
          return (
            <div key={paramKey} style={{
              backgroundColor: '#fff', borderRadius: '14px', padding: '1.2rem',
              border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{cfg.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cfg.standard}</div>
                  </div>
                </div>
                {latest && <StatusBadge status={latest.status} />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {latest ? parseFloat(latest.value).toFixed(1) : '--'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 600 }}>
                    {latest?.unit || cfg.defaultUnit}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Statutory Norm: <strong>{cfg.normalRange}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                {latest ? `Last updated: ${new Date(latest.observed_at).toLocaleTimeString()}` : 'No readings logged today'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="sleek-input"
            value={paramFilter}
            onChange={e => setParamFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '180px' }}
          >
            <option value="">All Parameters</option>
            <option value="AIR_DUST">Air Dust</option>
            <option value="WATER_QUALITY">Water Quality</option>
            <option value="NOISE">Noise Level</option>
            <option value="METHANE">Methane (CH4)</option>
            <option value="CO2">Carbon Dioxide</option>
            <option value="TEMPERATURE">Temperature</option>
          </select>

          <select
            className="sleek-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="THRESHOLD_EXCEEDED">Exceeded</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="sleek-input"
            placeholder="Search observations by mine, parameter..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Observations Feed Table */}
      <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Reading ID / Parameter</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine Facility</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Recorded Value</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Compliance Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Logged By</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} style={{ borderBottom: '1px solid #f1f5f9' }} className="mo-skeleton-row">
                  <td style={{ padding: '14px 16px' }}>
                    <div className="mo-skeleton-cell" style={{ width: '65%', height: '14px', marginBottom: '6px' }} />
                    <div className="mo-skeleton-cell" style={{ width: '45%', height: '10px' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}><div className="mo-skeleton-cell" style={{ width: '70%', height: '14px' }} /></td>
                  <td style={{ padding: '14px 16px' }}><div className="mo-skeleton-cell" style={{ width: '65px', height: '18px' }} /></td>
                  <td style={{ padding: '14px 16px' }}><div className="mo-skeleton-cell" style={{ width: '85px', height: '22px', borderRadius: '99px' }} /></td>
                  <td style={{ padding: '14px 16px' }}><div className="mo-skeleton-cell" style={{ width: '90px', height: '14px' }} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}><div className="mo-skeleton-cell" style={{ width: '80px', height: '14px', marginLeft: 'auto' }} /></td>
                </tr>
              ))
            ) : filtered.map((obs) => {
              const cfg = PARAMETER_CONFIG[obs.parameter_type] || {};
              return (
                <tr key={obs.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      #{obs.id} • {cfg.label || obs.parameter_type}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{obs.mine_name || `Mine #${obs.mine_id}`}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: obs.status === 'CRITICAL' ? '#dc2626' : obs.status === 'THRESHOLD_EXCEEDED' ? '#d97706' : '#16a34a' }}>
                      {obs.value} {obs.unit}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={obs.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {obs.first_name ? `${obs.first_name} ${obs.last_name || ''}` : `User #${obs.observer_id}`}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(obs.observed_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No environmental readings logged matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL: LOG READING ─── */}
      {showLogModal && (
        <LogReadingModal
          mines={mines}
          onClose={() => setShowLogModal(false)}
          onSuccess={() => {
            setShowLogModal(false);
            if (onShowToast) onShowToast('Environmental reading recorded');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: SET THRESHOLDS ─── */}
      {showThresholdModal && (
        <SetThresholdsModal
          mines={mines}
          thresholds={thresholds}
          onClose={() => setShowThresholdModal(false)}
          onSuccess={() => {
            setShowThresholdModal(false);
            if (onShowToast) onShowToast('Statutory thresholds updated');
            loadData();
          }}
        />
      )}

    </div>
  );
}

// ─── Sub-Modal: Log Reading ──────────────────────────────────────────────────
function LogReadingModal({ mines, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [parameterType, setParameterType] = useState('AIR_DUST');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(PARAMETER_CONFIG['AIR_DUST'].defaultUnit);
  const [submitting, setSubmitting] = useState(false);

  const handleParamChange = (param) => {
    setParameterType(param);
    setUnit(PARAMETER_CONFIG[param]?.defaultUnit || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId || !value) return;
    setSubmitting(true);
    try {
      await api.createEnvObservation({
        mine_id: mineId,
        parameter_type: parameterType,
        value: parseFloat(value),
        unit,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to log reading');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Log Environmental Reading</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Facility</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Parameter Type</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={parameterType} onChange={e => handleParamChange(e.target.value)}>
              {Object.entries(PARAMETER_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Measured Value *</label>
              <input type="number" step="any" className="sleek-input" placeholder="e.g. 84.5" style={{ width: '100%', marginTop: '4px' }} value={value} onChange={e => setValue(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Unit</label>
              <input type="text" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={unit} onChange={e => setUnit(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#0284c7', color: '#fff' }}>
              {submitting ? 'Logging...' : 'Save Reading'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Statutory Thresholds ─────────────────────────────────────────
function SetThresholdsModal({ mines, thresholds, onClose, onSuccess }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [parameterType, setParameterType] = useState('AIR_DUST');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [unit, setUnit] = useState(PARAMETER_CONFIG['AIR_DUST'].defaultUnit);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mineId) return;
    setSubmitting(true);
    try {
      await api.upsertEnvThreshold({
        mine_id: mineId,
        parameter_type: parameterType,
        min_value: minValue ? parseFloat(minValue) : null,
        max_value: maxValue ? parseFloat(maxValue) : null,
        unit,
        alert_on_breach: true,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to update threshold');
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Configure Statutory Thresholds</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Facility</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Parameter</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={parameterType} onChange={e => {
              setParameterType(e.target.value);
              setUnit(PARAMETER_CONFIG[e.target.value]?.defaultUnit || '');
            }}>
              {Object.entries(PARAMETER_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Min Value</label>
              <input type="number" step="any" className="sleek-input" placeholder="e.g. 6.5" style={{ width: '100%', marginTop: '4px' }} value={minValue} onChange={e => setMinValue(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Max Value</label>
              <input type="number" step="any" className="sleek-input" placeholder="e.g. 100" style={{ width: '100%', marginTop: '4px' }} value={maxValue} onChange={e => setMaxValue(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Unit</label>
              <input type="text" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              {submitting ? 'Saving...' : 'Save Threshold'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
