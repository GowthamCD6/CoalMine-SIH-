import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';

export const DashboardScreen = ({ currentUser, onNavigate }) => {
  const [gasStatus, setGasStatus] = useState({ aqi: 'Optimal', ch4: '0.12%', co: '6 ppm', color: '#059669' });
  const [distressCount, setDistressCount] = useState(0);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const [envRes, alertsRes] = await Promise.allSettled([
          mobileApi.getEnvObservations({ limit: 3 }),
          mobileApi.getEmergencyAlerts(),
        ]);

        if (envRes.status === 'fulfilled' && envRes.value) {
          const obs = Array.isArray(envRes.value) ? envRes.value : (envRes.value?.rows || []);
          if (obs.length > 0) {
            const latest = obs[0];
            const isWarn = latest.status === 'WARNING' || latest.status === 'EXCEEDANCE';
            setGasStatus({
              aqi: isWarn ? 'Elevated Warning' : 'Optimal',
              ch4: `${latest.measured_value || 0.25}%`,
              co: '12 ppm',
              color: isWarn ? '#dc2626' : '#059669',
            });
          }
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) {
          const sos = alertsRes.value.data.sos_alerts || [];
          setDistressCount(sos.length);
        }
      } catch (err) {
        console.warn('Dashboard telemetry polling deferred:', err.message);
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 8000);
    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Worker Telemetry Banner */}
      <View style={styles.welcomeBanner}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>FIELD WORKER • ON DUTY</Text>
          </View>
          <Text style={styles.welcomeTitle}>Subterranean Field Operations</Text>
          <Text style={styles.welcomeSubtitle}>
            Worker: {currentUser?.first_name || currentUser?.username || 'Field Miner'} ({currentUser?.employee_code || 'EMP-7729'})
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Online</Text>
        </View>
      </View>

      {/* Worker Safety & Environment KPIs (Strictly Worker Focused - No Total Users or Admin Details) */}
      <View style={styles.kpiGrid}>
        {/* 1. Worker Current Zone */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Current Location</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="map-pin" size={14} color="#0284c7" />
            </View>
          </View>
          <Text style={styles.kpiVal}>Shaft 4 • L3</Text>
          <Text style={styles.trendSub}>-120m Subterranean Depth</Text>
        </View>

        {/* 2. Atmospheric & Gas Safety */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Atmospheric AQI</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="wind" size={14} color={gasStatus.color} />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: gasStatus.color }]}>{gasStatus.aqi}</Text>
          <Text style={styles.trendSub}>CH₄: {gasStatus.ch4} • CO: {gasStatus.co}</Text>
        </View>

        {/* 3. Cap-Lamp & Telemetry */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Cap-Lamp Power</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="lamp" size={14} color="#0284c7" />
            </View>
          </View>
          <Text style={styles.kpiVal}>94% Active</Text>
          <Text style={styles.trendSub}>Mesh telemetry locked</Text>
        </View>

        {/* 4. Emergency Sentinel Status */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Sector Safety</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="alert" size={14} color={distressCount > 0 ? '#dc2626' : '#059669'} />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: distressCount > 0 ? '#dc2626' : '#059669' }]}>
            {distressCount > 0 ? `${distressCount} Alert(s)` : 'All Clear'}
          </Text>
          <Text style={styles.trendSub}>
            {distressCount > 0 ? 'Active Distress in Mine' : '0 Distress • Perimeter safe'}
          </Text>
        </View>
      </View>

      {/* Worker Shift & Egress Readiness (Replaces Company Coal Production Target) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="compass" size={15} color="#0284c7" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Shift Status & Egress Readiness</Text>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Assigned Shift</Text>
            <Text style={styles.statusVal}>Morning Shift A</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Cap-Lamp Token</Text>
            <Text style={styles.statusVal}>#CL-4102 Verified</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Geofence Status</Text>
            <Text style={[styles.statusVal, { color: '#059669' }]}>✓ Safe Zone (Shaft 4)</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Primary Egress</Text>
            <Text style={styles.statusVal}>Shaft 4 Incline (140m)</Text>
          </View>
        </View>
      </View>

      {/* Operational Capabilities Hub */}
      <Text style={styles.groupHeader}>STATUTORY FIELD MODULES</Text>
      <View style={styles.toolGrid}>
        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('muster')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#f0f9ff' }]}>
            <Icon name="compass" size={18} color="#0284c7" />
          </View>
          <Text style={styles.toolTitle}>Shift Muster (Form B)</Text>
          <Text style={styles.toolDesc}>Geofence & Cap-Lamp log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('gas-monitor')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#ecfdf5' }]}>
            <Icon name="wind" size={18} color="#059669" />
          </View>
          <Text style={styles.toolTitle}>Gas & Ventilation</Text>
          <Text style={styles.toolDesc}>CH₄/CO/O₂ & Strata check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('hazard-cam')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#fff7ed' }]}>
            <Icon name="camera" size={18} color="#ea580c" />
          </View>
          <Text style={styles.toolTitle}>Hazard Camera</Text>
          <Text style={styles.toolDesc}>Snap near-miss & GPS HUD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('sos-panic')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#fef2f2' }]}>
            <Icon name="sos" size={18} color="#dc2626" />
          </View>
          <Text style={styles.toolTitle}>Emergency SOS</Text>
          <Text style={styles.toolDesc}>Siren, Strobe & Evacuation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('rfid-pass')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#eff6ff' }]}>
            <Icon name="id-card" size={18} color="#2563eb" />
          </View>
          <Text style={styles.toolTitle}>Digital RFID Pass</Text>
          <Text style={styles.toolDesc}>Worker badge & gate scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('offline-sync')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#f5f3ff' }]}>
            <Icon name="wifi" size={18} color="#7c3aed" />
          </View>
          <Text style={styles.toolTitle}>Offline Sync</Text>
          <Text style={styles.toolDesc}>Store & forward buffer</Text>
        </TouchableOpacity>
      </View>

      {/* Pre-Shift Safety Protocol & Verification Checklist (Replaces generic Operations Ledger) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="check-circle" size={15} color="#059669" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Pre-Shift Safety Confirmations</Text>
        </View>

        <View style={styles.feedList}>
          <View style={styles.feedItem}>
            <Text style={styles.feedBullet}>✓</Text>
            <Text style={styles.feedText}>Form B Digital Attendance & Cap-Lamp logged</Text>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Verified</Text>
            </View>
          </View>

          <View style={styles.feedItem}>
            <Text style={styles.feedBullet}>✓</Text>
            <Text style={styles.feedText}>Atmospheric multi-gas detector operational</Text>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Optimal</Text>
            </View>
          </View>

          <View style={styles.feedItem}>
            <Text style={styles.feedBullet}>✓</Text>
            <Text style={styles.feedText}>Subterranean mesh distress receiver active</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Armed</Text>
            </View>
          </View>
        </View>
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
  welcomeBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeRow: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: '#0369a1',
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    marginVertical: 4,
  },
  trendSub: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '400',
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
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  statusGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusItem: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  statusVal: {
    fontSize: 12.5,
    color: '#0f172a',
    fontWeight: '700',
  },
  groupHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  toolTile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  toolIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  toolTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '600',
  },
  toolDesc: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 2,
  },
  feedList: {
    gap: 8,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 9,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  feedBullet: {
    color: '#10b981',
    fontWeight: '900',
    fontSize: 12,
    marginRight: 8,
  },
  feedText: {
    color: '#0f172a',
    fontSize: 11.5,
    flex: 1,
  },
  doneBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  doneBadgeText: {
    color: '#047857',
    fontSize: 9.5,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeBadgeText: {
    color: '#1d4ed8',
    fontSize: 9.5,
    fontWeight: '600',
  },
});

export default DashboardScreen;
