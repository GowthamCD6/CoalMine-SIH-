import React, { useState } from 'react';
import { FileCheck, FileText, Download, CheckCircle, AlertCircle, Clock, BrainCircuit, ShieldAlert, Check } from 'lucide-react';

export default function ComplianceView({ onShowToast }) {
  const [documents] = useState([
    { id: 'DOC-DGMS-01', name: 'Annual Safety Report 2025', category: 'DGMS Statutory', status: 'Approved', expiry: '2026-12-31', aiScore: 98 },
    { id: 'DOC-ENV-44', name: 'Environmental Clearance', category: 'MoEFCC', status: 'Expiring Soon', expiry: '2026-09-15', aiScore: 82 },
    { id: 'DOC-HR-99', name: 'Worker Insurance Policy', category: 'Personnel', status: 'Approved', expiry: '2027-01-01', aiScore: 100 },
    { id: 'DOC-MINE-12', name: 'Explosives License', category: 'PESO', status: 'Overdue', expiry: '2026-08-01', aiScore: 45 },
    { id: 'DOC-DGMS-02', name: 'Ventilation Standard Audit', category: 'DGMS Statutory', status: 'Approved', expiry: '2026-11-20', aiScore: 91 },
  ]);

  const [aiInsights] = useState([
    { id: 'INS-01', text: 'Explosives License renewal requires immediate attention. Penalties may apply.', severity: 'high' },
    { id: 'INS-02', text: 'Environmental clearance expires next month. Predict 14 days for processing.', severity: 'medium' },
    { id: 'INS-03', text: 'Safety audit scores remain above 90th percentile globally.', severity: 'low' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="sleek-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
              <BrainCircuit size={28} color="var(--primary)" />
              AI Statutory Hub & Compliance Monitor
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
              AI-driven governance tracking, automated audits, and statutory compliance for DGMS & MoEFCC.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="sleek-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: '#475569' }} onClick={() => onShowToast('Running AI Audit...')}>
              <BrainCircuit size={18} /> Run AI Audit
            </button>
            <button className="sleek-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => onShowToast('Opening Document Upload...')}>
              <FileText size={18} /> Upload Document
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Document Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Statutory Documents</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {documents.map(doc => (
              <div key={doc.id} className="sleek-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: doc.status === 'Overdue' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: doc.status === 'Overdue' ? 700 : 500 }}>
                      {doc.status === 'Approved' ? <CheckCircle size={14} /> : doc.status === 'Expiring Soon' ? <Clock size={14} /> : <AlertCircle size={14} />}
                      Valid Till: {doc.expiry}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: doc.aiScore > 90 ? 'var(--success)' : doc.aiScore > 70 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                      AI Confidence: {doc.aiScore}%
                    </div>
                  </div>
                  <button 
                    className="sleek-btn" 
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

        {/* AI Insights Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>AI Compliance Insights</h3>
          <div className="sleek-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>84%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Compliance Health</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiInsights.map((insight) => (
                <div key={insight.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px', color: insight.severity === 'high' ? 'var(--danger)' : insight.severity === 'medium' ? '#d97706' : 'var(--success)' }}>
                    {insight.severity === 'high' ? <ShieldAlert size={16} /> : insight.severity === 'medium' ? <AlertCircle size={16} /> : <Check size={16} />}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
                    {insight.text}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="sleek-btn" style={{ width: '100%', marginTop: '8px', backgroundColor: 'transparent', border: '1px dashed var(--primary)', color: 'var(--primary)' }} onClick={() => onShowToast('Generating Full AI Brief...')}>
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
