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
              ACTOR: <Text style={styles.actorName}>{currentUser.username.toUpperCase()}</Text>
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
              {actor?.can_manage_access ? 'DELEGATION ACTIVE' : 'READ-ONLY STAFF'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>AUTHORITY TIER:</Text>
          <Text style={styles.metaVal}>{actor?.level || 'UNKNOWN'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>JURISDICTION:</Text>
          <Text style={styles.metaVal}>
            {actor?.level === 'SUPERADMIN'
              ? 'GLOBAL PLATFORM (ALL ORGS & MINES)'
              : actor?.level === 'ORG_ADMIN'
              ? `ORGANIZATION JURISDICTION (ORG #${actor.organization_id})`
              : actor?.level === 'MINE_ADMIN'
              ? `MINE JURISDICTION (MINE #${actor.mine_id})`
              : 'STANDARD WORKER (DELEGATION RESTRICTED)'}
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
              ? `Authorized to grant and revoke access for ${manageableCount} subordinate personnel.`
              : 'USERS_MANAGE_ROLES authority restricted. Subordinate access modification disabled.'}
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
            ALL USERS ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'MANAGEABLE' && styles.tabBtnActive]}
          onPress={() => setFilter('MANAGEABLE')}
        >
          <Text style={[styles.tabText, filter === 'MANAGEABLE' && styles.tabTextActive]}>
            SUBORDINATES ({manageableCount})
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
    backgroundColor: '#090d16',
  },
  actorCard: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actorName: {
    color: '#ffffff',
    fontWeight: '900',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  badgeTextSuccess: {
    color: '#38bdf8',
  },
  badgeTextDanger: {
    color: '#ef4444',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  metaLabel: {
    color: '#475569',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaVal: {
    color: '#cbd5e1',
    fontSize: 9.5,
    fontWeight: '700',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    padding: 9,
    marginTop: 9,
    borderWidth: 1,
  },
  summaryBoxSuccess: {
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  summaryBoxWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  summaryText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38bdf8',
  },
  tabText: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#38bdf8',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    padding: 8,
    margin: 10,
    borderRadius: 4,
  },
  messageText: {
    color: '#f87171',
    fontSize: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  listContent: {
    padding: 10,
    gap: 8,
  },
  userCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  userCardManageable: {
    borderColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
  },
  userCardRestricted: {
    borderColor: '#1e293b',
    opacity: 0.8,
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
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userName: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  userEmail: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusPillGray: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.25)',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textGreen: { color: '#4ade80' },
  textGray: { color: '#94a3b8' },
  reasonBox: {
    backgroundColor: '#090d16',
    borderRadius: 4,
    padding: 7,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  reasonLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reasonVal: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  rolesSection: {
    marginTop: 8,
  },
  rolesLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noRolesText: {
    color: '#64748b',
    fontSize: 10,
    fontStyle: 'italic',
  },
  subroleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subroleChipText: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
  },
  revokeBtn: {
    padding: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  grantBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 4,
    paddingVertical: 8,
  },
  grantBtnText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disabledBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 4,
    paddingVertical: 8,
  },
  disabledBtnText: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  switchBtnText: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontWeight: '800',
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginBottom: 12,
  },
  bold: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalSectionLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  noSubroles: {
    color: '#64748b',
    fontSize: 11,
    paddingVertical: 12,
  },
  subroleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 4,
    padding: 10,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subroleOptionTitle: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  subroleOptionMeta: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 2,
  },
  assignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 3,
  },
  assignBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default DelegationScreen;
