import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, ClipboardCheck, Users,
  Activity, TrendingUp, TrendingDown, Minus,
  RefreshCw, Building2, Zap, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { api } from '../../services/api.js';

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => {
  const colorMap = {
    green: { bg: '#dcfce7', text: '#166534', icon: '#16a34a', border: '#bbf7d0' },
    red: { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626', border: '#fecaca' },
    amber: { bg: '#fef3c7', text: '#92400e', icon: '#d97706', border: '#fde68a' },
    blue: { bg: '#dbeafe', text: '#1e40af', icon: '#2563eb', border: '#bfdbfe' },
    purple: { bg: '#f3e8ff', text: '#6b21a8', icon: '#9333ea', border: '#e9d5ff' },
    slate: { bg: '#f1f5f9', text: '#334155', icon: '#64748b', border: '#e2e8f0' },
  };
  const c = colorMap[color] || colorMap.slate;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
        backgroundColor: c.bg, borderRadius: '0 16px 0 80px', opacity: 0.6,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
            {value ?? '—'}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>{subtitle}</div>
          )}
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              {trend > 0 ? <TrendingUp size={14} color="#16a34a" /> : trend < 0 ? <TrendingDown size={14} color="#dc2626" /> : <Minus size={14} color="#94a3b8" />}
              <span style={{ fontSize: '0.78rem', color: trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#94a3b8', fontWeight: '600' }}>
                {Math.abs(trend)}% vs last month
              </span>
            </div>
          )}
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={c.icon} />
        </div>
      </div>
    </div>
  );
};

const StatusBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = { green: '#16a34a', red: '#dc2626', amber: '#d97706', blue: '#2563eb' };
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '700' }}>{value} <span style={{ color: '#94a3b8', fontWeight: '400' }}>/ {total}</span></span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colorMap[color] || '#2563eb', borderRadius: '99px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};

export default function MineDashboard({ currentUser, onNavigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getMineDashboard();
      setData(res?.kpis || res);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Mine dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
    : currentUser?.username;

  const comp = data?.compliance || {};
  const inc = data?.incidents || {};
  const ins = data?.inspections || {};
  const viol = data?.violations || {};
  const compPct = data?.compliance_pct;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Mine Operations Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Welcome back, <strong>{displayName}</strong> · Real-time governance overview
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastRefreshed && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
              color: '#475569', fontWeight: '600', fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '140px', borderRadius: '16px', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Alert Banner */}
          {(data?.active_alerts > 0) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px', borderRadius: '12px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              marginBottom: '1.5rem',
            }}>
              <Zap size={18} color="#dc2626" />
              <span style={{ fontWeight: '700', color: '#991b1b', fontSize: '0.9rem' }}>
                {data.active_alerts} active emergency alert{data.active_alerts > 1 ? 's' : ''} — immediate attention required
              </span>
              <button
                onClick={() => onNavigateTo?.('alerts')}
                style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                View Alerts
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KPICard
              title="Compliance Rate"
              value={compPct !== null && compPct !== undefined ? `${compPct}%` : '—'}
              subtitle={`${comp.compliant || 0} of ${comp.total || 0} requirements met`}
              icon={Shield}
              color={compPct >= 80 ? 'green' : compPct >= 60 ? 'amber' : 'red'}
              onClick={() => onNavigateTo?.('compliance')}
            />
            <KPICard
              title="Open Incidents"
              value={inc.open_count ?? '—'}
              subtitle={`${inc.high_severity || 0} high severity this month`}
              icon={AlertTriangle}
              color={inc.open_count > 5 ? 'red' : inc.open_count > 2 ? 'amber' : 'green'}
              onClick={() => onNavigateTo?.('incidents')}
            />
            <KPICard
              title="Inspections"
              value={ins.completed ?? '—'}
              subtitle={`${ins.pending || 0} pending · ${ins.overdue || 0} overdue`}
              icon={ClipboardCheck}
              color={ins.overdue > 0 ? 'amber' : 'blue'}
              onClick={() => onNavigateTo?.('inspections')}
            />
            <KPICard
              title="Open Violations"
              value={viol.open_count ?? '—'}
              subtitle={`${viol.critical || 0} critical violations`}
              icon={XCircle}
              color={viol.critical > 0 ? 'red' : viol.open_count > 0 ? 'amber' : 'green'}
              onClick={() => onNavigateTo?.('inspections')}
            />
            <KPICard
              title="Workers On-Site"
              value={data?.attendance_today ?? '—'}
              subtitle="Checked in today"
              icon={Users}
              color="blue"
              onClick={() => onNavigateTo?.('attendance')}
            />
            <KPICard
              title="Active Alerts"
              value={data?.active_alerts ?? '—'}
              subtitle="Emergency alerts right now"
              icon={Activity}
              color={data?.active_alerts > 0 ? 'red' : 'green'}
              onClick={() => onNavigateTo?.('alerts')}
            />
          </div>

          {/* Detail Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Compliance breakdown */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                  Compliance Breakdown
                </h3>
                <button onClick={() => onNavigateTo?.('compliance')} style={{ fontSize: '0.78rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  View All →
                </button>
              </div>
              <StatusBar label="Compliant" value={comp.compliant || 0} total={comp.total || 0} color="green" />
              <StatusBar label="Non-Compliant" value={comp.non_compliant || 0} total={comp.total || 0} color="red" />
              <StatusBar label="Overdue" value={comp.overdue || 0} total={comp.total || 0} color="amber" />
              <StatusBar label="Pending Review" value={comp.pending || 0} total={comp.total || 0} color="blue" />
            </div>

            {/* Incident & Inspection summary */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                  Safety Summary (Last 30 Days)
                </h3>
              </div>
              {[
                { label: 'Total Incidents', value: inc.total || 0, icon: AlertTriangle, color: '#d97706' },
                { label: 'High Severity Incidents', value: inc.high_severity || 0, icon: XCircle, color: '#dc2626' },
                { label: 'Resolved Incidents', value: inc.closed_count || 0, icon: CheckCircle2, color: '#16a34a' },
                { label: 'Overdue Inspections', value: ins.overdue || 0, icon: Clock, color: '#d97706' },
                { label: 'Critical Violations', value: viol.critical || 0, icon: AlertTriangle, color: '#dc2626' },
              ].map((row, i) => {
                const RowIcon = row.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: row.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RowIcon size={15} color={row.color} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#475569', flex: 1 }}>{row.label}</span>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{row.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
