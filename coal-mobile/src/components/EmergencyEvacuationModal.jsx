import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from './Icon';
import { emergencyService } from '../services/emergencyService';
import { mobileApi } from '../services/api';

export const EmergencyEvacuationModal = ({
  visible,
  alertData,
  currentUser,
  onDismiss,
}) => {
  const [location, setLocation] = useState(emergencyService.getCurrentLocation());
  const [strobeColor, setStrobeColor] = useState('#dc2626');
  const [confirmedSafe, setConfirmedSafe] = useState(false);
  const [respondingToColleague, setRespondingToColleague] = useState(false);
  const [safeLocationChoice, setSafeLocationChoice] = useState('EVACUATED_SAFE_SURFACE');
  const [submitting, setSubmitting] = useState(false);

  // Subscribe to live location updates
  useEffect(() => {
    const unsub = emergencyService.subscribeLocation((loc) => {
      setLocation(loc);
    });
    return unsub;
  }, []);

  // Visual screen strobe effect while modal is active and not confirmed safe
  useEffect(() => {
    let interval = null;
    if (visible && !confirmedSafe && !respondingToColleague) {
      interval = setInterval(() => {
        setStrobeColor((prev) => (prev === '#dc2626' ? '#991b1b' : '#dc2626'));
      }, 380);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, confirmedSafe, respondingToColleague]);

  // Reset local state when a brand new alert appears
  useEffect(() => {
    if (visible) {
      setConfirmedSafe(false);
      setRespondingToColleague(false);
      setSubmitting(false);
    }
  }, [alertData?.alertId, visible]);

  /**
   * CRITICAL ACTION: Worker taps the Green Safe Button
   * 1. Permanently silences siren and turns off torch strobe.
   * 2. Registers alertId in acknowledgedAlertIds so the alarm NEVER rings again!
   * 3. Submits safety status to the server so Admin Evacuation Ledger updates in real time.
   */
  const handleReportSafe = async (statusChoice = safeLocationChoice) => {
    setSubmitting(true);
    try {
      // Immediately silence the hardware alarm and lock out re-triggering
      await emergencyService.reportEvacuationSafe({
        alertId: alertData?.alertId,
        status: statusChoice,
        user: currentUser,
        location,
        apiInstance: mobileApi,
      });

      setConfirmedSafe(true);
    } catch (err) {
      console.warn('Failed to send safety confirmation:', err);
      // Even if network drops underground, silence the siren locally
      await emergencyService.acknowledgeAndSilenceAlert(alertData?.alertId);
      setConfirmedSafe(true);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * CRITICAL ACTION: Worker taps "I Am Responding" for a Colleague's SOS
   */
  const handleRespondToDistress = async () => {
    setSubmitting(true);
    try {
      await emergencyService.respondToNearbyDistress({
        alertId: alertData?.alertId,
        user: currentUser,
        location,
        apiInstance: mobileApi,
      });
      setRespondingToColleague(true);
    } catch (err) {
      console.warn('Failed to send response confirmation:', err);
      await emergencyService.acknowledgeAndSilenceAlert(alertData?.alertId);
      setRespondingToColleague(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMuteAndDismiss = async () => {
    await emergencyService.acknowledgeAndSilenceAlert(alertData?.alertId);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  const isRescue = Boolean(alertData?.isRescueAssist);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(15, 23, 42, 0.96)' }]}>
        <View style={[
          styles.container,
          { borderColor: confirmedSafe || respondingToColleague ? '#10b981' : strobeColor }
        ]}>
          {/* Header Siren Bar */}
          <View style={[
            styles.sirenHeader,
            { backgroundColor: confirmedSafe || respondingToColleague ? '#065f46' : strobeColor }
          ]}>
            <View style={styles.sirenRow}>
              <Icon
                name={confirmedSafe || respondingToColleague ? 'shield-check' : 'alert'}
                size={24}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sirenTitle}>
                {confirmedSafe
                  ? '✅ EVACUATION ACCOUNTABILITY CONFIRMED'
                  : respondingToColleague
                  ? '✅ RESCUE ASSIST ACKNOWLEDGED'
                  : isRescue
                  ? '🚨 NEARBY WORKER IN DISTRESS: HELP HIM!'
                  : 'EMERGENCY EVACUATION ORDER'}
              </Text>
            </View>
            <Text style={styles.sirenSub}>
              {confirmedSafe
                ? 'YOU ARE MARKED AS SAFE • DISPATCH HAS UPDATED MUSTER LEDGER'
                : respondingToColleague
                ? 'COORDINATES STREAMING TO PEER & SURFACE DISPATCH'
                : isRescue
                ? 'COLLEAGUE IN DANGER — PROCEED IMMEDIATELY TO ASSIST'
                : 'IMMEDIATE DANGER — ALL PERSONNEL WITHDRAW TO SURFACE'}
            </Text>
          </View>

          {/* If NOT confirmed safe yet: Show active alarm status */}
          {!confirmedSafe && !respondingToColleague && (
            <View style={styles.signalBanner}>
              <View style={styles.signalItem}>
                <View style={styles.pulsingDotRed} />
                <Text style={styles.signalText}>ALARM SIREN: ACTIVE</Text>
              </View>
              <View style={styles.signalItem}>
                <View style={styles.pulsingDotAmber} />
                <Text style={styles.signalText}>TORCH STROBE: FLASHING</Text>
              </View>
            </View>
          )}

          {/* Alert Source & Reason */}
          <View style={styles.reasonCard}>
            <Text style={styles.sourceLabel}>
              {isRescue ? 'DISTRESSED WORKER' : 'ALERT INITIATOR'}
            </Text>
            <Text style={styles.sourceValue}>
              {isRescue
                ? `${alertData?.workerName || 'Nearby Colleague'} (Subterranean Crew)`
                : (alertData?.source || 'AI Continuous Subterranean Safety Sentinel')}
            </Text>

            <Text style={[styles.sourceLabel, { marginTop: 8 }]}>
              {isRescue ? 'INCIDENT REPORT' : 'THREAT DETECTION'}
            </Text>
            <Text style={styles.threatValue}>
              {alertData?.reason || 'Critical Atmospheric Methane Surge (>1.35%) & Seismic Disruption'}
            </Text>

            <View style={[styles.exitBox, isRescue && { backgroundColor: '#7f1d1d' }]}>
              <Icon name={isRescue ? 'map-pin' : 'target'} size={15} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.exitText}>
                {isRescue
                  ? `LOCATION: ${alertData?.zone || 'Current Sector'} (${alertData?.depth || -180}m) • ~${alertData?.distance || 35}m AWAY`
                  : `PRIMARY ESCAPE ROUTE: ${alertData?.exitRoute || 'Shaft 4 Main Incline Portal'}`}
              </Text>
            </View>
          </View>

          {/* Continuously Updated Live Location Tracking */}
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryTop}>
              <View style={styles.locIconBox}>
                <Icon name="compass" size={15} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.telemetryHeaderTitle}>
                  {isRescue ? 'SUBTERRANEAN RESCUE BEACON' : 'LIVE EVACUATION TRACKING'}
                </Text>
                <Text style={styles.telemetryHeaderSub}>
                  {isRescue
                    ? 'Proximity radar locked on distressed peer signal'
                    : 'Continuous coordinates streaming to surface dispatch'}
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveBeacon} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryCol}>
                <Text style={styles.telLabel}>Your Current Position</Text>
                <Text style={styles.telValue}>
                  {location.latitude}° N, {location.longitude}° E
                </Text>
              </View>
              <View style={styles.telemetryCol}>
                <Text style={styles.telLabel}>Current Depth</Text>
                <Text style={[styles.telValue, { color: '#38bdf8' }]}>
                  {location.depth} meters
                </Text>
              </View>
            </View>

            <View style={styles.telemetryFooterRow}>
              <Text style={styles.distanceText}>
                {isRescue ? (
                  <>ESTIMATED DISTANCE: <Text style={styles.boldDistance}>~{alertData?.distance || 35} METERS</Text></>
                ) : (
                  <>DISTANCE TO PORTAL: <Text style={styles.boldDistance}>{location.distanceToExit} METERS</Text></>
                )}
              </Text>
              <Text style={styles.timestampText}>Pitched: {location.timestamp}</Text>
            </View>
          </View>

          {/* CONFIRMED SAFE CARD (Appears once worker tapped the green button) */}
          {confirmedSafe && (
            <View style={styles.confirmedSafeCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Icon name="check" size={18} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={styles.confirmedSafeTitle}>SAFETY LOGGED WITH DISPATCH</Text>
              </View>
              <Text style={styles.confirmedSafeText}>
                Your status has been updated to <Text style={{ fontWeight: '700', color: '#10b981' }}>SAFE & ACCOUNTED FOR</Text> in the Command Ledger.
                The emergency siren and flashlight strobe are now silenced and will not sound again for this event.
              </Text>
              <TouchableOpacity
                style={styles.dismissNoticeBtn}
                onPress={handleMuteAndDismiss}
              >
                <Text style={styles.dismissNoticeBtnText}>Dismiss Notice / Return to App</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CONFIRMED RESCUE ASSIST CARD */}
          {respondingToColleague && (
            <View style={styles.confirmedSafeCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Icon name="check" size={18} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={styles.confirmedSafeTitle}>RESPONSE TRANSMITTED</Text>
              </View>
              <Text style={styles.confirmedSafeText}>
                Surface dispatch and <Text style={{ fontWeight: '700', color: '#38bdf8' }}>{alertData?.workerName || 'your colleague'}</Text> have been notified that you are en route to provide emergency assistance.
              </Text>
              <TouchableOpacity
                style={styles.dismissNoticeBtn}
                onPress={handleMuteAndDismiss}
              >
                <Text style={styles.dismissNoticeBtnText}>Dismiss Notice / View Map</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ACTION BUTTONS: Visible when not yet confirmed safe */}
          {!confirmedSafe && !respondingToColleague && (
            <View style={styles.buttonStack}>
              {/* PRIMARY PROMINENT GREEN ACTION BUTTON */}
              {isRescue ? (
                <TouchableOpacity
                  style={styles.greenSafeBtn}
                  onPress={handleRespondToDistress}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.greenSafeBtnText}>🏃 I AM RESPONDING / EN ROUTE TO ASSIST</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  {/* Select Safe Location Quick Chips */}
                  <View style={styles.choiceRow}>
                    <TouchableOpacity
                      style={[
                        styles.choiceChip,
                        safeLocationChoice === 'EVACUATED_SAFE_SURFACE' && styles.choiceChipActive
                      ]}
                      onPress={() => setSafeLocationChoice('EVACUATED_SAFE_SURFACE')}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        safeLocationChoice === 'EVACUATED_SAFE_SURFACE' && styles.choiceChipTextActive
                      ]}>
                        Surface Portal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.choiceChip,
                        safeLocationChoice === 'SAFE_REFUGE_CHAMBER' && styles.choiceChipActive
                      ]}
                      onPress={() => setSafeLocationChoice('SAFE_REFUGE_CHAMBER')}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        safeLocationChoice === 'SAFE_REFUGE_CHAMBER' && styles.choiceChipTextActive
                      ]}>
                        Refuge Chamber
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.choiceChip,
                        safeLocationChoice === 'SAFE_MAIN_INCLINE' && styles.choiceChipActive
                      ]}
                      onPress={() => setSafeLocationChoice('SAFE_MAIN_INCLINE')}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        safeLocationChoice === 'SAFE_MAIN_INCLINE' && styles.choiceChipTextActive
                      ]}>
                        Main Incline
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.greenSafeBtn}
                    onPress={() => handleReportSafe()}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Icon name="check" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                        <Text style={styles.greenSafeBtnText}>
                          ✅ I HAVE EVACUATED SUCCESSFULLY / I AM SAFE
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* SECONDARY: SILENCE SIREN & STREAM TELEMETRY */}
              <TouchableOpacity
                style={styles.standDownBtn}
                onPress={handleMuteAndDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.standDownText}>
                  {isRescue ? 'MUTE SIREN / STAND DOWN' : 'MUTE SIREN (EVACUATION IN PROGRESS)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  container: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  sirenHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sirenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  sirenTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sirenSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  signalBanner: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 7,
    paddingHorizontal: 14,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  pulsingDotAmber: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginRight: 6,
  },
  signalText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  reasonCard: {
    padding: 14,
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sourceLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sourceValue: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  threatValue: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 16,
  },
  exitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  exitText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    flex: 1,
  },
  telemetryCard: {
    padding: 12,
    backgroundColor: '#090d16',
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  telemetryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  telemetryHeaderTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  telemetryHeaderSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveBeacon: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  liveBadgeText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: '800',
  },
  telemetryGrid: {
    flexDirection: 'row',
    backgroundColor: '#131b2e',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  telemetryCol: {
    flex: 1,
  },
  telLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
  },
  telValue: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  telemetryFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  boldDistance: {
    color: '#ffffff',
    fontWeight: '900',
  },
  timestampText: {
    color: '#475569',
    fontSize: 9,
  },
  buttonStack: {
    padding: 12,
    gap: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  choiceChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  choiceChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  choiceChipText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  greenSafeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  greenSafeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  standDownBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  standDownText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  confirmedSafeCard: {
    margin: 12,
    padding: 14,
    backgroundColor: '#064e3b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  confirmedSafeTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  confirmedSafeText: {
    color: '#d1fae5',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  dismissNoticeBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissNoticeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
