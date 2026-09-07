import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  MapPin,
  AlertOctagon,
  Radio,
  Clock,
  Navigation,
  Send,
  CheckCircle2,
  X,
  Volume2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api.js';

export default function EmergencyConsoleView({ onShowToast }) {
  const [activeSOS, setActiveSOS] = useState([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Evacuation Modal State
  const [showEvacModal, setShowEvacModal] = useState(false);
  const [evacTargetZone, setEvacTargetZone] = useState('ALL');
  const [evacTitle, setEvacTitle] = useState('🚨 IMMEDIATE MINE EVACUATION ORDER');
  const [evacMessage, setEvacMessage] = useState(
    'Critical life-safety hazard detected. All subterranean and surface personnel must drop tools and proceed immediately to emergency egress.'
  );
  const [exitRoute, setExitRoute] = useState('Shaft 4 Incline (Portal Gate)');

  const fetchEmergencyData = async () => {
    try {
      const res = await api.getEmergencyAlerts();
      if (res.data) {
        setActiveSOS(res.data.sos_alerts || []);
        setActiveBroadcasts((res.data.broadcasts || []).filter((b) => b.status === 'ACTIVE'));
        setSignals(res.data.signals || []);
      }
    } catch (err) {
      console.warn('Failed to fetch emergency feeds:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
    const interval = setInterval(fetchEmergencyData, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcastEvacuation = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: evacTitle,
        message: evacMessage,
        type: 'EVACUATION',
        severity: 'CRITICAL',
        target_zone: evacTargetZone,
        exit_route: exitRoute,
        sender_name: 'Mine Safety Command',
        sender_role: 'COMMAND',
      };

      await api.createEmergencyAlert(payload);
      if (onShowToast) {
        onShowToast('🚨 Mass Evacuation Broadcast Dispatched to all mobile terminals!', false);
      }
      setShowEvacModal(false);
      await fetchEmergencyData();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to broadcast evacuation: ' + err.message, true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.resolveEmergencyAlert(id);
      if (onShowToast) {
        onShowToast('Evacuation order stood down.');
      }
      await fetchEmergencyData();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to resolve alert: ' + err.message, true);
      }
    }
  };

  const handleAcknowledgeSos = async (sosId) => {
    try {
      await api.respondToDistress(sosId, { status: 'ACKNOWLEDGED' });
      if (onShowToast) {
        onShowToast(`SOS ${sosId} acknowledged by Command.`);
      }
      await fetchEmergencyData();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error updating SOS: ' + err.message, true);
      }
    }
  };

  const handleDispatchTeam = async (sosId) => {
    try {
      await api.dispatchRescueTeam({
        alert_id: sosId,
        sector: 'Shaft 4 • Level 3',
        rescue_team_name: 'Rapid Response Team Alpha',
      });
      if (onShowToast) {
        onShowToast(`🚑 Rescue Brigade dispatched to ${sosId}!`);
      }
      await fetchEmergencyData();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error dispatching team: ' + err.message, true);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          backgroundColor: 'rgba(254, 242, 242, 0.7)',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.5rem',
                color: '#b91c1c',
                fontWeight: 800,
              }}
            >
              <Ambulance size={28} color="#dc2626" />
              Emergency & SOS Console
            </h2>
            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Subterranean telemetry dispatch, remote beacon sirens & mass evacuation broadcast system.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="sleek-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
              }}
              onClick={fetchEmergencyData}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              className="sleek-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
              }}
              onClick={() => setShowEvacModal(true)}
            >
              <AlertOctagon size={18} /> Broadcast Evacuation
            </button>
          </div>
        </div>
      </div>

      {activeBroadcasts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="var(--danger)" /> Active Mine Evacuation Orders ({activeBroadcasts.length})
          </h3>
          {activeBroadcasts.map((b) => (
            <div
              key={b.id}
              className="sleek-card"
              style={{
                padding: '18px',
                backgroundColor: '#fef2f2',
                borderLeft: '5px solid var(--danger)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem' }}>{b.title}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#fee2e2',
                      color: 'var(--danger)',
                      fontWeight: 700,
                    }}
                  >
                    TARGET: {b.target_zone_name || b.target_zone}
                  </span>
                </div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '6px' }}>{b.message}</div>
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                  Exit Route: {b.exit_route} • Dispatched by {b.sender_name}
                </div>
              </div>
              <button
                className="sleek-btn"
                style={{ backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: 700, padding: '8px 14px' }}
                onClick={() => handleResolveAlert(b.id)}
              >
                Stand Down Evacuation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Live SOS Feeds & Responders */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Active SOS Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--danger)" /> Live Subterranean SOS Feeds ({activeSOS.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSOS.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <CheckCircle2 size={28} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Zero Active SOS Distress Beacons</div>
                <div style={{ fontSize: '0.85rem' }}>All worker turnstiles and underground shafts report green.</div>
              </div>
            ) : (
              activeSOS.map((sos) => (
                <div
                  key={sos.id}
                  className="sleek-card"
                  style={{
                    padding: '16px',
                    borderLeft: `4px solid ${sos.status === 'ACTIVE_DISTRESS' ? 'var(--danger)' : 'var(--primary)'}`,
                    backgroundColor: sos.status === 'ACTIVE_DISTRESS' ? '#fff5f5' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {sos.id} - {sos.worker_name || 'Worker'}
                    </span>
                    <span className={`badge-pill ${sos.status === 'ACTIVE_DISTRESS' ? 'badge-danger' : 'badge-warning'}`}>
                      {sos.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--danger)" /> {sos.zone} ({sos.depth}m)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> {new Date(sos.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>Notes:</strong> {sos.notes || 'Emergency assistance requested'}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button
                      className="sleek-btn"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#f1f5f9' }}
                      onClick={() => handleAcknowledgeSos(sos.id)}
                    >
                      Acknowledge
                    </button>
                    <button
                      className="sleek-btn"
                      style={{ padding: '6px 14px', fontSize: '0.85rem', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}
                      onClick={() => handleDispatchTeam(sos.id)}
                    >
                      Dispatch Rescue Brigade
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Responders & Signal Nodes Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="var(--primary)" /> Active Rescue Squads
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="sleek-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Alpha Subterranean Brigade</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shaft 4 Incline</span>
                  <span style={{ fontWeight: '600', color: 'var(--success)' }}>READY (Underground)</span>
                </div>
              </div>
              <div className="sleek-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Rapid Ventilation Crew</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Zone B Airway</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>STANDBY</span>
                </div>
              </div>
              <div className="sleek-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Surface Medevac Mobile</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Portal Gate Sump</span>
                  <span style={{ fontWeight: '600', color: 'var(--success)' }}>ON-SITE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="#0284c7" /> Mesh Signal Sectors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {signals.map((sig) => (
                <div key={sig.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{sig.name}</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>{sig.signal_node}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evacuation Modal */}
      {showEvacModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '2px solid #ef4444',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 800, fontSize: '1.25rem' }}>
                <AlertOctagon size={24} color="#dc2626" />
                Dispatch Mass Evacuation Order
              </div>
              <button
                onClick={() => setShowEvacModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBroadcastEvacuation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target Mine Sector:
                </label>
                <select
                  value={evacTargetZone}
                  onChange={(e) => setEvacTargetZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <option value="ALL">Entire Mine (All Surface & Underground Sectors)</option>
                  {signals
                    .filter((s) => s.id !== 'ALL')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.signal_node})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Evacuation Order Title:
                </label>
                <input
                  type="text"
                  value={evacTitle}
                  onChange={(e) => setEvacTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#991b1b',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Emergency Directive / Message:
                </label>
                <textarea
                  rows={3}
                  value={evacMessage}
                  onChange={(e) => setEvacMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Designated Egress / Escape Route:
                </label>
                <input
                  type="text"
                  value={exitRoute}
                  onChange={(e) => setExitRoute(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEvacModal(false)}
                  className="sleek-btn"
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="sleek-btn"
                  style={{
                    flex: 2,
                    padding: '12px',
                    backgroundColor: 'var(--danger)',
                    color: '#ffffff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={16} />
                  {submitting ? 'Broadcasting...' : 'DISPATCH IMMEDIATE EVACUATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
