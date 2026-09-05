import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';

import { Icon } from '../components/Icon';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DelegationScreen } from '../screens/DelegationScreen';
import { InspectionsScreen } from '../screens/InspectionsScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { HazardCamScreen } from '../screens/HazardCamScreen';
import { OfflineSyncScreen } from '../screens/OfflineSyncScreen';
import { SosPanicScreen } from '../screens/SosPanicScreen';
import { RfidPassScreen } from '../screens/RfidPassScreen';
import { OcrScannerScreen } from '../screens/OcrScannerScreen';

export const AppNavigator = ({
  currentUser,
  onLogout,
  onSwitchUser,
}) => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateTo = (screen) => {
    setActiveScreen(screen);
    setMenuOpen(false);
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen currentUser={currentUser} onNavigate={navigateTo} />;
      case 'delegation':
        return <DelegationScreen currentUser={currentUser} onSwitchUser={onSwitchUser} />;
      case 'inspections':
        return <InspectionsScreen currentUser={currentUser} />;
      case 'emergency':
        return <EmergencyScreen currentUser={currentUser} />;
      case 'hazard-cam':
        return <HazardCamScreen currentUser={currentUser} />;
      case 'offline-sync':
        return <OfflineSyncScreen currentUser={currentUser} />;
      case 'sos-panic':
        return <SosPanicScreen currentUser={currentUser} />;
      case 'rfid-pass':
        return <RfidPassScreen currentUser={currentUser} />;
      case 'ocr-scanner':
        return <OcrScannerScreen currentUser={currentUser} />;
      default:
        return <DashboardScreen currentUser={currentUser} onNavigate={navigateTo} />;
    }
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'delegation': return 'Access Delegation';
      case 'hazard-cam': return 'Hazard Camera';
      case 'sos-panic': return 'Emergency SOS';
      case 'offline-sync': return 'Offline Sync';
      case 'rfid-pass': return 'RFID Beacon';
      case 'ocr-scanner': return 'OCR Scanner';
      case 'inspections': return 'Inspections';
      case 'emergency': return 'Crisis Console';
      default: return 'Field Dashboard';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Industrial Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.brandGroup} onPress={() => navigateTo('dashboard')}>
          <View style={styles.brandBadge}>
            <Icon name="mining" size={18} color="#38bdf8" />
          </View>
          <View>
            <Text style={styles.brandTitle}>NEXUSMINE</Text>
            <Text style={styles.brandSub}>{getScreenTitle()}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.sosQuickBtn}
            onPress={() => navigateTo('sos-panic')}
          >
            <Icon name="sos" size={14} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.sosQuickText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuTrigger}
            onPress={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.menuTriggerText}>Tools</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Viewport */}
      <View style={styles.viewport}>{renderActiveScreen()}</View>

      {/* Primary Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'dashboard' && styles.tabActive]}
          onPress={() => navigateTo('dashboard')}
        >
          <Icon
            name="dashboard"
            size={18}
            color={activeScreen === 'dashboard' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'dashboard' && styles.tabLabelActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'delegation' && styles.tabActive]}
          onPress={() => navigateTo('delegation')}
        >
          <Icon
            name="users"
            size={18}
            color={activeScreen === 'delegation' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'delegation' && styles.tabLabelActive]}>
            Delegation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'inspections' && styles.tabActive]}
          onPress={() => navigateTo('inspections')}
        >
          <Icon
            name="clipboard"
            size={18}
            color={activeScreen === 'inspections' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'inspections' && styles.tabLabelActive]}>
            Inspections
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'hazard-cam' && styles.tabActive]}
          onPress={() => navigateTo('hazard-cam')}
        >
          <Icon
            name="camera"
            size={18}
            color={activeScreen === 'hazard-cam' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'hazard-cam' && styles.tabLabelActive]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setMenuOpen(true)}
        >
          <Icon name="more" size={18} color="#64748b" />
          <Text style={styles.tabLabel}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Wireframe Tools Menu Modal */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalMenu}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Icon name="menu" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
                <Text style={styles.modalTitle}>OPERATIONAL MODULE CATALOG</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
                <Icon name="close" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.menuGroupHeader}>CORE WORKFLOW</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('delegation')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="delegation" size={18} color="#38bdf8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Access Delegation & Subordinate Management</Text>
                <Text style={styles.menuItemDesc}>Evaluate hierarchy and assign/revoke subroles</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.menuGroupHeader}>CORE STATIONS</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('dashboard')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="dashboard" size={18} color="#60a5fa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Field Operations Dashboard</Text>
                <Text style={styles.menuItemDesc}>Production targets, shift telemetry & stats</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('inspections')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="clipboard" size={18} color="#34d399" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Inspections & Statutory Violations</Text>
                <Text style={styles.menuItemDesc}>Shift safety ledger and compliance log</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('emergency')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="alert" size={18} color="#f87171" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Emergency Crisis Console</Text>
                <Text style={styles.menuItemDesc}>Evacuation alarms, muster calls & broadcast</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.menuGroupHeader}>FIELD UTILITIES</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('hazard-cam')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="camera" size={18} color="#fbbf24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Hazard Reporting Camera</Text>
                <Text style={styles.menuItemDesc}>Geotagged viewfinder with depth HUD</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('sos-panic')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="sos" size={18} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Emergency SOS Beacon</Text>
                <Text style={styles.menuItemDesc}>Subterranean distress mesh trigger</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('offline-sync')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="wifi" size={18} color="#a78bfa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Offline-First Buffer & Sync</Text>
                <Text style={styles.menuItemDesc}>Mesh store-and-forward queue monitor</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('rfid-pass')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="id-card" size={18} color="#38bdf8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>Proximity Beacon Access Badge</Text>
                <Text style={styles.menuItemDesc}>Digital worker credential & turnstile NFC</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('ocr-scanner')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="ocr" size={18} color="#2dd4bf" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemTitle}>OCR Document Digitizer</Text>
                <Text style={styles.menuItemDesc}>Optical scanner for physical shift ledgers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>DISCONNECT SESSION ({currentUser.username.toUpperCase()})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSub: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  sosQuickText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  menuTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 5,
  },
  menuTriggerText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  viewport: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#38bdf8',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#38bdf8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalMenu: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
    marginBottom: 8,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: 4,
  },
  menuGroupHeader: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemTitle: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  menuItemDesc: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 1,
  },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
});

export default AppNavigator;
