import React from 'react';
import {
  Pickaxe,
  Activity,
  Building2,
  Users,
  ShieldCheck,
  FolderTree,
  FileText,
  ChevronRight,
  Database,
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navSections = [
    {
      title: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'System Overview & Health', icon: Activity },
      ],
    },
    {
      title: 'Core Enterprise Entities',
      items: [
        { id: 'organizations', label: 'Organizations & Mines', icon: Building2 },
        { id: 'users', label: 'User Directory & Provisioning', icon: Users },
      ],
    },
    {
      title: 'Access Control & Navigation',
      items: [
        { id: 'rbac', label: 'Roles & Subroles (RBAC)', icon: ShieldCheck },
        { id: 'pages', label: 'Pages & Hierarchy Tree', icon: FolderTree },
      ],
    },
    {
      title: 'Compliance & Audit',
      items: [
        { id: 'audit-logs', label: 'Audit Logs & Payloads', icon: FileText },
      ],
    },
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-subtle, #e2e8f0)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Brand Header */}
      <div style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} color="#2563eb" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DB Connection Status Widget Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle, #e2e8f0)',
        backgroundColor: '#f8fafc',
      }}>
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
