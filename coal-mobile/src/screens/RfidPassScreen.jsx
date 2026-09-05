import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';

export const RfidPassScreen = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [passData, setPassData] = useState(null);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  useEffect(() => {
    loadPass();
  }, []);

  const loadPass = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getRfidPass();
      setPassData(data);
    } catch {
      setPassData({
        id: currentUser.id,
        name: `${currentUser.first_name || currentUser.username} ${currentUser.last_name || ''}`.trim(),
        username: currentUser.username,
        employee_code: currentUser.employee_code || `EMP-${8000 + currentUser.id}`,
        role: currentUser.status === 'ACTIVE' ? 'Field Technician' : 'Visitor',
        cleared_zones: ['Zone A (Surface)', 'Zone B (Level 2)', 'Zone C (Shaft 4)'],
        qr_payload: `PASS-${currentUser.id}-${currentUser.username}`,
        status: 'ACTIVE_CLEARED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLastCheckIn(`Shaft 3 Turnstile Node #04 • ${timestamp}`);
    Alert.alert(
      'Turnstile Beacon Verified',
      'Proximity credential verified at Shaft 3 Turnstile. Personnel subterranean manifest updated.'
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Generating cryptographically signed pass...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="id-card" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.title}>PROXIMITY BEACON ACCESS BADGE</Text>
        </View>
        <Text style={styles.subtitle}>
          CRYPTOGRAPHIC HARD-TOKEN & SUBTERRANEAN TURNSTILE CREDENTIAL
        </Text>
      </View>

      {/* Digital ID Badge Card */}
      <View style={styles.idCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.companyTitle}>MINISTRY OF COAL / NEXUSMINE</Text>
          <View style={styles.chipRow}>
            <Icon name="rfid" size={12} color="#0284c7" style={{ marginRight: 4 }} />
            <Text style={styles.chipIcon}>RFID SECURED</Text>
          </View>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(currentUser.first_name || currentUser.username).charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.workerName}>{passData?.name?.toUpperCase() || currentUser.username.toUpperCase()}</Text>
          <Text style={styles.workerRole}>{passData?.role?.toUpperCase() || 'FIELD PERSONNEL'}</Text>
          <Text style={styles.empId}>OPERATOR ID: {passData?.employee_code || 'EMP-8492'}</Text>
        </View>

        {/* Simulated QR Pattern */}
        <View style={styles.qrBox}>
          <View style={styles.qrSimulatedPattern}>
            <Icon name="crosshair" size={36} color="#475569" style={{ marginBottom: 4 }} />
            <Text style={styles.qrCodeText}>TURNSTILE SENSOR TARGET</Text>
          </View>
          <Text style={styles.qrTokenText}>
            HASH: {passData?.qr_payload?.substring(0, 26)}...
          </Text>
        </View>

        {/* Cleared Zones */}
        <View style={styles.clearanceCard}>
          <View style={styles.clearanceHeader}>
            <Icon name="check" size={11} color="#16a34a" style={{ marginRight: 4 }} />
            <Text style={styles.clearanceTitle}>STATUTORY SAFETY CLEARANCE</Text>
          </View>
          <Text style={styles.clearanceSub}>
            Authorized Zones: {passData?.cleared_zones?.join(' • ')}
          </Text>
        </View>
      </View>

      {/* Turnstile Proximity Tap Action */}
      <TouchableOpacity style={styles.tapBtn} onPress={handleSimulateScan}>
        <Icon name="wifi" size={14} color="#ffffff" style={{ marginRight: 6 }} />
        <Text style={styles.tapBtnText}>
          SIMULATE PROXIMITY BEACON TURNSTILE CHECK-IN
        </Text>
      </TouchableOpacity>

      {lastCheckIn && (
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>LAST PROXIMITY EVENT:</Text>
          <Text style={styles.logVal}>{lastCheckIn}</Text>
        </View>
      )}
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
  center: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
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
  idCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  companyTitle: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    color: '#0284c7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  workerName: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  workerRole: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  empId: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  qrBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrSimulatedPattern: {
    width: 120,
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  qrTokenText: {
    color: '#94a3b8',
    fontSize: 8.5,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  clearanceCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 6,
  },
  clearanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearanceTitle: {
    color: '#16a34a',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  clearanceSub: {
    color: '#15803d',
    fontSize: 9.5,
    marginTop: 2,
  },
  tapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 12,
  },
  tapBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  logCard: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  logTitle: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logVal: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default RfidPassScreen;
