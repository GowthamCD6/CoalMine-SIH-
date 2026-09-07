import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, BrainCircuit, FileCheck, Camera,
  UserCheck, Cloud, HardHat, FileText, ClipboardCheck,
  ClipboardList, Ambulance, Tractor, ShieldAlert, Smartphone,
  Building2, Users, Shield, FolderTree, UserCog, LogOut,
  ChevronDown, X, Pickaxe, BarChart3, Landmark,
  AlertTriangle, Activity, Briefcase, Factory, Home, Flame, MessageSquare,
} from 'lucide-react';
import { api } from '../../services/api.js';
import './Sidebar.css';

// Icon registry — maps icon names stored in DB to Lucide components
const ICON_MAP = {
  LayoutDashboard, Map, BrainCircuit, FileCheck, Camera,
  UserCheck, Cloud, HardHat, FileText, ClipboardCheck,
  ClipboardList, Ambulance, Tractor, ShieldAlert, Smartphone,
  Building2, Users, Shield, FolderTree, UserCog, BarChart3,
  Landmark, AlertTriangle, Activity, Briefcase, Factory, Home, Flame, MessageSquare,
};

// Fallback static nav for Super Admin (always visible)
const ADMIN_STATIC_NAV = [
  {
    label: 'Administration', section: true,
    children: [
      { id: 'organizations', label: 'Organizations & Mines', icon: Building2 },
      { id: 'users', label: 'User Directory', icon: Users },
      { id: 'rbac', label: 'Roles & Subroles (RBAC)', icon: Shield },
      { id: 'pages', label: 'Pages & Hierarchy', icon: FolderTree },
    ],
  },
  { id: 'dashboard', label: 'System Overview & Health', icon: LayoutDashboard },
  { id: 'command-map', label: 'GIS Command Map', icon: Map },
  { id: 'analytics', label: 'AI Risk Analytics', icon: BrainCircuit },
  {
    label: 'Smart Governance', section: true,
    children: [
      { id: 'compliance', label: 'Compliance Hub', icon: Shield },
      { id: 'inspections', label: 'Inspections & Violations', icon: ClipboardList },
      { id: 'incidents', label: 'Incident Management', icon: Flame },
      { id: 'smoke-detection', label: 'AI Smoke CCTV', icon: Camera },
      { id: 'environment', label: 'Environmental Control', icon: Cloud },
      { id: 'audit-logs', label: 'Audit Log', icon: FileText },
    ],
  },
  {
    label: 'Operations', section: true,
    children: [
      { id: 'production', label: 'Production & Dispatch', icon: Pickaxe },
      { id: 'attendance', label: 'AI Facial Attendance', icon: UserCheck },
      { id: 'labor', label: 'Labor & Safety', icon: HardHat },
      { id: 'contractors', label: 'Contractor Workforce', icon: Briefcase },
      { id: 'grievances', label: 'Worker Grievances', icon: MessageSquare },
      { id: 'emergency', label: 'Emergency Console', icon: Ambulance },
      { id: 'resources', label: 'Resource Allocation', icon: Tractor },
    ],
  },
  { id: 'alerts', label: 'Emergency Alerts', icon: ShieldAlert, badge: 'LIVE' },
  { id: 'mobile-app', label: 'Mobile App Simulator', icon: Smartphone },
];

// Maps page.route / page.code values to tab IDs used in App.jsx
const ROUTE_TO_TAB = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/mine-dashboard': 'mine-dashboard',
  '/corporate-dashboard': 'corporate-dashboard',
  '/regulatory-dashboard': 'regulatory-dashboard',
  '/organizations': 'organizations',
  '/admin/organizations': 'organizations',
  '/mines': 'mines',
  '/admin/mines': 'mines',
  '/users': 'users',
  '/admin/users': 'users',
  '/rbac': 'rbac',
  '/admin/rbac': 'rbac',
  '/pages': 'pages',
  '/admin/pages': 'pages',
  '/analytics': 'analytics',
  '/admin/analytics': 'analytics',
  '/audit-logs': 'audit-logs',
  '/audit': 'audit-logs',
  '/materials': 'resources',
  '/compliance': 'compliance',
  '/inspections': 'inspections',
  '/incidents': 'incidents',
  '/environment': 'environment',
  '/alerts': 'alerts',
  '/emergency': 'alerts',
  '/attendance': 'attendance',
  '/labor': 'labor',
  '/contractors': 'contractors',
  '/grievances': 'grievances',
  '/production': 'production',
  '/resources': 'resources',
  '/smoke-detection': 'smoke-detection',
  '/command-map': 'command-map',
  '/mobile-app': 'mobile-app',
  // Page code mappings
  'page-dashboard': 'dashboard',
  'page-orgs': 'organizations',
  'page-mines': 'mines',
  'page-users': 'users',
  'page-rbac': 'rbac',
  'page-pages': 'pages',
  'page-audit': 'audit-logs',
  'page-materials': 'resources',
};

