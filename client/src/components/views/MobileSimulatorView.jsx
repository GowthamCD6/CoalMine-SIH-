import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Camera,
  Wifi,
  Bell,
  IdCard,
  FileText,
  ClipboardCheck,
  Truck,
  Users,
  Check,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  X,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { api, getAccessToken } from '../../services/api';

const PRESET_ACCOUNTS = [
  { label: 'Superadmin (*)', email: 'admin@coalmin.org', desc: 'Global Authority' },
  { label: 'ECL Org Admin', email: 'admin@ecl.coalmin.org', desc: 'Scope: Org #1' },
  { label: 'Rajmahal Mine Admin', email: 'admin@rajmahal.coalmin.org', desc: 'Scope: Mine #1' },
  { label: 'Safety Officer', email: 'safety@rajmahal.coalmin.org', desc: 'Staff (Read-Only)' },
  { label: 'Unassigned Worker', email: 'sollamaten@gmail.com', desc: 'Unassigned' },
];

export default function MobileSimulatorView({ onShowToast }) {
  const [activeScreen, setActiveScreen] = useState('delegation');
  const [delegationData, setDelegationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simUser, setSimUser] = useState('admin@coalmin.org');
  const [activeToken, setActiveToken] = useState(getAccessToken());

  // Modal for grant access
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [grantModalOpen, setGrantModalOpen] = useState(false);

  // Inspections state
  const [inspections, setInspections] = useState([]);
  // Hazards state
  const [hazards, setHazards] = useState([]);
  const [hazardCaptured, setHazardCaptured] = useState(false);
  // Offline sync state
  const [beaconConnected, setBeaconConnected] = useState(true);
  const [queuedItems, setQueuedItems] = useState([
    { id: 'OFF-101', title: 'Hazard Report #402 (Methane Seepage)', status: 'PENDING' },
    { id: 'OFF-102', title: 'Ventilation Shaft Check #V-993', status: 'PENDING' },
  ]);
  // SOS Panic state
  const [sosActive, setSosActive] = useState(false);
  // RFID state
  const [rfidData, setRfidData] = useState(null);
  const [rfidCheckedIn, setRfidCheckedIn] = useState(false);
  // OCR state
  const [ocrText, setOcrText] = useState(null);

  const fetchDelegationData = useCallback(async (tokenToUse) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/delegation/scope', {
        headers: {
          Authorization: `Bearer ${tokenToUse || activeToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data?.data) {
        setDelegationData(data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  const switchPersona = async (email) => {
    setSimUser(email);
    try {
      const loginRes = await api.login(email, 'Admin@12345');
      const newToken = loginRes?.tokens?.accessToken;
      if (newToken) {
        setActiveToken(newToken);
        await fetchDelegationData(newToken);
        if (onShowToast) onShowToast(`Switched persona to ${email}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Login failed: ${err.message}`, true);
    }
  };

  useEffect(() => {
    fetchDelegationData(activeToken);
    loadOtherData();
  }, [fetchDelegationData, activeToken]);

  const loadOtherData = async () => {
    try {
      const [inspRes, hazRes, rfidRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/inspections', {
          headers: { Authorization: `Bearer ${activeToken}` },
        }).then((r) => r.json()),
        fetch('http://localhost:5000/api/v1/hazards', {
          headers: { Authorization: `Bearer ${activeToken}` },
        }).then((r) => r.json()),
        fetch('http://localhost:5000/api/v1/rfid-pass', {
          headers: { Authorization: `Bearer ${activeToken}` },
        }).then((r) => r.json()),
      ]);
      if (inspRes?.data) setInspections(inspRes.data);
      if (hazRes?.data) setHazards(hazRes.data);
      if (rfidRes?.data) setRfidData(rfidRes.data);
    } catch {
      // fallback
    }
  };

  const handleGrantSubrole = async (subroleId) => {
    if (!selectedTargetUser) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/${selectedTargetUser.id}/subroles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subrole_id: subroleId, status: 'ACTIVE' }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to grant subrole');
      setGrantModalOpen(false);
      await fetchDelegationData(activeToken);
      if (onShowToast) onShowToast(`Granted subrole to ${selectedTargetUser.username}!`);
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleRevokeSubrole = async (userId, subroleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/${userId}/subroles/${subroleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to revoke subrole');
      await fetchDelegationData(activeToken);
      if (onShowToast) onShowToast('Subrole access revoked successfully.');
    } catch (err) {
      if (onShowToast) onShowToast(err.message, true);
    }
  };

  const handleTriggerSos = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/emergencies/sos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zone: 'Zone B (Level 4 Deep)', depth: -150 }),
      });
      setSosActive(true);
      if (onShowToast) onShowToast('EMERGENCY DISTRESS BEACON TRANSMITTED ACROSS SUBTERRANEAN CHANNELS!', true);
    } catch {
      setSosActive(true);
    }
  };

  const handleSyncAll = () => {
    if (!beaconConnected) {
      if (onShowToast) onShowToast('Cannot sync in Zero-Signal cave mode. Connect surface beacon first.', true);
      return;
    }
    setQueuedItems((prev) => prev.map((q) => ({ ...q, status: 'SYNCED' })));
    if (onShowToast) onShowToast('All offline payloads synced successfully with central DB.');
  };

  const handleRunOcr = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/ocr/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
      }).then((r) => r.json());
      if (res?.data?.raw_text) setOcrText(res.data.raw_text);
      if (onShowToast) onShowToast(`Extracted ${res?.data?.extracted_words || 452} words from log sheet.`);
    } catch {
      setOcrText('SHIFT LOG - SHAFT 3 (2026-09-05)\nVentilation: 18.5 m3/s\nMethane: 0.12%\nWorkers: 120');
    }
  };

  const actor = delegationData?.actor;
  const users = delegationData?.users || [];
  const assignableSubroles = delegationData?.assignable_subroles || [];
  const manageableCount = users.filter((u) => u.is_manageable).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner with Persona Switcher */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        border: '1px solid #334155',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={22} color="#38bdf8" />
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                CoalMin Mobile Field Unit & Access Delegation Simulator
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Interactive live simulator for all wireframe mobile pages & access delegation workflow
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Test Persona:</span>
            {PRESET_ACCOUNTS.map((p, i) => (
              <button
                key={i}
                onClick={() => switchPersona(p.email)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: simUser === p.email ? '2px solid #38bdf8' : '1px solid #475569',
                  backgroundColor: simUser === p.email ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Navigation / Page Selector on Left */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Wireframe Mobile Pages:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveScreen('delegation')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'delegation' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'delegation' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'delegation' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Users size={18} color={activeScreen === 'delegation' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Access Delegation</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Check & Grant Smaller Users Access</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'dashboard' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'dashboard' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'dashboard' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <ShieldCheck size={18} color={activeScreen === 'dashboard' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Field Dashboard</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>KPIs, Personnel, Operations Feed</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('hazard-cam')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'hazard-cam' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'hazard-cam' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'hazard-cam' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Camera size={18} color={activeScreen === 'hazard-cam' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Hazard Camera</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>GPS Geotag HUD & Depth Tagging</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('sos-panic')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'sos-panic' ? '1px solid #ef4444' : '1px solid transparent',
                backgroundColor: activeScreen === 'sos-panic' ? '#fef2f2' : '#f8fafc',
                color: activeScreen === 'sos-panic' ? '#dc2626' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Bell size={18} color={activeScreen === 'sos-panic' ? '#dc2626' : '#64748b'} />
              <div>
                <div>Emergency SOS Panic</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Tactile Underground Beacon Trigger</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('offline-sync')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'offline-sync' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'offline-sync' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'offline-sync' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Wifi size={18} color={activeScreen === 'offline-sync' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Offline-First Sync</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Surface Beacon & SQLite Cache</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('rfid-pass')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'rfid-pass' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'rfid-pass' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'rfid-pass' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <IdCard size={18} color={activeScreen === 'rfid-pass' ? '#2563eb' : '#64748b'} />
              <div>
                <div>RFID Beacon Pass</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Digital Worker Badge & QR Clearance</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('ocr-scanner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'ocr-scanner' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'ocr-scanner' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'ocr-scanner' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FileText size={18} color={activeScreen === 'ocr-scanner' ? '#2563eb' : '#64748b'} />
              <div>
                <div>OCR Log Scanner</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Digitize Handwritten Shift Ledgers</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('inspections')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'inspections' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'inspections' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'inspections' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <ClipboardCheck size={18} color={activeScreen === 'inspections' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Inspections & Violations</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Statutory Remediation Ledger</div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('emergency')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeScreen === 'emergency' ? '1px solid #2563eb' : '1px solid transparent',
                backgroundColor: activeScreen === 'emergency' ? '#eff6ff' : '#f8fafc',
                color: activeScreen === 'emergency' ? '#1d4ed8' : '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Truck size={18} color={activeScreen === 'emergency' ? '#2563eb' : '#64748b'} />
              <div>
                <div>Emergency Crisis Console</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>Global Evacuation & Muster Alarms</div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Device Frame Mockup on Right */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '420px',
            height: '740px',
            backgroundColor: '#0f172a',
            borderRadius: '40px',
            padding: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 10px #1e293b, 0 0 0 12px #334155',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Phone Speaker Notch */}
            <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '80px', height: '5px', backgroundColor: '#334155', borderRadius: '3px' }} />
            </div>

            {/* Screen Inner Container */}
            <div style={{
              flex: 1,
              backgroundColor: '#0f172a',
              borderRadius: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              color: '#ffffff',
            }}>
              {/* Screen Content based on activeScreen */}
              {activeScreen === 'delegation' && (
                <div style={{ padding: '14px' }}>
                  {/* Actor Authority Card */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px',
                    border: '1px solid #334155',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Actor: <strong style={{ color: '#fff' }}>{actor?.username}</strong></span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: actor?.can_manage_access ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: actor?.can_manage_access ? '#4ade80' : '#f87171',
                      }}>
                        {actor?.can_manage_access ? 'DELEGATION ALLOWED' : 'READ-ONLY STAFF'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '2px' }}>
                      Authority Rank: <strong style={{ color: '#38bdf8' }}>{actor?.level}</strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Scope: <strong>
                        {actor?.level === 'SUPERADMIN' ? 'Global Platform' : actor?.organization_id ? `Org #${actor.organization_id}` : `Mine #${actor?.mine_id}`}
                      </strong>
                    </div>

                    <div style={{
                      marginTop: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#0f172a',
                      fontSize: '0.75rem',
                      color: actor?.can_manage_access ? '#86efac' : '#fca5a5',
                    }}>
                      {actor?.can_manage_access
                        ? `✓ You can manage and grant access to ${manageableCount} smaller subordinate user(s).`
                        : `✕ You lack USERS_MANAGE_ROLES authority. Cannot delegate access.`}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    User Hierarchy Evaluation:
                  </div>

                  {/* Users Evaluation List */}
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1s infinite' }} />
                      <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>Evaluating hierarchy...</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {users.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            padding: '10px',
                            border: u.is_manageable ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #334155',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{u.username}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{u.email}</div>
                            </div>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '10px',
                              backgroundColor: u.is_manageable ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                              color: u.is_manageable ? '#4ade80' : '#94a3b8',
                            }}>
                              {u.is_manageable ? 'CAN MANAGE' : 'CANNOT MANAGE'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '4px 6px', borderRadius: '4px', margin: '4px 0' }}>
                            Hierarchy: <em>{u.delegation_reason}</em>
                          </div>

                          {/* Subroles */}
                          <div style={{ margin: '4px 0' }}>
                            {u.roles.length === 0 ? (
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>No subroles assigned (Unassigned)</span>
                            ) : (
                              u.roles.map((r, ri) => (
                                <div key={ri} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.7rem',
                                  backgroundColor: '#0f172a',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  marginBottom: '3px',
                                  color: '#93c5fd'
                                }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <ShieldCheck size={12} color="#38bdf8" />
                                    {r.subrole_name} ({r.role_name})
                                  </span>
                                  {u.is_manageable && (
                                    <button
                                      onClick={() => handleRevokeSubrole(u.id, r.subrole_id)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Action Button */}
                          {u.is_manageable ? (
                            <button
                              onClick={() => {
                                setSelectedTargetUser(u);
                                setGrantModalOpen(true);
                              }}
                              style={{
                                width: '100%',
                                marginTop: '4px',
                                padding: '6px',
                                borderRadius: '6px',
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              + GRANT SUBROLE / ACCESS
                            </button>
                          ) : (
                            <div style={{
                              textAlign: 'center',
                              fontSize: '0.7rem',
                              color: '#64748b',
                              padding: '4px',
                              backgroundColor: '#0f172a',
                              borderRadius: '4px',
                              marginTop: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}>
                              <AlertTriangle size={12} /> Delegation Restricted
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'dashboard' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>Field Dashboard</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Mining Telemetry</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                      ONLINE
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>My Sector Zone</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>Shaft 4 • L3</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>-120m Subterranean</div>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Atmospheric AQI</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22c55e' }}>Optimal</div>
                      <div style={{ fontSize: '0.65rem', color: '#4ade80' }}>CH₄: 0.12% Safe</div>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cap-Lamp Power</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>94% Active</div>
                      <div style={{ fontSize: '0.65rem', color: '#4ade80' }}>Mesh Locked</div>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sector Safety</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22c55e' }}>All Clear</div>
                      <div style={{ fontSize: '0.65rem', color: '#4ade80' }}>0 Distress Alerts</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>Shift & Egress Readiness</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.7rem' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Shift</div>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>Morning Shift A</div>
                      </div>
                      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Token</div>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>#CL-4102 Verified</div>
                      </div>
                      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Geofence</div>
                        <div style={{ color: '#4ade80', fontWeight: 700 }}>Safe Perimeter</div>
                      </div>
                      <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Primary Egress</div>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>Shaft 4 (140m)</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>Pre-Shift Safety Confirmations</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>✓ Form B Digital Attendance & Cap-Lamp logged</div>
                      <div>✓ Atmospheric multi-gas detector operational</div>
                      <div>✓ Subterranean mesh distress receiver armed</div>
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === 'hazard-cam' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '4px' }}>Hazard Reporting Camera</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Geotagged Photo HUD Simulator</div>

                  <div style={{
                    height: '240px',
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    position: 'relative',
                    border: '2px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px',
                  }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '6px', borderRadius: '4px', alignSelf: 'flex-start', fontFamily: 'monospace', fontSize: '0.65rem', color: '#38bdf8' }}>
                      <div>LAT: 23.7957° N</div>
                      <div>LON: 86.4304° E</div>
                      <div>DEPTH: -120m &bull; ZONE: Shaft 4 Sector B</div>
                    </div>

                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                      {hazardCaptured ? '✓ Photo Geotagged with coordinates' : 'Point camera at structural fissure'}
                    </div>

                    <button
                      onClick={() => {
                        setHazardCaptured(true);
                        if (onShowToast) onShowToast('Geotagged optical frame captured!');
                      }}
                      style={{
                        alignSelf: 'center',
                        width: '50px',
                        height: '50px',
                        borderRadius: '25px',
                        backgroundColor: '#ffffff',
                        border: '4px solid rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                      }}
                    />
                  </div>

                  {hazardCaptured && (
                    <div style={{ marginTop: '10px', backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                        ✓ Photo Captured (Stored to /uploads on submit):
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACnSURBVHic7cExAQAAAMKg9U9tCy8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgB81QAAAAcB05HIAAAAASUVORK5CYII=';
                            await fetch('http://localhost:5001/api/v1/hazards', {
                              method: 'POST',
                              headers: {
                                Authorization: `Bearer ${activeToken}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                hazard_type: 'Roof Degradation Fissure',
                                location_name: 'Shaft 4 Sector B',
                                depth_meters: -120,
                                zone_tag: 'Level 3 - Sector B',
                                notes: 'Optical fissure record captured via HUD sensor.',
                                photo_base64: sampleBase64,
                                file_name: `simulator_hazard_${Date.now()}.png`,
                              }),
                            });
                            setHazardCaptured(false);
                            if (onShowToast) onShowToast('📸 Photo saved to /uploads folder and logged to Audit Trail!');
                          } catch (err) {
                            setHazardCaptured(false);
                            if (onShowToast) onShowToast('Offline queue mode active: ' + err.message, true);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        SUBMIT & SAVE TO /uploads
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'sos-panic' && (
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 900, textAlign: 'center' }}>
                      EMERGENCY SOS PANIC BUTTON
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center', marginTop: '2px' }}>
                      Instant Subterranean Rescue Dispatch
                    </div>

                    <div style={{ marginTop: '14px', backgroundColor: '#1e293b', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>WORKER LOCATION BEACON:</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>Zone B (Level 4 Deep) &bull; -150m</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <button
                      onClick={handleTriggerSos}
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '80px',
                        backgroundColor: sosActive ? '#991b1b' : '#dc2626',
                        border: '8px solid rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        fontSize: '2rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)',
                        letterSpacing: '2px',
                      }}
                    >
                      SOS
                    </button>
                  </div>

                  {sosActive ? (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.75rem' }}>DISTRESS SIGNAL TRANSMITTING</div>
                      <button
                        onClick={() => setSosActive(false)}
                        style={{ marginTop: '6px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Stand Down / Reset
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
                      Tap to transmit coordinates and worker ID to surface rescue team.
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'offline-sync' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px' }}>Offline-First Sync Center</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Zero-Signal Buffer & Surface Beacon Relay</div>

                  <div style={{
                    backgroundColor: beaconConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: beaconConnected ? '1px solid #22c55e' : '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '10px',
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: beaconConnected ? '#4ade80' : '#f87171' }}>
                      {beaconConnected ? 'Surface Beacon Detected (Online)' : 'Zero-Signal Cave Mode (Offline)'}
                    </div>
                    <button
                      onClick={() => setBeaconConnected(!beaconConnected)}
                      style={{
                        marginTop: '6px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569',
                        color: '#38bdf8',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      Simulate: {beaconConnected ? 'Enter Cave (Disconnect)' : 'Reach Surface (Connect)'}
                    </button>
                  </div>

                  <button
                    onClick={handleSyncAll}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    FLUSH PENDING QUEUE TO CENTRAL STORE
                  </button>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>Local Buffer:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {queuedItems.map((q) => (
                      <div key={q.id} style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{q.title}</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ID: {q.id}</div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: q.status === 'SYNCED' ? '#4ade80' : '#facc15' }}>
                          {q.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeScreen === 'rfid-pass' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px' }}>Beacon Proximity Access Pass</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '12px' }}>Digital ID & Automated Turnstile Clearance</div>

                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px', color: '#0f172a', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>MINISTRY OF COAL &bull; NEXUSMINE</div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>
                      {(rfidData?.name || 'R').charAt(0)}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{rfidData?.name || 'Ramesh Kumar'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>ID: {rfidData?.employee_code || 'EMP-8492'}</div>

                    <div style={{
                      margin: '12px auto',
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#f1f5f9',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#475569',
                      fontWeight: 800,
                    }}>
                      QR CODE
                    </div>

                    <div style={{ backgroundColor: '#f0fdf4', borderRadius: '6px', padding: '6px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>
                      ✓ Cleared for Zones A, B, C
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRfidCheckedIn(true);
                      if (onShowToast) onShowToast('Turnstile Proximity Beacon Verified at Shaft 3!');
                    }}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    SIMULATE NFC / BEACON TURNSTILE TAP
                  </button>

                  {rfidCheckedIn && (
                    <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#4ade80', textAlign: 'center' }}>
                      ✓ Last Check-in: Shaft 3 Turnstile ({new Date().toLocaleTimeString()})
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'ocr-scanner' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px' }}>OCR Document Scanner</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Camera Log Sheet Digitizer</div>

                  <div style={{
                    height: '180px',
                    backgroundColor: '#000',
                    borderRadius: '10px',
                    border: '2px dashed #38bdf8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>[ ALIGN LOG SHEET INSIDE FRAME ]</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Daily Mining Log Shaft 3 &bull; Level 4 Shift 1</div>
                  </div>

                  <button
                    onClick={handleRunOcr}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    DIGITIZE PHYSICAL SHIFT LEDGER
                  </button>

                  {ocrText && (
                    <div style={{ marginTop: '10px', backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>
                        ✓ Extracted 452 words (97% confidence):
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.65rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {ocrText}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'inspections' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px' }}>Inspections & Violations</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Statutory Remediation Ledger</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspections.map((item) => (
                      <div key={item.id} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa' }}>{item.id}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: item.severity === 'HIGH' ? '#ef4444' : '#facc15' }}>
                            {item.severity}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, margin: '4px 0' }}>{item.observation_type}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sector: {item.location} &bull; Officer: {item.inspector}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Deadline: {item.deadline}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: item.status === 'RESOLVED' ? '#4ade80' : '#facc15' }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeScreen === 'emergency' && (
                <div style={{ padding: '14px' }}>
                  <div style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 900, marginBottom: '2px' }}>
                    Crisis Response Console
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Global Alarm Broadcast System</div>

                  <button
                    onClick={() => {
                      if (onShowToast) onShowToast('FULL EVACUATION ALARM BROADCASTED ACROSS ALL SHAFTS!', true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    TRIGGER FULL EVACUATION
                  </button>

                  <button
                    onClick={() => {
                      if (onShowToast) onShowToast('MUSTER PROTOCOL SIGNAL BROADCASTED!');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: '#0f172a',
                      color: '#f59e0b',
                      border: '1px solid #f59e0b',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    SOUND MUSTER ALARM
                  </button>

                  <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Distress Signal Feed</div>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>✓ All monitored shaft channels clear</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grant Access Modal */}
      {grantModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '1.25rem',
            width: '100%',
            maxWidth: '440px',
            color: '#fff',
            border: '1px solid #475569',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Grant Subrole to Subordinate</h3>
              <button
                onClick={() => setGrantModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
              Target User: <strong style={{ color: '#38bdf8' }}>{selectedTargetUser?.username}</strong> ({selectedTargetUser?.email})
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              Available Subroles in your Scope:
            </div>

            {assignableSubroles.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                No assignable subroles available for your authority.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                {assignableSubroles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleGrantSubrole(s.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Role: {s.role_name} &bull; Scope: {s.mine_name || s.organization_name || 'Global'}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>Grant ➔</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
