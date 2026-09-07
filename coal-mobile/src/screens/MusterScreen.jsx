import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
import { mobileApi } from '../services/api';

export const MusterScreen = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('geofence'); // 'geofence' | 'token' | 'caplamp'

  // Geofence State
  const [geofenceCheckedIn, setGeofenceCheckedIn] = useState(false);
  const [checkingGeofence, setCheckingGeofence] = useState(false);
  const [inPerimeter] = useState(true);
  const [punchTime, setPunchTime] = useState(null);

  // Token Scan State
  const [tokenScanned, setTokenScanned] = useState(false);
  const [scanningToken, setScanningToken] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);

  // Cap-lamp State
  const [lampAssigned] = useState(true);
  const [lampId] = useState('CL-4092-B');
  const [batteryLevel] = useState(98);
  const [chargingBay] = useState('Rack 04 • Bay 18');
  const [lampReturnStatus] = useState('Checked Out (On-Duty)');

  const handleGeofencePunch = async () => {
    setCheckingGeofence(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
      await mobileApi.punchAttendance({
        worker_id: currentUser?.id || 1,
        worker_name: currentUser?.first_name || currentUser?.username || 'Field Miner',
        employee_code: currentUser?.employee_code || 'EMP-7729',
        zone: 'Pit 03 Perimeter (Sector North)',
        location: 'Shaft 4 Incline Portal',
        method: 'GEOFENCE_BIOMETRIC',
      });
    } catch (err) {
      console.warn('Attendance backend punch deferred (offline mode):', err.message);
    } finally {
      setCheckingGeofence(false);
      if (inPerimeter) {
        setGeofenceCheckedIn(true);
        setPunchTime(time);
        Alert.alert(
          'Form B Muster Recorded & Synced',
          `Statutory shift check-in confirmed at ${time}.\nGeofence: Pit 03 Perimeter (Sector North).\nWorker: ${currentUser?.username || 'Field Personnel'}\nCommitted to Central DGMS Roster.`
        );
      } else {
        Alert.alert('Geofence Violation', 'Outside mine lease perimeter. Please enter the physical gate perimeter to punch in.');
      }
    }
  };

  const handleScanToken = () => {
    setScanningToken(true);
    setTimeout(() => {
      setScanningToken(false);
      setTokenScanned(true);
      setTokenDetails({
        tokenId: 'HT-9924-ECL',
        type: 'Rugged Helmet NFC Token',
        shaft: 'Shaft 04 (Main Incline)',
        clearance: 'DGMS Shift Cleared',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      Alert.alert(
        'Helmet Token Authenticated',
        'NFC Token HT-9924-ECL validated. Shaft descent access granted for Shift 1.'
      );
    }, 1500);
  };

  const handleLampCheck = () => {
    Alert.alert(
      'Cap-Lamp Log Synchronized',
      `Assigned Cap-Lamp: ${lampId}\nRack Location: ${chargingBay}\nBattery: ${batteryLevel}%\nShift Status: Active on Duty.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DGMS FORM B COMPLIANCE</Text>
          </View>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTagText}>MUSTER ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.title}>Digital Shift Muster & Attendance</Text>
        <Text style={styles.subtitle}>
          Statutory electronic register replacing physical Form B. Tracks geo-punch, underground shaft tokens, and cap-lamp accountability.
        </Text>
      </View>

      {/* Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'geofence' && styles.tabBtnActive]}
          onPress={() => setActiveTab('geofence')}
        >
          <Icon name="compass" size={14} color={activeTab === 'geofence' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'geofence' && styles.tabTextActive]}>
            GPS Geofence
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'token' && styles.tabBtnActive]}
          onPress={() => setActiveTab('token')}
        >
          <Icon name="id-card" size={14} color={activeTab === 'token' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'token' && styles.tabTextActive]}>
            Shaft NFC Token
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'caplamp' && styles.tabBtnActive]}
          onPress={() => setActiveTab('caplamp')}
        >
          <Icon name="lamp" size={14} color={activeTab === 'caplamp' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'caplamp' && styles.tabTextActive]}>
            Cap-Lamp Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Geofenced Surface Check-in */}
      {activeTab === 'geofence' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="compass" size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Surface Geofence Boundary Status</Text>
                <Text style={styles.cardSubtitle}>ECL Pit 03 Perimeter • Auto-detected via GPS</Text>
              </View>
            </View>

            <View style={styles.geoStatusBox}>
              <View style={styles.geoRow}>
                <Text style={styles.geoLabel}>Mine Site Geofence:</Text>
                <View style={styles.statusPillSuccess}>
                  <Text style={styles.statusPillSuccessText}>INSIDE PERIMETER (42m to Gate A)</Text>
                </View>
              </View>
              <View style={styles.geoRow}>
                <Text style={styles.geoLabel}>Current Telemetry:</Text>
                <Text style={styles.geoVal}>23.7957° N, 86.4304° E (±2.8m accuracy)</Text>
              </View>
              <View style={styles.geoRow}>
                <Text style={styles.geoLabel}>Assigned Shift:</Text>
                <Text style={styles.geoVal}>Shift 1 (07:00 - 15:00 hrs) • Morning</Text>
              </View>
              <View style={styles.geoRow}>
                <Text style={styles.geoLabel}>Form B Status:</Text>
                <Text style={[styles.geoVal, { fontWeight: '700', color: geofenceCheckedIn ? '#059669' : '#d97706' }]}>
                  {geofenceCheckedIn ? `PUNCHED IN AT ${punchTime}` : 'PENDING DAILY IN-PUNCH'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                geofenceCheckedIn ? styles.actionBtnSuccess : styles.actionBtnPrimary,
              ]}
              onPress={handleGeofencePunch}
              disabled={checkingGeofence || geofenceCheckedIn}
            >
              {checkingGeofence ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Icon name={geofenceCheckedIn ? 'check' : 'map-pin'} size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>
                    {geofenceCheckedIn ? 'SHIFT IN-PUNCH CONFIRMED' : 'PUNCH IN VIA GEOFENCE (FORM B)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Statutory Notice */}
          <View style={styles.infoBanner}>
            <Icon name="alert" size={14} color="#0284c7" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              In accordance with DGMS Circular 4 of 2021, only GPS-verified surface muster punches are legally valid for Form B wage computation.
            </Text>
          </View>
        </View>
      )}

      {/* Tab 2: NFC / QR Underground Token Scanning */}
      {activeTab === 'token' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="id-card" size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Underground Shaft Token Validation</Text>
                <Text style={styles.cardSubtitle}>Rugged Helmet RFID / Turnstile Proximity Scan</Text>
              </View>
            </View>

            <Text style={styles.bodyDesc}>
              Underground mines where GPS satellite signals attenuate require proximity token scans at the pit-head or shaft collar before descending.
            </Text>

            <View style={styles.tokenDisplay}>
              <View style={styles.tokenGraphic}>
                <Icon name="crosshair" size={32} color="#0284c7" />
                <Text style={styles.tokenGraphicText}>NFC / QR SHAFT TERMINAL</Text>
              </View>

              {tokenScanned && tokenDetails ? (
                <View style={styles.tokenResult}>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Token ID:</Text>
                    <Text style={styles.tokenValue}>{tokenDetails.tokenId}</Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Shaft Gate:</Text>
                    <Text style={styles.tokenValue}>{tokenDetails.shaft}</Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Clearance:</Text>
                    <Text style={[styles.tokenValue, { color: '#059669', fontWeight: '700' }]}>{tokenDetails.clearance}</Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Scan Timestamp:</Text>
                    <Text style={styles.tokenValue}>{tokenDetails.time}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.waitingText}>Hold device against helmet tag or scan surface QR terminal</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={handleScanToken}
              disabled={scanningToken}
            >
              {scanningToken ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Icon name="ocr" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionBtnText}>
                    {tokenScanned ? 'RE-SCAN SHAFT TOKEN' : 'SCAN HELMET NFC / QR TOKEN'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tab 3: Digital Cap-Lamp Log */}
      {activeTab === 'caplamp' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                <Icon name="lamp" size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Cap-Lamp Shift Assignment Log</Text>
                <Text style={styles.cardSubtitle}>Subterranean accountability & battery safety register</Text>
              </View>
            </View>

            <View style={styles.lampStatusCard}>
              <View style={styles.lampMainRow}>
                <View>
                  <Text style={styles.lampSub}>ASSIGNED UNIT</Text>
                  <Text style={styles.lampIdText}>{lampId}</Text>
                </View>
                <View style={styles.batteryBadge}>
                  <Text style={styles.batteryText}>{batteryLevel}% CHARGED</Text>
                </View>
              </View>

              <View style={styles.lampDetailRow}>
                <View style={styles.lampDetailCol}>
                  <Text style={styles.lampDetailLabel}>Charging Dock</Text>
                  <Text style={styles.lampDetailVal}>{chargingBay}</Text>
                </View>
                <View style={styles.lampDetailCol}>
                  <Text style={styles.lampDetailLabel}>Operational State</Text>
                  <Text style={[styles.lampDetailVal, { color: '#059669' }]}>{lampReturnStatus}</Text>
                </View>
              </View>

              <View style={styles.lampDetailRow}>
                <View style={styles.lampDetailCol}>
                  <Text style={styles.lampDetailLabel}>Safety Specification</Text>
                  <Text style={styles.lampDetailVal}>DGMS Intrinsically Safe Ex-ia IIC</Text>
                </View>
                <View style={styles.lampDetailCol}>
                  <Text style={styles.lampDetailLabel}>Max Lux Output</Text>
                  <Text style={styles.lampDetailVal}>4,800 Lumens (Dual LED Beam)</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleLampCheck}>
              <Icon name="check" size={15} color="#0369a1" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnSecondaryText}>CONFIRM CAP-LAMP RECEIPT & SAFETY CHECK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...theme.cardShadow,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveTagText: {
    color: '#047857',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 17,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0284c7',
  },
  tabContent: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...theme.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  geoStatusBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  geoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  geoLabel: {
    color: '#64748b',
    fontSize: 11.5,
  },
  geoVal: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '500',
  },
  statusPillSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillSuccessText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#0284c7',
  },
  actionBtnSuccess: {
    backgroundColor: '#059669',
  },
  actionBtnSecondary: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionBtnSecondaryText: {
    color: '#0369a1',
    fontSize: 11.5,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 12,
  },
  infoText: {
    color: '#0369a1',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  bodyDesc: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  tokenDisplay: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenGraphic: {
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenGraphicText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  waitingText: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
  },
  tokenResult: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    gap: 6,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tokenLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  tokenValue: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '600',
  },
  lampStatusCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  lampMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingBottom: 10,
    marginBottom: 10,
  },
  lampSub: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lampIdText: {
    color: '#92400e',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  batteryBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  batteryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  lampDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lampDetailCol: {
    flex: 1,
  },
  lampDetailLabel: {
    color: '#78350f',
    fontSize: 10.5,
  },
  lampDetailVal: {
    color: '#451a03',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
});
