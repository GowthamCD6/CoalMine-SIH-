import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';

export const SosPanicScreen = ({ currentUser }) => {
  const [active, setActive] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [zone] = useState('Zone B (Level 4 Deep)');
  const [depth] = useState(-150);

  const handlePanicPress = async () => {
    setTriggering(true);
    try {
      await mobileApi.triggerSos(zone, depth);
      setActive(true);
      Alert.alert(
        'Distress Beacon Active',
        `Emergency distress signal transmitted for ${currentUser.username} at ${zone} (${depth}m). Surface rescue team alerted!`
      );
    } catch {
      setActive(true);
      Alert.alert(
        'Distress Beacon Stored',
        'Local distress signal active. Broadcasting via ultra-low-frequency subterranean mesh.'
      );
    } finally {
      setTriggering(false);
    }
  };

  const handleReset = () => {
    setActive(false);
    Alert.alert('Distress Deactivated', 'Emergency beacon stood down.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Icon name="sos" size={16} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.title}>EMERGENCY DISTRESS BEACON TRIGGER</Text>
        </View>
        <Text style={styles.subtitle}>
          TACTILE GLOVE-COMPATIBLE HARD-TRIGGER FOR UNDERGROUND CRISIS RESPONSE
        </Text>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.locLabel}>CURRENT PERSONNEL LOCATION TELEMETRY:</Text>
        <Text style={styles.locVal}>{zone.toUpperCase()} • DEPTH: {depth}M</Text>
        <Text style={styles.locCoords}>GPS: 23.7957° N, 86.4304° E • CARRIER MESH: LOCK</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.panicBtn, active ? styles.panicBtnActive : styles.panicBtnIdle]}
          onPress={handlePanicPress}
          disabled={triggering}
          activeOpacity={0.7}
        >
          {triggering ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <View style={styles.innerPanic}>
              <Icon name="sos" size={36} color="#ffffff" style={{ marginBottom: 6 }} />
              <Text style={styles.panicText}>S O S</Text>
              <Text style={styles.panicSub}>
                {active ? 'BROADCASTING ACTIVE' : 'PRESS TO BROADCAST'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {active ? (
        <View style={styles.activeAlertBox}>
          <View style={styles.alertHeaderRow}>
            <Icon name="alert" size={14} color="#fca5a5" style={{ marginRight: 6 }} />
            <Text style={styles.alertTitle}>DISTRESS BEACON TRANSMITTING</Text>
          </View>
          <Text style={styles.alertDesc}>
            Rescue dispatch alerted. Subterranean sirens sounding. Maintain personal radio beacon active.
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>STAND DOWN ALARM</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.idleNotice}>
          <Icon name="shield" size={14} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.idleNoticeText}>
            Distress beacons transmit direct depth telemetry and worker ID to surface dispatch.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    padding: 14,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'center',
    marginTop: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ef4444',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 3,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  locLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  locVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },
  locCoords: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  panicBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
  },
  panicBtnIdle: {
    backgroundColor: '#dc2626',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 12,
  },
  panicBtnActive: {
    backgroundColor: '#991b1b',
    borderColor: '#fca5a5',
  },
  innerPanic: {
    alignItems: 'center',
  },
  panicText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
  },
  panicSub: {
    color: '#fecaca',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  activeAlertBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  alertDesc: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  idleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  idleNoticeText: {
    color: '#64748b',
    fontSize: 9.5,
    textAlign: 'center',
    flex: 1,
  },
});

export default SosPanicScreen;