function buildNavFromTree(tree) {
  const mapNode = (node) => {
    const rawCode = (node.code || '').toLowerCase().replace(/_/g, '-');
    const tabId =
      ROUTE_TO_TAB[node.route] ||
      ROUTE_TO_TAB[rawCode] ||
      ROUTE_TO_TAB[`/${rawCode}`] ||
      (rawCode.startsWith('page-') ? rawCode.replace('page-', '') : null) ||
      node.route?.replace('/', '') ||
      'dashboard';

    const IconComp = ICON_MAP[node.icon] || LayoutDashboard;

    if (node.type === 'GROUP' || (node.children && node.children.length > 0)) {
      return {
        label: node.name,
        section: true,
        children: (node.children || []).map(mapNode).filter(Boolean),
      };
    }
    return { id: tabId, label: node.name, icon: IconComp };
  };

  const items = tree.map(mapNode).filter(Boolean);
  // Ensure Administration section appears at the top
  items.sort((a, b) => {
    const aIsAdmin = a.label?.toLowerCase().includes('admin');
    const bIsAdmin = b.label?.toLowerCase().includes('admin');
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return 0;
  });
  return items;
}

export default function Sidebar({
  activeTab = 'dashboard',
  onSelectTab,
  userRole,
  userData,
  currentUser,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ Administration: true });
  const [dynamicNav, setDynamicNav] = useState(null);
  const [navLoading, setNavLoading] = useState(true);

  // Determine if user is super admin
  const permissions = currentUser?.permissions || [];
  const isSuperAdmin =
    currentUser?.username === 'superadmin' ||
    currentUser?.email === 'admin@coalmin.org' ||
    permissions.some(
      (p) => (typeof p === 'string' ? p === '*' || p === 'ALL_PERMISSIONS' : p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS' || p.code === '*')
    ) ||
    currentUser?.subroles?.some(s => s.role_code === 'SUPERADMIN' || s.role_code === 'SUPER_ADMIN' || s.subrole_code === 'CHIEF_ADMIN');

  useEffect(() => {
    loadNav();
  }, [currentUser?.id]);

  const loadNav = async () => {
    setNavLoading(true);
    try {
      const tree = await api.getPageTree();
      if (Array.isArray(tree) && tree.length > 0) {
        const built = buildNavFromTree(tree);
        setDynamicNav(built);
        // Auto-open first section group
        const firstSection = built.find((n) => n.section && n.children?.length > 0);
        if (firstSection) {
          setOpenSections((prev) => ({ ...prev, [firstSection.label]: true }));
        }
      } else {
        setDynamicNav(null);
      }
    } catch {
      setDynamicNav(null);
    } finally {
      setNavLoading(false);
    }
  };

  // Super admins always get the comprehensive platform navigation; scoped users get permission-driven tree
  const menuConfig = isSuperAdmin
    ? ADMIN_STATIC_NAV
    : dynamicNav && dynamicNav.length > 0
    ? dynamicNav
    : ADMIN_STATIC_NAV;

  const handleItemClick = (id) => {
    if (onSelectTab) onSelectTab(id);
    if (onClose) onClose();
  };

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const displayName = userData?.first_name
    ? `${userData.first_name} ${userData.last_name || ''}`.trim()
    : userData?.username || 'Authorized Officer';

  const roleLabel = userData?.roleName || userData?.role_name || userRole || 'System Administrator';
  const userInitial = displayName.charAt(0).toUpperCase() || 'U';

  const renderItems = (items) => {
    return items.map((item, index) => {
      // Section with children (collapsible group)
      if (item.section && item.children) {
        const isOpen = openSections[item.label] !== false; // default open
        const isAnyChildActive = item.children.some((c) => c.id === activeTab);
        return (
          <div key={`section-${index}`} className="nav-dropdown">
            <button
              type="button"
              className={`nav-item dropdown-trigger ${isAnyChildActive ? 'active' : ''}`}
              onClick={() => toggleSection(item.label)}
            >
              {isAnyChildActive && <div className="active-indicator" />}
              {item.icon && <item.icon className="nav-icon" size={18} />}
              <span className="nav-label">{item.label}</span>
              <ChevronDown
                className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                size={15}
              />
            </button>
            {isOpen && (
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
                      {ChildIcon && <ChildIcon className="nav-icon" size={16} />}
                      <span className="nav-label">{child.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      // Plain section divider (no children)
      if (item.section) {
        return (
          <div key={`divider-${index}`} className="nav-section">
            <span className="section-label">{item.label}</span>
          </div>
        );
      }

      // Regular nav item
      const Icon = item.icon;
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
          {Icon && <Icon className="nav-icon" size={18} />}
          <span className="nav-label">{item.label}</span>
          {item.badge && (
            <span className={`nav-badge ${item.badge.toLowerCase()}`}>
              {item.badge}
            </span>
          )}
        </button>
      );
    });
  };

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
                <div className="company-title">SmartMine</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navLoading ? (
            <div style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              Loading navigation…
            </div>
          ) : (
            renderItems(menuConfig)
          )}
        </nav>

        {/* User Profile & Logout in Footer */}
        <div className="sidebar-footer">
          <div
            className="user-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="User settings"
          >
            <div className="user-avatar-wrapper">
              <div className="user-avatar">{userInitial}</div>
              <span className="user-status-dot" title="Active session" />
            </div>
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
                  {userData?.email || `${userData?.username || 'user'}@smartmine.gov`}
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
