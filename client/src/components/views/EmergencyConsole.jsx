import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  BellRing, 
  Volume2, 
  ShieldAlert, 
  Send, 
  Users, 
  CheckCircle2,
  Clock,
  Flame,
  PhoneCall
} from 'lucide-react';

export default function EmergencyConsole({ onShowToast }) {
  const [activeSignals, setActiveSignals] = useState([
    {
      id: 'SOS-801',
      worker: 'D. Sen (EMP-4109)',
      zone: 'Jharia Block II - Level 4 Underground',
      depth: '-145 meters',
      time: '12 mins ago',
      gasWarning: 'CH4 Spike 0.52%',
      status: 'DISPATCHING_RESCUE',
    },
  ]);

  const [commsLog, setCommsLog] = useState([
    { id: 1, sender: 'Safety Control Room', time: '09:20 AM', message: 'Muster roll attendance sync verified for Shift 1.' },
    { id: 2, sender: 'Station Chief', time: '09:05 AM', message: 'Ventilation Shaft 3 backup generator tested and operational.' },
    { id: 3, sender: 'Surface Siren Node', time: '08:00 AM', message: 'Automated daily audio beacon diagnostic passed (98 dB nominal).' },
  ]);

  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleTriggerEvacuation = () => {
    const newLog = {
      id: Date.now(),
      sender: 'EMERGENCY BROADCAST',
      time: new Date().toLocaleTimeString(),
      message: '🚨 CRITICAL: FULL EVACUATION PROTOCOL INITIATED ACROSS ALL SECTORS.',
    };
    setCommsLog([newLog, ...commsLog]);
    if (onShowToast) onShowToast('EVACUATION BROADCAST SENT! Underground sirens activated.', true);
  };

  const handleTriggerMuster = () => {
    const newLog = {
      id: Date.now(),
      sender: 'SURFACE CONTROLLER',
      time: new Date().toLocaleTimeString(),
      message: '⚠️ Muster Alarm sounding. All workers proceed to designated refuge bays.',
    };
    setCommsLog([newLog, ...commsLog]);
    if (onShowToast) onShowToast('Muster Assembly Alarm sounded across all shafts.');
  };

  const handlePostComms = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const newLog = {
      id: Date.now(),
      sender: 'Radio Operator',
      time: new Date().toLocaleTimeString(),
      message: broadcastMessage,
    };
    setCommsLog([newLog, ...commsLog]);
    setBroadcastMessage('');
    if (onShowToast) onShowToast('Radio communication logged.');
  };

  const handleAcknowledgeSignal = (id) => {
    setActiveSignals(activeSignals.filter((s) => s.id !== id));
    if (onShowToast) onShowToast(`Distress signal #${id} resolved & rescue team deployed.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={28} color="var(--danger)" />
          Emergency Crisis & SOS Command Console
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
          Real-time incident response, rapid evacuation broadcasting, distress beacon tracking, and crisis communications
        </p>
      </div>

      {/* Top Grid: Global Broadcast Actions & Distress Monitor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Global Broadcast Panel */}
        <div className="card-white" style={{
          padding: '1.5rem',
          borderLeft: '4px solid var(--danger)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '8px' }}>
            <Volume2 size={22} />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--danger-text)' }}>
              Subterranean Siren & Evacuation Broadcaster
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            Instantly triggers high-decibel acoustic surface sirens, digital subterranean pagers, and automated refuge bay ventilation protocols.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleTriggerEvacuation}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
            >
              <AlertTriangle size={20} />
              TRIGGER FULL EVACUATION ALARM
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={handleTriggerMuster}
                style={{
                  padding: '11px',
                  backgroundColor: 'var(--warning-light)',
                  border: '1px solid var(--warning-border)',
                  color: 'var(--warning-text)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <BellRing size={16} />
                SOUND MUSTER ALARM
              </button>

              <button
                onClick={() => {
                  if (onShowToast) onShowToast('Ventilation purge sequence engaged: Fans boosted to 120%.');
                }}
                style={{
                  padding: '11px',
                  backgroundColor: 'var(--info-light)',
                  border: '1px solid var(--info-border)',
                  color: 'var(--info)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Radio size={16} />
                PURGE VENTILATION
              </button>
            </div>
          </div>
        </div>

        {/* Active Distress Signals Monitor */}
        <div className="card-white" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Active Distress Signals</h3>
            <span className={`badge-pill ${activeSignals.length > 0 ? 'badge-danger' : 'badge-success'}`}>
              {activeSignals.length} Active Beacons
            </span>
          </div>

          {activeSignals.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--success-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--success-border)',
              color: 'var(--success-text)',
            }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Sectors Clear</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Zero active distress signals or trapped personnel alerts detected across all 14 mines.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeSignals.map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--danger-light)',
                    border: '1px solid var(--danger-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--danger-text)', fontSize: '0.85rem' }}>
                      {sig.id} • {sig.worker}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--danger-text)', fontWeight: 600 }}>
                      {sig.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-body)' }}>
                    <strong>Location:</strong> {sig.zone} ({sig.depth})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', fontWeight: 600 }}>
                    ⚠️ {sig.gasWarning}
                  </div>
                  <button
                    onClick={() => handleAcknowledgeSignal(sig.id)}
                    style={{
                      marginTop: '4px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--danger)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Deploy Rescue & Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Incident Communications Feed */}
      <div className="card-white" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Incident Radio & Broadcast Communications Log</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Encrypted Statutory VHF/Digital Feed
          </span>
        </div>

        {/* Log Entries List */}
        <div style={{ padding: '1rem 1.5rem', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {commsLog.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '10px 14px',
                backgroundColor: log.sender.includes('EMERGENCY') ? 'var(--danger-light)' : 'var(--bg-surface-subtle)',
                border: `1px solid ${log.sender.includes('EMERGENCY') ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{
                  fontWeight: 700,
                  color: log.sender.includes('EMERGENCY') ? 'var(--danger-text)' : 'var(--text-main)',
                }}>
                  {log.sender}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {log.time}
                </span>
              </div>
              <div style={{ color: log.sender.includes('EMERGENCY') ? 'var(--danger-text)' : 'var(--text-body)' }}>
                {log.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input to send radio message */}
        <form onSubmit={handlePostComms} style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '10px',
          backgroundColor: '#fafafa',
        }}>
          <input
            type="text"
            placeholder="Type emergency announcement or operational dispatch order..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="input-white"
            style={{ height: '40px', fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            style={{
              padding: '0 20px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={15} />
            <span>Transmit</span>
          </button>
        </form>
      </div>
    </div>
  );
}
