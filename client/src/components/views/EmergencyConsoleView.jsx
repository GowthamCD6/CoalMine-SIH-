import React, { useState } from 'react';
import { Ambulance, MapPin, AlertOctagon, Radio, Clock, Navigation } from 'lucide-react';

export default function EmergencyConsoleView({ onShowToast }) {
  const [activeSOS] = useState([
    { id: 'SOS-0992', user: 'Amit Kumar', location: 'Level 4, Sector B', time: '2 mins ago', status: 'Unacknowledged', type: 'Gas Leak' },
    { id: 'SOS-0991', user: 'Team Alpha', location: 'Shaft 2', time: '15 mins ago', status: 'Responder Dispatched', type: 'Structural Integrity' }
  ]);

  const [responders] = useState([
    { team: 'Rescue Team 1', status: 'Deployed - Shaft 2', eta: '4 mins' },
    { team: 'Medevac Unit', status: 'Standby', eta: 'N/A' },
    { team: 'Ventilation Crew', status: 'En-route Sector B', eta: '8 mins' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--danger)' }}>
              <Ambulance size={28} />
              Emergency & SOS Console
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              Active monitoring of SOS panics, environmental emergencies, and response team coordination.
            </p>
          </div>
          <button 
            className="clay-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--danger)', color: '#fff' }}
            onClick={() => onShowToast && onShowToast('Mass Evacuation Broadcast Initiated', true)}
          >
            <AlertOctagon size={18} /> Broadcast Evacuation
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Active SOS Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--danger)" /> Live SOS Feeds
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSOS.map(sos => (
              <div key={sos.id} className="clay-card" style={{ padding: '16px', borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sos.id} - {sos.type}</span>
                  <span className={`badge-pill ${sos.status === 'Unacknowledged' ? 'badge-danger' : 'badge-warning'}`}>
                    {sos.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {sos.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {sos.time}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>User:</strong> {sos.user}</div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="clay-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9' }} onClick={() => onShowToast && onShowToast('Acknowledge sent')}>
                    Acknowledge
                  </button>
                  <button className="clay-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => onShowToast && onShowToast('Dispatching responders')}>
                    Dispatch Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responders Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="var(--primary)" /> Active Responders
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {responders.map((resp, i) => (
              <div key={i} className="clay-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{resp.team}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{resp.status}</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>ETA: {resp.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
