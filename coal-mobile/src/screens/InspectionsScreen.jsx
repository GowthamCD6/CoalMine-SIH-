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
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#0369a1',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  card: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardId: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  badgeMed: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  badgeLow: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  severityText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  obsType: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
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
    color: '#64748b',
    fontSize: 11,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  deadline: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '400',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textGreen: { color: '#047857' },
  textYellow: { color: '#b45309' },
  textBlue: { color: '#0284c7' },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resolveBtnText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 13,
  },
  severitySelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sevSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  sevSelectBtnActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  sevSelectText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.6 },
  createBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600',
  },
});

export default InspectionsScreen;
