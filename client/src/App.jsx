import React, { useState, useEffect } from 'react';
import Header from './components/common/Header.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import DiagnosticsDrawer from './components/common/DiagnosticsDrawer.jsx';
import Toast from './components/common/Toast.jsx';

import LoginPage from './pages/Auth/LoginPage.jsx';
import DashboardOverview from './pages/Admin/DashboardOverview.jsx';
import AdminManagement from './pages/Admin/AdminManagement.jsx';
import PagesManagement from './pages/Admin/PagesManagement.jsx';
import AuditLogsView from './pages/Admin/AuditLogsView.jsx';
import CommandMapView from './pages/Admin/CommandMapView.jsx';
import AnalyticsView from './pages/Admin/AnalyticsView.jsx';

import ComplianceView from './pages/SafetyOfficer/ComplianceView.jsx';
import SmokeDetectionView from './pages/SafetyOfficer/SmokeDetectionView.jsx';
import EnvironmentMonitoringView from './pages/SafetyOfficer/EnvironmentMonitoringView.jsx';
import InspectionsView from './pages/SafetyOfficer/InspectionsView.jsx';
import EmergencyAlertsView from './pages/SafetyOfficer/EmergencyAlertsView.jsx';
import EmergencyConsoleView from './pages/SafetyOfficer/EmergencyConsoleView.jsx';

import AttendanceSystemView from './pages/LaborOfficer/AttendanceSystemView.jsx';
import LaborDeploymentView from './pages/LaborOfficer/LaborDeploymentView.jsx';

import ResourceAllocationView from './pages/StoreOfficer/ResourceAllocationView.jsx';

import MobileSimulatorView from './pages/FieldUnit/MobileSimulatorView.jsx';
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

  const showToast = (message, isDanger = false) => {
    setToast({ message, isDanger });
  };

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
          <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>CoalMin API Platform</div>
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
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setIsMobileSidebarOpen(false);
        }}
        userRole={currentUser?.role_name || currentUser?.role || 'admin'}
        userData={currentUser}
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
          {activeTab === 'dashboard' && (
            <DashboardOverview
              serverStatus={serverStatus}
              onNavigateTo={(tab) => setActiveTab(tab)}
            />
          )}

          {(activeTab === 'organizations' || activeTab === 'mines' || activeTab === 'users' || activeTab === 'rbac') && (
            <div style={{ padding: '2rem' }}>
              <AdminManagement
                currentUser={currentUser}
                onShowToast={showToast}
                initialTab={activeTab === 'organizations' ? 'orgs' : activeTab === 'mines' ? 'mines' : activeTab === 'users' ? 'users' : 'rbac'}
              />
            </div>
          )}

          {activeTab === 'pages' && (
            <PagesManagement onShowToast={showToast} />
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
            <div style={{ padding: '2rem' }}>
              <InspectionsView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'emergency' && (
            <div style={{ padding: '2rem' }}>
              <EmergencyConsoleView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'command-map' && (
            <div style={{ padding: '2rem' }}>
              <CommandMapView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ padding: '2rem' }}>
              <AnalyticsView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div style={{ padding: '2rem' }}>
              <ComplianceView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'environment' && (
            <div style={{ padding: '2rem' }}>
              <EnvironmentMonitoringView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'labor' && (
            <div style={{ padding: '2rem' }}>
              <LaborDeploymentView onShowToast={showToast} onNavigateTo={(tab) => setActiveTab(tab)} />
            </div>
          )}

          {activeTab === 'smoke-detection' && (
            <div style={{ padding: '2rem' }}>
              <SmokeDetectionView />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div style={{ padding: '2rem' }}>
              <AttendanceSystemView onShowToast={showToast} />
            </div>
          )}

          {activeTab === 'resources' && (
            <div style={{ padding: '2rem' }}>
              <ResourceAllocationView onShowToast={showToast} />
            </div>
          )}
        </main>
      </div>

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
