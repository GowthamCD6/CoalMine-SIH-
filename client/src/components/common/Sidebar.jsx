import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  BrainCircuit,
  FileCheck,
  Camera,
  UserCheck,
  Cloud,
  HardHat,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Ambulance,
  Tractor,
  ShieldAlert,
  Smartphone,
  Building2,
  Users,
  Shield,
  FolderTree,
  UserCog,
  User,
  LogOut,
  ChevronDown,
  X,
  Pickaxe,
  Database,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  activeTab = 'dashboard',
  onSelectTab,
  userRole,
  userData,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const handleItemClick = (id) => {
    if (onSelectTab) {
      onSelectTab(id);
    }
    if (onClose) {
      onClose();
    }
  };

  // Nav structure organized by sections and collapsible dropdown groups
  const menuConfig = [
    {
      label: 'Platform Overview',
      section: true,
    },
    {
      id: 'dashboard',
      label: 'System Overview & Health',
      icon: LayoutDashboard,
    },
    {
      id: 'command-map',
      label: 'National GIS Command Map',
      icon: Map,
    },
    {
      id: 'analytics',
      label: 'AI Risk Analytics',
      icon: BrainCircuit,
    },
    {
      label: 'Smart Governance',
      section: true,
    },
    {
      label: 'AI Statutory & Compliance',
      icon: Shield,
      isDropdown: true,
      isOpen: governanceOpen,
      toggle: () => setGovernanceOpen(!governanceOpen),
      children: [
        { id: 'compliance', label: 'AI Statutory Hub', icon: FileCheck },
        { id: 'smoke-detection', label: 'AI Smoke CCTV', icon: Camera },
        { id: 'attendance', label: 'AI Facial Attendance', icon: UserCheck },
        { id: 'environment', label: 'Environmental Control', icon: Cloud },
        { id: 'labor', label: 'Labor & Safety Tracking', icon: HardHat },
        { id: 'audit-logs', label: 'Blockchain Audit Log', icon: FileText },
      ],
    },
    {
      label: 'Core Operations',
      section: true,
    },
    {
      label: 'Operations & Emergency',
      icon: ClipboardCheck,
      isDropdown: true,
      isOpen: operationsOpen,
      toggle: () => setOperationsOpen(!operationsOpen),
      children: [
        { id: 'inspections', label: 'Inspections & Violations', icon: ClipboardList },
        { id: 'emergency', label: 'Emergency & SOS Console', icon: Ambulance },
        { id: 'resources', label: 'Resource Allocation', icon: Tractor },
      ],
    },
    {
      label: 'Field Dispatch',
      section: true,
    },
    {
      id: 'alerts',
      label: 'Emergency Alerts Dispatch',
      icon: ShieldAlert,
      badge: 'LIVE',
    },
    {
      id: 'mobile-app',
      label: 'Mobile App Simulator',
      icon: Smartphone,
    },
    {
      label: 'Administration',
      section: true,
    },
    {
      label: 'System Administration',
      icon: UserCog,
      isDropdown: true,
      isOpen: adminOpen,
      toggle: () => setAdminOpen(!adminOpen),
      children: [
        { id: 'organizations', label: 'Organizations & Mines', icon: Building2 },
        { id: 'users', label: 'User Directory & Staff', icon: Users },
        { id: 'rbac', label: 'Roles & Subroles (RBAC)', icon: Shield },
        { id: 'pages', label: 'Pages & Hierarchy Tree', icon: FolderTree },
      ],
    },
  ];

  const displayName = userData?.first_name
    ? `${userData.first_name} ${userData.last_name || ''}`.trim()
    : userData?.username || 'Authorized Officer';

  const roleLabel = userData?.roleName || userData?.role_name || userRole || 'System Administrator';

  const userInitial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {onClose && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}

          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Pickaxe size={22} />
              </div>
              <div className="company-name">
                <div className="company-title">
                  CoalMin
                  <span className="title-badge">SIH26024</span>
                </div>
                <div className="company-subtitle">Smart Mining & Governance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="sidebar-nav">
          {menuConfig.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="nav-section">
                  <span className="section-label">{item.label}</span>
                </div>
              );
            }

            const Icon = item.icon;

            if (item.isDropdown) {
              const isAnyChildActive = item.children.some((child) => activeTab === child.id);

              return (
                <div key={index} className="nav-dropdown">
                  <button
                    type="button"
                    className={`nav-item dropdown-trigger ${isAnyChildActive ? 'active' : ''}`}
                    onClick={item.toggle}
                    title={item.label}
                  >
                    {isAnyChildActive && <div className="active-indicator" />}
                    <Icon className="nav-icon" size={18} />
                    <span className="nav-label">{item.label}</span>
                    <ChevronDown
                      className={`dropdown-arrow ${item.isOpen ? 'open' : ''}`}
                      size={15}
                    />
                  </button>

                  {item.isOpen && (
                    <div className="dropdown-content">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = activeTab === child.id;

                        return (
                          <button
                            type="button"
                            key={child.id}
                            className={`nav-item sub-item ${isActive ? 'active' : ''}`}
                            title={child.label}
                            onClick={() => handleItemClick(child.id)}
                          >
                            {isActive && <div className="active-indicator" />}
                            <ChildIcon className="nav-icon" size={16} />
                            <span className="nav-label">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeTab === item.id;

            return (
              <button
                type="button"
                key={item.id || index}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
                onClick={() => handleItemClick(item.id)}
              >
                {isActive && <div className="active-indicator" />}
                <Icon className="nav-icon" size={18} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badge.toLowerCase()}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Status Strip */}
        <div className="sidebar-db-strip">
          <div className="db-dot" />
          <div className="db-info">
            <div className="db-title">TiDB MySQL 8.0+</div>
            <div className="db-sub">SSL Pool Connected</div>
          </div>
          <Database size={15} color="#16a34a" />
        </div>

        {/* User Profile & Logout in Footer */}
        <div className="sidebar-footer">
          <div
            className="user-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="User settings"
          >
            <div className="user-avatar">{userInitial}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
            <ChevronDown
              size={16}
              className={`user-menu-icon ${userMenuOpen ? 'open' : ''}`}
            />
          </div>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-meta">
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  {displayName}
                </div>
                <div className="user-dropdown-email">
                  {userData?.email || `${userData?.username || 'user'}@coalmin.org`}
                </div>
              </div>
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                <LogOut size={16} />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
