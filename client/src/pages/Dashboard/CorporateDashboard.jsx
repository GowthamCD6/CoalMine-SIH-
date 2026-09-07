import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Shield, RefreshCw, Activity,
  ArrowUpRight, CheckCircle2, XCircle, BarChart3
} from 'lucide-react';
import { api } from '../../services/api.js';

const RiskBadge = ({ level }) => {
  const map = {
    HIGH: { bg: '#fee2e2', text: '#991b1b', label: 'HIGH RISK' },
    MEDIUM: { bg: '#fef3c7', text: '#92400e', label: 'MEDIUM' },
    LOW: { bg: '#dcfce7', text: '#166534', label: 'LOW RISK' },
  };
  const c = map[level] || map.LOW;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '99px', fontSize: '0.7rem',
      fontWeight: '700', backgroundColor: c.bg, color: c.text, letterSpacing: '0.04em',
    }}>
      {c.label}
    </span>
  );
};

const CompliancePill = ({ pct }) => {
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const bg = pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2';
  return (
    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: bg, color }}>
      {pct !== null && pct !== undefined ? `${pct}%` : '—'}
    </span>
  );
};

export default function CorporateDashboard({ currentUser, onNavigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('risk_level');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getCorporateDashboard();
      setData(res);
    } catch (err) {
      console.warn('Corporate dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary || {};
  const mines = data?.mines || [];

  const sortedMines = [...mines].sort((a, b) => {
    if (sortKey === 'risk_level') {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (order[a.risk_level] ?? 2) - (order[b.risk_level] ?? 2);
    }
    if (sortKey === 'compliance_pct') return (a.compliance_pct ?? -1) - (b.compliance_pct ?? -1);
    if (sortKey === 'open_incidents') return b.open_incidents - a.open_incidents;
    return 0;
  });

  const highRiskCount = mines.filter((m) => m.risk_level === 'HIGH').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Corporate Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Consolidated governance view across all mine sites
          </p>
        </div>
        <button
          onClick={load}
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

      {/* Summary KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Mine Sites', value: summary.total_mines ?? '—', icon: Building2, color: '#2563eb', bg: '#dbeafe' },
          { label: 'High Risk Sites', value: highRiskCount, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Avg Compliance', value: summary.avg_compliance_pct !== null ? `${summary.avg_compliance_pct}%` : '—', icon: Shield, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Active Alerts', value: mines.reduce((s, m) => s + (m.active_alerts || 0), 0), icon: Activity, color: '#d97706', bg: '#fef3c7' },
        ].map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CardIcon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{card.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* High-risk alert */}
      {highRiskCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '12px',
          backgroundColor: '#fff5f5', border: '1px solid #fecaca',
          marginBottom: '1.5rem',
        }}>
          <AlertTriangle size={18} color="#dc2626" />
          <span style={{ fontWeight: '600', color: '#991b1b', fontSize: '0.88rem' }}>
            {highRiskCount} mine site{highRiskCount > 1 ? 's are' : ' is'} rated HIGH RISK. Review and take immediate corrective action.
          </span>
        </div>
      )}

      {/* Mine sites table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            All Mine Sites — Governance Status
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'risk_level', label: 'By Risk' },
              { key: 'compliance_pct', label: 'By Compliance' },
              { key: 'open_incidents', label: 'By Incidents' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                style={{
                  padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem',
                  fontWeight: '600', cursor: 'pointer',
                  border: sortKey === key ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: sortKey === key ? '#dbeafe' : 'transparent',
                  color: sortKey === key ? '#1e40af' : '#64748b',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading mine data…</div>
        ) : mines.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No mine sites found in your scope.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem', fontWeight: '700' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mine Site</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Organization</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Risk Level</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Compliance</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Open Incidents</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Open Violations</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {sortedMines.map((mine, i) => (
                <tr
                  key={mine.mine_id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: mine.risk_level === 'HIGH' ? '#dc2626' : mine.risk_level === 'MEDIUM' ? '#d97706' : '#16a34a' }} />
                      {mine.mine_name}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{mine.org_name}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><RiskBadge level={mine.risk_level} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><CompliancePill pct={mine.compliance_pct} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: mine.open_incidents > 0 ? '#dc2626' : '#16a34a', fontWeight: '700' }}>{mine.open_incidents}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: mine.open_violations > 0 ? '#d97706' : '#16a34a', fontWeight: '700' }}>{mine.open_violations}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {mine.active_alerts > 0 ? (
                      <span style={{ padding: '2px 8px', borderRadius: '99px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '700', fontSize: '0.78rem' }}>
                        🔴 {mine.active_alerts}
                      </span>
                    ) : (
                      <CheckCircle2 size={16} color="#16a34a" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
