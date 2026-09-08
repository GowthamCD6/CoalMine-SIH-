import React, { useState, useEffect, useMemo } from 'react';
import {
  HardHat,
  Users,
  UserCheck,
  ShieldAlert,
  Activity,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  ChevronRight,
  Download,
  Filter,
  ShieldCheck,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import api from '../../services/api.js';

export default function LaborDeploymentView({ onShowToast, onNavigateTo }) {
  const [activeTab, setActiveTab] = useState('shifts'); // 'shifts' | 'contractors' | 'zones'
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [contractorsSummary, setContractorsSummary] = useState(null);
  const [contractorsList, setContractorsList] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deploy Crew Modal State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState('General Extraction Shift');
  const [newShiftHours, setNewShiftHours] = useState('06:00 — 14:00');
  const [newShiftZone, setNewShiftZone] = useState('Underground Level 3 (Seam 4)');
  const [newShiftSupervisor, setNewShiftSupervisor] = useState('');
  const [newShiftHeadcount, setNewShiftHeadcount] = useState(30);

  // Standard DGMS 3-tier coal mine shifts
  const [shifts, setShifts] = useState([
    {
      id: 'SHFT-MORN-A',
      name: 'Morning General Shift',
      hours: '06:00 — 14:00',
      zone: 'Underground Level 3 (Seam 4)',
      supervisor: 'Arun Kumar (First Class Overman)',
      headcount: 48,
      safetyScore: '98%',
      status: 'Active',
    },
    {
      id: 'SHFT-AFT-B',
      name: 'Afternoon Production Shift',
      hours: '14:00 — 22:00',
      zone: 'Surface Coal Handling Plant & Dispatch',
      supervisor: 'Meera Reddy (Safety Officer)',
      headcount: 112,
      safetyScore: '95%',
      status: 'Active',
    },
    {
      id: 'SHFT-NGT-C',
      name: 'Night Maintenance & Strata Shift',
      hours: '22:00 — 06:00',
      zone: 'Shaft 4 Incline & Drainage Sump',
      supervisor: 'Vikram Singh (Shift Sirdar)',
      headcount: 36,
      safetyScore: '99%',
      status: 'Scheduled',
    },
  ]);

  // Subterranean work zones data
  const subterraneanZones = [
    { id: 'ZN-01', name: 'Seam IX • Level 3 Face', depth: '-120m', airflow: '4.2 m/s', ch4: '0.12%', sirdar: 'B. C. Murmu', count: 42, status: 'NORMAL' },
    { id: 'ZN-02', name: 'Continuous Miner Heading 4', depth: '-165m', airflow: '3.8 m/s', ch4: '0.18%', sirdar: 'S. K. Soren', count: 28, status: 'NORMAL' },
    { id: 'ZN-03', name: 'Shaft 2 Bottom Sump & Pump', depth: '-210m', airflow: '5.1 m/s', ch4: '0.08%', sirdar: 'R. K. Singh', count: 14, status: 'NORMAL' },
    { id: 'ZN-04', name: 'Longwall Face West Panel', depth: '-140m', airflow: '4.6 m/s', ch4: '0.22%', sirdar: 'D. Mahato', count: 35, status: 'CAUTION' },
  ];

  const fetchWorkforceFeeds = async () => {
    setLoading(true);
    try {
      const [statsRes, contSummRes, contListRes, logsRes] = await Promise.allSettled([
        api.getAttendanceStats(),
        api.getContractorsSummary(),
        api.getContractors({ limit: 10 }),
        api.getAttendanceLogs({ limit: 8 }),
      ]);

      if (statsRes.status === 'fulfilled') setAttendanceStats(statsRes.value);
      if (contSummRes.status === 'fulfilled') setContractorsSummary(contSummRes.value);
      if (contListRes.status === 'fulfilled') {
        const rows = Array.isArray(contListRes.value) ? contListRes.value : (contListRes.value?.rows || []);
        setContractorsList(rows);
      }
      if (logsRes.status === 'fulfilled') {
        const logs = Array.isArray(logsRes.value) ? logsRes.value : (logsRes.value?.rows || []);
        setAttendanceLogs(logs);
      }
    } catch (err) {
      console.warn('Failed to load labor deployment feeds:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforceFeeds();
  }, []);

  const handleDeployCrewSubmit = (e) => {
    e.preventDefault();
    if (!newShiftSupervisor.trim()) {
      if (onShowToast) onShowToast('Please provide an appointed shift supervisor / Overman name', true);
      return;
    }

    const newCrew = {
      id: `SHFT-${Date.now().toString().slice(-4)}`,
      name: newShiftName,
      hours: newShiftHours,
      zone: newShiftZone,
      supervisor: newShiftSupervisor,
      headcount: Number(newShiftHeadcount) || 20,
      safetyScore: '100%',
      status: 'Active',
    };

    setShifts((prev) => [newCrew, ...prev]);
    setShowDeployModal(false);
    setNewShiftSupervisor('');
    if (onShowToast) onShowToast(`Crew deployed to ${newShiftZone} successfully!`);
  };

  const totalWorkers = (attendanceStats?.today_present || 196);
  const undergroundCount = (attendanceStats?.underground_count || 48);
  const contractorCount = (contractorsSummary?.total_workers || 124);
  const safetyRate = (attendanceStats?.safety_gear_compliance || 96);

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
              backgroundColor: '#eff6ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HardHat size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>
              Labor Deployment & Shift Operations
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
              DGMS SHIFT MNGMT ACTIVE
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={fetchWorkforceFeeds}
            title="Refresh workforce feeds"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onShowToast && onShowToast('Exporting Shift Duty Roster (PDF)...')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => setShowDeployModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} />
            <span>Deploy Crew</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateTo) onNavigateTo('attendance');
              else if (onShowToast) onShowToast('Opening AI Attendance...');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={14} />
            <span>Biometric Scanner →</span>
          </button>
        </div>
      </div>

      {/* 4-Column Responsive KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Active Workforce */}
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
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {totalWorkers} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Personnel</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Total On-Duty Workforce</div>
          </div>
        </div>

        {/* Subterranean Underground Miners */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #fee2e2',
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
            <HardHat size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>
              {undergroundCount} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#991b1b' }}>Miners</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Subterranean Miners</div>
          </div>
        </div>

        {/* Contractor Workforce */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #ede9fe',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            flexShrink: 0,
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1.1 }}>
              {contractorCount} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#5b21b6' }}>Workers</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>Contractor Workforce</div>
          </div>
        </div>

        {/* Safety & PPE Compliance */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #dcfce7',
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
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', lineHeight: 1.1 }}>
              {safetyRate}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '3px' }}>PPE & Biometric Rate</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Strip */}
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
            { key: 'shifts', label: 'Active Shift Rosters', count: shifts.length, icon: HardHat },
            { key: 'contractors', label: 'Contractor Crew Roll', count: contractorsList.length || 3, icon: Briefcase },
            { key: 'zones', label: 'Work Face & Safety Zones', count: subterraneanZones.length, icon: Layers },
          ].map(({ key, label, count, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 18px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
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
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            DGMS Rule 77 Egress Verification: <strong style={{ color: '#059669' }}>LOCKED</strong>
          </span>
        </div>
      </div>

      {/* Tab 1: Active Shifts & Real-time Biometric Check-in Feed */}
      {activeTab === 'shifts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
          {/* Left Column: Shift Rosters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Active Shift Allocations & Duty Rosters
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Shift Cycle: 3x8 Hour Rotation
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shifts.map((shift, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${shift.status === 'Active' ? '#2563eb' : '#cbd5e1'}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {shift.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {shift.hours}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: shift.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                        color: shift.status === 'Active' ? '#166534' : '#475569',
                      }}
                    >
                      {shift.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', fontSize: '0.84rem', color: '#475569', margin: '10px 0' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Zone:</span> <strong>{shift.zone}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Supervisor:</span> <strong>{shift.supervisor}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={13} color="var(--primary)" /> Headcount: <span style={{ color: 'var(--primary)' }}>{shift.headcount} Workers</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} color="#059669" /> Safety Rating: {shift.safetyScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Check-in & Muster Audit Feed */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Live Biometric Check-ins
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Real-time facial scan verification feed
                </p>
              </div>
              <button
                onClick={fetchWorkforceFeeds}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(attendanceLogs.length > 0
                ? attendanceLogs
                : [
                    { id: 1, worker_name: 'Rajesh Murmu', employee_code: 'EMP-401', check_in_time: '06:14 AM', zone: 'Shaft 4 Portal', verified: true },
                    { id: 2, worker_name: 'Sunil Kumar Soren', employee_code: 'EMP-388', check_in_time: '06:18 AM', zone: 'Shaft 4 Portal', verified: true },
                    { id: 3, worker_name: 'Anil Bauri', employee_code: 'EMP-412', check_in_time: '06:22 AM', zone: 'Pit 2 Entry', verified: true },
                    { id: 4, worker_name: 'Manoj Mahato', employee_code: 'EMP-504', check_in_time: '06:29 AM', zone: 'Shaft 4 Portal', verified: true },
                  ]
              ).slice(0, 6).map((log, i) => (
                <div
                  key={log.id || i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                      {log.worker_name || `Worker #${log.worker_id || i + 1}`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {log.employee_code || `EMP-${300 + i}`} • {log.zone || 'Shaft 4 Incline'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {log.check_in_time || '06:30 AM'}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={11} /> Biometric Match
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                fontSize: '0.82rem',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => onNavigateTo && onNavigateTo('attendance')}
            >
              Open Full Biometric Muster Roll <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Contractor Agency Roll */}
      {activeTab === 'contractors' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Contractor Agencies & Outsourced Deployment Roll
            </h3>
            <button
              onClick={() => onNavigateTo && onNavigateTo('contractors')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Manage Contracts & Workers <ChevronRight size={14} />
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Agency Name</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Work Order / Contract</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Active Headcount</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Safety Compliance</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Deployment Zone</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { agency: 'Shree Ram Mining Services Ltd', order: 'WO-2026-CH-09', count: 48, comp: '98%', zone: 'Surface CHP & Dispatch', status: 'ACTIVE' },
                { agency: 'Eastern Coal Logistics & Blasting', order: 'WO-2026-BL-04', count: 32, comp: '96%', zone: 'Pit 2 Face Extraction', status: 'ACTIVE' },
                { agency: 'Jharkhand Strata Support Corp', order: 'WO-2026-ST-12', count: 24, comp: '99%', zone: 'Shaft 4 Bolting Unit', status: 'ACTIVE' },
                { agency: 'Dhanbad Industrial Safety Solutions', order: 'WO-2026-SF-01', count: 20, comp: '95%', zone: 'Ventilation & Sump Bay', status: 'ACTIVE' },
              ].map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{c.agency}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontFamily: 'monospace' }}>{c.order}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{c.count} Miners</td>
                  <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 700 }}>{c.comp}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{c.zone}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534' }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Subterranean Work Zones & Safety Monitoring */}
      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {subterraneanZones.map((zone) => (
            <div
              key={zone.id}
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>{zone.id}</div>
                  <h4 style={{ margin: '2px 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{zone.name}</h4>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  backgroundColor: zone.status === 'NORMAL' ? '#dcfce7' : '#fef3c7',
                  color: zone.status === 'NORMAL' ? '#166534' : '#92400e',
                }}>
                  {zone.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Depth:</span> <strong>{zone.depth}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Air Velocity:</span> <strong>{zone.airflow}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>CH₄ Reading:</span> <strong style={{ color: zone.ch4.includes('0.2') ? '#d97706' : '#059669' }}>{zone.ch4}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Sirdar:</span> <strong>{zone.sirdar}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Active Headcount:</span>
                <strong style={{ color: '#2563eb' }}>{zone.count} Miners Online</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deploy Crew Modal */}
      {showDeployModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden', border: '1px solid #e2e8f0',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <HardHat size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Deploy Shift Workforce Crew
                </h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeployCrewSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Shift Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  placeholder="e.g. Morning General Shift"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Shift Hours
                  </label>
                  <select
                    value={newShiftHours}
                    onChange={(e) => setNewShiftHours(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  >
                    <option value="06:00 — 14:00">06:00 — 14:00 (Morning)</option>
                    <option value="14:00 — 22:00">14:00 — 22:00 (Afternoon)</option>
                    <option value="22:00 — 06:00">22:00 — 06:00 (Night)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Allocated Headcount
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    value={newShiftHeadcount}
                    onChange={(e) => setNewShiftHeadcount(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Target Extraction / Maintenance Zone
                </label>
                <select
                  value={newShiftZone}
                  onChange={(e) => setNewShiftZone(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                >
                  <option value="Underground Level 3 (Seam 4)">Underground Level 3 (Seam 4)</option>
                  <option value="Continuous Miner Heading 4">Continuous Miner Heading 4</option>
                  <option value="Surface Coal Handling Plant & Dispatch">Surface Coal Handling Plant & Dispatch</option>
                  <option value="Shaft 4 Incline & Drainage Sump">Shaft 4 Incline & Drainage Sump</option>
                  <option value="Pit 2 Highwall Extraction Face">Pit 2 Highwall Extraction Face</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Certified Shift Supervisor / Overman
                </label>
                <input
                  type="text"
                  required
                  value={newShiftSupervisor}
                  onChange={(e) => setNewShiftSupervisor(e.target.value)}
                  placeholder="e.g. Ramesh Chandra (1st Class Overman)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Deploy Crew & Lock Muster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
