import React, { useState } from 'react';
import { HardHat, Users, UserCheck, ShieldAlert, Activity, UserX, UserPlus } from 'lucide-react';

export default function LaborDeploymentView({ onShowToast, onNavigateTo }) {
  const [shifts] = useState([
    { id: 'SHFT-MORN-A', zone: 'Underground Level 3', supervisor: 'Arun Kumar', headcount: 45, status: 'Active', safetyScore: '98%' },
    { id: 'SHFT-MORN-B', zone: 'Surface Processing', supervisor: 'Meera Reddy', headcount: 120, status: 'Active', safetyScore: '95%' },
    { id: 'SHFT-NIGHT-A', zone: 'Underground Level 3', supervisor: 'Vikram Singh', headcount: 42, status: 'Scheduled', safetyScore: '-' },
  ]);

  const [alerts] = useState([
    { id: 'ALT-772', worker: 'Ramesh Das (EMP-401)', issue: 'RFID Tracker Offline', time: '10:14 AM' },
    { id: 'ALT-773', worker: 'Suresh Patil (EMP-392)', issue: 'Missed Biometric Check-in', time: '09:05 AM' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="sleek-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <HardHat size={28} color="var(--primary)" />
              Labor Deployment & Safety Tracking
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              Real-time monitoring of worker shifts, biometric attendance, and safety gear compliance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="sleek-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: '#475569' }} onClick={() => onShowToast('Exporting Duty Roster...')}>
              Duty Roster
            </button>
            <button
              className="sleek-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: '#fff' }}
              onClick={() => {
                if (onNavigateTo) onNavigateTo('attendance');
                else if (onShowToast) onShowToast('Opening Biometric Attendance Portal...');
              }}
            >
              <UserCheck size={18} /> Initiate Biometric Roll Call
            </button>
          </div>
        </div>
      </div>

      {/* Smart Biometric Attendance Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: '#dbeafe', borderRadius: '10px', color: 'var(--primary)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Smart Biometric Attendance & Facial Scanner System
              <span
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                ResNet-18 Active
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Real-time facial recognition portal, DGMS Form B e-muster, and worker registration.
            </div>
          </div>
        </div>
        <button
          className="sleek-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '9px 16px',
            fontWeight: 600,
          }}
          onClick={() => onNavigateTo && onNavigateTo('attendance')}
        >
          Open AI Attendance Portal →
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Active Workforce</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>165</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Across 2 active shifts
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Underground Workers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>45</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '10px' }}>
              <HardHat size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Strict Monitoring Active
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Safety Compliance</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>96%</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '10px' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} /> +2% from last week
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Shift Management */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Current Shifts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shifts.map((shift, idx) => (
              <div key={idx} className="sleek-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', backgroundColor: shift.status === 'Active' ? '#eff6ff' : '#f1f5f9', color: shift.status === 'Active' ? 'var(--primary)' : '#64748b', borderRadius: '12px' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>{shift.id}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{shift.zone} • Sup: {shift.supervisor}</div>
                    </div>
                  </div>
                  <span className={`badge-pill ${shift.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {shift.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Headcount</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{shift.headcount} Personnel</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Safety Score</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{shift.safetyScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Safety Anomalies</h3>
          <div className="sleek-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <div>No active anomalies.</div>
              </div>
            ) : (
              alerts.map((alt) => (
                <div key={alt.id} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#fff1f2', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
                  <UserX size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239', marginBottom: '2px' }}>{alt.worker}</div>
                    <div style={{ fontSize: '0.8rem', color: '#be123c' }}>{alt.issue}</div>
                    <div style={{ fontSize: '0.7rem', color: '#fda4af', marginTop: '6px' }}>{alt.time}</div>
                  </div>
                </div>
              ))
            )}
            
            <button className="sleek-btn" style={{ width: '100%', marginTop: '8px', backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
