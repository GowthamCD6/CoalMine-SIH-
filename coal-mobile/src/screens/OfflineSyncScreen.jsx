import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/Icon';

const INITIAL_QUEUE = [
  {
    id: 'OFF-101',
    type: 'HAZARD_REPORT',
    title: 'Hazard Report #402 (Methane Seepage in Shaft 3)',
    timestamp: '10:45:12',
    status: 'PENDING',
    bytes: 42000,
  },
  {
    id: 'OFF-102',
    type: 'INSPECTION_DRAFT',
    title: 'Ventilation Shaft Check #V-993 (Level 4)',
    timestamp: '09:20:44',
    status: 'PENDING',
    bytes: 18000,
  },
  {
    id: 'OFF-103',
    type: 'ATTENDANCE_PUNCH',
    title: 'Worker Proximity Pass Check-In (EMP-8492)',
    timestamp: '08:00:19',
    status: 'SYNCED',
    bytes: 1200,
  },
];

export const OfflineSyncScreen = ({ currentUser }) => {
  const [beaconConnected, setBeaconConnected] = useState(true);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [syncing, setSyncing] = useState(false);

  const pendingCount = queue.filter((q) => q.status === 'PENDING').length;

  const handleSyncAll = () => {
    if (!beaconConnected) {
      Alert.alert(
        'Zero-Signal Isolated Mode',
        'Cannot synchronize data without surface beacon or mesh relay link. Connect to a transceiver station.'
      );
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) => ({ ...item, status: 'SYNCED' }))
      );
      setSyncing(false);
      Alert.alert('Synchronization Complete', 'All buffered telemetry payloads flushed to central database.');
    }, 1200);
  };

  const handleClearSynced = () => {
    setQueue((prev) => prev.filter((item) => item.status === 'PENDING'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="wifi" size={16} color="#a78bfa" style={{ marginRight: 6 }} />
          <Text style={styles.title}>OFFLINE BUFFER & MESH SYNCHRONIZATION</Text>
        </View>
        <Text style={styles.subtitle}>
          STORE-AND-FORWARD RELAY TELEMETRY QUEUE
        </Text>
      </View>

      {/* Surface Beacon Signal Status Card */}
      <View
        style={[
          styles.beaconCard,
          beaconConnected ? styles.beaconOnline : styles.beaconOffline,
        ]}
      >
        <View style={styles.beaconHeader}>
          <View style={[styles.beaconIconBox, { backgroundColor: beaconConnected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
            <Icon name="wifi" size={18} color={beaconConnected ? '#38bdf8' : '#ef4444'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.beaconTitle}>
              {beaconConnected
                ? 'SURFACE TRANSCEIVER BEACON: LOCKED'
                : 'ZERO-SIGNAL ISOLATION: ACTIVE'}
            </Text>
            <Text style={styles.beaconSub}>
              {beaconConnected
                ? 'High-speed shaft transceiver connected. Channel clear for store-and-forward flush.'
                : 'Subterranean isolation. Telemetry payloads secured in encrypted local storage.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.toggleBeaconBtn}
          onPress={() => setBeaconConnected(!beaconConnected)}
        >
          <Text style={styles.toggleBeaconText}>
            SIMULATE: {beaconConnected ? 'DISCONNECT BEACON (ENTER DEEP DRIFT)' : 'CONNECT BEACON (REACH RELAY NODE)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statsNum}>{pendingCount}</Text>
          <Text style={styles.statsLabel}>BUFFERED</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statsNum}>{queue.length - pendingCount}</Text>
          <Text style={styles.statsLabel}>COMMITTED</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statsNum}>
            {Math.round(queue.reduce((acc, i) => acc + (i.status === 'PENDING' ? i.bytes : 0), 0) / 1024)} KB
          </Text>
          <Text style={styles.statsLabel}>QUEUE SIZE</Text>
        </View>
      </View>

      {/* Sync Trigger Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.syncBtn, (syncing || pendingCount === 0) && styles.btnDisabled]}
          onPress={handleSyncAll}
          disabled={syncing || pendingCount === 0}
        >
          {syncing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="refresh" size={12} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.syncBtnText}>
                FLUSH LOCAL BUFFER TO CENTRAL STORE ({pendingCount})
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {queue.some((i) => i.status === 'SYNCED') && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearSynced}>
            <Text style={styles.clearBtnText}>PRUNE</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.queueHeader}>STORED BUFFER PAYLOADS</Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.queueList}
        renderItem={({ item }) => (
          <View style={styles.queueItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueItemTitle}>{item.title}</Text>
              <Text style={styles.queueItemMeta}>
                REF: {item.id} • {item.timestamp} • {(item.bytes / 1024).toFixed(1)} KB
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                item.status === 'SYNCED' ? styles.statusSynced : styles.statusPending,
              ]}
            >
              <Icon
                name={item.status === 'SYNCED' ? 'check' : 'wifi'}
                size={9}
                color={item.status === 'SYNCED' ? '#4ade80' : '#f59e0b'}
                style={{ marginRight: 3 }}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  item.status === 'SYNCED' ? styles.textGreen : styles.textYellow,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  beaconCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  beaconOnline: {
    borderColor: '#a7f3d0',
  },
  beaconOffline: {
    borderColor: '#fecaca',
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f1f5f9',
  },
  beaconTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  beaconSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  toggleBeaconBtn: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  toggleBeaconText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statCol: {
    alignItems: 'center',
  },
  statsNum: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  statsLabel: {
    color: '#64748b',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  syncBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  clearBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  btnDisabled: { opacity: 0.6 },
  queueHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  queueList: {
    gap: 8,
    paddingBottom: 24,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  queueItemTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '600',
  },
  queueItemMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusSynced: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textGreen: { color: '#047857' },
  textYellow: { color: '#b45309' },
});

export default OfflineSyncScreen;
