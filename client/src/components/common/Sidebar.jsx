import React from 'react';
import {
  Pickaxe,
  Activity,
  Building2,
  Users,
  ShieldCheck,
  FolderTree,
  FileText,
  Database,
  Smartphone,
  ShieldAlert,
  ChevronRight,
  ClipboardCheck,
  Ambulance,
  Map,
  BrainCircuit,
  FileCheck,
  Tractor,
  Cloud,
  HardHat,
  Camera,
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navSections = [
    {
      title: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'System Overview & Health', icon: Activity },
        { id: 'command-map', label: 'National GIS Command Map', icon: Map },
        { id: 'analytics', label: 'AI Risk Analytics', icon: BrainCircuit },
      ],
    },
    {
      title: 'Smart Governance & Compliance',
      items: [
        { id: 'compliance', label: 'AI Statutory Hub', icon: FileCheck },
        { id: 'smoke-detection', label: 'AI Smoke CCTV', icon: Camera },
        { id: 'environment', label: 'Environmental Control', icon: Cloud },
        { id: 'labor', label: 'Labor & Safety Tracking', icon: HardHat },
        { id: 'audit-logs', label: 'Blockchain Audit Log', icon: FileText },
      ],
    },
    {
      title: 'Core Operations',
      items: [
        { id: 'inspections', label: 'Inspections & Violations', icon: ClipboardCheck },
        { id: 'emergency', label: 'Emergency & SOS Console', icon: Ambulance },
        { id: 'resources', label: 'Resource Allocation', icon: Tractor },
      ]
    },
    {
      title: 'Mobile & Field Unit',
      items: [
        { id: 'alerts', label: 'Emergency Alerts & Dispatch', icon: ShieldAlert },
        { id: 'mobile-app', label: 'Mobile App & Delegation', icon: Smartphone },
      ],
    },
    {
      title: 'System Administration',
      items: [
        { id: 'organizations', label: 'Organizations & Mines', icon: Building2 },
        { id: 'users', label: 'User Directory & Provisioning', icon: Users },
        { id: 'rbac', label: 'Roles & Subroles (RBAC)', icon: ShieldCheck },
        { id: 'pages', label: 'Pages & Hierarchy Tree', icon: FolderTree },
      ],
    }
  ];

  return (
    <aside className="sidebar-container" style={{
      width: '280px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Brand Header */}
      <div style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          color: '#60a5fa',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          <Pickaxe size={20} />
        </div>
        <div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            CoalMin
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 700,
            }}>
              SIH26024
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            TiDB Cloud Management API
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: '#94a3b8',
              padding: '0 0.75rem 0.5rem',
            }}>
              {sec.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-icon-wrapper">
                      <Icon size={18} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="nav-chevron" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DB Connection Status Widget Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="#059669" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0f172a' }}>TiDB MySQL 8.0+</div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>SSL Pool Connected</div>
          </div>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
        </div>
      </div>
    </aside>
  );
}
