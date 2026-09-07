import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';
import { theme } from '../theme';
import { emergencyService } from '../services/emergencyService';

const MINE_SECTORS = [
  {
    id: 'ALL',
    name: 'Entire Mine (All Zones)',
    signal_node: 'ALL_NODES',
    workers_online: 48,
    signal_desc: 'Full Subterranean & Surface Mesh Broadcast',
  },
  {
    id: 'SHAFT_4_L3',
    name: 'Shaft 4 - Level 3 (-120m)',
    signal_node: 'MESH-S4-L3',
    workers_online: 16,
    signal_desc: 'Incline Mesh Signal (-62 dBm)',
  },
  {
    id: 'ZONE_B_L4',
    name: 'Zone B - Level 4 Deep (-150m)',
    signal_node: 'MESH-ZB-L4',
    workers_online: 12,
    signal_desc: 'Face Repeater Signal (-71 dBm)',
  },
  {
    id: 'SECTOR_C_FACE',
    name: 'Sector C - Longwall Face (-180m)',
    signal_node: 'MESH-SC-L5',
    workers_online: 9,
    signal_desc: 'Longwall Seam Signal (-78 dBm)',
  },
  {
    id: 'PIT_2_SURFACE',
    name: 'Surface Pit 2 / Haulage (0m)',
    signal_node: 'GPS-SURFACE-P2',
    workers_online: 7,
    signal_desc: 'Surface GPS / 4G Locked',
  },
  {
    id: 'VENT_AIRWAY_1',
    name: 'Vent Shaft 1 Return Airway (-90m)',
    signal_node: 'MESH-VENT-01',
    workers_online: 4,
    signal_desc: 'Airway Sensor Signal (-66 dBm)',
  },
];

