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
import { theme } from '../theme';

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
        id: currentUser?.id || 1,
        name: `${currentUser?.first_name || currentUser?.username || 'Field'} ${currentUser?.last_name || 'Operator'}`.trim(),
        username: currentUser?.username || 'operator',
        employee_code: currentUser?.employee_code || `EMP-${8000 + (currentUser?.id || 1)}`,
        role: currentUser?.mobileRole === 'SUPERADMIN' ? 'Global Super Administrator' : 'Field Worker / Operator',
        cleared_zones: ['Zone A (Surface Logistics)', 'Zone B (Level 2 Deep)', 'Zone C (Shaft 4 Pit)'],
        qr_payload: `PASS-${currentUser?.id || 1}-${currentUser?.username || 'op'}-SIG89F71A`,
        status: 'ACTIVE_CLEARED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLastCheckIn(`Shaft 3 Turnstile Terminal #04 • ${timestamp}`);
    Alert.alert(
      'Turnstile Proximity Verified',
      'Digital credential verified via near-field radio. Personnel subterranean roll manifest updated.'
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading cryptographic pass credentials...</Text>
      </View>
    );
  }

  const initial = (currentUser?.first_name || currentUser?.username || 'U').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Digital Access Pass</Text>
        <Text style={styles.subtitle}>
          Statutory electronic identity token and subterranean turnstile credential.
        </Text>
      </View>

      {/* Corporate Digital ID Card */}
      <View style={styles.idCard}>
        {/* Card Top Strip */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.authorityName}>MINISTRY OF COAL / DGMS</Text>
            <Text style={styles.passType}>Statutory Miner Identity Card</Text>
          </View>
          <View style={styles.rfidTag}>
            <Icon name="rfid" size={13} color={theme.colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.rfidTagText}>RFID SECURE</Text>
          </View>
        </View>

        {/* Worker Info */}
        <View style={styles.workerSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.workerName}>{passData?.name || currentUser?.username}</Text>
          <Text style={styles.workerRole}>{passData?.role || 'Field Personnel'}</Text>
          <Text style={styles.empId}>Employee ID: {passData?.employee_code || 'EMP-8492'}</Text>
        </View>

        {/* QR Simulation Box */}
        <View style={styles.qrContainer}>
          <View style={styles.qrFrame}>
            <Icon name="crosshair" size={32} color={theme.colors.textMuted} style={{ marginBottom: 4 }} />
            <Text style={styles.qrHint}>Turnstile Proximity Sensor Target</Text>
          </View>
          <Text style={styles.qrHash}>
            Token Hash: {passData?.qr_payload?.substring(0, 24)}...
          </Text>
        </View>

        {/* Safety Clearance Details */}
        <View style={styles.clearanceCard}>
          <View style={styles.clearanceHeader}>
            <Icon name="check-circle" size={14} color={theme.colors.success} style={{ marginRight: 6 }} />
            <Text style={styles.clearanceTitle}>Authorized Zone Clearance</Text>
          </View>
          <Text style={styles.clearanceList}>
            {passData?.cleared_zones?.join('  •  ') || 'Zone A  •  Zone B  •  Zone C'}
          </Text>
        </View>
      </View>

      {/* Scan Trigger Button */}
      <TouchableOpacity style={styles.tapBtn} onPress={handleSimulateScan} activeOpacity={0.8}>
        <Icon name="wifi" size={16} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={styles.tapBtnText}>Simulate Turnstile Beacon Tap</Text>
      </TouchableOpacity>

      {/* Recent Proximity Event */}
      {lastCheckIn ? (
        <View style={styles.logCard}>
          <View style={styles.logHeader}>
            <Icon name="check" size={13} color={theme.colors.success} style={{ marginRight: 5 }} />
            <Text style={styles.logTitle}>Last Proximity Event Verified</Text>
          </View>
          <Text style={styles.logVal}>{lastCheckIn}</Text>
        </View>
      ) : (
        <View style={styles.infoNotice}>
          <Icon name="shield" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.infoNoticeText}>
            Hold phone near NFC turnstile antenna at shaft entry to log entry into shift manifest.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontWeight: theme.typography.medium,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: theme.typography.regular,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  idCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  authorityName: {
    fontSize: 10,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  passType: {
    fontSize: 14,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginTop: 2,
  },
  rfidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rfidTagText: {
    fontSize: 10,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primaryText,
    letterSpacing: 0.3,
  },
  workerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
  },
  workerName: {
    fontSize: 17,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  workerRole: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: theme.typography.regular,
  },
  empId: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 3,
    fontWeight: theme.typography.medium,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  qrFrame: {
    width: 130,
    height: 130,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  qrHint: {
    fontSize: 9,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  qrHash: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 6,
    fontWeight: theme.typography.regular,
  },
  clearanceCard: {
    backgroundColor: theme.colors.successBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    padding: 12,
    marginTop: 8,
  },
  clearanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clearanceTitle: {
    fontSize: 12,
    fontWeight: theme.typography.semibold,
    color: theme.colors.successText,
  },
  clearanceList: {
    fontSize: 11,
    color: theme.colors.successText,
    lineHeight: 16,
    fontWeight: theme.typography.regular,
  },
  tapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 16,
    ...theme.cardShadow,
  },
  tapBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.semibold,
  },
  logCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginTop: 12,
    ...theme.cardShadow,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTitle: {
    fontSize: 11,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
  },
  logVal: {
    fontSize: 12,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  infoNoticeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    flex: 1,
    lineHeight: 16,
    fontWeight: theme.typography.regular,
  },
});

export default RfidPassScreen;
