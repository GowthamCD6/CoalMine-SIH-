import React, { useState } from 'react';
import { Tractor, Users, Settings, Filter, MoveRight } from 'lucide-react';

export default function ResourceAllocationView({ onShowToast }) {
  const [resources] = useState([
    { id: 'HEMM-01', type: 'Excavator EX-1200', assignee: 'Team Alpha', location: 'Pit 2', status: 'Active' },
    { id: 'HEMM-04', type: 'Dumper D-85', assignee: 'Team Bravo', location: 'Pit 2', status: 'Active' },
    { id: 'HEMM-09', type: 'Dozer DZ-01', assignee: 'None', location: 'Workshop', status: 'Maintenance' },
    { id: 'DRLL-02', type: 'Rotary Drill', assignee: 'Team Charlie', location: 'Sector 4', status: 'Active' },
    { id: 'HEMM-12', type: 'Excavator EX-1200', assignee: 'None', location: 'Yard B', status: 'Idle' },
  ]);

  return (
    <div className="manage-orders-container" style={{ padding: '0 0 20px', gap: '12px' }}>
      {/* Header */}
      <div className="filter-prototype-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <Tractor size={28} color="var(--primary)" />
              Resource Allocation
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Manage Heavy Earth Moving Machinery (HEMM) and shift personnel assignments.
            </p>
          </div>
          <button className="btn btn-apply">
            <Settings size={16} /> Manage Shifts
          </button>
        </div>
      </div>

      {/* Kanban-style Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {/* Column 1: Active */}
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--success)' }}>Active Deployed</h3>
            <span className="badge-pill badge-success">{resources.filter(r => r.status === 'Active').length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resources.filter(r => r.status === 'Active').map(res => (
              <div key={res.id} className="sleek-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{res.id} - {res.type}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }}/> {res.assignee}</span>
                  <span>{res.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Idle */}
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--warning)' }}>Idle / Standby</h3>
            <span className="badge-pill badge-warning">{resources.filter(r => r.status === 'Idle').length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resources.filter(r => r.status === 'Idle').map(res => (
              <div key={res.id} className="sleek-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{res.id} - {res.type}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }}/> Unassigned</span>
                  <span>{res.location}</span>
                </div>
                <button 
                  className="sleek-btn" 
                  style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
                  onClick={() => onShowToast && onShowToast(`Assigning ${res.id}...`)}
                >
                  Allocate <MoveRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Maintenance */}
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--danger)' }}>In Maintenance</h3>
            <span className="badge-pill badge-danger">{resources.filter(r => r.status === 'Maintenance').length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resources.filter(r => r.status === 'Maintenance').map(res => (
              <div key={res.id} className="sleek-card" style={{ padding: '12px', borderLeft: '4px solid var(--danger)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{res.id} - {res.type}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Location: {res.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
