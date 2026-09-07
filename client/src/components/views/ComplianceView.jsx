import React, { useState } from 'react';
import { FileCheck, FileText, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function ComplianceView({ onShowToast }) {
  const [documents] = useState([
    { id: 'DOC-DGMS-01', name: 'Annual Safety Report 2025', category: 'DGMS Statutory', status: 'Approved', expiry: '2026-12-31' },
    { id: 'DOC-ENV-44', name: 'Environmental Clearance', category: 'MoEFCC', status: 'Expiring Soon', expiry: '2026-09-15' },
    { id: 'DOC-HR-99', name: 'Worker Insurance Policy', category: 'Personnel', status: 'Approved', expiry: '2027-01-01' },
    { id: 'DOC-MINE-12', name: 'Explosives License', category: 'PESO', status: 'Overdue', expiry: '2026-08-01' },
    { id: 'DOC-DGMS-02', name: 'Ventilation Standard Audit', category: 'DGMS Statutory', status: 'Approved', expiry: '2026-11-20' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <FileCheck size={28} color="var(--primary)" />
              Compliance & Statutory Hub
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              Central repository for DGMS compliance, certifications, and operational licenses.
            </p>
          </div>
          <button className="clay-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: '#fff' }}>
            <FileText size={18} /> Upload Document
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {documents.map(doc => (
          <div key={doc.id} className="clay-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                <FileCheck size={24} />
              </div>
              <span className={`badge-pill ${
                doc.status === 'Approved' ? 'badge-success' : 
                doc.status === 'Expiring Soon' ? 'badge-warning' : 'badge-danger'
              }`}>
                {doc.status}
              </span>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>{doc.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {doc.id} • {doc.category}</div>
            </div>
            
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: doc.status === 'Overdue' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: doc.status === 'Overdue' ? 700 : 500 }}>
                {doc.status === 'Approved' ? <CheckCircle size={14} /> : doc.status === 'Expiring Soon' ? <Clock size={14} /> : <AlertCircle size={14} />}
                Valid Till: {doc.expiry}
              </div>
              <button 
                className="clay-btn" 
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                onClick={() => onShowToast && onShowToast(`Downloading ${doc.id}...`)}
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
