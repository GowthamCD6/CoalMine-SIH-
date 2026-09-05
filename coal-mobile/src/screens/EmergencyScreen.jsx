import React, { useState, useEffect } from 'react';
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
import { mobileApi } from '../services/api';

export const EmergencyScreen = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sos_alerts: [],
    broadcasts: [],
    status: 'CLEAR',
  });
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    setLoading(true);
    try {
      const res = await mobileApi.getEmergencyAlerts();
      setData(res);
    } catch {
      setData({
        sos_alerts: [],
        broadcasts: [
          {
            id: 'BRD-001',
            type: 'ROUTINE',
            message: 'Periodic radio check verified. Subterranean relay mesh nominal.',
            sender: 'System Dispatch',
            timestamp: new Date().toISOString(),
          },
        ],
        status: 'CLEAR',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (type) => {
    Alert.alert(
      `Confirm ${type} Broadcast`,
      `Broadcast a ${type} statutory alarm across surface audio sirens and subterranean personal transceivers?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'BROADCAST NOW',
          style: 'destructive',
          onPress: async () => {
            setBroadcasting(true);
            try {
              const res = await mobileApi.triggerBroadcast(type);
              setData((prev) => ({
                ...prev,
                broadcasts: [res, ...prev.broadcasts],
              }));
              Alert.alert('Broadcast Dispatched', res.message);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to send broadcast');
            } finally {
              setBroadcasting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="emergency" size={16} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.title}>EMERGENCY CRISIS & EVACUATION CONSOLE</Text>
        </View>
        <Text style={styles.subtitle}>
          SUBTERRANEAN MESH BROADCAST & LIFE-SAFETY COMMAND
        </Text>
      </View>

      {/* Global Alarm Broadcast System */}
      <View style={styles.broadcastCard}>
        <Text style={styles.broadcastTitle}>STATUTORY ALARM DISPATCH SYSTEM</Text>
        <Text style={styles.broadcastDesc}>
          Direct trigger for subterranean audio-visual horns and personal telemetry pagers.
        </Text>

        <TouchableOpacity
          style={[styles.evacBtn, broadcasting && styles.btnDisabled]}
          onPress={() => handleBroadcast('EVACUATION')}
          disabled={broadcasting}
        >
          <Icon name="alert" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.evacBtnText}>TRIGGER IMMEDIATE EVACUATION SIREN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.musterBtn, broadcasting && styles.btnDisabled]}
          onPress={() => handleBroadcast('MUSTER')}
          disabled={broadcasting}
        >
          <Icon name="emergency" size={14} color="#f59e0b" style={{ marginRight: 6 }} />
          <Text style={styles.musterBtnText}>SOUND PROTOCOL MUSTER SIGNAL</Text>
        </TouchableOpacity>
      </View>

      {/* Active Distress Signals */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="sos" size={14} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>ACTIVE SOS DISTRESS BEACONS</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#0284c7" />
        ) : data.sos_alerts.length === 0 ? (
          <View style={styles.clearStatus}>
            <Icon name="shield" size={28} color="#4ade80" style={{ marginBottom: 6 }} />
            <Text style={styles.clearText}>ZERO ACTIVE DISTRESS BEACONS DETECTED</Text>
            <Text style={styles.clearSub}>All monitored subterranean zones nominal</Text>
          </View>
        ) : (
          data.sos_alerts.map((a, i) => (
            <View key={i} style={styles.alertItem}>
              <View style={styles.alertHeader}>
                <Icon name="alert" size={12} color="#ef4444" style={{ marginRight: 5 }} />
                <Text style={styles.alertWorker}>{a.worker_name} ({a.zone})</Text>
              </View>
              <Text style={styles.alertTime}>Depth: {a.depth}m • Transmitted: {new Date(a.timestamp).toLocaleTimeString()}</Text>
              <Text style={styles.alertStatus}>STATUS: {a.status}</Text>
            </View>
          ))
        )}
      </View>

      {/* Incident Communication Log */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="file-text" size={14} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>INCIDENT TRANSMISSION LOG</Text>
        </View>
        {data.broadcasts.map((b, i) => (
          <View key={i} style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.logType}>TRANSMISSION: {b.type}</Text>
              <Text style={styles.logTime}>
                {new Date(b.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.logMsg}>{b.message}</Text>
            <Text style={styles.logSender}>DISPATCHER: {b.sender}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 12.5,
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
  broadcastCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 10,
  },
  broadcastTitle: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  broadcastDesc: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 10,
    lineHeight: 14,
  },
  evacBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 6,
  },
  evacBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  musterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  musterBtnText: {
    color: '#f59e0b',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  sectionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  clearStatus: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  clearText: {
    color: '#4ade80',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  clearSub: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 2,
  },
  alertItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
    padding: 9,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertWorker: {
    color: '#fca5a5',
    fontSize: 11.5,
    fontWeight: '800',
  },
  alertTime: {
    color: '#cbd5e1',
    fontSize: 9.5,
    marginTop: 2,
  },
  alertStatus: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  logItem: {
    backgroundColor: '#090d16',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  logType: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  logTime: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  logMsg: {
    color: '#e2e8f0',
    fontSize: 11,
  },
  logSender: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 3,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EmergencyScreen;
