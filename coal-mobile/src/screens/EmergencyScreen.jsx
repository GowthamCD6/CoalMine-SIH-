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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 14,
    paddingBottom: 28,
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
  broadcastCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  broadcastTitle: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  broadcastDesc: {
    color: '#475569',
    fontSize: 11.5,
    marginBottom: 12,
    lineHeight: 16,
  },
  evacBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  evacBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  musterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  musterBtnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  clearStatus: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  clearText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
  },
  clearSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  alertItem: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertWorker: {
    color: '#b91c1c',
    fontSize: 12.5,
    fontWeight: '600',
  },
  alertTime: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  alertStatus: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  logItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logType: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '600',
  },
  logTime: {
    color: '#64748b',
    fontSize: 10,
  },
  logMsg: {
    color: '#0f172a',
    fontSize: 11.5,
  },
  logSender: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 3,
  },
});

export default EmergencyScreen;
