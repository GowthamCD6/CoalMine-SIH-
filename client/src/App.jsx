import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import DiagnosticsDrawer from './components/common/DiagnosticsDrawer.jsx';
import Toast from './components/common/Toast.jsx';

import LoginPage from './pages/Auth/LoginPage.jsx';

// Dashboards
import DashboardOverview from './pages/Admin/DashboardOverview.jsx';
import MineDashboard from './pages/Dashboard/MineDashboard.jsx';
import CorporateDashboard from './pages/Dashboard/CorporateDashboard.jsx';
import RegulatoryDashboard from './pages/Dashboard/RegulatoryDashboard.jsx';
import ProductionDashboardView from './pages/Dashboard/ProductionDashboardView.jsx';

// Admin
import AdminManagement from './pages/Admin/AdminManagement.jsx';
import AuditLogsView from './pages/Admin/AuditLogsView.jsx';
import CommandMapView from './pages/Admin/CommandMapView.jsx';
import AnalyticsView from './pages/Admin/AnalyticsView.jsx';

// Safety Officer
import ComplianceView from './pages/SafetyOfficer/ComplianceView.jsx';
import SmokeDetectionView from './pages/SafetyOfficer/SmokeDetectionView.jsx';
import EnvironmentMonitoringView from './pages/SafetyOfficer/EnvironmentMonitoringView.jsx';
import InspectionsView from './pages/SafetyOfficer/InspectionsView.jsx';
import IncidentManagementView from './pages/SafetyOfficer/IncidentManagementView.jsx';
import EmergencyAlertsView from './pages/SafetyOfficer/EmergencyAlertsView.jsx';

// Labor Officer
import AttendanceSystemView from './pages/LaborOfficer/AttendanceSystemView.jsx';
import LaborDeploymentView from './pages/LaborOfficer/LaborDeploymentView.jsx';
import ContractorManagementView from './pages/LaborOfficer/ContractorManagementView.jsx';
import GrievanceBoardView from './pages/LaborOfficer/GrievanceBoardView.jsx';

// Store Officer
import ResourceAllocationView from './pages/StoreOfficer/ResourceAllocationView.jsx';

// Field Unit
import MobileSimulatorView from './pages/FieldUnit/MobileSimulatorView.jsx';

