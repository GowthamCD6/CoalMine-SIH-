import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
import { emergencyService } from '../services/emergencyService';

export const GasMonitorScreen = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('gas'); // 'gas' | 'strata'

  // Gas Entry Wizard
  const [ch4, setCh4] = useState('0.35'); // % Methane
  const [co, setCo] = useState('12'); // ppm Carbon Monoxide
  const [o2, setO2] = useState('20.8'); // % Oxygen
  const [gallery, setGallery] = useState('Gallery 14 West • Return Airway');
  const [submittedLogs, setSubmittedLogs] = useState([]);

  // Strata Support Checklist
  const [roofBoltsOk, setRoofBoltsOk] = useState(true);
  const [timberPropsOk, setTimberPropsOk] = useState(true);
  const [tellTaleMm, setTellTaleMm] = useState('3.2'); // mm displacement
  const [strataNotes, setStrataNotes] = useState('');

  // Calculate Threshold Tiers
  const ch4Val = parseFloat(ch4) || 0;
  const coVal = parseFloat(co) || 0;
  const o2Val = parseFloat(o2) || 20.9;

  const isCh4Danger = ch4Val > 1.25;
  const isCh4Warn = ch4Val > 0.75 && ch4Val <= 1.25;

  const isCoDanger = coVal > 50;
  const isCoWarn = coVal > 25 && coVal <= 50;

  const isO2Danger = o2Val < 19.0;
  const isO2Warn = o2Val >= 19.0 && o2Val < 19.5;

  const hasCriticalGasAlert = isCh4Danger || isCoDanger || isO2Danger;
  const hasWarningGasAlert = isCh4Warn || isCoWarn || isO2Warn;

  const tellTaleVal = parseFloat(tellTaleMm) || 0;
  const isStrataDanger = tellTaleVal > 10;
  const isStrataWarn = tellTaleVal > 5 && tellTaleVal <= 10;

  const handleLogGasReading = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      time,
      ch4: `${ch4Val.toFixed(2)}%`,
      co: `${coVal} ppm`,
      o2: `${o2Val.toFixed(1)}%`,
      gallery,
      danger: hasCriticalGasAlert,
      warn: hasWarningGasAlert,
    };

    setSubmittedLogs([newLog, ...submittedLogs]);

    if (hasCriticalGasAlert) {
      emergencyService.triggerEvacuationAlarm({
        source: 'AI Handheld Gas Analyzer Sensor',
        reason: `METHANE / CO CRITICAL SURGE at ${gallery}: CH4=${ch4Val}%, CO=${coVal}ppm, O2=${o2Val}%.`,
        exitRoute: 'Shaft 4 Incline (Portal Egress)',
      });
    } else {
      Alert.alert(
        'Atmospheric Log Recorded',
        `Readings for ${gallery} logged in statutory ventilation book at ${time}. Gas levels within permissible DGMS limits.`
      );
    }
  };

  const handleSubmitStrata = () => {
    Alert.alert(
      'Strata Inspection Submitted',
      `Roof Bolts: ${roofBoltsOk ? 'VERIFIED INTACT' : 'DEFECT REPORTED'}\nTimber Props: ${timberPropsOk ? 'OK' : 'DISPLACEMENT'}\nTell-tale Reading: ${tellTaleVal} mm (${isStrataDanger ? 'CRITICAL DISPLACEMENT' : isStrataWarn ? 'ATTENTION' : 'NORMAL'})\n\nShift Sirdar Log updated.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DGMS STATUTORY SAFETY</Text>
          </View>
          <View style={[styles.statusPill, hasCriticalGasAlert ? styles.pillDanger : styles.pillSuccess]}>
            <View style={[styles.statusDot, { backgroundColor: hasCriticalGasAlert ? '#ef4444' : '#10b981' }]} />
            <Text style={[styles.statusPillText, { color: hasCriticalGasAlert ? '#b91c1c' : '#047857' }]}>
              {hasCriticalGasAlert ? 'RED ALERT' : 'VENTILATION SAFE'}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>Environmental & Ventilation Monitoring</Text>
        <Text style={styles.subtitle}>
          Atmospheric gas detector entry wizard and strata roof support integrity checklist.
        </Text>
      </View>

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'gas' && styles.tabBtnActive]}
          onPress={() => setActiveTab('gas')}
        >
          <Icon name="wind" size={15} color={activeTab === 'gas' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'gas' && styles.tabTextActive]}>
            Gas Entry Wizard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'strata' && styles.tabBtnActive]}
          onPress={() => setActiveTab('strata')}
        >
          <Icon name="clipboard" size={15} color={activeTab === 'strata' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'strata' && styles.tabTextActive]}>
            Strata & Roof Bolts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Critical Banner if Alert Active */}
      {hasCriticalGasAlert && (
        <View style={styles.criticalAlertBanner}>
          <Icon name="alert" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.criticalBannerTitle}>DANGEROUS ATMOSPHERIC CONDITION</Text>
            <Text style={styles.criticalBannerSub}>
              One or more gas levels have breached Coal Mines Regulation legal thresholds. Evacuate gallery immediately.
            </Text>
          </View>
        </View>
      )}

      {/* Tab 1: Gas Entry Wizard */}
      {activeTab === 'gas' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="wind" size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Atmospheric Gas Logging Wizard</Text>
                <Text style={styles.cardSubtitle}>Handheld multi-gas detector input (DGMS Reg 153)</Text>
              </View>
            </View>

            {/* Gallery Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sampling Underground Location</Text>
              <TextInput
                style={styles.textInput}
                value={gallery}
                onChangeText={setGallery}
                placeholder="e.g. Gallery 14 West • Return Airway"
              />
            </View>

            {/* Gas Metrics Inputs */}
            <View style={styles.gasInputGrid}>
              {/* CH4 */}
              <View style={[styles.gasMetricCard, isCh4Danger && styles.metricDanger, isCh4Warn && styles.metricWarn]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricCode}>CH₄ (Methane)</Text>
                  <Text style={[styles.metricLimit, isCh4Danger ? { color: '#dc2626' } : { color: '#64748b' }]}>
                    Legal Max: 0.75%
                  </Text>
                </View>
                <View style={styles.metricInputRow}>
                  <TextInput
                    style={styles.metricTextInput}
                    value={ch4}
                    onChangeText={setCh4}
                    keyboardType="numeric"
                  />
                  <Text style={styles.metricUnit}>% Vol</Text>
                </View>
                <Text style={[styles.metricVerdict, isCh4Danger ? { color: '#dc2626' } : isCh4Warn ? { color: '#d97706' } : { color: '#059669' }]}>
                  {isCh4Danger ? 'RED ALERT: Evacuate' : isCh4Warn ? 'WARNING: High Gas' : 'NORMAL'}
                </Text>
              </View>

              {/* CO */}
              <View style={[styles.gasMetricCard, isCoDanger && styles.metricDanger, isCoWarn && styles.metricWarn]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricCode}>CO (Carbon Monoxide)</Text>
                  <Text style={[styles.metricLimit, isCoDanger ? { color: '#dc2626' } : { color: '#64748b' }]}>
                    Legal Max: 25 ppm
                  </Text>
                </View>
                <View style={styles.metricInputRow}>
                  <TextInput
                    style={styles.metricTextInput}
                    value={co}
                    onChangeText={setCo}
                    keyboardType="numeric"
                  />
                  <Text style={styles.metricUnit}>PPM</Text>
                </View>
                <Text style={[styles.metricVerdict, isCoDanger ? { color: '#dc2626' } : isCoWarn ? { color: '#d97706' } : { color: '#059669' }]}>
                  {isCoDanger ? 'TOXIC CO ALERT' : isCoWarn ? 'ELEVATED CO' : 'NORMAL'}
                </Text>
              </View>

              {/* O2 */}
              <View style={[styles.gasMetricCard, isO2Danger && styles.metricDanger, isO2Warn && styles.metricWarn]}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricCode}>O₂ (Oxygen)</Text>
                  <Text style={[styles.metricLimit, isO2Danger ? { color: '#dc2626' } : { color: '#64748b' }]}>
                    Legal Min: 19.5%
                  </Text>
                </View>
                <View style={styles.metricInputRow}>
                  <TextInput
                    style={styles.metricTextInput}
                    value={o2}
                    onChangeText={setO2}
                    keyboardType="numeric"
                  />
                  <Text style={styles.metricUnit}>% Vol</Text>
                </View>
                <Text style={[styles.metricVerdict, isO2Danger ? { color: '#dc2626' } : isO2Warn ? { color: '#d97706' } : { color: '#059669' }]}>
                  {isO2Danger ? 'ASPHYXIATION RISK' : isO2Warn ? 'DEFICIENT O2' : 'OPTIMAL'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                hasCriticalGasAlert ? styles.submitBtnDanger : styles.submitBtnPrimary,
              ]}
              onPress={handleLogGasReading}
            >
              <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>
                {hasCriticalGasAlert ? 'RECORD & TRANSMIT CRITICAL GAS ALARM' : 'RECORD ATMOSPHERIC READING'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Previous Shift Logs */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shift Gas Audit Ledger</Text>
            <View style={styles.logList}>
              <View style={styles.logItem}>
                <View style={styles.logTop}>
                  <Text style={styles.logGallery}>Gallery 14 West (Inbye)</Text>
                  <Text style={styles.logTime}>07:45 AM</Text>
                </View>
                <Text style={styles.logData}>CH₄: 0.30% • CO: 10 ppm • O₂: 20.9% (Normal)</Text>
              </View>
              {submittedLogs.map((log) => (
                <View key={log.id} style={[styles.logItem, log.danger && styles.logItemDanger]}>
                  <View style={styles.logTop}>
                    <Text style={[styles.logGallery, log.danger && { color: '#dc2626', fontWeight: '700' }]}>{log.gallery}</Text>
                    <Text style={styles.logTime}>{log.time}</Text>
                  </View>
                  <Text style={styles.logData}>CH₄: {log.ch4} • CO: {log.co} • O₂: {log.o2}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Tab 2: Strata Support Checklist */}
      {activeTab === 'strata' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                <Icon name="clipboard" size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Strata Support & Tell-Tale Checklist</Text>
                <Text style={styles.cardSubtitle}>Roof displacement & support stability inspection</Text>
              </View>
            </View>

            {/* Check 1: Roof Bolts */}
            <View style={styles.checkItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkTitle}>Roof Bolt Torque Verification</Text>
                <Text style={styles.checkSub}>Minimum torque 120 Nm with intact bearing plates</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, roofBoltsOk ? styles.togglePass : styles.toggleFail]}
                onPress={() => setRoofBoltsOk(!roofBoltsOk)}
              >
                <Text style={[styles.toggleText, roofBoltsOk ? styles.togglePassText : styles.toggleFailText]}>
                  {roofBoltsOk ? 'VERIFIED PASS' : 'ATTENTION REQ'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Check 2: Timber Props */}
            <View style={styles.checkItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkTitle}>Timber Props & Crossbars</Text>
                <Text style={styles.checkSub}>Verify wedges tight and props free of longitudinal splitting</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, timberPropsOk ? styles.togglePass : styles.toggleFail]}
                onPress={() => setTimberPropsOk(!timberPropsOk)}
              >
                <Text style={[styles.toggleText, timberPropsOk ? styles.togglePassText : styles.toggleFailText]}>
                  {timberPropsOk ? 'SECURE' : 'DEFECTIVE'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tell-tale Displacement */}
            <View style={styles.tellTaleBox}>
              <View style={styles.tellTaleHeader}>
                <Text style={styles.tellTaleTitle}>Tell-Tale Dual Roof Indicator (mm)</Text>
                <Text style={[styles.tellTaleStatus, isStrataDanger ? { color: '#dc2626' } : isStrataWarn ? { color: '#d97706' } : { color: '#059669' }]}>
                  {isStrataDanger ? 'CRITICAL (>10mm)' : isStrataWarn ? 'ATTENTION (5-10mm)' : 'SAFE (<5mm)'}
                </Text>
              </View>
              <TextInput
                style={styles.tellTaleInput}
                value={tellTaleMm}
                onChangeText={setTellTaleMm}
                keyboardType="numeric"
                placeholder="Roof displacement in mm"
              />
              <Text style={styles.tellTaleHint}>
                Displacement {'>'} 10mm mandates immediate withdrawal of all personnel from the stope face.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supervisor Remarks & Strata Observations</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                value={strataNotes}
                onChangeText={setStrataNotes}
                placeholder="e.g. Cleat fractures noted on north rib; extra prop installed."
                multiline
              />
            </View>

            <TouchableOpacity style={[styles.submitBtn, styles.submitBtnPrimary]} onPress={handleSubmitStrata}>
              <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>SUBMIT STRATA CHECKLIST TO SIRDAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...theme.cardShadow,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  pillSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  pillDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 17,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0284c7',
  },
  criticalAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  criticalBannerTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  criticalBannerSub: {
    color: '#fecaca',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  tabContent: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...theme.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#0f172a',
    fontSize: 12,
  },
  gasInputGrid: {
    gap: 10,
    marginBottom: 16,
  },
  gasMetricCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  metricDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
  },
  metricWarn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCode: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  metricLimit: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  metricInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricTextInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 90,
  },
  metricUnit: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  metricVerdict: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitBtnPrimary: {
    backgroundColor: '#0284c7',
  },
  submitBtnDanger: {
    backgroundColor: '#dc2626',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  logList: {
    gap: 8,
  },
  logItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logItemDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  logGallery: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '600',
  },
  logTime: {
    color: '#64748b',
    fontSize: 10.5,
  },
  logData: {
    color: '#475569',
    fontSize: 11,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkTitle: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  checkSub: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  togglePass: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  toggleFail: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  togglePassText: {
    color: '#047857',
    fontSize: 10.5,
    fontWeight: '700',
  },
  toggleFailText: {
    color: '#b91c1c',
    fontSize: 10.5,
    fontWeight: '700',
  },
  tellTaleBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  tellTaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tellTaleTitle: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tellTaleStatus: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  tellTaleInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  tellTaleHint: {
    color: '#64748b',
    fontSize: 10.5,
    lineHeight: 14,
  },
});
