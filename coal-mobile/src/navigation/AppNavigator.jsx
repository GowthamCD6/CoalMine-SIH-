import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

import { Icon } from '../components/Icon';
import { EmergencyEvacuationModal } from '../components/EmergencyEvacuationModal';
import { emergencyService } from '../services/emergencyService';
import { mobileApi } from '../services/api';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DelegationScreen } from '../screens/DelegationScreen';
import { InspectionsScreen } from '../screens/InspectionsScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { HazardCamScreen } from '../screens/HazardCamScreen';
import { OfflineSyncScreen } from '../screens/OfflineSyncScreen';
import { SosPanicScreen } from '../screens/SosPanicScreen';
import { RfidPassScreen } from '../screens/RfidPassScreen';
import { OcrScannerScreen } from '../screens/OcrScannerScreen';

// Statutory DGMS Worker Screens
import { MusterScreen } from '../screens/MusterScreen';
import { GasMonitorScreen } from '../screens/GasMonitorScreen';
import { MachineryExplosivesScreen } from '../screens/MachineryExplosivesScreen';
import { FormJScreen } from '../screens/FormJScreen';
import { WorkerWellbeingScreen } from '../screens/WorkerWellbeingScreen';

export const AppNavigator = ({
  currentUser,
  onLogout,
  onSwitchUser,
}) => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [evacuationActive, setEvacuationActive] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [liveLocation, setLiveLocation] = useState(emergencyService.getCurrentLocation());

  useEffect(() => {
    const unsubAlarm = emergencyService.subscribeAlarm((active, data) => {
      setEvacuationActive(active);
      setAlertData(data);
    });
    const unsubLoc = emergencyService.subscribeLocation((loc) => {
      setLiveLocation(loc);
    });

    // Start background polling for remote targeted sector broadcasts
    emergencyService.startServerAlertPolling(mobileApi, liveLocation.zone, currentUser);

    return () => {
      unsubAlarm();
      unsubLoc();
      emergencyService.stopServerAlertPolling();
    };
  }, []);

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
        return <SosPanicScreen currentUser={currentUser} onNavigate={navigateTo} />;
      case 'rfid-pass':
        return <RfidPassScreen currentUser={currentUser} />;
      case 'ocr-scanner':
        return <OcrScannerScreen currentUser={currentUser} />;

      // Statutory DGMS Modules
      case 'muster':
        return <MusterScreen currentUser={currentUser} />;
      case 'gas-monitor':
        return <GasMonitorScreen currentUser={currentUser} />;
      case 'machinery-explosives':
        return <MachineryExplosivesScreen currentUser={currentUser} />;
      case 'form-j':
        return <FormJScreen currentUser={currentUser} onNavigate={navigateTo} />;
      case 'wellbeing':
        return <WorkerWellbeingScreen currentUser={currentUser} />;

      default:
        return <DashboardScreen currentUser={currentUser} onNavigate={navigateTo} />;
    }
  };

  const isSuperAdmin = currentUser?.mobileRole === 'SUPERADMIN';

  return (
    <View style={styles.container}>
      {/* Top Header: Live Location on Left, SOS on Right (Zero tools) */}
      <View style={styles.topHeader}>
        {/* Top Left: Worker Live Location Telemetry */}
        <TouchableOpacity
          style={styles.liveLocationGroup}
          onPress={() => {
            Alert.alert(
              'Worker Live Location Telemetry',
              `Current GPS: ${liveLocation.latitude}° N, ${liveLocation.longitude}° E\nSubterranean Depth: ${liveLocation.depth}m\nZone: ${liveLocation.zone}\nDistance to Egress: ${liveLocation.distanceToExit} meters\nGeofence Status: Locked (Pit 3)\n\nTest AI warning siren and flashing flashlight?`,
              [
                { text: 'Close', style: 'cancel' },
                {
                  text: '🚨 Trigger AI Warning Test',
                  style: 'destructive',
                  onPress: () =>
                    emergencyService.triggerEvacuationAlarm({
                      source: 'AI Predictive Safety Sentinel (Methane Surge)',
                      reason: 'Methane level crossed 1.40% threshold. Immediate evacuation order active with flashing torch & warning siren.',
                      exitRoute: 'Shaft 4 Incline (Portal Gate)',
                    }),
                },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <View style={styles.pulseContainer}>
            <View style={styles.pulseRing} />
            <View style={styles.pulseDot} />
          </View>
          <View>
            <View style={styles.locationTitleRow}>
              <Icon name="map-pin" size={11} color="#0284c7" style={{ marginRight: 3 }} />
              <Text style={styles.locationTitle}>
                {liveLocation.zone} ({liveLocation.depth}m)
              </Text>
            </View>
            <Text style={styles.locationCoords}>
              {liveLocation.latitude}° N, {liveLocation.longitude}° E • Live Locked
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top Right: Emergency SOS Button ONLY (No tools button) */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.sosQuickBtn}
            onPress={() => navigateTo('sos-panic')}
            activeOpacity={0.8}
          >
            <Icon name="sos" size={14} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={styles.sosQuickText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Viewport */}
      <View style={styles.viewport}>{renderActiveScreen()}</View>

      {/* Primary Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'dashboard' && styles.tabActive]}
          onPress={() => navigateTo('dashboard')}
        >
          <Icon
            name="dashboard"
            size={18}
            color={activeScreen === 'dashboard' ? '#0284c7' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'dashboard' && styles.tabLabelActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Super Admin: Workers | Worker: My Pass */}
        {isSuperAdmin ? (
          <TouchableOpacity
            style={[styles.tabItem, activeScreen === 'delegation' && styles.tabActive]}
            onPress={() => navigateTo('delegation')}
          >
            <Icon
              name="users"
              size={18}
              color={activeScreen === 'delegation' ? '#0284c7' : '#64748b'}
            />
            <Text style={[styles.tabLabel, activeScreen === 'delegation' && styles.tabLabelActive]}>
              Workers
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.tabItem, activeScreen === 'rfid-pass' && styles.tabActive]}
            onPress={() => navigateTo('rfid-pass')}
          >
            <Icon
              name="id-card"
              size={18}
              color={activeScreen === 'rfid-pass' ? '#0284c7' : '#64748b'}
            />
            <Text style={[styles.tabLabel, activeScreen === 'rfid-pass' && styles.tabLabelActive]}>
              My Pass
            </Text>
          </TouchableOpacity>
        )}

        {/* Tab 3: Camera (Explicitly replaces inspections) */}
        <TouchableOpacity
          style={[styles.tabItem, activeScreen === 'hazard-cam' && styles.tabActive]}
          onPress={() => navigateTo('hazard-cam')}
        >
          <Icon
            name="camera"
            size={18}
            color={activeScreen === 'hazard-cam' ? '#0284c7' : '#64748b'}
          />
          <Text style={[styles.tabLabel, activeScreen === 'hazard-cam' && styles.tabLabelActive]}>
            Camera
          </Text>
        </TouchableOpacity>

        {/* Tab 4: More (Opens full categorized modules modal) */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setMenuOpen(true)}
        >
          <Icon name="more" size={18} color="#64748b" />
          <Text style={styles.tabLabel}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Comprehensive "More" Modal: All Pages Categorized */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalMenu}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Icon name="more" size={16} color="#0284c7" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>All Operational Modules</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
                <Icon name="close" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.menuGroupHeader}>CORE OPERATIONAL MODULES</Text>

              {/* 1. Digital Shift Muster & Cap-Lamp */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('muster')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#f0f9ff' }]}>
                  <Icon name="compass" size={17} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Digital Shift Muster (Form B)</Text>
                  <Text style={styles.menuItemDesc}>Geofence attendance, shaft token & cap-lamp log</Text>
                </View>
              </TouchableOpacity>

              {/* 2. Gas & Atmospheric Safety */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('gas-monitor')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#ecfdf5' }]}>
                  <Icon name="wind" size={17} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>AI Gas & Atmospheric Safety</Text>
                  <Text style={styles.menuItemDesc}>CH₄, CO, O₂ statutory thresholds & strata check</Text>
                </View>
              </TouchableOpacity>

              {/* 3. Emergency SOS & Evacuation Beacon */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('sos-panic')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#fef2f2' }]}>
                  <Icon name="sos" size={17} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Emergency SOS & Evacuation Beacon</Text>
                  <Text style={styles.menuItemDesc}>Audio warning siren, torch strobe & live tracking</Text>
                </View>
              </TouchableOpacity>

              {/* Super Admin Special Modules */}
              {isSuperAdmin && (
                <>
                  <Text style={styles.menuGroupHeader}>SUPER ADMIN CONSOLE</Text>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('delegation')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#e0f2fe' }]}>
                      <Icon name="users" size={17} color="#0369a1" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemTitle}>Worker Management & Delegation</Text>
                      <Text style={styles.menuItemDesc}>System-wide worker assignment & control</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {/* Sign Out Button */}
              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutBtnText}>
                  Sign Out ({isSuperAdmin ? 'Super Admin' : 'Field Worker'}: {currentUser?.username || 'Session'})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Global AI / Staff Emergency Evacuation Modal */}
      <EmergencyEvacuationModal
        visible={evacuationActive}
        alertData={alertData}
        currentUser={currentUser}
        onDismiss={() => setEvacuationActive(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  liveLocationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '700',
  },
  locationCoords: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sosQuickText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  viewport: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#0284c7',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#0284c7',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 14,
  },
  modalMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 6,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 13.5,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  menuGroupHeader: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemTitle: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  menuItemDesc: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  logoutBtn: {
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 11.5,
  },
});

export default AppNavigator;
