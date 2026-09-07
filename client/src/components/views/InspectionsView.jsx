import React, { useState } from 'react';
import { ClipboardCheck, Search, Plus, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function InspectionsView({ onShowToast }) {
  const [searchTerm, setSearchTerm] = useState('');

  const inspections = [
    { id: '#V-992', type: 'Roof Support Degradation', inspector: 'S. Verma', location: 'Jharia - Level 3', deadline: '2026-09-05', severity: 'High', status: 'In Progress' },
    { id: '#V-991', type: 'Missing PPE (Contractor)', inspector: 'M. Singh', location: 'Godavari - Zone B', deadline: '2026-09-01', severity: 'Medium', status: 'Pending Review' },
    { id: '#S-402', type: 'Routine Vent Shaft Check', inspector: 'Auto-Sensor', location: 'Talcher - Shaft 4', deadline: '2026-08-30', severity: 'Low', status: 'Resolved' },
    { id: '#V-988', type: 'Gas Concentration Spike', inspector: 'K. Patel', location: 'Rajmahal - Sector 2', deadline: '2026-09-02', severity: 'High', status: 'Pending Review' },
    { id: '#S-399', type: 'Equipment Maintenance (Drill)', inspector: 'J. Doe', location: 'ECL Main Workshop', deadline: '2026-08-28', severity: 'Low', status: 'Resolved' },
  ];

  const filtered = inspections.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <ClipboardCheck size={28} color="var(--primary)" />
              Inspections & Violations
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              The tracking ledger where users view, log, and update safety observations, statutory violations, and remediation deadlines.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="sleek-input" 
            placeholder="Search violation ID, type, or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
        <button 
          className="sleek-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: '#fff' }}
          onClick={() => onShowToast && onShowToast('New Inspection Report Opened')}
        >
          <Plus size={18} /> New Inspection
        </button>
      </div>

      <div className="table-container glass-panel">
        <table className="table-white">
          <thead>
            <tr>
              <th>ID</th>
              <th>Observation Type</th>
              <th>Inspector</th>
              <th>Location</th>
              <th>Deadline</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.id}</td>
                <td>{item.type}</td>
                <td>{item.inspector}</td>
                <td>{item.location}</td>
                <td>{item.deadline}</td>
                <td>
                  <span style={{ 
                    color: item.severity === 'High' ? 'var(--danger)' : item.severity === 'Medium' ? 'var(--warning)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600
                  }}>
                    {item.severity === 'High' && <AlertTriangle size={14} />}
                    {item.severity === 'Medium' && <Info size={14} />}
                    {item.severity === 'Low' && <CheckCircle size={14} />}
                    {item.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge-pill ${item.status === 'Resolved' ? 'badge-success' : item.status === 'In Progress' ? 'badge-primary' : 'badge-warning'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
