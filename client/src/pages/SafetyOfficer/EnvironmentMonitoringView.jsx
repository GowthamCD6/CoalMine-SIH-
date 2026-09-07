import React, { useState } from 'react';
import { Cloud, Droplets, Wind, AlertTriangle, Activity, CheckCircle, BarChart2 } from 'lucide-react';

export default function EnvironmentMonitoringView({ onShowToast }) {
  const [sensors] = useState([
    { id: 'ENV-AQI-01', location: 'Open Cast Pit Alpha', type: 'Air Quality (PM2.5)', value: '145 µg/m³', status: 'Warning', trend: '+12%' },
    { id: 'ENV-AQI-02', location: 'Main Processing Plant', type: 'Air Quality (PM10)', value: '85 µg/m³', status: 'Normal', trend: '-5%' },
    { id: 'ENV-H2O-01', location: 'Discharge Point A', type: 'Water pH Level', value: '6.8 pH', status: 'Normal', trend: 'Stable' },
    { id: 'ENV-NOS-04', location: 'Heavy Machinery Zone', type: 'Noise Level', value: '95 dB', status: 'Critical', trend: '+15%' },
    { id: 'ENV-GAS-01', location: 'Underground Shaft B', type: 'Methane (CH4)', value: '0.1%', status: 'Normal', trend: 'Stable' },
  ]);

  return (
    <div className="manage-orders-container" style={{ padding: '0 0 20px', gap: '12px' }}>
      {/* Header */}
      <div className="filter-prototype-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <Cloud size={28} color="var(--primary)" />
              Environmental & Pollution Control
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Real-time monitoring of air, water, and noise pollution for statutory compliance (MoEFCC).
            </p>
          </div>
          <button className="btn btn-apply" onClick={() => onShowToast('Generating Environmental Report...')}>
            <BarChart2 size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Average AQI</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>124</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '10px' }}>
              <Wind size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <AlertTriangle size={14} /> Moderate Pollution
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Water Discharge pH</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>6.8</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}>
              <Droplets size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle size={14} /> Within limits
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Active Violations</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>2</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '10px' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Activity size={14} /> Requires immediate action
          </div>
        </div>
      </div>

      {/* Sensor List */}
      <h3 style={{ margin: '10px 0 0 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Live Sensor Feed</h3>
      <div className="sleek-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Sensor ID</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Location</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Type</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Value</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{sensor.id}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-body)' }}>{sensor.location}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-body)' }}>{sensor.type}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {sensor.value} 
                  <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: sensor.trend.includes('+') ? 'var(--danger)' : 'var(--success)' }}>
                    {sensor.trend}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge-pill ${
                    sensor.status === 'Normal' ? 'badge-success' : 
                    sensor.status === 'Warning' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {sensor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