export const SosPanicScreen = ({ currentUser, onNavigate }) => {
  const [active, setActive] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [workerZone] = useState('Shaft 4 • Level 3');
  const [workerDepth] = useState(-180);

  // Higher role dispatch state
  const isHigherRole =
    currentUser?.mobileRole === 'SUPERADMIN' ||
    ['ADMIN', 'MANAGER', 'SUPERVISOR', 'SAFETY_OFFICER'].some((r) =>
      (currentUser?.role || currentUser?.mobileRole || '').toUpperCase().includes(r)
    );

  const [mode, setMode] = useState(isHigherRole ? 'DISPATCH' : 'WORKER_SOS');
  const [targetSector, setTargetSector] = useState('SHAFT_4_L3');
  const [alertType, setAlertType] = useState('EVACUATION');
  const [severity, setSeverity] = useState('CRITICAL');
  const [directiveTitle, setDirectiveTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [exitRoute, setExitRoute] = useState('Shaft 4 Incline (Portal Gate)');
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const selectedSectorObj = MINE_SECTORS.find((s) => s.id === targetSector) || MINE_SECTORS[0];

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await mobileApi.getEmergencyAlerts();
      const broadcasts = res?.broadcasts || res?.data?.broadcasts || [];
      setRecentBroadcasts(broadcasts.slice(0, 5));
    } catch {
      // offline fallback
    }
  };

  // Base Worker: Manual SOS Distress
  const handleWorkerSos = async (reasonTag = 'Emergency Distress Triggered') => {
    setTriggering(true);
    try {
      await mobileApi.triggerSos(workerZone, workerDepth, reasonTag);
      setActive(true);
      fetchAlerts();
      Alert.alert(
        '🚨 Distress Broadcast Transmitted!',
        `Your emergency signal has been broadcast to all nearby workers in ${workerZone} and Surface Control!\n\nColleagues in your sector have been alerted with instructions: "HELP HIM AT ${workerZone.toUpperCase()}!"\n\nRemain calm, keep your cap-lamp lit, and stay in a secure area.`
      );
    } catch {
      setActive(true);
      Alert.alert(
        'Distress Broadcast Active (Local Mesh)',
        `Your emergency signal is transmitting to nearby personnel in ${workerZone}.`
      );
    } finally {
      setTriggering(false);
    }
  };

  const handleStandDownSos = async () => {
    try {
      await mobileApi.resolveSos();
    } catch {
      // offline fallback
    }
    setActive(false);
    fetchAlerts();
    Alert.alert('Distress Stood Down', 'Emergency distress beacon deactivated across subterranean mesh repeaters.');
  };

  // Higher Role: Targeted Sector Dispatch
  const handleDispatchTargetedAlert = async () => {
    setTriggering(true);
    try {
      const payload = {
        title: directiveTitle || (alertType === 'EVACUATION' ? '🚨 IMMEDIATE SECTOR EVACUATION ORDER' : '⚠️ SAFETY DIRECTIVE'),
        message: customMessage || `Critical order for ${selectedSectorObj.name}. Follow statutory escape protocols immediately.`,
        type: alertType,
        severity,
        target_zone: targetSector,
        signal_node: selectedSectorObj.signal_node,
        exit_route: exitRoute,
        sender_name: `${currentUser?.username || 'Staff'} (Command)`,
        sender_role: currentUser?.mobileRole || 'SUPERADMIN',
      };

      await mobileApi.createEmergencyAlert(payload);
      Alert.alert(
        'Alert Broadcast Dispatched',
        `Targeted alert sent to ${selectedSectorObj.name}!\n\nSignal Node: ${selectedSectorObj.signal_node}\nTargeted Workers: ${selectedSectorObj.workers_online}\n\nDevices in that sector will sound sirens and flash strobes specially.`
      );
      setDirectiveTitle('');
      setCustomMessage('');
      fetchAlerts();
    } catch {
      Alert.alert('Dispatch Queued Offline', 'Alert queued for transmission as soon as mesh connection returns.');
    } finally {
      setTriggering(false);
    }
  };

  const handleResolveRemoteAlert = async (id) => {
    setResolvingId(id);
    try {
      await mobileApi.resolveEmergencyAlert(id);
      Alert.alert('Alert Resolved', 'Broadcast stood down across all subterranean nodes.');
      fetchAlerts();
    } catch {
      Alert.alert('Notice', 'Unable to resolve alert right now.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        {onNavigate && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => onNavigate('dashboard')}
            activeOpacity={0.7}
          >
            <Icon name="back" size={13} color="#0284c7" style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        )}
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: active ? '#ef4444' : '#10b981' }]} />
            <Text style={styles.statusBadgeText}>{active ? 'DISTRESS BROADCAST ACTIVE' : 'SYSTEM ONLINE'}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: isHigherRole ? '#fef2f2' : '#f0f9ff' }]}>
            <Icon name="shield" size={11} color={isHigherRole ? '#dc2626' : '#0284c7'} style={{ marginRight: 4 }} />
            <Text style={[styles.roleBadgeText, { color: isHigherRole ? '#991b1b' : '#0369a1' }]}>
              {isHigherRole ? 'COMMAND DISPATCH' : 'WORKER STATION'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Safety & Emergency Dispatch</Text>
        <Text style={styles.subtitle}>
          {isHigherRole
            ? 'Command Role: Select target sector and dispatch signal-filtered alerts with sirens & strobes.'
            : 'Worker Role: Trigger immediate distress beacon or report urgent station hazards.'}
        </Text>
      </View>

      {/* Mode Selector for Higher Roles */}
      {isHigherRole && (
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'DISPATCH' && styles.modeTabActive]}
            onPress={() => setMode('DISPATCH')}
          >
            <Icon name="broadcast" size={13} color={mode === 'DISPATCH' ? '#ffffff' : '#475569'} style={{ marginRight: 6 }} />
            <Text style={[styles.modeTabText, mode === 'DISPATCH' && styles.modeTabTextActive]}>
              Targeted Dispatch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'WORKER_SOS' && styles.modeTabActive]}
            onPress={() => setMode('WORKER_SOS')}
          >
            <Icon name="sos" size={13} color={mode === 'WORKER_SOS' ? '#ffffff' : '#475569'} style={{ marginRight: 6 }} />
            <Text style={[styles.modeTabText, mode === 'WORKER_SOS' && styles.modeTabTextActive]}>
              Personal SOS
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* VIEW A: Higher Role Targeted Sector Dispatcher */}
      {mode === 'DISPATCH' && isHigherRole ? (
        <View style={styles.dispatchCard}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="alert" size={15} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Dispatch Targeted Alert</Text>
          </View>

          {/* Target Place / Sector Selector */}
          <Text style={styles.inputLabel}>1. Select Target Sector / Place</Text>
          <View style={styles.sectorChipsContainer}>
            {MINE_SECTORS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sectorChip, targetSector === s.id && styles.sectorChipActive]}
                onPress={() => setTargetSector(s.id)}
              >
                <Text style={[styles.sectorChipTitle, targetSector === s.id && styles.sectorChipTitleActive]}>
                  {s.name}
                </Text>
                <Text style={[styles.sectorChipWorkers, targetSector === s.id && styles.sectorChipWorkersActive]}>
                  {s.workers_online} workers
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Signal Filter & Worker Preview Card */}
          <View style={styles.signalFilterBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name="wifi" size={13} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={styles.signalFilterTitle}>
                Signal Filter: <Text style={{ fontFamily: 'monospace', fontWeight: '800' }}>{selectedSectorObj.signal_node}</Text>
              </Text>
            </View>
            <Text style={styles.signalFilterDesc}>
              {selectedSectorObj.signal_desc}
            </Text>
            <Text style={styles.signalFilterTargetText}>
              📢 {selectedSectorObj.workers_online} worker mobile devices in this signal zone will sound sirens & flash flashlight strobes specially.
            </Text>
          </View>

          {/* Alert Category & Severity */}
          <Text style={styles.inputLabel}>2. Alert Category & Priority</Text>
          <View style={styles.catRow}>
            <TouchableOpacity
              style={[styles.catBtn, alertType === 'EVACUATION' && styles.catBtnActiveRed]}
              onPress={() => {
                setAlertType('EVACUATION');
                setSeverity('CRITICAL');
                setDirectiveTitle('🚨 IMMEDIATE SECTOR EVACUATION ORDER');
                setCustomMessage(`Cease extraction at ${selectedSectorObj.name}. Don self-rescuers and proceed to ${exitRoute}.`);
              }}
            >
              <Text style={[styles.catBtnText, alertType === 'EVACUATION' && styles.catBtnTextActive]}>
                🚨 Evacuation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catBtn, alertType === 'GAS_SURGE' && styles.catBtnActiveAmber]}
              onPress={() => {
                setAlertType('GAS_SURGE');
                setSeverity('CRITICAL');
                setDirectiveTitle('⚠️ CRITICAL METHANE (CH₄) SPIKE');
                setCustomMessage(`Methane level crossed 1.40% statutory threshold at ${selectedSectorObj.name}. Hold work.`);
              }}
            >
              <Text style={[styles.catBtnText, alertType === 'GAS_SURGE' && styles.catBtnTextActive]}>
                ⚠️ Gas Surge
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catBtn, alertType === 'STRATA_WARNING' && styles.catBtnActiveBlue]}
              onPress={() => {
                setAlertType('STRATA_WARNING');
                setSeverity('WARNING');
                setDirectiveTitle('🪨 STRATA / ROOF INSTABILITY');
                setCustomMessage(`Spalling observed at ${selectedSectorObj.name}. Hold advance, inspect roof support.`);
              }}
            >
              <Text style={[styles.catBtnText, alertType === 'STRATA_WARNING' && styles.catBtnTextActive]}>
                🪨 Strata
              </Text>
            </TouchableOpacity>
          </View>

          {/* Directive Title & Order Input */}
          <Text style={styles.inputLabel}>3. Directive Title</Text>
          <TextInput
            style={styles.textInput}
            value={directiveTitle}
            onChangeText={setDirectiveTitle}
            placeholder="e.g. IMMEDIATE SHAFT 4 INCLINE EVACUATION"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>4. Operational Order & Directive Details</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Describe threat, immediate actions, and escape path..."
            placeholderTextColor="#94a3b8"
            multiline
          />

          <Text style={styles.inputLabel}>5. Designated Escape Route</Text>
          <TextInput
            style={styles.textInput}
            value={exitRoute}
            onChangeText={setExitRoute}
            placeholder="Shaft 4 Incline (Portal Gate)"
            placeholderTextColor="#94a3b8"
          />

          {/* Dispatch Button */}
          <TouchableOpacity
            style={[styles.dispatchBtn, triggering && styles.btnDisabled]}
            onPress={handleDispatchTargetedAlert}
            disabled={triggering}
          >
            {triggering ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="broadcast" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.dispatchBtnText}>
                  Broadcast Alert to {selectedSectorObj.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* VIEW B: Base Worker SOS Distress Trigger & Local Incidents */
        <View>
          {/* Worker Telemetry Card */}
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryHeader}>
              <Icon name="crosshair" size={14} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={styles.telemetryTitle}>Personnel Station Telemetry</Text>
            </View>

            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>Current Station</Text>
                <Text style={styles.telemetryValue}>{workerZone}</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>Depth</Text>
                <Text style={[styles.telemetryValue, { color: '#0284c7' }]}>{workerDepth} meters</Text>
              </View>
            </View>

            <View style={styles.telemetryFooter}>
              <Icon name="wifi" size={12} color="#059669" style={{ marginRight: 5 }} />
              <Text style={styles.footerCoords}>Sub-surface Mesh: Locked • GPS: 23.7957° N, 86.4304° E</Text>
            </View>
          </View>

          {/* Tactile SOS Trigger */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.panicBtn, active ? styles.panicBtnActive : styles.panicBtnIdle]}
              onPress={() => handleWorkerSos('Manual SOS Distress Triggered')}
              disabled={triggering}
              activeOpacity={0.8}
            >
              {triggering ? (
                <ActivityIndicator color="#ffffff" size="large" />
              ) : (
                <View style={styles.innerPanic}>
                  <Icon name="sos" size={40} color="#ffffff" style={{ marginBottom: 6 }} />
                  <Text style={styles.panicText}>S O S</Text>
                  <Text style={styles.panicSub}>
                    {active ? 'BROADCASTING DISTRESS' : 'PRESS TO BROADCAST'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Station Incident Dispatches for Workers */}
          <View style={styles.workerQuickIncidentsCard}>
            <Text style={styles.quickIncidentsLabel}>Report Station Hazard (Immediate Dispatch):</Text>
            <View style={styles.quickIncidentGrid}>
              <TouchableOpacity
                style={styles.quickIncidentBtn}
                onPress={() => handleWorkerSos('Hazard: Methane Gas Seepage at Face')}
              >
                <Text style={styles.quickIncidentBtnText}>⚠️ Gas Seepage</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickIncidentBtn}
                onPress={() => handleWorkerSos('Hazard: Roof Support Cracking')}
              >
                <Text style={styles.quickIncidentBtnText}>🪨 Roof Crack</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickIncidentBtn}
                onPress={() => handleWorkerSos('Hazard: Subterranean Water Inrush')}
              >
                <Text style={styles.quickIncidentBtnText}>💧 Water Inrush</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickIncidentBtn}
                onPress={() => handleWorkerSos('Medical: Worker Injured at Station')}
              >
                <Text style={styles.quickIncidentBtnText}>🚑 Worker Injured</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Distress Beacon Status Card */}
          {active && (
            <View style={styles.distressActiveCard}>
              <View style={styles.distressActiveTop}>
                <View style={styles.distressPulseOuter}>
                  <View style={styles.distressPulseInner} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.distressActiveTitle}>🚨 DISTRESS BEACON BROADCASTING</Text>
                  <Text style={styles.distressActiveSub}>Transmitting across {workerZone} subterranean mesh</Text>
                </View>
              </View>
              <Text style={styles.distressActiveDesc}>
                Your emergency distress signal has been routed via node{' '}
                <Text style={{ fontWeight: '800', color: '#0284c7' }}>{selectedSectorObj.signal_node}</Text>.
                Nearby crew members in your sector have been alerted with instructions:
              </Text>
              <View style={styles.distressCallout}>
                <Text style={styles.distressCalloutText}>
                  "🚨 NEARBY WORKER IN DISTRESS: HELP {currentUser?.username?.toUpperCase() || 'HIM'} AT {workerZone.toUpperCase()}!"
                </Text>
              </View>
              <Text style={styles.distressInstruction}>
                Rescue and colleagues are responding. Keep your cap-lamp lit and remain in a secure area.
              </Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleStandDownSos} activeOpacity={0.8}>
                <Icon name="check" size={15} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.resetBtnText}>I Am Safe / Stand Down Beacon</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Dispatched Broadcasts Feed */}
      {recentBroadcasts.length > 0 && (
        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>Active Subterranean Broadcasts</Text>
          <View style={{ gap: 8 }}>
            {recentBroadcasts.map((b) => (
              <View key={b.id} style={styles.feedItem}>
                <View style={styles.feedItemTop}>
                  <View style={styles.feedItemBadge}>
                    <Text style={styles.feedItemBadgeText}>{b.severity || 'CRITICAL'}</Text>
                  </View>
                  <Text style={styles.feedItemTime}>
                    {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.feedItemHeader}>{b.title}</Text>
                <Text style={styles.feedItemMessage}>{b.message}</Text>
                <View style={styles.feedItemFooter}>
                  <Text style={styles.feedItemTarget}>Target: {b.target_zone_name || b.target_zone}</Text>
                  <Text style={styles.feedItemSignal}>📡 {b.signal_filter || 'ALL'}</Text>
                </View>

                {/* Stand down button for higher roles */}
                {isHigherRole && b.status === 'ACTIVE' && (
                  <TouchableOpacity
                    style={styles.resolveSmallBtn}
                    onPress={() => handleResolveRemoteAlert(b.id)}
                    disabled={resolvingId === b.id}
                  >
                    <Text style={styles.resolveSmallBtnText}>
                      {resolvingId === b.id ? 'Standing Down...' : 'Stand Down / Clear'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
    padding: 14,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 11.5,
    lineHeight: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#0284c7',
  },
  modeTabText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dispatchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  sectorChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  sectorChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    width: '48%',
  },
  sectorChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  sectorChipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectorChipTitleActive: {
    color: '#0284c7',
  },
  sectorChipWorkers: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
  },
  sectorChipWorkersActive: {
    color: '#0369a1',
    fontWeight: '600',
  },
  signalFilterBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  signalFilterTitle: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '700',
  },
  signalFilterDesc: {
    fontSize: 10,
    color: '#0284c7',
    marginBottom: 4,
  },
  signalFilterTargetText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
  },
  catRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  catBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catBtnActiveRed: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  catBtnActiveAmber: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  catBtnActiveBlue: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  catBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  catBtnTextActive: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#0f172a',
    fontSize: 12,
    marginBottom: 6,
  },
  textArea: {
    height: 54,
    textAlignVertical: 'top',
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 8,
  },
  dispatchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  telemetryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  telemetryTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '700',
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  telemetryItem: {
    flex: 1,
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  telemetryValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  telemetryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerCoords: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  panicBtn: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicBtnIdle: {
    backgroundColor: '#dc2626',
    borderWidth: 8,
    borderColor: '#fca5a5',
  },
  panicBtnActive: {
    backgroundColor: '#b91c1c',
    borderWidth: 10,
    borderColor: '#f87171',
  },
  innerPanic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  panicSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  workerQuickIncidentsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  quickIncidentsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  quickIncidentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickIncidentBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    width: '48%',
    alignItems: 'center',
  },
  quickIncidentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  feedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 10,
  },
  feedItem: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
  },
  feedItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feedItemBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedItemBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  feedItemTime: {
    color: '#7f1d1d',
    fontSize: 10,
  },
  feedItemHeader: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  feedItemMessage: {
    color: '#334155',
    fontSize: 11,
    marginBottom: 6,
  },
  feedItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 4,
    borderRadius: 4,
  },
  feedItemTarget: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '600',
  },
  feedItemSignal: {
    fontSize: 9.5,
    color: '#0284c7',
    fontWeight: '700',
  },
  resolveSmallBtn: {
    backgroundColor: '#059669',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  resolveSmallBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  distressActiveCard: {
    backgroundColor: '#fff1f2',
    borderWidth: 2,
    borderColor: '#e11d48',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  distressActiveTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distressPulseOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(225, 29, 72, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  distressPulseInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e11d48',
  },
  distressActiveTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9f1239',
  },
  distressActiveSub: {
    fontSize: 10.5,
    color: '#be123c',
    marginTop: 1,
  },
  distressActiveDesc: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 8,
  },
  distressCallout: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#e11d48',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  distressCalloutText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#be123c',
    lineHeight: 16,
  },
  distressInstruction: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

export default SosPanicScreen;