import { usePermissions } from './hooks/usePermissions.js';
import { api, subscribeToApiLogs, getAccessToken } from './services/api.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [serverStatus, setServerStatus] = useState({ online: false, database: 'checking' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Derive permission helpers from the logged-in user
  const { hasPermission, getDashboardType, isSuperAdmin, isRegulatory } = usePermissions(currentUser);

  const showToast = useCallback((message, isDanger = false) => {
    setToast({ message, isDanger });
  }, []);

  const navigateTo = useCallback((tab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  }, []);

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      const health = await api.getHealth();
      setServerStatus(health);
    } catch {
      setServerStatus({ online: false, database: 'offline' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkCurrentUser = async () => {
    setAuthChecking(true);
    if (getAccessToken()) {
      try {
        const userProfile = await api.getMe();
        setCurrentUser(userProfile);
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setAuthChecking(false);
  };

  useEffect(() => {
    checkStatus();
    checkCurrentUser();
    const interval = setInterval(checkStatus, 30000);

    const unsubscribe = subscribeToApiLogs((logs) => {
      setDiagnosticsLogs(logs);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // When user logs in, route to the right dashboard for their role
  useEffect(() => {
    if (currentUser) {
      const dashType = getDashboardType();
      if (dashType === 'admin') setActiveTab('dashboard');
      else if (dashType === 'corporate') setActiveTab('corporate-dashboard');
      else if (dashType === 'regulatory') setActiveTab('regulatory-dashboard');
      else setActiveTab('mine-dashboard');
    }
  }, [currentUser?.id]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // If verifying token on initial load
  if (authChecking) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>SmartMine Platform</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>Verifying secure session...</div>
        </div>
      </div>
    );
  }

  // If not logged in, render dedicated LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.first_name || user.username}!`);
        }}
      />
    );
  }

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    showToast('Logged out of session.');
  };

  return (
    <div className="app-layout">
      {/* Enhanced Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={navigateTo}
        userRole={currentUser?.role_name || currentUser?.role || 'admin'}
        userData={currentUser}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sleek Top Bar / Header */}
        <Header
          serverStatus={serverStatus}
          onRefreshStatus={checkStatus}
          isRefreshing={isRefreshing}
          onToggleDiagnostics={() => setActiveTab('audit-logs')}
          diagnosticsCount={diagnosticsLogs.length}
          currentUser={currentUser}
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Viewport Views */}
        <main className="view-viewport" style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── Dashboards (role-routed) ── */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              serverStatus={serverStatus}
              onNavigateTo={navigateTo}
            />
          )}

          {activeTab === 'mine-dashboard' && (
            <MineDashboard currentUser={currentUser} onNavigateTo={navigateTo} />
          )}

          {activeTab === 'corporate-dashboard' && (
            <CorporateDashboard currentUser={currentUser} onNavigateTo={navigateTo} />
          )}

          {activeTab === 'regulatory-dashboard' && (
            <RegulatoryDashboard currentUser={currentUser} onNavigateTo={navigateTo} />
          )}

          {activeTab === 'production' && (
            <ProductionDashboardView onShowToast={showToast} />
          )}

          {/* ── Administration (Unified module with horizontal selector) ── */}
          {(
            activeTab === 'admin' ||
            activeTab === 'administration' ||
            activeTab === 'organizations' ||
            activeTab === 'mines' ||
            activeTab === 'users' ||
            activeTab === 'rbac' ||
            activeTab === 'pages' ||
            activeTab === 'evaluator'
          ) && (
            <AdminManagement
              currentUser={currentUser}
              onShowToast={showToast}
              initialTab={
                activeTab === 'mines' ? 'mines' :
                activeTab === 'users' ? 'users' :
                activeTab === 'rbac' ? 'rbac' :
                activeTab === 'pages' ? 'pages' :
                activeTab === 'evaluator' ? 'evaluator' :
                'orgs'
              }
            />
          )}

          {activeTab === 'mobile-app' && (
            <MobileSimulatorView onShowToast={showToast} />
          )}

          {activeTab === 'alerts' && (
            <EmergencyAlertsView currentUser={currentUser} onShowToast={showToast} />
          )}

          {(activeTab === 'audit' || activeTab === 'audit-logs') && (
            <AuditLogsView onShowToast={showToast} />
          )}

          {activeTab === 'inspections' && (
            <InspectionsView onShowToast={showToast} />
          )}

          {activeTab === 'incidents' && (
            <IncidentManagementView onShowToast={showToast} />
          )}

          {activeTab === 'emergency' && (
            <EmergencyAlertsView currentUser={currentUser} onShowToast={showToast} />
          )}

          {activeTab === 'command-map' && (
            <CommandMapView onShowToast={showToast} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView onShowToast={showToast} />
          )}

          {activeTab === 'compliance' && (
            <ComplianceView onShowToast={showToast} />
          )}

          {activeTab === 'environment' && (
            <EnvironmentMonitoringView onShowToast={showToast} />
          )}

          {activeTab === 'labor' && (
            <LaborDeploymentView onShowToast={showToast} onNavigateTo={navigateTo} />
          )}

          {activeTab === 'contractors' && (
            <ContractorManagementView onShowToast={showToast} />
          )}

          {activeTab === 'grievances' && (
            <GrievanceBoardView onShowToast={showToast} />
          )}

          {activeTab === 'smoke-detection' && (
            <SmokeDetectionView onShowToast={showToast} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceSystemView onShowToast={showToast} />
          )}

          {activeTab === 'resources' && (
            <ResourceAllocationView onShowToast={showToast} />
          )}

          {/* Safe Fallback: if activeTab does not match any known view, show DashboardOverview */}
          {![
            'dashboard', 'mine-dashboard', 'corporate-dashboard', 'regulatory-dashboard',
            'production', 'organizations', 'mines', 'users', 'rbac', 'pages', 'mobile-app',
            'alerts', 'emergency', 'audit', 'audit-logs', 'inspections', 'incidents',
            'command-map', 'analytics', 'compliance', 'environment', 'labor',
            'contractors', 'grievances', 'smoke-detection', 'attendance', 'resources'
          ].includes(activeTab) && (
            <DashboardOverview
              serverStatus={serverStatus}
              onNavigateTo={navigateTo}
            />
          )}
        </main>
      </div>

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
