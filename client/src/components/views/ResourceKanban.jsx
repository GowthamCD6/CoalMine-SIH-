import React, { useState } from 'react';
import { 
  Tractor, 
  Truck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  UserCheck,
  Building2,
  HardHat
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function ResourceKanban({ onShowToast }) {
  const [machinery, setMachinery] = useState(api.getMachinery());

  const columns = [
    { id: 'Central Depot', title: 'Central Equipment Depot', color: 'var(--primary)', desc: 'Available for site deployment' },
    { id: 'Pit Alpha', title: 'Pit Alpha Quarry', color: 'var(--info)', desc: 'Surface seam extraction' },
    { id: 'Maintenance Bay', title: 'Mechanical Maintenance Shop', color: 'var(--warning)', desc: 'Undergoing servicing & overhaul' },
    { id: 'Active Shift', title: 'Active Underground Shift', color: 'var(--success)', desc: 'Underground hauling & cutting' },
  ];

  const handleMove = (item, targetLocation) => {
    const updated = api.moveMachineryLocation(item.id, targetLocation);
    setMachinery(updated);
    if (onShowToast) onShowToast(`${item.name} dispatched to ${targetLocation}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tractor size={28} color="var(--primary)" />
            Heavy Machinery & Resource Allocation Dispatch
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            Interactive dispatch roster for continuous miners, hydraulic shovels, haul trucks, and ventilation units
          </p>
        </div>

        <button
          onClick={() => {
            if (onShowToast) onShowToast('New Heavy Asset Commissioning modal opened.');
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
          <Plus size={16} />
          <span>Commission Machinery</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        alignItems: 'flex-start',
      }}>
        {columns.map((col) => {
          const colItems = machinery.filter((m) => m.location === col.id);

          return (
            <div
              key={col.id}
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '520px',
              }}
            >
              {/* Column Header */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color }} />
                    <h3 style={{ fontSize: '0.92rem', margin: 0 }}>{col.title}</h3>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-body)',
                  }}>
                    {colItems.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {col.desc}
                </div>
              </div>

              {/* Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                {colItems.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem 1rem',
                    color: 'var(--text-light)',
                    fontSize: '0.78rem',
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    No machinery currently deployed in this sector
                  </div>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={item.id}
                      className="card-white"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: 'var(--primary)',
                          backgroundColor: 'var(--primary-light)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}>
                          {item.id}
                        </span>
                        <span className={`badge-pill ${
                          item.status.includes('Service') || item.status.includes('Overhaul') ? 'badge-warning' : 'badge-success'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {item.status}
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {item.name}
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        <div><strong>Capacity:</strong> {item.capacity}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HardHat size={12} />
                          <span>Operator: <strong>{item.operator}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>Operating Hours: <strong>{item.hoursRun} hrs</strong></span>
                        </div>
                      </div>

                      {/* Move to another column selector */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dispatch To:</span>
                        <select
                          value={item.location}
                          onChange={(e) => handleMove(item, e.target.value)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: '#ffffff',
                            color: 'var(--primary)',
                            fontWeight: 600,
                          }}
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
