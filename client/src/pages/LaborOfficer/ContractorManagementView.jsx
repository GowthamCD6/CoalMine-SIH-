import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, Search, Filter, ShieldCheck, Users, FileText,
  Building2, Phone, Mail, UserCheck, X, Check, Eye, XCircle
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function ContractorManagementView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('contractors'); // 'contractors' | 'contracts' | 'workers'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [mines, setMines] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showNewContractor, setShowNewContractor] = useState(false);
  const [showNewContract, setShowNewContract] = useState(false);
  const [showNewWorker, setShowNewWorker] = useState(false);

  // Load mines
  useEffect(() => {
    api.getMines({ limit: 100 })
      .then(res => setMines(Array.isArray(res) ? res : res?.data || res?.rows || []))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, contRes, ctrRes, wrkRes] = await Promise.all([
        api.getContractorsSummary().catch(() => null),
        api.getContractors({ limit: 100 }).catch(() => ({ data: [] })),
        api.getContracts({ limit: 100 }).catch(() => ({ data: [] })),
        api.getContractorWorkers({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes?.data || sumRes || null);
      setContractors(contRes?.data?.rows || contRes?.data || contRes?.rows || (Array.isArray(contRes) ? contRes : []));
      setContracts(ctrRes?.data?.rows || ctrRes?.data || ctrRes?.rows || (Array.isArray(ctrRes) ? ctrRes : []));
      setWorkers(wrkRes?.data?.rows || wrkRes?.data || wrkRes?.rows || (Array.isArray(wrkRes) ? wrkRes : []));
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load contractor data', true);
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredContractors = contractors.filter(c =>
    (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContracts = contracts.filter(c =>
    (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.work_description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkers = workers.filter(w =>
    (w.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>

      {/* Top Header Bar */}
      <div
        style={{
          padding: '0.65rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Briefcase size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>
              Contractor Workforce Governance
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              LABOR REGULATION ACTIVE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {activeTab === 'contractors' && (
            <button
              onClick={() => setShowNewContractor(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#7c3aed',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={14} /> Register Contractor
            </button>
          )}
          {activeTab === 'contracts' && (
            <button
              onClick={() => setShowNewContract(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={14} /> Assign Contract
            </button>
          )}
          {activeTab === 'workers' && (
            <button
              onClick={() => setShowNewWorker(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#059669',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={14} /> Enroll Worker
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.active_contractors ?? contractors.filter(c => c.status === 'ACTIVE').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Contractors</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #e0e7ff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>
              {summary?.active_contracts ?? contracts.filter(c => c.status === 'ACTIVE').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Site Contracts</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #dbeafe', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
              {summary?.total_workers ?? workers.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outsourced Workers</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff', padding: '1.2rem', borderRadius: '12px',
          border: '1px solid #dcfce7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              {summary?.training_compliance_pct ?? 95}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safety VTC Certified</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'contractors', label: 'Contractor Firms', count: contractors.length, icon: Building2 },
            { key: 'contracts', label: 'Site Work Contracts', count: contracts.length, icon: FileText },
            { key: 'workers', label: 'Contractor Personnel', count: workers.length, icon: Users },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchTerm(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                color: activeTab === key ? '#7c3aed' : 'var(--text-muted)',
                borderBottom: activeTab === key ? '3px solid #7c3aed' : '3px solid transparent',
                transition: 'all 0.2s', marginBottom: '-2px'
              }}
            >
              <Icon size={18} />
              {label}
              <span style={{
                fontSize: '0.72rem', padding: '2px 7px', borderRadius: '99px',
                backgroundColor: activeTab === key ? '#ede9fe' : '#f1f5f9',
                color: activeTab === key ? '#7c3aed' : '#64748b'
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="sleek-input"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* ─── TAB 1: CONTRACTORS ─── */}
      {activeTab === 'contractors' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Company / Registration</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Contact Person</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Phone / Email</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Active Contracts</th>
                <th style={{ textAlign: 'center', padding: '12px 16px' }}>Workers</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContractors.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.company_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reg: {c.registration_number || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600 }}>
                    {c.contact_person || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569' }}>
                    <div>{c.contact_phone || '--'}</div>
                    <div style={{ color: '#64748b' }}>{c.contact_email || '--'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', fontWeight: 700 }}>
                      {c.active_contracts_count || 0} contracts
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                      {c.workers_count || 0} workers
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: c.status === 'ACTIVE' ? '#dcfce7' : c.status === 'BLACKLISTED' ? '#fee2e2' : '#f1f5f9',
                      color: c.status === 'ACTIVE' ? '#166534' : c.status === 'BLACKLISTED' ? '#991b1b' : '#475569',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredContractors.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No contractor firms registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 2: CONTRACTS ─── */}
      {activeTab === 'contracts' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Contractor / Mine</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Scope of Work</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Start Date</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>End Date</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((ctr) => (
                <tr key={ctr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ctr.company_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ctr.mine_name}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', maxWidth: '300px' }}>
                    {ctr.work_description || 'General Mining Services'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {new Date(ctr.start_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {ctr.end_date ? new Date(ctr.end_date).toLocaleDateString() : 'Indefinite'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: ctr.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: ctr.status === 'ACTIVE' ? '#166534' : '#991b1b',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {ctr.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 3: WORKERS ─── */}
      {activeTab === 'workers' && (
        <div className="table-container glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-white" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Worker Name / ID</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Contractor Firm</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Mine & Section</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Safety VTC Training</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{w.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {w.id_number || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    {w.company_name}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    <div>{w.mine_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.assigned_area || 'Site Area'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {w.role || 'General Labour'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: w.training_status === 'CERTIFIED' ? '#dcfce7' : w.training_status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                      color: w.training_status === 'CERTIFIED' ? '#166534' : w.training_status === 'PENDING' ? '#92400e' : '#991b1b',
                      fontSize: '0.75rem', fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      {w.training_status === 'CERTIFIED' ? (
                        <><CheckCircle2 size={12} /> Certified</>
                      ) : w.training_status === 'PENDING' ? (
                        <><Clock size={12} /> Pending VTC</>
                      ) : (
                        <><XCircle size={12} /> Expired</>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: w.status === 'ACTIVE' ? '#eff6ff' : '#f1f5f9',
                      color: w.status === 'ACTIVE' ? '#2563eb' : '#64748b',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No contractor personnel enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── MODAL: REGISTER CONTRACTOR ─── */}
      {showNewContractor && (
        <RegisterContractorModal
          onClose={() => setShowNewContractor(false)}
          onSuccess={() => {
            setShowNewContractor(false);
            if (onShowToast) onShowToast('Contractor firm registered');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: ASSIGN CONTRACT ─── */}
      {showNewContract && (
        <AssignContractModal
          mines={mines}
          contractors={contractors}
          onClose={() => setShowNewContract(false)}
          onSuccess={() => {
            setShowNewContract(false);
            if (onShowToast) onShowToast('Work contract provisioned');
            loadData();
          }}
        />
      )}

      {/* ─── MODAL: ENROLL WORKER ─── */}
      {showNewWorker && (
        <EnrollWorkerModal
          mines={mines}
          contractors={contractors}
          onClose={() => setShowNewWorker(false)}
          onSuccess={() => {
            setShowNewWorker(false);
            if (onShowToast) onShowToast('Worker enrolled');
            loadData();
          }}
        />
      )}

    </div>
  );
}

// ─── Sub-Modal: Register Contractor ──────────────────────────────────────────
function RegisterContractorModal({ onClose, onSuccess }) {
  const [companyName, setCompanyName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [person, setPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName) return;
    setSubmitting(true);
    try {
      await api.createContractor({
        company_name: companyName,
        registration_number: regNum,
        contact_person: person,
        contact_phone: phone,
        contact_email: email,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Register Contractor Firm</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Company Name *</label>
            <input type="text" className="sleek-input" placeholder="e.g. Apex Mining Infra Pvt Ltd" style={{ width: '100%', marginTop: '4px' }} value={companyName} onChange={e => setCompanyName(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Government Registration / CIN</label>
            <input type="text" className="sleek-input" placeholder="e.g. U10100WB2020PTC123456" style={{ width: '100%', marginTop: '4px' }} value={regNum} onChange={e => setRegNum(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Primary Contact Person</label>
            <input type="text" className="sleek-input" placeholder="Name of Manager / Director" style={{ width: '100%', marginTop: '4px' }} value={person} onChange={e => setPerson(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Phone Number</label>
              <input type="text" className="sleek-input" placeholder="+91 98765 43210" style={{ width: '100%', marginTop: '4px' }} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Email Address</label>
              <input type="email" className="sleek-input" placeholder="contact@firm.com" style={{ width: '100%', marginTop: '4px' }} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#7c3aed', color: '#fff' }}>
              {submitting ? 'Registering...' : 'Register Firm'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Assign Contract ──────────────────────────────────────────────
function AssignContractModal({ mines, contractors, onClose, onSuccess }) {
  const [contractorId, setContractorId] = useState(contractors[0]?.id || '');
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contractorId || !mineId) return;
    setSubmitting(true);
    try {
      await api.createContract({
        contractor_id: contractorId,
        mine_id: mineId,
        work_description: desc,
        start_date: startDate,
        end_date: endDate || undefined,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to assign contract');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Assign Mine Site Contract</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Contractor Firm</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={contractorId} onChange={e => setContractorId(e.target.value)}>
              {contractors.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Facility</label>
            <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
              {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Scope of Work *</label>
            <textarea className="sleek-input" rows="3" placeholder="e.g. Overburden drilling, coal transportation to siding..." style={{ width: '100%', marginTop: '4px' }} value={desc} onChange={e => setDesc(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Commencement Date</label>
              <input type="date" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Completion Date</label>
              <input type="date" className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              {submitting ? 'Assigning...' : 'Provision Contract'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-Modal: Enroll Worker ────────────────────────────────────────────────
function EnrollWorkerModal({ mines, contractors, onClose, onSuccess }) {
  const [contractorId, setContractorId] = useState(contractors[0]?.id || '');
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [role, setRole] = useState('Dumper Operator');
  const [trainingStatus, setTrainingStatus] = useState('CERTIFIED');
  const [area, setArea] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !contractorId || !mineId) return;
    setSubmitting(true);
    try {
      await api.createContractorWorker({
        contractor_id: contractorId,
        mine_id: mineId,
        full_name: name,
        id_number: idNum,
        role,
        training_status: trainingStatus,
        assigned_area: area,
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to enroll worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Enroll Contractor Personnel</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Worker Full Name *</label>
            <input type="text" className="sleek-input" placeholder="e.g. Ramesh Kumar" style={{ width: '100%', marginTop: '4px' }} value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Aadhaar / Gate Pass ID</label>
              <input type="text" className="sleek-input" placeholder="e.g. PASS-89012" style={{ width: '100%', marginTop: '4px' }} value={idNum} onChange={e => setIdNum(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Trade / Role</label>
              <input type="text" className="sleek-input" placeholder="e.g. Drill Operator" style={{ width: '100%', marginTop: '4px' }} value={role} onChange={e => setRole(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Contractor Firm</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={contractorId} onChange={e => setContractorId(e.target.value)}>
                {contractors.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Mine Facility</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={mineId} onChange={e => setMineId(e.target.value)}>
                {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Assigned Section</label>
              <input type="text" className="sleek-input" placeholder="e.g. Haul Road 3" style={{ width: '100%', marginTop: '4px' }} value={area} onChange={e => setArea(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Safety Training Status</label>
              <select className="sleek-input" style={{ width: '100%', marginTop: '4px' }} value={trainingStatus} onChange={e => setTrainingStatus(e.target.value)}>
                <option value="CERTIFIED">Certified (VTC Pass)</option>
                <option value="PENDING">Pending Training</option>
                <option value="EXPIRED">Training Expired</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="sleek-btn" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="sleek-btn" style={{ backgroundColor: '#059669', color: '#fff' }}>
              {submitting ? 'Enrolling...' : 'Enroll Worker'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
