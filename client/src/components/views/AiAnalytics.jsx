import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Wrench,
  Info
} from 'lucide-react';

export default function AiAnalytics({ onShowToast }) {
  const [selectedAsset, setSelectedAsset] = useState('PUMP_4B'); // 'PUMP_4B' | 'FAN_EXHAUST' | 'CONTINUOUS_MINER'

  // 30-Day Failure Probability Data Curve
  const failureDays = [
    { day: 1, prob: 10 }, { day: 3, prob: 12 }, { day: 6, prob: 15 },
    { day: 9, prob: 18 }, { day: 12, prob: 24 }, { day: 15, prob: 35 },
    { day: 18, prob: 48 }, { day: 21, prob: 62 }, { day: 24, prob: 78 },
    { day: 27, prob: 88 }, { day: 30, prob: 96 }
  ];

  // Radar Axes Data (0 to 100)
  const radarAxes = [
    { label: 'Ventilation', jharia: 85, raniganj: 30 },
    { label: 'Seismic Tremor', jharia: 40, raniganj: 20 },
    { label: 'Water Ingress', jharia: 50, raniganj: 35 },
    { label: 'Methane Gas', jharia: 90, raniganj: 25 },
    { label: 'Roof Structural', jharia: 65, raniganj: 45 },
    { label: 'Equipment Stress', jharia: 75, raniganj: 40 },
  ];

  // Helper to generate polygon SVG points for Radar
  const radarCenter = 140;
  const radarRadius = 100;
  const totalAxes = radarAxes.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  };

  const jhariaPoints = radarAxes.map((axis, i) => {
    const { x, y } = getCoordinates(i, axis.jharia);
    return `${x},${y}`;
  }).join(' ');

  const raniganjPoints = radarAxes.map((axis, i) => {
    const { x, y } = getCoordinates(i, axis.raniganj);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={28} color="var(--primary)" />
            AI Predictive Risk & Equipment Telemetry Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            Machine learning failure degradation curves, subsurface hazard multi-factor radar models, and automated work orders
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              if (onShowToast) onShowToast('Automated SAP PM Maintenance Work Order WO-8902 dispatched to Jharia Shop.');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Wrench size={15} />
            <span>Generate Preventive Work Order</span>
          </button>
        </div>
      </div>

      {/* Grid: Predictive Failure Chart + Multi-Axis Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        {/* Predictive Curve Chart */}
        <div className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Equipment Failure Forecast (Next 30 Days)</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Asset: <strong>Submersible De-watering Pump #04B (Level 3 Incline)</strong>
              </span>
            </div>
            <span className="badge-pill badge-danger">
              High Wear Warning
            </span>
          </div>

          {/* SVG Line & Gradient Chart */}
          <div style={{ flex: 1, minHeight: '260px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 500 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="failureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = 200 - (val / 100) * 160;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x="15" y={y + 4} fontSize="11" fill="#94a3b8" fontFamily="Inter">{val}%</text>
                  </g>
                );
              })}

              {/* Threshold Line at 70% */}
              <line x1="40" y1={200 - (70 / 100) * 160} x2="480" y2={200 - (70 / 100) * 160} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="350" y={200 - (70 / 100) * 160 - 6} fontSize="10" fill="#b45309" fontWeight="bold">Critical Threshold (70%)</text>

              {/* Area Under Curve */}
              <path
                d={`
                  M 40,${200 - (failureDays[0].prob / 100) * 160}
                  ${failureDays.map((d, idx) => {
                    const x = 40 + (idx / (failureDays.length - 1)) * 440;
                    const y = 200 - (d.prob / 100) * 160;
                    return `L ${x},${y}`;
                  }).join(' ')}
                  L 480,200 L 40,200 Z
                `}
                fill="url(#failureGradient)"
              />

              {/* Line Curve */}
              <path
                d={`
                  M 40,${200 - (failureDays[0].prob / 100) * 160}
                  ${failureDays.map((d, idx) => {
                    const x = 40 + (idx / (failureDays.length - 1)) * 440;
                    const y = 200 - (d.prob / 100) * 160;
                    return `L ${x},${y}`;
                  }).join(' ')}
                `}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {failureDays.map((d, idx) => {
                const x = 40 + (idx / (failureDays.length - 1)) * 440;
                const y = 200 - (d.prob / 100) * 160;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" />
                    <text x={x} y="222" fontSize="10" fill="#64748b" textAnchor="middle">D{d.day}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '10px 14px',
            backgroundColor: 'var(--warning-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--warning-border)',
            fontSize: '0.8rem',
            color: 'var(--warning-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={16} />
            <span>
              <strong>AI Recommendation:</strong> Sump Pump #04B bearing vibration exceeds tolerance on Day 18 (62% probability). Schedule impeller replacement within 9 days to prevent flooding.
            </span>
          </div>
        </div>

        {/* Hazard Radar Chart */}
        <div className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Multi-Factor Hazard Radar</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Subterranean environmental risk vectors
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(239, 68, 68, 0.4)', border: '2px solid #ef4444' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Jharia Block II (Critical)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.4)', border: '2px solid #10b981' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Raniganj East (Normal)</span>
            </div>
          </div>

          {/* SVG Radar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
            <svg viewBox="0 0 280 280" style={{ width: '260px', height: '260px', overflow: 'visible' }}>
              {/* Concentric Web Rings */}
              {[0.25, 0.5, 0.75, 1.0].map((ring, idx) => (
                <polygon
                  key={idx}
                  points={radarAxes.map((_, i) => {
                    const { x, y } = getCoordinates(i, ring * 100);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}

              {/* Axis Spoke Lines */}
              {radarAxes.map((axis, i) => {
                const { x, y } = getCoordinates(i, 100);
                const labelPos = getCoordinates(i, 122);
                return (
                  <g key={i}>
                    <line x1={radarCenter} y1={radarCenter} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      fontSize="9"
                      fill="#475569"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="Inter"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              {/* Jharia Polygon */}
              <polygon
                points={jhariaPoints}
                fill="rgba(239, 68, 68, 0.25)"
                stroke="#ef4444"
                strokeWidth="2"
              />

              {/* Raniganj Polygon */}
              <polygon
                points={raniganjPoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
