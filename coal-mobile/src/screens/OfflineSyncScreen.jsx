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
    backgroundColor: '#090d16',
    padding: 12,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  beaconCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  beaconOnline: {
    backgroundColor: '#0f172a',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  beaconOffline: {
    backgroundColor: '#0f172a',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  beaconTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  beaconSub: {
    color: '#94a3b8',
    fontSize: 9.5,
    marginTop: 2,
    lineHeight: 13,
  },
  toggleBeaconBtn: {
    marginTop: 10,
    backgroundColor: '#090d16',
    borderRadius: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  toggleBeaconText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  statCol: {
    alignItems: 'center',
  },
  statsNum: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  statsLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  syncBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  clearBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearBtnText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.6 },
  queueHeader: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  queueList: {
    gap: 6,
    paddingBottom: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  queueItemTitle: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  queueItemMeta: {
    color: '#64748b',
    fontSize: 9.5,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
  },
  statusSynced: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textGreen: { color: '#4ade80' },
  textYellow: { color: '#facc15' },
});

export default OfflineSyncScreen;
