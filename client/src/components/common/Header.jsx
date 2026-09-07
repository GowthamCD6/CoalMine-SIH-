import React from 'react';
import {
  Menu,
  BookOpen,
  Terminal,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Activity,
  Map,
  BrainCircuit,
  FileCheck,
  Camera,
  UserCheck,
  Cloud,
  HardHat,
  FileText,
  ClipboardList,
  Ambulance,
  Tractor,
  ShieldAlert,
  Smartphone,
  Building2,
  Users,
  FolderTree,
} from 'lucide-react';
import './Header.css';

const TAB_METADATA = {
  dashboard: { category: 'Platform Overview', title: 'System Overview & Health', icon: Activity },
  'command-map': { category: 'Platform Overview', title: 'National GIS Command Map', icon: Map },
  analytics: { category: 'Platform Overview', title: 'AI Risk Analytics', icon: BrainCircuit },
  compliance: { category: 'Smart Governance', title: 'AI Statutory Hub', icon: FileCheck },
  'smoke-detection': { category: 'Smart Governance', title: 'AI Smoke CCTV', icon: Camera },
  attendance: { category: 'Smart Governance', title: 'AI Facial Attendance', icon: UserCheck },
  environment: { category: 'Smart Governance', title: 'Environmental Control', icon: Cloud },
  labor: { category: 'Smart Governance', title: 'Labor & Safety Tracking', icon: HardHat },
  'audit-logs': { category: 'Smart Governance', title: 'Blockchain Audit Log', icon: FileText },
  inspections: { category: 'Core Operations', title: 'Inspections & Violations', icon: ClipboardList },
  emergency: { category: 'Core Operations', title: 'Emergency & SOS Console', icon: Ambulance },
  resources: { category: 'Core Operations', title: 'Resource Allocation', icon: Tractor },
  alerts: { category: 'Field Dispatch', title: 'Emergency Alerts & Dispatch', icon: ShieldAlert },
  'mobile-app': { category: 'Field Dispatch', title: 'Mobile App & Delegation', icon: Smartphone },
  organizations: { category: 'Administration', title: 'Organizations & Mines', icon: Building2 },
  users: { category: 'Administration', title: 'User Directory & Provisioning', icon: Users },
  rbac: { category: 'Administration', title: 'Roles & Subroles (RBAC)', icon: ShieldCheck },
  pages: { category: 'Administration', title: 'Pages & Hierarchy Tree', icon: FolderTree },
};

export default function Header({
  serverStatus = { online: false },
  onRefreshStatus,
  isRefreshing = false,
  onToggleDiagnostics,
  diagnosticsCount = 0,
  currentUser,
  activeTab = 'dashboard',
  onOpenMobileSidebar,
  onLogout,
}) {
  const currentMeta = TAB_METADATA[activeTab] || {
    category: 'CoalMin Console',
    title: 'Management View',
    icon: Activity,
  };

  const TabIcon = currentMeta.icon;

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
    : currentUser?.username || 'Officer';

  const userInitial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <header className="topbar-header">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="topbar-left">
        {onOpenMobileSidebar && (
          <button
            type="button"
            className="topbar-mobile-btn"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="topbar-title-group">
          <div className="topbar-breadcrumb">
            <span>CoalMin Platform</span>
            <span className="topbar-breadcrumb-dot" />
            <span>{currentMeta.category}</span>
          </div>
          <div className="topbar-heading">
            <TabIcon size={18} color="#2563eb" />
            <span>{currentMeta.title}</span>
          </div>
        </div>
      </div>

      {/* Right: Status Pill & Quick Actions */}
      <div className="topbar-right">
        {/* Backend Status Pill */}
        <div
          className={`topbar-status-pill ${serverStatus.online ? 'online' : 'offline'}`}
          title={serverStatus.online ? 'TiDB Cloud Cluster Online' : 'Backend Server Offline'}
        >
          <span className="topbar-status-dot" />
          <span className="topbar-status-text">
            {serverStatus.online ? 'TiDB Cloud Online' : 'Backend Offline'}
          </span>
          {onRefreshStatus && (
            <button
              type="button"
              onClick={onRefreshStatus}
              title="Refresh server status"
              className="topbar-reload-btn"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Swagger API Docs */}
        <a
          href="http://localhost:5001/api/docs"
          target="_blank"
          rel="noreferrer"
          className="topbar-btn"
          title="Open Swagger REST API Documentation"
        >
          <BookOpen size={14} color="#2563eb" />
          <span>Swagger Docs</span>
        </a>

        {/* API Diagnostics Inspector */}
        <button
          type="button"
          onClick={onToggleDiagnostics}
          title="Open API & Diagnostics Inspector"
          className="topbar-btn"
        >
          <Terminal size={14} color="#2563eb" />
          <span>API Inspector</span>
          {diagnosticsCount > 0 && (
            <span className="btn-badge">{diagnosticsCount}</span>
          )}
        </button>

        {/* Compact User Chip */}
        {currentUser && (
          <div className="topbar-user-chip">
            <div className="topbar-user-avatar">{userInitial}</div>
            <span className="topbar-user-name">{displayName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
