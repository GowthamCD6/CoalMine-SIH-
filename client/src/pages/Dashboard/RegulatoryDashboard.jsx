import React, { useState, useEffect } from 'react';
import { Shield, Building2, RefreshCw, FileCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.js';

const RAGBadge = ({ compliant, total }) => {
  const pct = total > 0 ? Math.round((compliant / total) * 100) : null;
  if (pct === null) return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No data</span>;
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const bg = pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2';
  const label = pct >= 80 ? '✅ Compliant' : pct >= 60 ? '⚠️ Partial' : '❌ Non-Compliant';
  return (
    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '700', backgroundColor: bg, color }}>
      {label} ({pct}%)
    </span>
  );
};

export default function RegulatoryDashboard({ currentUser, onNavigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getRegulatoryDashboard();
      setData(res);
    } catch (err) {
      console.warn('Regulatory dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rows = data?.compliance_by_mine || [];
  const totalNonCompliant = rows.reduce((s, r) => s + (Number(r.non_compliant) || 0), 0);
  const totalOverdue = rows.reduce((s, r) => s + (Number(r.overdue) || 0), 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Regulatory Oversight Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Statutory compliance status across assigned mine sites
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
            color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Summary KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Mine Sites Monitored', value: rows.length, icon: Building2, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Total Requirements', value: rows.reduce((s, r) => s + Number(r.total || 0), 0), icon: FileCheck, color: '#9333ea', bg: '#f3e8ff' },
          { label: 'Non-Compliant', value: totalNonCompliant, icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Overdue', value: totalOverdue, icon: Clock, color: '#d97706', bg: '#fef3c7' },
        ].map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CardIcon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{card.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert if overdue */}
      {totalOverdue > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '12px',
          backgroundColor: '#fef3c7', border: '1px solid #fde68a',
          marginBottom: '1.5rem',
        }}>
          <AlertTriangle size={18} color="#d97706" />
          <span style={{ fontWeight: '600', color: '#92400e', fontSize: '0.88rem' }}>
            {totalOverdue} compliance requirement{totalOverdue > 1 ? 's are' : ' is'} overdue across monitored sites. Escalation may be required.
          </span>
        </div>
      )}

      {/* Compliance table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            Compliance Status by Mine Site
          </h3>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading compliance data…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Shield size={40} style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <div>No mine sites assigned to your authority scope yet.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem', fontWeight: '700' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mine Site</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Organization</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Compliant</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Non-Compliant</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{row.mine_name}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{row.org_name}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <RAGBadge compliant={row.compliant} total={row.total} />
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#0f172a' }}>{row.total || 0}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>{row.compliant || 0}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: row.non_compliant > 0 ? '#dc2626' : '#16a34a', fontWeight: '700' }}>{row.non_compliant || 0}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: row.overdue > 0 ? '#d97706' : '#16a34a', fontWeight: '700' }}>{row.overdue || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
