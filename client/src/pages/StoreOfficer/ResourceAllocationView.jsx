import React, { useState, useMemo } from 'react';
import {
  Tractor,
  Users,
  Settings,
  Filter,
  MoveRight,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BatteryCharging,
  Gauge,
  Search,
  ArrowRight,
  Activity,
  X,
  Fuel,
  MapPin,
  User,
} from 'lucide-react';

const INITIAL_MACHINERY = [
  {
    id: 'HEMM-EX-01',
    name: 'Hitachi EX-1200 Hydraulic Shovel',
    category: 'Excavator',
    operator: 'Ramesh Das (EMP-401)',
    location: 'Pit 2 • Bench 4',
    status: 'Active',
    fuelPct: 78,
    hoursOperated: 1420,
    health: 'Good',
  },
  {
    id: 'HEMM-DP-04',
    name: 'Caterpillar 777D (100T Dumper)',
    category: 'Dumper',
    operator: 'Sunil Soren (EMP-388)',
    location: 'Pit 2 • Haul Road B',
    status: 'Active',
    fuelPct: 84,
    hoursOperated: 2150,
    health: 'Good',
  },
  {
    id: 'HEMM-CM-02',
    name: 'Joy 12ED Continuous Miner',
    category: 'Continuous Miner',
    operator: 'Arun Kumar Team',
    location: 'Underground Level 3 • Seam 4',
    status: 'Active',
    fuelPct: 92,
    hoursOperated: 980,
    health: 'Good',
  },
  {
    id: 'HEMM-DZ-01',
    name: 'Komatsu D375A Crawler Dozer',
    category: 'Dozer',
    operator: 'Unassigned',
    location: 'Stockyard B',
    status: 'Idle',
    fuelPct: 65,
    hoursOperated: 3400,
    health: 'Standby',
  },
  {
    id: 'HEMM-DR-02',
    name: 'Sandvik D245S Rotary Blast Drill',
    category: 'Drill',
    operator: 'Unassigned',
    location: 'Blast Area Sector 4',
    status: 'Idle',
    fuelPct: 88,
    hoursOperated: 1120,
    health: 'Standby',
  },
  {
    id: 'HEMM-EX-09',
    name: 'Komatsu PC-2000 Super Shovel',
    category: 'Excavator',
    operator: 'Workshop Crew',
    location: 'Central Workshop • Bay 2',
    status: 'Maintenance',
    fuelPct: 40,
    hoursOperated: 4800,
    health: 'Hydraulic Cylinder Seal Replacement',
  },
  {
    id: 'HEMM-RB-03',
    name: 'Fletcher Quad Roof Bolter',
    category: 'Roof Bolter',
    operator: 'Strata Support Unit',
    location: 'Workshop • Bay 4',
    status: 'Maintenance',
    fuelPct: 52,
    hoursOperated: 1890,
    health: 'Statutory 500-hr Overhaul',
  },
];

