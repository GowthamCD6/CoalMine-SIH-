import React from 'react';
import {
  Menu,
  BookOpen,
  Terminal,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Shield,
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
  Pickaxe,
  Briefcase,
  MessageSquare,
  Flame,
} from 'lucide-react';
import './Header.css';

const TAB_METADATA = {
  // Dashboards
  dashboard: { category: 'Platform Overview', title: 'System Overview & Health', icon: Activity },
  'mine-dashboard': { category: 'Mine Operations', title: 'Mine Site Executive Dashboard', icon: Activity },
  'corporate-dashboard': { category: 'Corporate Governance', title: 'Corporate Consolidated Dashboard', icon: Activity },
  'regulatory-dashboard': { category: 'Regulatory Oversight', title: 'DGMS Regulatory Dashboard', icon: ShieldCheck },
  'command-map': { category: 'Platform Overview', title: 'National GIS Command Map', icon: Map },
  analytics: { category: 'Platform Overview', title: 'AI Risk Analytics', icon: BrainCircuit },

  // Smart Governance
  compliance: { category: 'Smart Governance', title: 'AI Statutory & Compliance Hub', icon: Shield },
  inspections: { category: 'Smart Governance', title: 'Inspections & Violations', icon: ClipboardList },
  incidents: { category: 'Smart Governance', title: 'Incident Management', icon: Flame },
  'smoke-detection': { category: 'Smart Governance', title: 'AI Smoke CCTV Surveillance', icon: Camera },
  environment: { category: 'Smart Governance', title: 'Environmental Control & Sensors', icon: Cloud },
  'audit-logs': { category: 'Smart Governance', title: 'Blockchain Audit Log', icon: FileText },
  audit: { category: 'Smart Governance', title: 'Blockchain Audit Log', icon: FileText },

  // Operations
  production: { category: 'Operations', title: 'Production & Mining Operations', icon: Pickaxe },
  attendance: { category: 'Operations', title: 'AI Facial Attendance & Muster', icon: UserCheck },
  labor: { category: 'Operations', title: 'Labor & Shift Operations', icon: HardHat },
  contractors: { category: 'Operations', title: 'Contractor Workforce Governance', icon: Briefcase },
  grievances: { category: 'Operations', title: 'Worker Grievance Redressal Board', icon: MessageSquare },
  emergency: { category: 'Operations', title: 'Emergency Console & Rescue', icon: Ambulance },
  resources: { category: 'Operations', title: 'HEMM Resource & Machinery Allocation', icon: Tractor },
  alerts: { category: 'Operations', title: 'Emergency Alerts & Dispatch', icon: ShieldAlert },
  'mobile-app': { category: 'Operations', title: 'Mobile App Simulator', icon: Smartphone },

  // Administration
  organizations: { category: 'Administration', title: 'Organizations & Mines', icon: Building2 },
  mines: { category: 'Administration', title: 'Mine Sites Management', icon: Building2 },
  users: { category: 'Administration', title: 'User Directory & Provisioning', icon: Users },
  rbac: { category: 'Administration', title: 'Roles & Subroles (RBAC)', icon: ShieldCheck },
  pages: { category: 'Administration', title: 'Pages & Hierarchy Tree', icon: FolderTree },
  evaluator: { category: 'Administration', title: 'RBAC Policy Evaluator', icon: ShieldCheck },
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
    category: 'Operations',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: currentMeta.category === 'Operations' ? '#2563eb' : currentMeta.category === 'Smart Governance' ? '#059669' : '#64748b',
              backgroundColor: currentMeta.category === 'Operations' ? '#eff6ff' : currentMeta.category === 'Smart Governance' ? '#ecfdf5' : '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {currentMeta.category}
            </span>
            <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>/</span>
            <div className="topbar-heading">
              <TabIcon size={18} color="#2563eb" />
              <span>{currentMeta.title}</span>
            </div>
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
          <BookOpen size={14} className="topbar-icon" />
          <span>Swagger Docs</span>
        </a>

        {/* API Diagnostics Inspector */}
        <button
          type="button"
          onClick={onToggleDiagnostics}
          title="Open API & Diagnostics Inspector"
          className="topbar-btn"
        >
          <Terminal size={14} className="topbar-icon" />
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
