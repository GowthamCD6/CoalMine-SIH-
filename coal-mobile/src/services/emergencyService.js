import { NativeModules, Platform, Vibration } from 'react-native';

const { EmergencyAlert } = NativeModules;

// Listeners for location and alarm state
const alarmListeners = new Set();
const locationListeners = new Set();

let isAlarmRunning = false;
let locationInterval = null;

// Simulated base location near mine pit
let currentLocation = {
  latitude: 23.7957,
  longitude: 86.4304,
  depth: -180,
  zone: 'Shaft 4 • Level 3',
  distanceToExit: 145, // meters
  accuracy: 2.4,
  timestamp: new Date().toLocaleTimeString(),
  evacuating: false,
};

function notifyAlarmChange(active, alertData) {
  alarmListeners.forEach((listener) => {
    try {
      listener(active, alertData);
    } catch (e) {
      console.warn('Alarm listener error:', e);
    }
  });
}

function notifyLocationChange(loc) {
  locationListeners.forEach((listener) => {
    try {
      listener(loc);
    } catch (e) {
      console.warn('Location listener error:', e);
    }
  });
}

/**
 * Start continuous high-frequency location fetching
 */
function startContinuousLocationTracking() {
  if (locationInterval) return;

  locationInterval = setInterval(() => {
    // Simulate real-time continuous movement toward exit during evacuation
    const step = Math.random() * 0.00004;
    const depthChange = Math.floor(Math.random() * 4) + 1;

    currentLocation = {
      ...currentLocation,
      latitude: Number((currentLocation.latitude + step).toFixed(6)),
      longitude: Number((currentLocation.longitude + step * 0.5).toFixed(6)),
      depth: Math.min(-20, currentLocation.depth + depthChange),
      distanceToExit: Math.max(12, currentLocation.distanceToExit - (Math.floor(Math.random() * 6) + 2)),
      timestamp: new Date().toLocaleTimeString(),
    };

    notifyLocationChange(currentLocation);
  }, 2200);
}

function stopContinuousLocationTracking() {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
}

// Set of alert IDs that this device has already acknowledged/reported safe for
const acknowledgedAlertIds = new Set();
let pollInterval = null;
let triggeredByServerAlertId = null;