export default function ResourceAllocationView({ onShowToast }) {
  const [resources, setResources] = useState(INITIAL_MACHINERY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [modalType, setModalType] = useState(null); // 'ALLOCATE' | 'MAINTENANCE' | 'NEW'
  const [activeItem, setActiveItem] = useState(null);

  // Form states
  const [targetPit, setTargetPit] = useState('Pit 2 • Bench 4');
  const [targetOperator, setTargetOperator] = useState('Team Alpha (Shift A)');
  const [maintReason, setMaintReason] = useState('Routine 250-hour Hydraulic Inspection');

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.location.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (selectedCategory === 'ALL') return true;
      return res.category === selectedCategory;
    });
  }, [resources, searchQuery, selectedCategory]);

  const activeCount = resources.filter((r) => r.status === 'Active').length;
  const idleCount = resources.filter((r) => r.status === 'Idle').length;
  const maintCount = resources.filter((r) => r.status === 'Maintenance').length;
  const fleetAvailability = Math.round((activeCount / resources.length) * 100);

  // Status transitions
  const handleQuickMove = (id, newStatus) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              operator: newStatus === 'Idle' ? 'Unassigned' : r.operator,
              location:
                newStatus === 'Maintenance'
                  ? 'Central Workshop'
                  : newStatus === 'Idle'
                  ? 'Stockyard Ready Bay'
                  : r.location,
            }
          : r
      )
    );
    if (onShowToast) onShowToast(`${id} moved to ${newStatus}`);
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    setResources((prev) =>
      prev.map((r) =>
        r.id === activeItem.id
          ? {
              ...r,
              status: 'Active',
              location: targetPit,
              operator: targetOperator,
            }
          : r
      )
    );
    if (onShowToast) onShowToast(`${activeItem.id} deployed to ${targetPit}`);
    setModalType(null);
    setActiveItem(null);
  };

  const handleMaintSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    setResources((prev) =>
      prev.map((r) =>
        r.id === activeItem.id
          ? {
              ...r,
              status: 'Maintenance',
              location: 'Central Workshop • Bay 1',
              health: maintReason,
            }
          : r
      )
    );
    if (onShowToast) onShowToast(`${activeItem.id} scheduled for maintenance: ${maintReason}`);
    setModalType(null);
    setActiveItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tractor size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              HEMM Resource & Heavy Machinery Allocation
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Real-time Heavy Earth Moving Machinery dispatch, workshop maintenance & fuel telematics
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="sleek-btn"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => {
              if (onShowToast) onShowToast('Fleet Telematics Synced');
            }}
          >
            <Activity size={16} /> Live GPS Telematics
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
            Fleet Availability Rate
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
            {fleetAvailability}%
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Exceeds DGMS 75% Availability Norm
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
            Active Deployed Units
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
            {activeCount} Units
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Operating across 3 benches & underground seams
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
            Standby / Ready Reserve
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
            {idleCount} Units
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Inspected and ready for shift deployment
          </div>
        </div>

        <div className="sleek-card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
            In Central Workshop
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>
            {maintCount} Units
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
            Scheduled mechanical & strata servicing
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Category:</span>
          {['ALL', 'Excavator', 'Dumper', 'Continuous Miner', 'Dozer', 'Drill', 'Roof Bolter'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Search machine ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Column 1: Active Deployed */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '4px solid #16a34a',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} /> Active Deployed
            </h3>
            <span className="badge-pill badge-success">
              {filteredResources.filter((r) => r.status === 'Active').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredResources
              .filter((r) => r.status === 'Active')
              .map((res) => (
                <div key={res.id} className="sleek-card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {res.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{res.name}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                      {res.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', margin: '8px 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="var(--primary)" /> <strong>Location:</strong> {res.location}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <User size={13} color="#64748b" /> <strong>Operator:</strong> {res.operator}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Fuel size={12} color="#0284c7" /> Fuel: <strong>{res.fuelPct}%</strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#64748b" /> <strong>{res.hoursOperated} hrs</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => handleQuickMove(res.id, 'Idle')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Move to Standby
                    </button>
                    <button
                      onClick={() => {
                        setActiveItem(res);
                        setModalType('MAINTENANCE');
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Workshop Service
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: Standby / Idle */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '4px solid #d97706',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} /> Idle / Ready Standby
            </h3>
            <span className="badge-pill badge-warning">
              {filteredResources.filter((r) => r.status === 'Idle').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredResources
              .filter((r) => r.status === 'Idle')
              .map((res) => (
                <div key={res.id} className="sleek-card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {res.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{res.name}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                      {res.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', margin: '8px 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="var(--primary)" /> <strong>Location:</strong> {res.location}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <User size={13} color="#64748b" /> <strong>Operator:</strong> Unassigned
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Fuel size={12} color="#0284c7" /> Fuel: <strong>{res.fuelPct}%</strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#64748b" /> <strong>{res.hoursOperated} hrs</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => {
                        setActiveItem(res);
                        setModalType('ALLOCATE');
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Deploy to Pit <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: Central Workshop / Maintenance */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '4px solid #dc2626',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={18} /> Central Workshop Servicing
            </h3>
            <span className="badge-pill badge-danger">
              {filteredResources.filter((r) => r.status === 'Maintenance').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredResources
              .filter((r) => r.status === 'Maintenance')
              .map((res) => (
                <div key={res.id} className="sleek-card" style={{ padding: '14px', borderLeft: '3.5px solid #dc2626' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {res.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{res.name}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                      IN REPAIR
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', margin: '8px 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="var(--primary)" /> <strong>Bay:</strong> {res.location}
                    </div>
                    <div style={{ color: '#b91c1c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle size={13} color="#b91c1c" /> <strong>Job:</strong> {res.health}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => handleQuickMove(res.id, 'Idle')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} /> Complete Overhaul & Return to Standby
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {modalType === 'ALLOCATE' && activeItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Deploy {activeItem.id}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveItem(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Equipment Model
                </label>
                <input
                  type="text"
                  value={`${activeItem.id} — ${activeItem.name}`}
                  disabled
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Target Operational Pit / Seam
                </label>
                <select
                  value={targetPit}
                  onChange={(e) => setTargetPit(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <option value="Pit 2 • Bench 4">Pit 2 • Bench 4 (Extraction Face)</option>
                  <option value="Pit 1 • North Incline">Pit 1 • North Incline</option>
                  <option value="Underground Level 3 • Seam 4">Underground Level 3 • Seam 4</option>
                  <option value="Stockyard Coal Handling Plant">Stockyard Coal Handling Plant</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Assigned Heavy Equipment Operator / Team
                </label>
                <input
                  type="text"
                  value={targetOperator}
                  onChange={(e) => setTargetOperator(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setActiveItem(null);
                  }}
                  className="sleek-btn"
                  style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sleek-btn"
                  style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 700 }}
                >
                  Confirm Deployment Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {modalType === 'MAINTENANCE' && activeItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>
                Schedule Maintenance: {activeItem.id}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveItem(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Service / Defect Description
                </label>
                <textarea
                  rows={3}
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setActiveItem(null);
                  }}
                  className="sleek-btn"
                  style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sleek-btn"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
                >
                  Route to Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
