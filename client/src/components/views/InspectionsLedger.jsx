import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  X, 
  Check,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function InspectionsLedger({ inspections, onUpdateInspections, onShowToast }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Inspection Form State
  const [formObservation, setFormObservation] = useState('');
  const [formInspector, setFormInspector] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSeverity, setFormSeverity] = useState('MEDIUM');
  const [formDeadline, setFormDeadline] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const filteredInspections = inspections.filter((item) => {
    const matchesSearch = 
      item.observation.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleCreateInspection = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formObservation.trim()) errors.observation = 'Observation description is required';
    if (!formInspector.trim()) errors.inspector = 'Inspector name is required';
    if (!formLocation.trim()) errors.location = 'Location or shaft ID is required';
    if (!formDeadline) errors.deadline = 'Statutory remediation deadline is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const created = api.createInspection({
      observation: formObservation,
      inspector: formInspector,
      location: formLocation,
      severity: formSeverity,
      deadline: formDeadline,
    });

    onUpdateInspections([created, ...inspections]);
    setIsModalOpen(false);
    setFormObservation('');
    setFormInspector('');
    setFormLocation('');
    setFormDeadline('');
    setFormErrors({});
    if (onShowToast) onShowToast(`Inspection #${created.id} logged successfully!`);
  };

  const handleToggleResolve = (id) => {
    const target = inspections.find((i) => i.id === id);
    const newStatus = target.status === 'Resolved' ? 'In Progress' : 'Resolved';
    const updated = api.updateInspectionStatus(id, newStatus);
    onUpdateInspections(updated);
    if (onShowToast) onShowToast(`Inspection #${id} marked as ${newStatus}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Inspections & Statutory Violations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            DGMS safety observations, statutory violation tracking, and remediation compliance ledgers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          <Plus size={16} />
          <span>Log New Inspection</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-white" style={{
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search violation ID, observation or seam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-white"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input-white"
            style={{ width: '160px', height: '38px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-white"
            style={{ width: '160px', height: '38px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing <strong>{filteredInspections.length}</strong> of {inspections.length} records
        </div>
      </div>

      {/* Inspections Table */}
      <div className="card-white" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table-white">
            <thead>
              <tr>
                <th>ID</th>
                <th>Observation & Type</th>
                <th>Inspector</th>
                <th>Location / Seam</th>
                <th>Remediation Deadline</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                    #{item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.observation}</div>
                    {item.category && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Category: {item.category}
                      </span>
                    )}
                  </td>
                  <td>{item.inspector}</td>
                  <td>{item.location}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <Clock size={13} color="var(--text-light)" />
                      {item.deadline}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-pill ${
                      item.severity === 'HIGH' ? 'badge-danger' : item.severity === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-pill ${
                      item.status === 'Resolved' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleResolve(item.id)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.status === 'Resolved' ? 'var(--bg-surface-subtle)' : 'var(--success-light)',
                        color: item.status === 'Resolved' ? 'var(--text-muted)' : 'var(--success-text)',
                        border: `1px solid ${item.status === 'Resolved' ? 'var(--border-subtle)' : 'var(--success-border)'}`,
                      }}
                    >
                      {item.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Inspection Modal */}
      {isModalOpen && (
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
            maxWidth: '520px',
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
                <ShieldAlert size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Log Statutory Inspection</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Observation & Violation Details
                </label>
                <textarea
                  rows={3}
                  value={formObservation}
                  onChange={(e) => setFormObservation(e.target.value)}
                  className={`input-white ${formErrors.observation ? 'input-error' : ''}`}
                  placeholder="e.g. Pillar 4B roof mesh shows micro-fractures exceeding statutory clearance"
                />
                {formErrors.observation && <span className="field-error-msg">{formErrors.observation}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    value={formInspector}
                    onChange={(e) => setFormInspector(e.target.value)}
                    className={`input-white ${formErrors.inspector ? 'input-error' : ''}`}
                    placeholder="e.g. S. Verma"
                  />
                  {formErrors.inspector && <span className="field-error-msg">{formErrors.inspector}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Location / Shaft Code
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className={`input-white ${formErrors.location ? 'input-error' : ''}`}
                    placeholder="e.g. Jharia Level 3"
                  />
                  {formErrors.location && <span className="field-error-msg">{formErrors.location}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Severity
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    className="input-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH (Critical)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Remediation Deadline
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className={`input-white ${formErrors.deadline ? 'input-error' : ''}`}
                  />
                  {formErrors.deadline && <span className="field-error-msg">{formErrors.deadline}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-body)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Log Violation Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
