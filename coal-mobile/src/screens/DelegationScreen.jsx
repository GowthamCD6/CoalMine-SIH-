import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';

export const DelegationScreen = ({ currentUser, onSwitchUser }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadDelegationScope = useCallback(async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await mobileApi.getDelegationScope();
      setData(res);
    } catch (err) {
      setStatusMessage('Error loading delegation scope: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDelegationScope();
  }, [loadDelegationScope]);

  const handleGrantSubrole = async (subroleId) => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await mobileApi.assignUserSubrole(selectedUser.id, subroleId);
      setModalVisible(false);
      Alert.alert('Access Granted', `Assigned subrole to ${selectedUser.username}.`);
      await loadDelegationScope();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to grant access');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeSubrole = async (user, subroleId) => {
    Alert.alert(
      'Confirm Access Revocation',
      `Revoke this subrole from ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.revokeUserSubrole(user.id, subroleId);
              Alert.alert('Access Revoked', `Subrole revoked for ${user.username}.`);
              await loadDelegationScope();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to revoke subrole');
            }
          },
        },
      ]
    );
  };

  const actor = data?.actor;
  const users = data?.users || [];
  const assignableSubroles = data?.assignable_subroles || [];

  const filteredUsers = users.filter((u) => {
    if (filter === 'MANAGEABLE') return u.is_manageable;
    if (filter === 'RESTRICTED') return !u.is_manageable;
    return true;
  });

  const manageableCount = users.filter((u) => u.is_manageable).length;

  return (
    <View style={styles.container}>
      {/* Actor Scope Header Banner */}
      <View style={styles.actorCard}>
        <View style={styles.actorRow}>
          <View style={styles.actorIdentity}>
            <Icon name="user" size={14} color="#38bdf8" style={{ marginRight: 6 }} />
            <Text style={styles.actorGreeting}>
              SIGNED IN AS: <Text style={styles.actorName}>{currentUser.username.toUpperCase()}</Text>
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              actor?.can_manage_access ? styles.badgeSuccess : styles.badgeDanger,
            ]}
          >
            <Icon
              name={actor?.can_manage_access ? 'unlock' : 'lock'}
              size={11}
              color={actor?.can_manage_access ? '#38bdf8' : '#ef4444'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.badgeText,
                actor?.can_manage_access ? styles.badgeTextSuccess : styles.badgeTextDanger,
              ]}
            >
              {actor?.can_manage_access ? 'ADMIN MODE' : 'WORKER MODE'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>ROLE:</Text>
          <Text style={styles.metaVal}>{currentUser?.mobileRole === 'SUPERADMIN' ? 'SUPER ADMIN' : 'FIELD WORKER'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>ACCESS SCOPE:</Text>
          <Text style={styles.metaVal}>
            {currentUser?.mobileRole === 'SUPERADMIN'
              ? 'FULL PLATFORM — ALL WORKERS'
              : 'FIELD WORKER — LIMITED ACCESS'}
          </Text>
        </View>

        <View
          style={[
            styles.summaryBox,
            actor?.can_manage_access ? styles.summaryBoxSuccess : styles.summaryBoxWarn,
          ]}
        >
          <Icon
            name={actor?.can_manage_access ? 'check-circle' : 'alert'}
            size={13}
            color={actor?.can_manage_access ? '#4ade80' : '#f59e0b'}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.summaryText}>
            {actor?.can_manage_access
              ? `Authorized to manage ${manageableCount} field workers.`
              : 'Worker accounts cannot manage other users. Contact your Super Admin.'}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'ALL' && styles.tabBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.tabTextActive]}>
              ALL WORKERS ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'MANAGEABLE' && styles.tabBtnActive]}
          onPress={() => setFilter('MANAGEABLE')}
        >
          <Text style={[styles.tabText, filter === 'MANAGEABLE' && styles.tabTextActive]}>
              MANAGEABLE ({manageableCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'RESTRICTED' && styles.tabBtnActive]}
          onPress={() => setFilter('RESTRICTED')}
        >
          <Text style={[styles.tabText, filter === 'RESTRICTED' && styles.tabTextActive]}>
            RESTRICTED ({users.length - manageableCount})
          </Text>
        </TouchableOpacity>
      </View>

      {statusMessage ? (
        <View style={styles.messageBox}>
          <Icon name="alert" size={13} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.messageText}>{statusMessage}</Text>
        </View>
      ) : null}

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Evaluating hierarchy rules...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.userCard,
                item.is_manageable ? styles.userCardManageable : styles.userCardRestricted,
              ]}
            >
              <View style={styles.userCardHeader}>
                <View style={styles.userMainInfo}>
                  <View style={styles.avatarBox}>
                    <Icon name="user" size={14} color={item.is_manageable ? '#38bdf8' : '#64748b'} />
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    item.is_manageable ? styles.statusPillGreen : styles.statusPillGray,
                  ]}
                >
                  <Icon
                    name={item.is_manageable ? 'check' : 'lock'}
                    size={10}
                    color={item.is_manageable ? '#4ade80' : '#94a3b8'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      item.is_manageable ? styles.textGreen : styles.textGray,
                    ]}
                  >
                    {item.is_manageable ? 'MANAGEABLE' : 'RESTRICTED'}
                  </Text>
                </View>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>HIERARCHY STATUS:</Text>
                <Text style={styles.reasonVal}>{item.delegation_reason}</Text>
              </View>

              {/* Roles currently assigned */}
              <View style={styles.rolesSection}>
                <Text style={styles.rolesLabel}>ASSIGNED ROLES & CLEARANCES:</Text>
                {item.roles.length === 0 ? (
                  <Text style={styles.noRolesText}>Zero Active Roles (Unassigned Personnel)</Text>
                ) : (
                  item.roles.map((r, i) => (
                    <View key={i} style={styles.subroleChip}>
                      <Icon name="shield" size={11} color="#38bdf8" style={{ marginRight: 5 }} />
                      <Text style={styles.subroleChipText}>
                        {r.subrole_name} ({r.role_name})
                      </Text>
                      {item.is_manageable && (
                        <TouchableOpacity
                          style={styles.revokeBtn}
                          onPress={() => handleRevokeSubrole(item, r.subrole_id)}
                        >
                          <Icon name="close" size={11} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {item.is_manageable ? (
                  <TouchableOpacity
                    style={styles.grantBtn}
                    onPress={() => {
                      setSelectedUser(item);
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="plus" size={11} color="#ffffff" style={{ marginRight: 5 }} />
                    <Text style={styles.grantBtnText}>GRANT ACCESS / SUBROLE</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.disabledBtn}>
                    <Icon name="lock" size={11} color="#64748b" style={{ marginRight: 5 }} />
                    <Text style={styles.disabledBtnText}>DELEGATION RESTRICTED</Text>
                  </View>
                )}

                {onSwitchUser && (
                  <TouchableOpacity
                    style={styles.switchBtn}
                    onPress={() => onSwitchUser(item)}
                  >
                    <Icon name="refresh" size={11} color="#38bdf8" style={{ marginRight: 4 }} />
                    <Text style={styles.switchBtnText}>ACT AS USER</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Grant Access Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="delegation" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>DELEGATE SUBORDINATE ACCESS</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Target: <Text style={styles.bold}>{selectedUser?.username}</Text> ({selectedUser?.email})
            </Text>

            <Text style={styles.modalSectionLabel}>
              AUTHORIZATION SUBROLES IN YOUR JURISDICTION:
            </Text>

            {assignableSubroles.length === 0 ? (
              <Text style={styles.noSubroles}>
                No assignable subroles available within your current jurisdictional scope.
              </Text>
            ) : (
              <FlatList
                data={assignableSubroles}
                keyExtractor={(s) => String(s.id)}
                style={{ maxHeight: 280 }}
                renderItem={({ item: subrole }) => (
                  <TouchableOpacity
                    style={styles.subroleOption}
                    onPress={() => handleGrantSubrole(subrole.id)}
                    disabled={submitting}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subroleOptionTitle}>{subrole.name}</Text>
                      <Text style={styles.subroleOptionMeta}>
                        Role: {subrole.role_name} • Scope: {subrole.mine_name || subrole.organization_name || 'Global'}
                      </Text>
                    </View>
                    <View style={styles.assignBadge}>
                      <Text style={styles.assignBadgeText}>ASSIGN</Text>
                      <Icon name="chevron-right" size={12} color="#38bdf8" />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>CANCEL</Text>
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
  },
  actorCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  actorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actorIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actorGreeting: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  actorName: {
    color: '#0f172a',
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeDanger: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badgeTextSuccess: {
    color: '#047857',
  },
  badgeTextDanger: {
    color: '#64748b',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  metaVal: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  summaryBoxSuccess: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  summaryBoxWarn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  summaryText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0284c7',
  },
  tabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0284c7',
    fontWeight: '600',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    margin: 12,
    borderRadius: 8,
  },
  messageText: {
    color: '#b91c1c',
    fontSize: 11.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  userCard: {
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
  userCardManageable: {
    borderColor: '#e2e8f0',
    borderLeftWidth: 3.5,
    borderLeftColor: '#0284c7',
  },
  userCardRestricted: {
    borderColor: '#e2e8f0',
    opacity: 0.85,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userName: {
    color: '#0f172a',
    fontSize: 13.5,
    fontWeight: '600',
  },
  userEmail: {
    color: '#64748b',
    fontSize: 11,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusPillGray: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  textGreen: { color: '#047857' },
  textGray: { color: '#64748b' },
  reasonBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reasonLabel: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '600',
  },
  reasonVal: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  rolesSection: {
    marginTop: 10,
  },
  rolesLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 5,
  },
  noRolesText: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  subroleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subroleChipText: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '500',
    flex: 1,
  },
  revokeBtn: {
    padding: 4,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  grantBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 6,
    paddingVertical: 9,
  },
  grantBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  disabledBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingVertical: 9,
  },
  disabledBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  switchBtnText: {
    color: '#0284c7',
    fontSize: 11,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 14,
  },
  bold: {
    color: '#0f172a',
    fontWeight: '600',
  },
  modalSectionLabel: {
    color: '#64748b',
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  noSubroles: {
    color: '#94a3b8',
    fontSize: 12,
    paddingVertical: 12,
  },
  subroleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subroleOptionTitle: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '600',
  },
  subroleOptionMeta: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 2,
  },
  assignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  assignBadgeText: {
    color: '#0369a1',
    fontSize: 10.5,
    fontWeight: '600',
  },
  closeBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  closeBtnText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600',
  },
});

export default DelegationScreen;
