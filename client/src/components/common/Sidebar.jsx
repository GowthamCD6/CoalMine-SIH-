import React from 'react';
import {
  Pickaxe,
  Activity,
  ClipboardCheck,
  Truck,
  MapPin,
  Brain,
  Link,
  FileCheck,
  Tractor,
  UserCheck,
  Camera,
  Wifi,
  Radio,
  FileText,
  AlertOctagon,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, inspectionCount = 6, emergencyCount = 0 }) {
  const navSections = [
    {
      title: 'Operations & Safety',
      items: [
        { id: 'telemetry', label: 'Operational Overview', icon: Activity },
        { id: 'inspections', label: 'Inspections & Violations', icon: ClipboardCheck, badge: inspectionCount, badgeColor: 'warning' },
        { id: 'emergency', label: 'Emergency & SOS Console', icon: AlertOctagon, badge: emergencyCount > 0 ? emergencyCount : null, badgeColor: 'danger' },
      ],
    },
    {
      title: 'Enterprise Hubs (Web)',
      items: [
        { id: 'command-map', label: 'National GIS Command Map', icon: MapPin },
        { id: 'analytics', label: 'AI Risk Analytics', icon: Brain },
        { id: 'blockchain', label: 'Blockchain Audit Log', icon: Link },
        { id: 'compliance', label: 'Compliance & Statutory Hub', icon: FileCheck },
        { id: 'resources', label: 'Resource Allocation', icon: Tractor },
      ],
    },
    {
      title: 'Administration & RBAC',
      items: [
        { id: 'admin', label: 'System Admin & Scoped RBAC', icon: UserCheck },
      ],
    },
    {
      title: 'Mobile Field Simulators',
      items: [
        { id: 'mobile-hazard-cam', label: 'Hazard Camera Geotagger', icon: Camera, tag: 'Mobile' },
        { id: 'mobile-offline-sync', label: 'Offline-First Sync Center', icon: Wifi, tag: 'Mobile' },
        { id: 'mobile-sos-button', label: 'Emergency SOS Panic Trigger', icon: Radio, tag: 'Mobile' },
        { id: 'mobile-rfid-pass', label: 'Beacon Proximity RFID Pass', icon: Shield, tag: 'Mobile' },
        { id: 'mobile-ocr-scanner', label: 'OCR Document Scanner', icon: FileText, tag: 'Mobile' },
      ],
    },
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Brand Header */}
      <div style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
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
            color: 'var(--text-main)',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            lineHeight: 1.1,
          }}>
            <span>CoalMin</span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--primary-border)',
            }}>
              SIH26024
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Enterprise Mining Operations
          </span>
        </div>
      </div>

      {/* Navigation Links Scrollable List */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-light)',
              padding: '0 0.65rem',
              marginBottom: '6px',
            }}>
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-body)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.84rem',
                      textAlign: 'left',
                      border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-body)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComponent
                        size={17}
                        color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.badge != null && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: item.badgeColor === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)',
                          color: item.badgeColor === 'danger' ? 'var(--danger-text)' : 'var(--warning-text)',
                          border: `1px solid ${item.badgeColor === 'danger' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                        }}>
                          {item.badge}
                        </span>
                      )}
                      {item.tag && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                        }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#fafafa',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600 }}>TiDB Cloud Hybrid</span>
          <span style={{ color: 'var(--success)', fontWeight: 600 }}>Connected</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
          Ministry of Coal • Smart India Hackathon
        </div>
      </div>
    </aside>
  );
}
