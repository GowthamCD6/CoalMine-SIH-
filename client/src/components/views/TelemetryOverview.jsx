import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Radio, 
  ShieldAlert, 
  Server, 
  Database, 
  Pickaxe, 
  Wind, 
  Flame, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export default function TelemetryOverview({ serverStatus, stats, onNavigateTo }) {
  // Live simulated pit telemetry data
  const [pits, setPits] = useState([
    {
      code: 'PIT-ALPHA-01',
      zone: 'Eastern Seam #4',
      ch4: 0.18,
      co: 4.2,
      ventilation: 98.2,
      temp: 24.5,
      status: 'Nominal',
      trend: 'stable',
    },
    {
      code: 'SHAFT-BETA-03',
      zone: 'Underground Block C',
      ch4: 0.31,
      co: 6.8,
      ventilation: 112.5,
      temp: 26.1,
      status: 'Nominal',
      trend: 'stable',
    },
    {
      code: 'PIT-GAMMA-09',
      zone: 'Deep Incline Quarry',
      ch4: 0.48,
      co: 11.4,
      ventilation: 84.0,
      temp: 29.3,
      status: 'Caution',
      trend: 'rising',
    },
    {
      code: 'EXP-DELTA-02',
      zone: 'South Expansion Track',
      ch4: 0.12,
      co: 3.1,
      ventilation: 95.0,
      temp: 23.8,
      status: 'Nominal',
      trend: 'stable',
    },
    {
      code: 'RAM-INCLINE-05',
      zone: 'Ramgarh Block #2',
      ch4: 0.22,
      co: 5.5,
      ventilation: 104.2,
      temp: 25.2,
      status: 'Nominal',
      trend: 'stable',
    },
  ]);

  // Subtle real-time fluctuations to give a live telemetry feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setPits((prev) =>
        prev.map((pit) => {
          const delta = (Math.random() - 0.5) * 0.02;
          const newCh4 = Math.max(0.05, Math.min(0.75, Number((pit.ch4 + delta).toFixed(2))));
          const newStatus = newCh4 >= 0.45 ? 'Caution' : 'Nominal';
          return {
            ...pit,
            ch4: newCh4,
            ventilation: Number((pit.ventilation + (Math.random() - 0.5) * 0.4).toFixed(1)),
            temp: Number((pit.temp + (Math.random() - 0.5) * 0.1).toFixed(1)),
            status: newStatus,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Operational Overview & Telemetry
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            Real-time environmental sensor telemetry, pit ventilation, and multi-subsidiary KPI tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: 'var(--text-body)',
            fontWeight: 500,
            boxShadow: 'var(--shadow-xs)',
          }}>
            <Clock size={14} color="var(--primary)" />
            Live Sync: Every 4s
          </span>
          <button
            onClick={() => onNavigateTo('inspections')}
            style={{
              padding: '7px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>View 6 Open Inspections</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Card 1 */}
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active Mining Units
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.minesActive || 14}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>5 Subsidiaries</span>
            <span>across Jharkhand & Bengal</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Daily Output (Tons)
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {(stats?.productionTodayTons || 4520).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--success-text)', marginTop: '4px', fontWeight: 600 }}>
            <span>↑ +6.4%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs target dispatch</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active IoT Sensor Mesh
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--info-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--info)',
            }}>
              <Radio size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.sensorsOnline || 148}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gas, airflow, temperature & vibration
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Operational Safety Index
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--warning-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning-text)',
            }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.operationalEfficiency || '98.4%'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success-text)', marginTop: '4px', fontWeight: 600 }}>
            Zero critical breaches logged
          </div>
        </div>
      </div>

      {/* Main Content Split: Telemetry Table + Architecture Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.2fr 1fr',
        gap: '1.5rem',
      }}>
        {/* Pit & Shaft Telemetry Table */}
        <div className="card-white" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Active Pit & Shaft Environmental Telemetry</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Multi-point subterranean methane, carbon monoxide, and ventilation flow rate monitoring
              </p>
            </div>
            <span className="badge-pill badge-success">
              <span className="pulse-dot pulse-success" />
              All Zones Active
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table-white">
              <thead>
                <tr>
                  <th>Site Code</th>
                  <th>Zone / Seam</th>
                  <th>CH4 Methane</th>
                  <th>CO (ppm)</th>
                  <th>Airflow</th>
                  <th>Temp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pits.map((pit) => (
                  <tr key={pit.code}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {pit.code}
                    </td>
                    <td>{pit.zone}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: pit.ch4 >= 0.45 ? 'var(--warning-text)' : 'var(--text-main)',
                      }}>
                        {pit.ch4}%
                      </span>
                    </td>
                    <td>{pit.co} ppm</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Wind size={13} color="var(--text-muted)" />
                        {pit.ventilation} m³/s
                      </span>
                    </td>
                    <td>{pit.temp}°C</td>
                    <td>
                      <span className={`badge-pill ${pit.status === 'Nominal' ? 'badge-success' : 'badge-warning'}`}>
                        {pit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Architecture & Health Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card-white" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={17} color="var(--primary)" />
              Backend Architecture
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '10px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Node.js / Express REST API</span>
                  <span style={{ color: serverStatus.online ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>
                    {serverStatus.online ? 'Port 5000' : 'Standalone'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  <code>/api/v1</code> master endpoints with Zod validation & RBAC
                </div>
              </div>

              <div style={{
                padding: '10px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>TiDB Cloud Managed DB</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>MySQL 8.0</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  TLS encrypted connection with SSL Root CA certificate
                </div>
              </div>

              <div style={{
                padding: '10px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>React 19 + Vite Frontend</span>
                  <span style={{ color: 'var(--purple)', fontWeight: 700 }}>v19.2</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  White theme design system with Lucide icons & Leaflet GIS
                </div>
              </div>
            </div>
          </div>

          {/* Quick Safety Summary */}
          <div className="card-white" style={{
            padding: '1.25rem',
            backgroundColor: 'var(--info-light)',
            border: '1px solid var(--info-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>Statutory Compliance Active</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', marginTop: '6px', lineHeight: 1.4 }}>
              All 14 active mines are logging immutable telemetry snapshots to the cryptographic audit trail according to DGMS Circular 2026 guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
