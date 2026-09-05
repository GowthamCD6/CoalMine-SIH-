import React, { useState } from 'react';
import { 
  FileCheck, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Search,
  Building,
  FileText
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function ComplianceHub({ onShowToast }) {
  const [docs, setDocs] = useState(api.getComplianceDocs());
  const [search, setSearch] = useState('');

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.authority.toLowerCase().includes(search.toLowerCase()) ||
    d.mine.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (title) => {
    if (onShowToast) onShowToast(`Downloading signed statutory certificate: "${title.substring(0, 30)}..."`);
  };

  const handleFileRenewal = (title) => {
    if (onShowToast) onShowToast(`Statutory Renewal Application initiated for: "${title.substring(0, 30)}..."`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck size={28} color="var(--primary)" />
            Statutory & Regulatory Compliance Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            Central repository for DGMS safety permits, MoEFCC environmental clearances, and PESO explosive licenses
          </p>
        </div>

        <button
          onClick={() => {
            if (onShowToast) onShowToast('New Statutory Permit Filing Form opened.');
          }}
          style={{
            padding: '9px 18px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Upload size={16} />
          <span>Upload Statutory Filing</span>
        </button>
      </div>

      {/* Compliance Health Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Clearances</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '4px' }}>
            100% Compliant
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            0 Stop-Work Orders Active
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Renewals Due (&lt;90 Days)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning-text)', marginTop: '4px' }}>
            2 Filings
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Ventilation & Groundwater Returns
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Statutory Audit Score</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            98.5 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            DGMS National Benchmark Top Tier
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card-white" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search document title, DGMS authority or mine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-white"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Compliance Documents Table */}
      <div className="card-white" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-white">
            <thead>
              <tr>
                <th>Document & License Details</th>
                <th>Regulatory Authority</th>
                <th>Mining Project</th>
                <th>Validity & Expiry</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        flexShrink: 0,
                      }}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{doc.title}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Ref: {doc.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>
                    {doc.authority}
                  </td>

                  <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    {doc.mine}
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {doc.expiryDate}
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      color: doc.daysLeft < 90 ? 'var(--warning-text)' : 'var(--text-light)',
                      fontWeight: doc.daysLeft < 90 ? 700 : 400,
                    }}>
                      {doc.daysLeft} days remaining
                    </span>
                  </td>

                  <td>
                    <span className={`badge-pill ${
                      doc.status === 'Valid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {doc.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleDownload(doc.title)}
                        title="Download Signed PDF Certificate"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-body)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>

                      {doc.daysLeft < 90 && (
                        <button
                          onClick={() => handleFileRenewal(doc.title)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--warning-light)',
                            border: '1px solid var(--warning-border)',
                            color: 'var(--warning-text)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Renew
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
