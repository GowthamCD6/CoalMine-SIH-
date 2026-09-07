import React, { useState } from 'react';
import { Map, MapPin, Activity, AlertTriangle, Search, Filter } from 'lucide-react';

export default function CommandMapView({ onShowToast }) {
  const [regions] = useState([
    { name: 'Jharia Coalfield', lat: '23.75° N', lng: '86.41° E', status: 'Critical', activeMines: 12, personnel: 4200, alerts: 3 },
    { name: 'Talcher Coalfield', lat: '20.95° N', lng: '85.22° E', status: 'Nominal', activeMines: 8, personnel: 3100, alerts: 0 },
    { name: 'Godavari Valley', lat: '17.84° N', lng: '80.89° E', status: 'Warning', activeMines: 5, personnel: 1850, alerts: 1 },
    { name: 'Raniganj Coalfield', lat: '23.63° N', lng: '87.13° E', status: 'Nominal', activeMines: 15, personnel: 5600, alerts: 0 },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <Map size={28} color="var(--primary)" />
              National GIS Command Map
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              Live geo-spatial monitoring of all active mining zones, asset tracking, and geological stability metrics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="sleek-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              <Search size={16} /> Search Map
            </button>
            <button className="sleek-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Map View - Using Grid for layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', height: '600px' }}>
        {/* Map Placeholder */}
        <div className="glass-panel" style={{ 
          position: 'relative', 
          backgroundColor: '#e2e8f0', 
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            Live GIS Feed Active (Simulation)
          </div>
          
          {/* Simulated Map Pins */}
          <div style={{ position: 'absolute', top: '30%', left: '40%', cursor: 'pointer' }} onClick={() => onShowToast && onShowToast('Jharia Coalfield Selected')}>
            <MapPin size={32} color="var(--danger)" fill="#fee2e2" />
            <div style={{ position: 'absolute', top: '35px', left: '-20px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Jharia (Alert)</div>
          </div>
          
          <div style={{ position: 'absolute', top: '50%', left: '60%', cursor: 'pointer' }}>
            <MapPin size={32} color="var(--success)" fill="#dcfce7" />
          </div>
          
          <div style={{ position: 'absolute', top: '70%', left: '45%', cursor: 'pointer' }}>
            <MapPin size={32} color="var(--warning)" fill="#fef9c3" />
          </div>

          <div style={{ textAlign: 'center', color: '#64748b', backgroundColor: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
            <Map size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>Interactive Map Component Loading...</p>
            <p style={{ fontSize: '0.8rem' }}>Coordinates: 20.5937° N, 78.9629° E (India)</p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Active Coalfields</h3>
          {regions.map((region, i) => (
            <div key={i} className="sleek-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{region.name}</h4>
                <span className={`badge-pill ${region.status === 'Critical' ? 'badge-danger' : region.status === 'Warning' ? 'badge-warning' : 'badge-success'}`}>
                  {region.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div><strong>Lat:</strong> {region.lat}</div>
                <div><strong>Lng:</strong> {region.lng}</div>
                <div><strong>Mines:</strong> {region.activeMines}</div>
                <div><strong>Personnel:</strong> {region.personnel.toLocaleString()}</div>
              </div>
              {region.alerts > 0 && (
                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <AlertTriangle size={14} /> {region.alerts} Active Alert(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
