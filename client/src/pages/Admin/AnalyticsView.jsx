import React from 'react';
import { BrainCircuit, Activity, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AnalyticsView({ onShowToast }) {
  const metrics = [
    { label: 'Overall Risk Score', value: '42 / 100', trend: '-5%', status: 'Nominal', icon: ShieldAlert },
    { label: 'Ventilation Efficiency', value: '94%', trend: '+2%', status: 'Optimal', icon: Activity },
    { label: 'Predicted Subsidence', value: '0.02mm', trend: 'Stable', status: 'Optimal', icon: TrendingUp },
  ];

  return (
    <div className="manage-orders-container" style={{ padding: '0 0 20px', gap: '12px' }}>
      {/* Header */}
      <div className="filter-prototype-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
          <BrainCircuit size={28} color="var(--primary)" />
          AI Risk Analytics
        </h2>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Predictive analytics engine analyzing sensor telemetry to forecast potential hazards.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mo-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="mo-stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>{m.label}</span>
                <Icon size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.value}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', width: '100%' }}>
                <span style={{ color: m.trend.includes('-') || m.trend === 'Stable' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>Trend: {m.trend}</span>
                <span style={{ fontWeight: 700, color: m.status === 'Optimal' || m.status === 'Nominal' ? 'var(--success)' : 'var(--danger)' }}>{m.status}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Simulated Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div className="filter-prototype-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>7-Day Hazard Prediction Curve</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0', borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0' }}>
            {/* CSS Bar Chart Simulation */}
            {[40, 35, 55, 30, 20, 65, 25].map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${val}%`, 
                  backgroundColor: val > 60 ? 'var(--danger)' : val > 40 ? 'var(--warning)' : 'var(--primary)',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8,
                  transition: 'height 0.3s ease'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-prototype-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Top Risk Factors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span>Methane Buildup</span>
                <span style={{ fontWeight: 'bold' }}>78%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '78%', height: '100%', backgroundColor: 'var(--danger)', borderRadius: '4px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span>Strata Instability</span>
                <span style={{ fontWeight: 'bold' }}>42%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--warning)', borderRadius: '4px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span>Equipment Fatigue</span>
                <span style={{ fontWeight: 'bold' }}>15%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '15%', height: '100%', backgroundColor: 'var(--success)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