export const emergencyService = {
  isAlarmActive: () => isAlarmRunning,
  getCurrentLocation: () => currentLocation,

  /**
   * Permanently acknowledge and silence an alert so it NEVER alarms again on this device
   */
  async acknowledgeAndSilenceAlert(alertId) {
    if (alertId) {
      acknowledgedAlertIds.add(alertId);
    }
    triggeredByServerAlertId = null;
    await this.dismissEvacuationAlarm();
  },

  /**
   * Worker reports safety status to surface dispatch and permanently silences alarm
   */
  async reportEvacuationSafe({ alertId, status = 'EVACUATED_SAFE_SURFACE', user = null, location = null, apiInstance = null }) {
    await this.acknowledgeAndSilenceAlert(alertId);

    const loc = location || currentLocation;
    const workerName = user ? `${user.first_name || user.username} (${user.employee_code || 'STAFF'})` : 'nandha (Staff)';
    const workerId = user?.employee_code || user?.id || 'EMP-7729';

    const payload = {
      alert_id: alertId,
      worker_id: workerId,
      worker_name: workerName,
      status,
      latitude: loc.latitude,
      longitude: loc.longitude,
      depth: loc.depth,
      zone: loc.zone,
      notes: `Worker safe check-in: ${status}`,
    };

    if (apiInstance && apiInstance.reportEvacuationSafe) {
      try {
        return await apiInstance.reportEvacuationSafe(payload);
      } catch (err) {
        console.warn('Failed to submit evacuation safety report to server:', err);
      }
    }
    return null;
  },

  /**
   * Worker acknowledges colleague SOS distress and indicates they are en route to assist
   */
  async respondToNearbyDistress({ alertId, user = null, location = null, apiInstance = null }) {
    await this.acknowledgeAndSilenceAlert(alertId);

    const loc = location || currentLocation;
    const responderName = user ? `${user.first_name || user.username}` : 'Nearby Colleague';
    const responderId = user?.id || 'RESP-' + Date.now();

    const payload = {
      responder_id: responderId,
      responder_name: responderName,
      responder_zone: loc.zone,
      responder_distance: '~35m',
    };

    if (apiInstance && apiInstance.respondToDistress) {
      try {
        return await apiInstance.respondToDistress(alertId, payload);
      } catch (err) {
        console.warn('Failed to submit distress response to server:', err);
      }
    }
    return null;
  },

  /**
   * Subscribe to alarm state changes (activated / dismissed)
   */
  subscribeAlarm(callback) {
    alarmListeners.add(callback);
    return () => alarmListeners.delete(callback);
  },

  /**
   * Subscribe to continuous location updates
   */
  subscribeLocation(callback) {
    locationListeners.add(callback);
    callback(currentLocation);
    return () => locationListeners.delete(callback);
  },

  /**
   * Trigger the Emergency Evacuation Alarm:
   * - Native ToneGenerator loud "BEEP BEEP BEEP" warning siren
   * - Native flashlight / torch strobing ON and OFF
   * - Device vibration SOS pulse
   * - Continuous location broadcast
   */
  async triggerEvacuationAlarm({
    source = 'AI Safety Monitoring System',
    reason = 'Critical Methane Surge (>1.35%) & Seismic Disruption',
    exitRoute = 'Shaft 4 Main Incline (Portal Gate)',
    alertId = null,
  } = {}) {
    // If worker already acknowledged this specific alert, DO NOT alarm!
    if (alertId && acknowledgedAlertIds.has(alertId)) {
      return;
    }

    isAlarmRunning = true;
    currentLocation.evacuating = true;

    // Start continuous location tracking immediately
    startContinuousLocationTracking();

    // Call native module if available
    if (EmergencyAlert && EmergencyAlert.startEmergencyAlarm) {
      try {
        await EmergencyAlert.startEmergencyAlarm();
      } catch (err) {
        console.warn('Native startEmergencyAlarm error:', err);
      }
    } else {
      Vibration.vibrate([0, 400, 200, 400, 200, 400], true);
    }

    notifyAlarmChange(true, { source, reason, exitRoute, alertId });
  },

  /**
   * Stop the Emergency Evacuation Alarm:
   * - Turn off flashlight
   * - Stop ToneGenerator beep sound
   * - Stop vibration
   * - Stand down continuous emergency telemetry
   */
  async dismissEvacuationAlarm() {
    isAlarmRunning = false;
    currentLocation.evacuating = false;

    stopContinuousLocationTracking();

    if (EmergencyAlert && EmergencyAlert.stopEmergencyAlarm) {
      try {
        await EmergencyAlert.stopEmergencyAlarm();
      } catch (err) {
        console.warn('Native stopEmergencyAlarm error:', err);
      }
    } else {
      Vibration.cancel();
    }

    notifyAlarmChange(false, null);
  },

  /**
   * Toggle flashlight independently if needed
   */
  async toggleTorch(enable) {
    if (EmergencyAlert && EmergencyAlert.toggleTorch) {
      try {
        return await EmergencyAlert.toggleTorch(enable);
      } catch (err) {
        console.warn('Native toggleTorch error:', err);
      }
    }
    return false;
  },

  /**
   * Trigger Colleague Distress Rescue Alert for nearby workers:
   * Alert nearby workers that their peer needs immediate assistance!
   */
  async triggerRescueAssistAlarm({
    workerName = 'Colleague',
    zone = 'Shaft 4 • Level 3',
    depth = -180,
    reason = 'Worker triggered emergency SOS distress beacon',
    distance = 35,
    alertId = null,
  } = {}) {
    // If worker already acknowledged this alert, do not sound
    if (alertId && acknowledgedAlertIds.has(alertId)) {
      return;
    }

    isAlarmRunning = true;
    currentLocation.evacuating = false;

    // Trigger hardware alarm: siren + flashlight strobe + vibration
    if (EmergencyAlert && EmergencyAlert.startEmergencyAlarm) {
      try {
        await EmergencyAlert.startEmergencyAlarm();
      } catch (err) {
        console.warn('Native startEmergencyAlarm error:', err);
      }
    } else {
      Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
    }

    notifyAlarmChange(true, {
      isRescueAssist: true,
      workerName,
      zone,
      depth,
      reason,
      distance,
      alertId,
    });
  },

  /**
   * Start periodic synchronization with server for remote targeted alerts
   * - If an evacuation is ordered, alerts workers in that sector to evacuate
   * - If user presses the green button, the alert ID is added to acknowledgedAlertIds and NEVER alarms again!
   * - If a nearby colleague presses SOS, alerts nearby workers: "HELP HIM AT [LOCATION]!"
   * - Never traps the distressed worker on their own device with an evacuation siren!
   */
  startServerAlertPolling(apiInstance, targetZone = null, currentUser = null) {
    if (pollInterval) return;

    pollInterval = setInterval(async () => {
      try {
        const zoneToCheck = targetZone || currentLocation.zone;
        // Fetch all active broadcasts so no evacuation or emergency message is missed
        const res = await apiInstance.getEmergencyAlerts();
        const broadcasts = res?.broadcasts || res?.all_broadcasts || res?.data?.broadcasts || [];

        const currentUsername = String(currentUser?.username || '').toLowerCase();
        const currentUserId = String(currentUser?.id || '');

        const matchingCriticalAlert = broadcasts.find((b) => {
          if (b.status !== 'ACTIVE') return false;

          // CRITICAL: If user pressed the green safe/evacuated button, NEVER alarm again!
          if (acknowledgedAlertIds.has(b.id)) return false;

          // 1. Evacuation Orders: ALL workers in or near the mine MUST receive the evacuation alarm!
          if (b.type === 'EVACUATION') {
            return true;
          }

          // 2. Colleague SOS Distress: Alert nearby workers, but don't alarm the distressed worker on their own phone with "Help him"
          if (
            b.type === 'WORKER_DISTRESS' &&
            ((currentUserId && (String(b.sender_id) === currentUserId || String(b.distress_worker_id) === currentUserId)) ||
             (currentUsername && (b.sender_name?.toLowerCase().includes(currentUsername) || b.distress_worker_name?.toLowerCase().includes(currentUsername))))
          ) {
            return false;
          }

          if (b.target_zone === 'ALL') return true;
          const wz = String(zoneToCheck).toLowerCase();
          const tz = String(b.target_zone || '').toLowerCase();
          const tzn = String(b.target_zone_name || '').toLowerCase();

          return (
            wz.includes(tz) ||
            tz.includes(wz) ||
            wz.includes(tzn) ||
            tzn.includes(wz) ||
            (tz.includes('shaft_4') && wz.includes('shaft 4')) ||
            (tz.includes('zone_b') && wz.includes('zone b')) ||
            (tz.includes('sector_c') && wz.includes('sector c')) ||
            (tz.includes('pit_2') && wz.includes('pit 2')) ||
            (tz.includes('vent') && wz.includes('vent'))
          );
        });

        if (matchingCriticalAlert && !isAlarmRunning) {
          triggeredByServerAlertId = matchingCriticalAlert.id;

          if (matchingCriticalAlert.type === 'WORKER_DISTRESS') {
            // Alert nearby workers to rescue their colleague!
            await emergencyService.triggerRescueAssistAlarm({
              workerName: matchingCriticalAlert.distress_worker_name || matchingCriticalAlert.sender_name || 'Nearby Worker',
              zone: matchingCriticalAlert.target_zone_name || matchingCriticalAlert.target_zone,
              depth: matchingCriticalAlert.distress_depth || -180,
              reason: matchingCriticalAlert.message || 'Worker SOS Emergency Distress',
              distance: 35,
              alertId: matchingCriticalAlert.id,
            });
          } else {
            // General mine or sector evacuation order
            await emergencyService.triggerEvacuationAlarm({
              source: `${matchingCriticalAlert.sender_name} (${matchingCriticalAlert.sender_role || 'Command'})`,
              reason: matchingCriticalAlert.message || matchingCriticalAlert.title,
              exitRoute: matchingCriticalAlert.exit_route || 'Shaft 4 Incline (Portal Gate)',
              alertId: matchingCriticalAlert.id,
            });
          }
        } else if (!matchingCriticalAlert && isAlarmRunning && triggeredByServerAlertId) {
          // Alert was resolved or stood down
          triggeredByServerAlertId = null;
          await emergencyService.dismissEvacuationAlarm();
        }
      } catch {
        // Subterranean mesh drop, ignore and retry next cycle
      }
    }, 3500);
  },

  stopServerAlertPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },
};

export default emergencyService;
