import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  BellRing,
  Wifi,
  Flame,
  ShieldAlert,
  Volume2,
  CheckCircle2,
  MapPin,
  Users,
  RefreshCw,
  Compass,
  Send,
  Info,
  XOctagon,
  ArrowRight,
  Shield,
  Layers,
  PhoneCall,
  Activity,
  UserCheck,
  UserX,
  AlertCircle,
  BatteryCharging,
  Navigation,
  Siren,
  Ambulance,
} from 'lucide-react';
import api from '../../services/api.js';

export default function EmergencyAlertsView({ currentUser, onShowToast }) {
  const [alertsData, setAlertsData] = useState({
    broadcasts: [],
    all_broadcasts: [],
    sos_alerts: [],
    signals: [],
    status: 'CLEAR',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  // Alert Dispatch Form State
  const [targetZone, setTargetZone] = useState('ALL');
  const [alertType, setAlertType] = useState('EVACUATION');
  const [severity, setSeverity] = useState('CRITICAL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [exitRoute, setExitRoute] = useState('Shaft 4 Incline (Portal Gate)');

  // Selected Zone Object
  const selectedZoneObj = alertsData.signals.find((s) => s.id === targetZone) || alertsData.signals[0] || {
    id: 'ALL',
    name: 'Entire Mine (All Surface & Underground Sectors)',
    signal_node: 'ALL_NODES',
    workers_online: 48,
    signal_strength: '100% Mesh Coverage',
  };

  // Determine user role hierarchy
  const userRole = (currentUser?.role || currentUser?.mobileRole || 'SUPERADMIN').toUpperCase();
  const isHigherRole = ['SUPERADMIN', 'GLOBAL_ADMIN', 'ORG_ADMIN', 'MINE_ADMIN', 'SAFETY_OFFICER', 'MANAGER', 'SUPERVISOR'].some(
    (r) => userRole.includes(r)
  );

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.getEmergencyAlerts();
      if (res.data) {
        setAlertsData(res.data);
      }
    } catch (err) {
      if (!silent) {
        onShowToast('Failed to sync emergency alert ledger: ' + err.message, true);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Live polling every 4 seconds
    const timer = setInterval(() => {
      fetchAlerts(true);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Quick Preset Handlers
  const handleApplyPreset = (presetType) => {
    setAlertType(presetType);
    if (presetType === 'EVACUATION') {
      setSeverity('CRITICAL');
      setTitle('IMMEDIATE SECTOR EVACUATION ORDER');
      setMessage(`All personnel in ${selectedZoneObj.name} must cease work, secure equipment, and proceed immediately to ${exitRoute}.`);
    } else if (presetType === 'GAS_SURGE') {
      setSeverity('CRITICAL');
      setTitle('CRITICAL METHANE (CH₄) SPIKE DETECTED');
      setMessage(`Continuous atmospheric sensors detected Methane surge above 1.40% statutory threshold at ${selectedZoneObj.name}. Don self-rescuers and evacuate.`);
    } else if (presetType === 'STRATA_WARNING') {
      setSeverity('WARNING');
      setTitle('STRATA / ROOF INSTABILITY HAZARD');
      setMessage(`Micro-seismic activity and displacement detected near ${selectedZoneObj.name}. Hold advance, inspect roof support bolts.`);
    } else if (presetType === 'BLASTING_CLEAR') {
      setSeverity('WARNING');
      setTitle('CONTROLLED BLASTING ZONE CLEARANCE');
      setMessage(`Certified blasting scheduled in 15 minutes. Clear all extraction pathways in ${selectedZoneObj.name}.`);
    }
  };

  const handleDispatchAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: title || (alertType === 'EVACUATION' ? 'IMMEDIATE SECTOR EVACUATION ORDER' : 'SAFETY DIRECTIVE'),
        message: message || `Directive for ${selectedZoneObj.name}. Follow statutory escape protocols.`,
        type: alertType,
        severity,
        target_zone: isHigherRole ? targetZone : (selectedZoneObj.id || 'ZONE_B_L4'),
        signal_node: selectedZoneObj.signal_node,
        exit_route: exitRoute,
        sender_name: `${currentUser?.first_name || currentUser?.username} (${userRole})`,
        sender_role: userRole,
      };

      await api.createEmergencyAlert(payload);
      onShowToast(`Emergency Alert dispatched to ${selectedZoneObj.name} (${selectedZoneObj.workers_online} workers notified)!`);
      setTitle('');
      setMessage('');
      await fetchAlerts(true);
    } catch (err) {
      onShowToast('Failed to dispatch alert: ' + err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    setResolvingId(alertId);
    try {
      await api.resolveEmergencyAlert(alertId);
      onShowToast('Alert stood down and marked as RESOLVED.');
      await fetchAlerts(true);
    } catch (err) {
      onShowToast('Failed to resolve alert: ' + err.message, true);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDispatchRescue = async (alertId, worker) => {
    try {
      await api.dispatchRescueTeam({
        alert_id: alertId,
        target_worker_id: worker.id,
        target_worker_name: worker.name,
        sector: selectedZoneObj.name || 'Hazard Sector',
        coordinates: `${worker.lat}° N, ${worker.lng}° E`,
        depth: worker.depth,
        rescue_team_name: 'Alpha Subterranean Rescue Brigade',
      });
      onShowToast(`Emergency Rescue Brigade dispatched to ${worker.name} at coordinates!`);
      await fetchAlerts(true);
    } catch (err) {
      onShowToast('Failed to dispatch rescue team: ' + err.message, true);
    }
  };

  const handleResolveDistress = async (sosId) => {
    try {
      await api.resolveEmergencySos(sosId);
      onShowToast('Worker distress beacon stood down and cleared.');
      await fetchAlerts(true);
    } catch (err) {
      onShowToast('Failed to stand down distress: ' + err.message, true);
    }
  };

  const activeAlerts = (alertsData.broadcasts || []).filter((b) => b.status === 'ACTIVE');
  const pastAlerts = (alertsData.broadcasts || []).filter((b) => b.status !== 'ACTIVE');

  return (
    <div className="manage-orders-container" style={{ padding: '0 0 20px', gap: '12px', width: '100%' }}>
      {/* Top Emergency Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: activeAlerts.length > 0 ? '#450a0a' : '#0f172a',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        color: '#ffffff',
        marginBottom: '1.75rem',
        border: activeAlerts.length > 0 ? '2px solid #ef4444' : '1px solid #1e293b',
        boxShadow: activeAlerts.length > 0 ? '0 10px 30px rgba(239, 68, 68, 0.25)' : '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: activeAlerts.length > 0 ? '#dc2626' : '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: activeAlerts.length > 0 ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none',
          }}>
            {activeAlerts.length > 0 ? (
              <ShieldAlert size={30} color="#ffffff" />
            ) : (
              <Radio size={28} color="#38bdf8" />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Subterranean Safety & Emergency Dispatch System
              </h1>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: activeAlerts.length > 0 ? '#ef4444' : '#10b981',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'inline-block',
                }} />
                {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE EMERGENCY BROADCASTS` : 'ALL SECTORS NOMINAL'}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Hierarchical Signal-Filtered Alert Broadcaster • Transmits hardware siren beeps & flashlight strobe triggers to targeted worker devices.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => fetchAlerts(false)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Sync Ledger
          </button>
        </div>
      </div>

      {/* Grid: Left Column = Mine Signal Zones & Dispatch Console | Right Column = Live Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.75rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Section 1: Mine Signal & Zone Network Matrix */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Subterranean Mesh Signal Network & Worker Density
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Click a sector to target
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {(alertsData.signals || []).map((zone) => {
                const isSelected = targetZone === zone.id;
                const hasAlert = activeAlerts.some((a) => a.target_zone === zone.id || a.target_zone === 'ALL');

                return (
                  <div
                    key={zone.id}
                    onClick={() => setTargetZone(zone.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected
                        ? '2px solid #0284c7'
                        : hasAlert
                        ? '1.5px solid #f87171'
                        : '1px solid #e2e8f0',
                      backgroundColor: isSelected
                        ? '#f0f9ff'
                        : hasAlert
                        ? '#fef2f2'
                        : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {zone.name}
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: isSelected ? '#0284c7' : '#e2e8f0',
                        color: isSelected ? '#ffffff' : '#475569',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}>
                        {zone.signal_node}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} color="#0284c7" />
                        <strong>{zone.workers_online}</strong> miners in range
                      </span>
                      <span style={{ color: zone.id === 'ALL' ? '#0284c7' : '#059669', fontWeight: 600 }}>
                        {zone.signal_strength}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Hierarchical Alert Dispatch Console ("Give Alert") */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellRing size={20} color="#dc2626" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Emergency Alert Giving Console
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '2px 0 0 0' }}>
                    {isHigherRole
                      ? 'High-Authority Dispatch: Select destination sector and filter broadcast by subterranean signal'
                      : 'Field Role Dispatch: Report urgent incident at your current station'}
                  </p>
                </div>
              </div>

              {/* User Dispatch Authority Badge */}
              <div style={{
                backgroundColor: isHigherRole ? '#fef2f2' : '#f0f9ff',
                border: isHigherRole ? '1px solid #fecaca' : '1px solid #bae6fd',
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Shield size={13} color={isHigherRole ? '#dc2626' : '#0284c7'} />
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isHigherRole ? '#991b1b' : '#0369a1',
                }}>
                  {userRole} • {isHigherRole ? 'TARGETING CLEARANCE: ALL ZONES' : 'LOCAL STATION ONLY'}
                </span>
              </div>
            </div>

            {/* Quick Emergency Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                RAPID INCIDENT PRESETS
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('EVACUATION')}
                  style={{
                    backgroundColor: alertType === 'EVACUATION' ? '#dc2626' : '#fef2f2',
                    color: alertType === 'EVACUATION' ? '#ffffff' : '#991b1b',
                    border: '1px solid #fca5a5',
                    padding: '6px 11px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Siren size={13} /> Evacuation Order
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('GAS_SURGE')}
                  style={{
                    backgroundColor: alertType === 'GAS_SURGE' ? '#d97706' : '#fffbeb',
                    color: alertType === 'GAS_SURGE' ? '#ffffff' : '#92400e',
                    border: '1px solid #fde68a',
                    padding: '6px 11px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <AlertTriangle size={13} /> Methane Gas Spike
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('STRATA_WARNING')}
                  style={{
                    backgroundColor: alertType === 'STRATA_WARNING' ? '#2563eb' : '#eff6ff',
                    color: alertType === 'STRATA_WARNING' ? '#ffffff' : '#1e40af',
                    border: '1px solid #bfdbfe',
                    padding: '6px 11px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Layers size={13} /> Strata Support Threat
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('BLASTING_CLEAR')}
                  style={{
                    backgroundColor: alertType === 'BLASTING_CLEAR' ? '#7c3aed' : '#f5f3ff',
                    color: alertType === 'BLASTING_CLEAR' ? '#ffffff' : '#5b21b6',
                    border: '1px solid #ddd6fe',
                    padding: '6px 11px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Flame size={13} /> Blasting Clearance
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Target Location / Place Selector (Crucial Requirement for Higher Roles) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Target Sector / Place {isHigherRole ? '(Select Destination)' : '(Station Locked)'}
                  </label>
                  <select
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value)}
                    disabled={!isHigherRole}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: isHigherRole ? '#ffffff' : '#f1f5f9',
                      color: '#0f172a',
                    }}
                  >
                    {(alertsData.signals || []).map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.workers_online} workers)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Alert Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="CRITICAL">CRITICAL (Siren & Flashlight Strobe)</option>
                    <option value="WARNING">WARNING (Subterranean Advisory)</option>
                    <option value="ADVISORY">ADVISORY (Operational Notice)</option>
                  </select>
                </div>
              </div>

              {/* Signal Filtering Preview Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wifi size={16} color="#0284c7" />
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    <strong>Signal Node Filter:</strong> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>{selectedZoneObj.signal_node}</code>
                    <span style={{ marginLeft: '6px', color: '#64748b' }}>({selectedZoneObj.signal_strength})</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                  Targeted Broadcast: {selectedZoneObj.workers_online} Devices Armed
                </div>
              </div>

              {/* Title & Escape Route */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Alert Directive Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. IMMEDIATE SHAFT 4 INCLINE EVACUATION"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Designated Egress Route
                  </label>
                  <input
                    type="text"
                    value={exitRoute}
                    onChange={(e) => setExitRoute(e.target.value)}
                    placeholder="e.g. Shaft 4 Incline (Portal Gate)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Directive Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Operational Order & Safety Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="State the threat cause, immediate actions required, and muster assembly point..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit Broadcast Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Send size={16} />
                {submitting
                  ? 'Broadcasting to Subterranean Nodes...'
                  : `Broadcast Targeted Alert to ${selectedZoneObj.name}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Emergency Broadcasts & Worker Distress Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Dispatched Alerts Feed */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} color="#dc2626" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Active Dispatched Alerts ({activeAlerts.length})
                </h3>
              </div>
            </div>

            {activeAlerts.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1',
              }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  No Active Emergency Broadcasts
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  All shafts and subterranean mesh sectors are operating under nominal safety conditions.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      border: '1.5px solid #fca5a5',
                      backgroundColor: '#fff5f5',
                      borderRadius: '12px',
                      padding: '14px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          marginRight: '6px',
                        }}>
                          {alert.severity || 'CRITICAL'}
                        </span>
                        <strong style={{ fontSize: '0.88rem', color: '#991b1b' }}>
                          {alert.title}
                        </strong>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: '#7f1d1d', fontWeight: 600 }}>
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#334155', margin: '6px 0', lineHeight: 1.4 }}>
                      {alert.message}
                    </div>

                    {/* Sector & Signal Details */}
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      marginTop: '8px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#475569' }}>
                          <strong>Target:</strong> {alert.target_zone_name || alert.target_zone}
                        </span>
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>
                          📡 {alert.signal_filter || 'ALL_NODES'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>
                          <strong>Escape Route:</strong> {alert.exit_route || 'Shaft 4 Incline'}
                        </span>
                        <span>
                          <strong>By:</strong> {alert.sender_name}
                        </span>
                      </div>
                    </div>

                    {/* Sector Evacuation Muster & Accountability Ledger */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #fed7aa',
                      padding: '12px',
                      marginTop: '10px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={15} color="#ea580c" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412' }}>
                            Evacuation Muster & Accountability Ledger
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                          }}>
                            👥 Sector Roster: {alert.muster?.total_workers || alert.affected_workers_count || 16}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                          }}>
                            🟢 Safe: {alert.muster?.safe_count || 0}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: (alert.muster?.unaccounted_count || alert.affected_workers_count) > 0 ? '#fee2e2' : '#f1f5f9',
                            color: (alert.muster?.unaccounted_count || alert.affected_workers_count) > 0 ? '#b91c1c' : '#64748b',
                          }}>
                            Unaccounted: {alert.muster?.unaccounted_count ?? (alert.affected_workers_count || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Unaccounted / Missing Workers in Hazard Zone */}
                      {alert.muster?.unaccounted_workers && alert.muster.unaccounted_workers.length > 0 && (
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          padding: '10px',
                          marginTop: '6px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <AlertCircle size={14} color="#dc2626" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991b1b' }}>
                              {alert.muster.unaccounted_workers.length} Personnel Pending Safe Evacuation Check-In:
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {alert.muster.unaccounted_workers.map((worker) => (
                              <div
                                key={worker.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '6px',
                                  padding: '7px 10px',
                                  border: '1px solid #fca5a5',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                                      {worker.name}
                                    </strong>
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                                      {worker.role || worker.id}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                    📍 Last Coordinates: {worker.lat}° N, {worker.lng}° E • Depth: <strong style={{ color: '#0284c7' }}>{worker.depth}m</strong> • Battery: {worker.battery}%
                                  </div>
                                </div>

                                <div>
                                  {worker.status === 'RESCUE_DISPATCHED' ? (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      backgroundColor: '#fef3c7',
                                      color: '#b45309',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #fde68a',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}>
                                      <Ambulance size={13} /> RESCUE EN ROUTE
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDispatchRescue(alert.id, worker)}
                                      style={{
                                        backgroundColor: '#dc2626',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <Ambulance size={13} /> Dispatch Rescue Brigade
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confirmed Safe List */}
                      {alert.muster?.confirmed_safe && alert.muster.confirmed_safe.length > 0 && (
                        <div style={{
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          padding: '10px',
                          marginTop: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <CheckCircle2 size={14} color="#16a34a" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>
                              ✅ Confirmed Safe & Evacuated Personnel ({alert.muster.confirmed_safe.length}):
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {alert.muster.confirmed_safe.map((safe, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  border: '1px solid #86efac',
                                  fontSize: '0.74rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <UserCheck size={14} color="#16a34a" />
                                  <strong style={{ color: '#0f172a' }}>{safe.worker_name}</strong>
                                  <span style={{ color: '#15803d', fontWeight: 600 }}>
                                    at {safe.safe_location_name}
                                  </span>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.68rem' }}>
                                  Pitched Safe: {safe.reported_at}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Rescue Dispatches */}
                      {alert.muster?.rescue_dispatches && alert.muster.rescue_dispatches.length > 0 && (
                        <div style={{
                          backgroundColor: '#fffbeb',
                          borderRadius: '8px',
                          border: '1px solid #fde68a',
                          padding: '8px 10px',
                          marginTop: '6px',
                        }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Ambulance size={14} /> Active Mine Rescue Missions:
                          </div>
                          {alert.muster.rescue_dispatches.map((mission, idx) => (
                            <div key={idx} style={{ fontSize: '0.7rem', color: '#78350f', display: 'flex', justifyContent: 'space-between' }}>
                              <span>
                                <strong>{mission.rescue_team_name}</strong> ➔ {mission.target_worker_name} ({mission.target_depth}m)
                              </span>
                              <span style={{ fontWeight: 700, color: '#b45309' }}>
                                {mission.status} (ETA {mission.estimated_arrival})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stand Down Button for Higher Roles */}
                    {isHigherRole && (
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={resolvingId === alert.id}
                          style={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <CheckCircle2 size={13} />
                          {resolvingId === alert.id ? 'Standing Down...' : 'Stand Down / Clear Alert'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worker SOS Distress Trigger Feed */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <PhoneCall size={18} color="#ea580c" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Worker SOS Beacons ({alertsData.sos_alerts?.length || 0})
              </h3>
            </div>

            {(!alertsData.sos_alerts || alertsData.sos_alerts.length === 0) ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                No active distress beacons received from subterranean workers.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alertsData.sos_alerts.map((sos) => (
                  <div
                    key={sos.id}
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1.5px solid #fdba74',
                      borderRadius: '10px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Siren size={15} color="#c2410c" /> {sos.worker_name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 600 }}>
                        {new Date(sos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#431407', marginTop: '4px' }}>
                      <strong>Subterranean Location:</strong> {sos.zone} (Depth: {sos.depth}m)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#7c2d12', marginTop: '2px' }}>
                      Coordinates: {sos.latitude}° N, {sos.longitude}° E • Reason: {sos.notes || 'Emergency Panic Beacon'}
                    </div>

                    {/* Nearby Responding Colleagues */}
                    <div style={{
                      backgroundColor: '#ffedd5',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      marginTop: '8px',
                      fontSize: '0.72rem',
                    }}>
                      {sos.responders && sos.responders.length > 0 ? (
                        <div>
                          <strong style={{ color: '#9a3412' }}>🏃 Nearby Responding Colleagues ({sos.responders.length}):</strong>
                          <div style={{ color: '#431407', marginTop: '2px' }}>
                            {sos.responders.map((r, idx) => (
                              <span key={idx} style={{ marginRight: '8px' }}>
                                • {r.responder_name} ({r.responder_distance})
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#9a3412' }}>
                          📡 Distress broadcast transmitting to nearby peer workers in {sos.zone}...
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleDispatchRescue(null, { id: sos.worker_id, name: sos.worker_name, depth: sos.depth, lat: sos.latitude, lng: sos.longitude, sector: sos.zone })}
                        style={{
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Ambulance size={13} /> Dispatch Rescue Team
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveDistress(sos.id)}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✅ Stand Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
