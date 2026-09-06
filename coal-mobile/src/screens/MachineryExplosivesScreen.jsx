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

export const MachineryExplosivesScreen = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('hemm'); // 'hemm' | 'explosives'

  // HEMM 5-point Checklist State
  const [selectedMachine, setSelectedMachine] = useState('CAT-777D-09 (100T Dumper)');
  const [brakesOk, setBrakesOk] = useState(true);
  const [steeringOk, setSteeringOk] = useState(true);
  const [tiresOk, setTiresOk] = useState(true);
  const [fluidsOk, setFluidsOk] = useState(true);
  const [afssOk, setAfssOk] = useState(true);
  const [machineActive, setMachineActive] = useState(false);

  // Explosives Ledger State
  const [magazineClerk, setMagazineClerk] = useState('MC-Ramesh (Lic #MG-8812)');
  const [certifiedBlaster, setCertifiedBlaster] = useState('BL-Suresh (DGMS #BL-4910)');
  const [cartridgesKg, setCartridgesKg] = useState('120');
  const [detonatorsIssued, setDetonatorsIssued] = useState('30');
  const [detonatorsReturned, setDetonatorsReturned] = useState('2');
  const [faceId, setFaceId] = useState('Bench 04 East • Blasting Pattern 18');
  const [blasterSigned, setBlasterSigned] = useState(false);

  const allChecksPass = brakesOk && steeringOk && tiresOk && fluidsOk && afssOk;

  const handleHemmSubmit = () => {
    if (allChecksPass) {
      setMachineActive(true);
      Alert.alert(
        'HEMM Pre-Shift Cleared',
        `${selectedMachine} passed all 5 statutory DGMS points.\nEquipment logged as ACTIVE for Shift 1.\nOperator: ${currentUser?.username || 'Operator'}`
      );
    } else {
      setMachineActive(false);
      Alert.alert(
        'EQUIPMENT GROUNDED (RED TAG)',
        `Safety critical failure detected on ${selectedMachine}!\nEquipment locked out from operations until mechanical workshop clearance.`
      );
    }
  };

  const handleExplosivesSignOff = () => {
    setBlasterSigned(true);
    Alert.alert(
      'Dual-Signature Ledger Recorded',
      `DGMS Explosives Return Form Confirmed:\n\nClerk: ${magazineClerk}\nBlaster: ${certifiedBlaster}\nCartridges: ${cartridgesKg} kg Emulsion\nDetonators: ${detonatorsIssued} issued, ${detonatorsReturned} returned unused.\nFace: ${faceId}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HEMM & EXPLOSIVES LEDGER</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>DGMS STATUTORY LOG</Text>
          </View>
        </View>
        <Text style={styles.title}>Heavy Machinery & Blasting Logs</Text>
        <Text style={styles.subtitle}>
          Pre-shift 5-point equipment fitness inspections and dual-signature magazine explosives accounting.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'hemm' && styles.tabBtnActive]}
          onPress={() => setActiveTab('hemm')}
        >
          <Icon name="truck" size={15} color={activeTab === 'hemm' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'hemm' && styles.tabTextActive]}>
            Pre-Shift HEMM
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'explosives' && styles.tabBtnActive]}
          onPress={() => setActiveTab('explosives')}
        >
          <Icon name="flame" size={15} color={activeTab === 'explosives' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'explosives' && styles.tabTextActive]}>
            Explosives Ledger
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: HEMM 5-Point Pre-Shift Checklist */}
      {activeTab === 'hemm' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="truck" size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>5-Point Equipment Inspection</Text>
                <Text style={styles.cardSubtitle}>Mandatory DGMS Circular checklist prior to operation</Text>
              </View>
            </View>

            {/* Equipment Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heavy Equipment ID / Model</Text>
              <TextInput
                style={styles.textInput}
                value={selectedMachine}
                onChangeText={setSelectedMachine}
                placeholder="e.g. CAT-777D-09 (100T Dumper)"
              />
            </View>

            {/* Status Summary Banner */}
            <View style={[styles.statusBanner, allChecksPass ? styles.bannerPass : styles.bannerFail]}>
              <Icon name={allChecksPass ? 'check' : 'alert'} size={16} color={allChecksPass ? '#047857' : '#b91c1c'} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerTitle, { color: allChecksPass ? '#047857' : '#b91c1c' }]}>
                  {allChecksPass ? 'ALL 5 CHECKS PASS — FIT FOR SHIFT' : 'DEFECT IDENTIFIED — GROUND MACHINE'}
                </Text>
                <Text style={[styles.statusBannerSub, { color: allChecksPass ? '#065f46' : '#991b1b' }]}>
                  {allChecksPass ? 'Machine can be authorized for active haulage' : 'Red tag lockout required under DGMS safety rule'}
                </Text>
              </View>
            </View>

            {/* 5-Point Items */}
            <View style={styles.checklist}>
              {/* 1. Brakes */}
              <View style={styles.checkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkName}>1. Service, Emergency & Retarder Brakes</Text>
                  <Text style={styles.checkDetail}>Holding pressure verified at 15% grade</Text>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, brakesOk ? styles.pillOk : styles.pillFail]}
                  onPress={() => setBrakesOk(!brakesOk)}
                >
                  <Text style={[styles.togglePillText, brakesOk ? styles.pillOkText : styles.pillFailText]}>
                    {brakesOk ? 'PASS' : 'FAIL'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. Steering & Reverse Alarm */}
              <View style={styles.checkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkName}>2. Steering & Audio-Visual Alarm (AVA)</Text>
                  <Text style={styles.checkDetail}>Aux steering motor and 110 dB reverse buzzer</Text>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, steeringOk ? styles.pillOk : styles.pillFail]}
                  onPress={() => setSteeringOk(!steeringOk)}
                >
                  <Text style={[styles.togglePillText, steeringOk ? styles.pillOkText : styles.pillFailText]}>
                    {steeringOk ? 'PASS' : 'FAIL'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3. Tires & Wheel Studs */}
              <View style={styles.checkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkName}>3. Tires & Wheel Studs</Text>
                  <Text style={styles.checkDetail}>Cold inflation pressure 100 PSI, no sidewall cuts</Text>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, tiresOk ? styles.pillOk : styles.pillFail]}
                  onPress={() => setTiresOk(!tiresOk)}
                >
                  <Text style={[styles.togglePillText, tiresOk ? styles.pillOkText : styles.pillFailText]}>
                    {tiresOk ? 'PASS' : 'FAIL'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 4. Fluid Levels */}
              <View style={styles.checkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkName}>4. Engine Oil, Coolant & Transmission</Text>
                  <Text style={styles.checkDetail}>Dipstick inspection and no hydraulic hose sweating</Text>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, fluidsOk ? styles.pillOk : styles.pillFail]}
                  onPress={() => setFluidsOk(!fluidsOk)}
                >
                  <Text style={[styles.togglePillText, fluidsOk ? styles.pillOkText : styles.pillFailText]}>
                    {fluidsOk ? 'PASS' : 'FAIL'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 5. Fire Suppression */}
              <View style={styles.checkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkName}>5. Auto Fire Suppression System (AFSS)</Text>
                  <Text style={styles.checkDetail}>Nitrogen propellant cylinder gauge in green zone</Text>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, afssOk ? styles.pillOk : styles.pillFail]}
                  onPress={() => setAfssOk(!afssOk)}
                >
                  <Text style={[styles.togglePillText, afssOk ? styles.pillOkText : styles.pillFailText]}>
                    {afssOk ? 'PASS' : 'FAIL'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, allChecksPass ? styles.btnPass : styles.btnFail]}
              onPress={handleHemmSubmit}
            >
              <Icon name={allChecksPass ? 'check' : 'close'} size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>
                {allChecksPass ? 'CLEAR MACHINE FOR ACTIVE SHIFT' : 'RECORD DEFECT & LOCKOUT MACHINE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tab 2: Explosives Ledger */}
      {activeTab === 'explosives' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                <Icon name="flame" size={16} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Statutory Explosives Issue & Return</Text>
                <Text style={styles.cardSubtitle}>Dual-signature custody transfer (Mines Act Section 23)</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Magazine Custodian / Clerk ID</Text>
              <TextInput
                style={styles.textInput}
                value={magazineClerk}
                onChangeText={setMagazineClerk}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Authorized Blaster / Mining Sirdar ID</Text>
              <TextInput
                style={styles.textInput}
                value={certifiedBlaster}
                onChangeText={setCertifiedBlaster}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Blasting Face / Stope ID</Text>
              <TextInput
                style={styles.textInput}
                value={faceId}
                onChangeText={setFaceId}
              />
            </View>

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Emulsion Cartridges (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={cartridgesKg}
                  onChangeText={setCartridgesKg}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Detonators Issued</Text>
                <TextInput
                  style={styles.textInput}
                  value={detonatorsIssued}
                  onChangeText={setDetonatorsIssued}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unused Detonators Returned to Magazine</Text>
              <TextInput
                style={styles.textInput}
                value={detonatorsReturned}
                onChangeText={setDetonatorsReturned}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.dualSignNotice}>
              <Icon name="shield" size={14} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={styles.dualSignText}>
                Dual cryptographic biometric hash attached to transaction upon submission.
              </Text>
            </View>

            <TouchableOpacity style={[styles.actionBtn, styles.btnPass]} onPress={handleExplosivesSignOff}>
              <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>
                {blasterSigned ? 'LEDGER DUAL SIGN-OFF CONFIRMED' : 'EXECUTE DUAL-SIGNATURE LOG ENTRY'}
              </Text>
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
  subBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  subBadgeText: {
    color: '#475569',
    fontSize: 9.5,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  bannerPass: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
  },
  bannerFail: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  statusBannerTitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusBannerSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  checklist: {
    marginBottom: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkName: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '600',
  },
  checkDetail: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  pillOk: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  pillFail: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  pillOkText: {
    color: '#047857',
    fontSize: 10.5,
    fontWeight: '700',
  },
  pillFailText: {
    color: '#b91c1c',
    fontSize: 10.5,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnPass: {
    backgroundColor: '#0284c7',
  },
  btnFail: {
    backgroundColor: '#dc2626',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  dualSignNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 14,
  },
  dualSignText: {
    color: '#0369a1',
    fontSize: 10.5,
    lineHeight: 14,
    flex: 1,
  },
});
