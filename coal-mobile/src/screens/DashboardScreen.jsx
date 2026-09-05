import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from '../components/Icon';

export const DashboardScreen = ({ currentUser, onNavigate }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeBanner}>
        <View>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>TELEMETRY GRID ACTIVE</Text>
          </View>
          <Text style={styles.welcomeTitle}>NEXUSMINE OPERATIONS</Text>
          <Text style={styles.welcomeSubtitle}>
            OPERATOR: {currentUser.first_name?.toUpperCase() || currentUser.username.toUpperCase()}
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>ONLINE</Text>
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>SUBTERRANEAN STAFF</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="users" size={14} color="#38bdf8" />
            </View>
          </View>
          <Text style={styles.kpiVal}>1,248</Text>
          <Text style={styles.trendUp}>+12 across 4 active shafts</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>OPEN VIOLATIONS</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="clipboard" size={14} color="#f59e0b" />
            </View>
          </View>
          <Text style={styles.kpiVal}>34</Text>
          <Text style={styles.trendDown}>5 remediated this shift</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>VENTILATION AQI</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="wifi" size={14} color="#4ade80" />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: '#4ade80' }]}>OPTIMAL</Text>
          <Text style={styles.trendUp}>Atmospheric sensors 100%</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>ACTIVE DISTRESS</Text>
            <View style={styles.kpiIconBox}>
              <Icon name="alert" size={14} color="#38bdf8" />
            </View>
          </View>
          <Text style={[styles.kpiVal, { color: '#38bdf8' }]}>0 ALERTS</Text>
          <Text style={styles.trendUp}>Sector perimeter nominal</Text>
        </View>
      </View>

      {/* Production Metric */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="chart" size={13} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>DAILY COAL EXTRACTION TARGET</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '88%' }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSub}>OUTPUT: 4,520 TONS</Text>
            <Text style={styles.progressSub}>GOAL: 5,000 TONS (90.4%)</Text>
          </View>
        </View>
      </View>

      {/* Wireframe Mobile Quick Action Hub */}
      <Text style={styles.groupHeader}>OPERATIONAL CAPABILITIES</Text>
      <View style={styles.toolGrid}>
        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('delegation')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="delegation" size={18} color="#38bdf8" />
          </View>
          <Text style={styles.toolTitle}>Access Delegation</Text>
          <Text style={styles.toolDesc}>Subordinate user manager</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('hazard-cam')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="camera" size={18} color="#fbbf24" />
          </View>
          <Text style={styles.toolTitle}>Hazard Camera</Text>
          <Text style={styles.toolDesc}>GPS geotag & depth HUD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('sos-panic')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="sos" size={18} color="#ef4444" />
          </View>
          <Text style={styles.toolTitle}>SOS Distress</Text>
          <Text style={styles.toolDesc}>Subterranean beacon trigger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('offline-sync')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="wifi" size={18} color="#a78bfa" />
          </View>
          <Text style={styles.toolTitle}>Offline Sync</Text>
          <Text style={styles.toolDesc}>Beacon queue & buffer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('rfid-pass')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="id-card" size={18} color="#38bdf8" />
          </View>
          <Text style={styles.toolTitle}>RFID Proximity</Text>
          <Text style={styles.toolDesc}>Digital access credential</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('ocr-scanner')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="ocr" size={18} color="#2dd4bf" />
          </View>
          <Text style={styles.toolTitle}>OCR Scanner</Text>
          <Text style={styles.toolDesc}>Digitize physical ledgers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('inspections')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="clipboard" size={18} color="#34d399" />
          </View>
          <Text style={styles.toolTitle}>Inspections</Text>
          <Text style={styles.toolDesc}>Statutory compliance log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolTile}
          onPress={() => onNavigate('emergency')}
        >
          <View style={styles.toolIconBox}>
            <Icon name="alert" size={18} color="#f87171" />
          </View>
          <Text style={styles.toolTitle}>Crisis Console</Text>
          <Text style={styles.toolDesc}>Evacuation & muster sirens</Text>
        </TouchableOpacity>
      </View>

      {/* Live Operations Feed */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Icon name="refresh" size={13} color="#38bdf8" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>REAL-TIME AUDIT LOG FEED</Text>
        </View>
        <View style={styles.feedList}>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>10:42</Text>
            <Text style={styles.feedText}>Shift 2 Personnel Attendance Check</Text>
            <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>VERIFIED</Text></View>
          </View>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>10:15</Text>
            <Text style={styles.feedText}>Magazine Explosives Registry Logged</Text>
            <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>VERIFIED</Text></View>
          </View>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>09:30</Text>
            <Text style={styles.feedText}>O2 Sensor Multi-point Calibrated</Text>
            <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>VERIFIED</Text></View>
          </View>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>08:15</Text>
            <Text style={styles.feedText}>Shaft 4 Structural Audit Pending</Text>
            <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>PENDING</Text></View>
          </View>
        </View>
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
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  badgeRow: {
    marginBottom: 4,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  welcomeSubtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  kpiCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4,
  },
  trendUp: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
  },
  trendDown: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
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
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressSub: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  groupHeader: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  toolTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  toolIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  toolDesc: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 2,
  },
  feedList: {
    gap: 6,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  feedTime: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  feedText: {
    color: '#cbd5e1',
    fontSize: 10.5,
    flex: 1,
  },
  doneBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  doneBadgeText: {
    color: '#4ade80',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  pendingBadgeText: {
    color: '#f59e0b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default DashboardScreen;
