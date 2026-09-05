import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';

export const InspectionsScreen = ({ currentUser }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  const [newType, setNewType] = useState('');
  const [newLocation, setNewLocation] = useState('Jharia - Level 3');
  const [newSeverity, setNewSeverity] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getInspections();
      setInspections(data);
    } catch {
      setInspections([
        {
          id: 'V-992',
          observation_type: 'Roof Support Degradation (Timber Decay)',
          inspector: 'S. Verma',
          location: 'Jharia - Level 3',
          deadline: '2026-09-05',
          severity: 'HIGH',
          status: 'IN_PROGRESS',
          created_at: new Date().toISOString(),
        },
        {
          id: 'V-991',
          observation_type: 'Contractor Personnel PPE Non-Compliance',
          inspector: 'M. Singh',
          location: 'Godavari - Zone B',
          deadline: '2026-09-01',
          severity: 'MEDIUM',
          status: 'PENDING_REVIEW',
          created_at: new Date().toISOString(),
        },
        {
          id: 'S-402',
          observation_type: 'Ventilation Shaft Air Velocity Audit',
          inspector: 'Auto-Sensor Node #4',
          location: 'Talcher - Shaft 4',
          deadline: '2026-08-30',
          severity: 'LOW',
          status: 'RESOLVED',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newType.trim()) {
      Alert.alert('Required Field', 'Specify observation description');
      return;
    }
    setCreating(true);
    try {
      const item = await mobileApi.createInspection({
        observation_type: newType,
        location: newLocation,
        severity: newSeverity,
      });
      setInspections([item, ...inspections]);
      setModalVisible(false);
      setNewType('');
      Alert.alert('Report Committed', `Observation #${item.id} logged.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save observation');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await mobileApi.updateInspectionStatus(item.id, newStatus);
      setInspections((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
      Alert.alert('Status Updated', `Observation #${item.id} marked ${newStatus}.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  const filtered = inspections.filter((i) => {
    if (filterSeverity === 'ALL') return true;
    return i.severity === filterSeverity;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Icon name="clipboard" size={16} color="#34d399" style={{ marginRight: 6 }} />
            <Text style={styles.title}>SAFETY OBSERVATIONS LEDGER</Text>
          </View>
          <Text style={styles.subtitle}>STATUTORY HAZARD & REMEDIATION REGISTRY</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={11} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.newBtnText}>NEW ENTRY</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filterSeverity === s && styles.filterChipActive]}
            onPress={() => setFilterSeverity(s)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterSeverity === s && styles.filterChipTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0284c7" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardId}>{item.id}</Text>
                <View
                  style={[
                    styles.severityBadge,
                    item.severity === 'HIGH'
                      ? styles.badgeHigh
                      : item.severity === 'MEDIUM'
                      ? styles.badgeMed
                      : styles.badgeLow,
                  ]}
                >
                  <Text style={styles.severityText}>{item.severity} PRIORITY</Text>
                </View>
              </View>

              <Text style={styles.obsType}>{item.observation_type}</Text>

              <View style={styles.detailRow}>
                <View style={styles.metaItem}>
                  <Icon name="pin" size={10} color="#64748b" style={{ marginRight: 4 }} />
                  <Text style={styles.detail}>{item.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="user" size={10} color="#64748b" style={{ marginRight: 4 }} />
                  <Text style={styles.detail}>{item.inspector}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.deadline}>DEADLINE: {item.deadline}</Text>
                <View style={styles.statusRow}>
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'RESOLVED'
                        ? styles.textGreen
                        : item.status === 'IN_PROGRESS'
                        ? styles.textYellow
                        : styles.textBlue,
                    ]}
                  >
                    {item.status}
                  </Text>
                  {item.status !== 'RESOLVED' && (
                    <TouchableOpacity
                      style={styles.resolveBtn}
                      onPress={() => handleUpdateStatus(item, 'RESOLVED')}
                    >
                      <Icon name="check" size={9} color="#22c55e" style={{ marginRight: 3 }} />
                      <Text style={styles.resolveBtnText}>RESOLVE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Observation Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Icon name="clipboard" size={16} color="#34d399" style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>LOG STATUTORY OBSERVATION</Text>
            </View>

            <Text style={styles.label}>OBSERVATION DESCRIPTION</Text>
            <TextInput
              style={styles.input}
              value={newType}
              onChangeText={setNewType}
              placeholder="e.g. Ventilation duct fracture or degraded timber"
              placeholderTextColor="#475569"
            />

            <Text style={styles.label}>LOCATION / MINE SHAFT ZONE</Text>
            <TextInput
              style={styles.input}
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="Jharia - Level 3"
              placeholderTextColor="#475569"
            />

            <Text style={styles.label}>SEVERITY CLASSIFICATION</Text>
            <View style={styles.severitySelectRow}>
              {['HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.sevSelectBtn,
                    newSeverity === sev && styles.sevSelectBtnActive,
                  ]}
                  onPress={() => setNewSeverity(sev)}
                >
                  <Text style={styles.sevSelectText}>{sev}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createBtn, creating && styles.btnDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createBtnText}>
                {creating ? 'COMMITTING TO LEDGER...' : 'SUBMIT STATUTORY REPORT'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filterChipActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0284c7',
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#38bdf8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: 8,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardId: {
    color: '#38bdf8',
    fontWeight: '900',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeMed: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  badgeLow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  severityText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  obsType: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    color: '#94a3b8',
    fontSize: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  deadline: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textGreen: { color: '#4ade80' },
  textYellow: { color: '#facc15' },
  textBlue: { color: '#38bdf8' },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderColor: '#22c55e',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  resolveBtnText: {
    color: '#22c55e',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  label: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#ffffff',
    fontSize: 12,
  },
  severitySelectRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  sevSelectBtn: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#090d16',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  sevSelectBtnActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    borderColor: '#0284c7',
  },
  sevSelectText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  createBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  btnDisabled: { opacity: 0.6 },
  createBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default InspectionsScreen;
