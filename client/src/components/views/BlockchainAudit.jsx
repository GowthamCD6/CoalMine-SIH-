import React, { useState } from 'react';
import { 
  Link, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Hash, 
  Cpu, 
  Layers,
  Search
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function BlockchainAudit({ onShowToast }) {
  const [logs, setLogs] = useState(api.getBlockchainLogs());
  const [selectedTx, setSelectedTx] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) =>
    log.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (hash) => {
    navigator.clipboard?.writeText(hash);
    if (onShowToast) onShowToast('Cryptographic hash copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link size={28} color="var(--primary)" />
          Cryptographic Blockchain Audit Trail & Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
          Tamper-proof distributed ledger tracking DGMS statutory filings, shift muster rolls, and hourly environmental proofs
        </p>
      </div>

      {/* Network Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Network Consensus</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={20} color="var(--success)" />
            Achieved (100%)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Proof of Authority (PoA) Consortium
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Block Height</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px', fontFamily: 'monospace' }}>
            #1,849,208
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Avg Block Time: 2.1s
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Authorized Validator Nodes</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            6 Nodes Online
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Ministry of Coal, DGMS, ECL, BCCL, SECL, MCL
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-white" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search block height, transaction hash or statutory action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-white"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
          />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredLogs.length}</strong> validated immutable records
        </span>
      </div>

      {/* Ledger Feed Table */}
      <div className="card-white" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-white">
            <thead>
              <tr>
                <th>Block & Hash</th>
                <th>Action & Statutory Payload</th>
                <th>Timestamp</th>
                <th>Validator Node</th>
                <th>Consensus Status</th>
                <th style={{ textAlign: 'right' }}>Proof</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.txHash}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.8rem' }}>
                        #{log.blockHeight}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.txHash.substring(0, 16)}...
                      </span>
                      <button
                        onClick={() => handleCopyHash(log.txHash)}
                        title="Copy Hash"
                        style={{ color: 'var(--text-light)', padding: '2px' }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.summary}</div>
                    <span className="badge-pill badge-primary" style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                      {log.action}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </td>

                  <td style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                    {log.validator}
                  </td>

                  <td>
                    <span className="badge-pill badge-success">
                      ✓ {log.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTx(log)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary-border)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      Inspect JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tx Inspector Modal */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--success)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Block Transaction Proof Inspector</h3>
              </div>
              <button onClick={() => setSelectedTx(null)} style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SHA-256 HASH</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--primary)' }}>
                  {selectedTx.txHash}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                DECODED CRYPTOGRAPHIC PAYLOAD
              </div>
              <pre style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                color: 'var(--text-main)',
              }}>
                {JSON.stringify(selectedTx, null, 2)}
              </pre>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedTx(null)}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
