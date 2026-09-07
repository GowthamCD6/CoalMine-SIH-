import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from '../components/Icon';

export const DashboardScreen = ({ currentUser, onNavigate }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeBanner}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>FIELD WORKER</Text>
          </View>
          <Text style={styles.welcomeTitle}>Subterranean Field Operations</Text>
          <Text style={styles.welcomeSubtitle}>
            Worker: {currentUser?.first_name || currentUser?.username || 'Staff'} ({currentUser?.employee_code || 'Staff'})
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Online</Text>
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Underground Staff</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="users" size={14} color="#0284c7" />
            </View>
          </View>
          <Text style={styles.kpiVal}>1,248</Text>
          <Text style={styles.trendSub}>+12 across 4 active shafts</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Open Violations</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="clipboard" size={14} color="#d97706" />
            </View>
          </View>
          <Text style={styles.kpiVal}>34</Text>
          <Text style={styles.trendSub}>5 resolved during shift</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Ventilation AQI</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="wifi" size={14} color="#059669" />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>Optimal</Text>
          <Text style={styles.trendSub}>Atmospheric sensors 100%</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>Active Distress</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="alert" size={14} color="#0284c7" />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: '#0f172a' }]}>0 Alerts</Text>
          <Text style={styles.trendSub}>Sector perimeter secure</Text>
        </View>
      </View>

      {/* Production Metric */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="chart" size={15} color="#0284c7" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Daily Coal Extraction Target</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '90%' }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSub}>Output: 4,520 tons</Text>
            <Text style={styles.progressSub}>Goal: 5,000 tons (90.4%)</Text>
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

      {/* Live Operations Feed */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="activity" size={15} color="#0284c7" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Real-time Operations Ledger</Text>
        </View>

        <View style={styles.feedList}>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>14:45</Text>
            <Text style={styles.feedText}>Shaft 3 ventilation damper B calibrated</Text>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Done</Text>
            </View>
          </View>

          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>14:12</Text>
            <Text style={styles.feedText}>Shift A team cleared entrance turnstile</Text>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>13:30</Text>
            <Text style={styles.feedText}>Level 4 water sump maintenance pending</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
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
    fontSize: 20,
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
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 7,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressSub: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
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
  feedTime: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
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
  pendingBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pendingBadgeText: {
    color: '#b45309',
    fontSize: 9.5,
    fontWeight: '600',
  },
});

export default DashboardScreen;
