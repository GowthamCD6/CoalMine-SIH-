import React, { useState, useEffect } from 'react';
import Header from './components/common/Header.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import DiagnosticsDrawer from './components/common/DiagnosticsDrawer.jsx';
import AuthModal from './components/common/AuthModal.jsx';
import Toast from './components/common/Toast.jsx';

import TelemetryOverview from './components/views/TelemetryOverview.jsx';
import InspectionsLedger from './components/views/InspectionsLedger.jsx';
import EmergencyConsole from './components/views/EmergencyConsole.jsx';
import CommandMap from './components/views/CommandMap.jsx';
import AiAnalytics from './components/views/AiAnalytics.jsx';
import BlockchainAudit from './components/views/BlockchainAudit.jsx';
import ComplianceHub from './components/views/ComplianceHub.jsx';
import ResourceKanban from './components/views/ResourceKanban.jsx';
import AdminManagement from './components/views/AdminManagement.jsx';
import MobileSimulators from './components/views/MobileSimulators.jsx';

import { api, subscribeToApiLogs } from './services/api.js';
import { initialUsers } from './data/mockData.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [currentUser, setCurrentUser] = useState(initialUsers[0]); // Default Superadmin
  const [serverStatus, setServerStatus] = useState({ online: false, database: 'checking' });
  const [serverStats, setServerStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [inspections, setInspections] = useState(api.getInspections());

  const showToast = (message, isDanger = false) => {
    setToast({ message, isDanger });
  };

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      const health = await api.getHealth();
      setServerStatus(health);
      const stats = await api.getStats();
      setServerStats(stats);
    } catch {
      setServerStatus({ online: false, database: 'offline' });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 20000);

    const unsubscribe = subscribeToApiLogs((logs) => {
      setDiagnosticsLogs(logs);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleTriggerEmergency = () => {
    setActiveTab('emergency');
    showToast('🚨 GLOBAL EMERGENCY PROTOCOL INITIATED! Evacuation siren broadcast triggered.', true);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        inspectionCount={inspections.filter((i) => i.status !== 'Resolved').length}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Global Header */}
        <Header
          serverStatus={serverStatus}
          onRefreshStatus={checkStatus}
          isRefreshing={isRefreshing}
          onTriggerEmergency={handleTriggerEmergency}
          onToggleDiagnostics={() => setDiagnosticsOpen(!diagnosticsOpen)}
          diagnosticsCount={diagnosticsLogs.length}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={() => {
            api.logout();
            setCurrentUser(initialUsers[0]);
            showToast('Logged out of session.');
          }}
        />

        {/* Viewport View */}
        <main className="view-viewport">
          {activeTab === 'telemetry' && (
            <TelemetryOverview
              serverStatus={serverStatus}
              stats={serverStats}
              onNavigateTo={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionsLedger
              inspections={inspections}
              onUpdateInspections={(updated) => setInspections(updated)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyConsole onShowToast={showToast} />
          )}

          {activeTab === 'command-map' && (
            <CommandMap onShowToast={showToast} />
          )}

          {activeTab === 'analytics' && (
            <AiAnalytics onShowToast={showToast} />
          )}

          {activeTab === 'blockchain' && (
            <BlockchainAudit onShowToast={showToast} />
          )}

          {activeTab === 'compliance' && (
            <ComplianceHub onShowToast={showToast} />
          )}

          {activeTab === 'resources' && (
            <ResourceKanban onShowToast={showToast} />
          )}

          {activeTab === 'admin' && (
            <AdminManagement
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {/* Mobile Simulators */}
          {activeTab === 'mobile-hazard-cam' && (
            <MobileSimulators activeSubScreen="camera" onShowToast={showToast} />
          )}

          {activeTab === 'mobile-offline-sync' && (
            <MobileSimulators activeSubScreen="sync" onShowToast={showToast} />
          )}

          {activeTab === 'mobile-sos-button' && (
            <MobileSimulators activeSubScreen="sos" onShowToast={showToast} />
          )}

          {activeTab === 'mobile-rfid-pass' && (
            <MobileSimulators activeSubScreen="rfid" onShowToast={showToast} />
          )}

          {activeTab === 'mobile-ocr-scanner' && (
            <MobileSimulators activeSubScreen="ocr" onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Slide-Up Diagnostics Console Drawer */}
      <DiagnosticsDrawer
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        currentUser={currentUser}
      />

      {/* User Login & Role Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Logged in as ${user.first_name} (${user.role}) - ${user.scope_type} Scope`);
        }}
        currentUserId={currentUser?.id}
      />

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
