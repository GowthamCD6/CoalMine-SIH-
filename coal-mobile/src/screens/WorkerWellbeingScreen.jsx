import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

export const WorkerWellbeingScreen = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('pme'); // 'pme' | 'payslip'

  const handleDownloadPaySlip = () => {
    Alert.alert(
      'Pay Slip Downloaded',
      'August 2026 Form B/C/D Wage Statement encrypted and stored in local device downloads.'
    );
  };

  const handleSchedulePme = () => {
    Alert.alert(
      'PME Hospital Appointment Request',
      'Appointment request submitted to Zonal Central Hospital (Sanctoria). Occupational Health Officer will confirm slot.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OCCUPATIONAL HEALTH & WELFARE</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>RULE 29B COMPLIANCE</Text>
          </View>
        </View>
        <Text style={styles.title}>Worker Well-being & Wages</Text>
        <Text style={styles.subtitle}>
          Mandatory DGMS Periodical Medical Examination (PME) alerts, wage breakdowns, overtime, and leave balances.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pme' && styles.tabBtnActive]}
          onPress={() => setActiveTab('pme')}
        >
          <Icon name="heart" size={15} color={activeTab === 'pme' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'pme' && styles.tabTextActive]}>
            PME Health Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'payslip' && styles.tabBtnActive]}
          onPress={() => setActiveTab('payslip')}
        >
          <Icon name="wallet" size={15} color={activeTab === 'payslip' ? '#0284c7' : '#64748b'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'payslip' && styles.tabTextActive]}>
            Pay Slip & Leaves
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: PME Alerts & Occupational Health */}
      {activeTab === 'pme' && (
        <View style={styles.tabContent}>
          {/* Urgent Reminder Card */}
          <View style={styles.pmeCard}>
            <View style={styles.pmeCardHeader}>
              <View style={styles.pmeIconBox}>
                <Icon name="heart" size={18} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pmeCardTitle}>MANDATORY PME DUE IN 38 DAYS</Text>
                <Text style={styles.pmeCardSub}>Due by: 14-Oct-2026 • Mines Rules 1955 Rule 29B</Text>
              </View>
            </View>
            <Text style={styles.pmeWarningBody}>
              Failure to complete periodical medical examination before deadline legally bars personnel from entering any subterranean mine working.
            </Text>
            <TouchableOpacity style={styles.pmeActionBtn} onPress={handleSchedulePme}>
              <Icon name="check" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.pmeActionBtnText}>SCHEDULE PME CLINICAL APPOINTMENT</Text>
            </TouchableOpacity>
          </View>

          {/* Current Fitness Clearance */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="shield" size={16} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Medical Fitness Record</Text>
                <Text style={styles.cardSubtitle}>Certified Fit for Subterranean Coal Seams</Text>
              </View>
            </View>

            <View style={styles.examList}>
              <View style={styles.examRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examName}>Chest Radiograph (X-Ray)</Text>
                  <Text style={styles.examDetail}>ILO Classification for Pneumoconiosis: 0/0 (Clear)</Text>
                </View>
                <View style={styles.statusPillPass}>
                  <Text style={styles.statusPassText}>FIT</Text>
                </View>
              </View>

              <View style={styles.examRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examName}>Audiometric Screening</Text>
                  <Text style={styles.examDetail}>Hearing acuity normal across industrial frequencies</Text>
                </View>
                <View style={styles.statusPillPass}>
                  <Text style={styles.statusPassText}>FIT</Text>
                </View>
              </View>

              <View style={styles.examRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examName}>Spirometry (Lung Function)</Text>
                  <Text style={styles.examDetail}>FEV1/FVC Ratio: 92% of predicted capacity</Text>
                </View>
                <View style={styles.statusPillPass}>
                  <Text style={styles.statusPassText}>FIT</Text>
                </View>
              </View>

              <View style={styles.examRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examName}>Cardiovascular Fitness (ECG)</Text>
                  <Text style={styles.examDetail}>Normal sinus rhythm; blood pressure 122/80 mmHg</Text>
                </View>
                <View style={styles.statusPillPass}>
                  <Text style={styles.statusPassText}>FIT</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Tab 2: Pay Slip & Leave Tracker */}
      {activeTab === 'payslip' && (
        <View style={styles.tabContent}>
          {/* Monthly Wage Breakdown Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Icon name="wallet" size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Monthly Wage Breakdown</Text>
                <Text style={styles.cardSubtitle}>Month: August 2026 • Form B Electronic Wage Sheet</Text>
              </View>
            </View>

            <View style={styles.salarySummary}>
              <Text style={styles.netLabel}>NET DISBURSED WAGE</Text>
              <Text style={styles.netAmount}>₹46,120.00</Text>
              <Text style={styles.netSub}>Credited via ECS to Bank Account • Form B Compliant</Text>
            </View>

            <View style={styles.wageItemsList}>
              <View style={styles.wageRow}>
                <Text style={styles.wageItemLabel}>Basic Wage (NCWA-XI)</Text>
                <Text style={styles.wageItemVal}>₹32,400.00</Text>
              </View>
              <View style={styles.wageRow}>
                <Text style={styles.wageItemLabel}>Underground Risk Allowance</Text>
                <Text style={styles.wageItemVal}>₹8,100.00</Text>
              </View>
              <View style={styles.wageRow}>
                <Text style={styles.wageItemLabel}>Variable Dearness Allowance (VDA)</Text>
                <Text style={styles.wageItemVal}>₹6,240.00</Text>
              </View>
              <View style={styles.wageRow}>
                <Text style={styles.wageItemLabel}>Safety & Shift Bonus</Text>
                <Text style={styles.wageItemVal}>₹3,500.00</Text>
              </View>
              <View style={[styles.wageRow, { borderBottomColor: '#cbd5e1' }]}>
                <Text style={[styles.wageItemLabel, { color: '#dc2626' }]}>PF & Statutory Deductions</Text>
                <Text style={[styles.wageItemVal, { color: '#dc2626' }]}>- ₹4,120.00</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPaySlip}>
              <Icon name="ocr" size={14} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={styles.downloadBtnText}>DOWNLOAD STATUTORY PAY SLIP (PDF)</Text>
            </TouchableOpacity>
          </View>

          {/* Overtime & Leaves Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Statutory Overtime & Leaves</Text>

            {/* Overtime (Form C) */}
            <View style={styles.otCard}>
              <View style={styles.otRow}>
                <Text style={styles.otLabel}>Form C Overtime Logged</Text>
                <Text style={styles.otHours}>18.5 Hours</Text>
              </View>
              <Text style={styles.otSub}>Computed at double ordinary rate: ₹4,625 earned</Text>
            </View>

            {/* Leave Balances (Form D & E) */}
            <View style={styles.leaveGrid}>
              <View style={styles.leaveBox}>
                <Text style={styles.leaveCount}>14</Text>
                <Text style={styles.leaveType}>Earned Leave (EL)</Text>
              </View>
              <View style={styles.leaveBox}>
                <Text style={styles.leaveCount}>6</Text>
                <Text style={styles.leaveType}>Casual Leave (CL)</Text>
              </View>
              <View style={styles.leaveBox}>
                <Text style={styles.leaveCount}>8</Text>
                <Text style={styles.leaveType}>Sick Leave (SL)</Text>
              </View>
            </View>
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
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#15803d',
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
    marginBottom: 12,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 13.5,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 11,
  },
  pmeCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  pmeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pmeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pmeCardTitle: {
    color: '#b91c1c',
    fontSize: 12.5,
    fontWeight: '800',
  },
  pmeCardSub: {
    color: '#7f1d1d',
    fontSize: 10.5,
    marginTop: 1,
  },
  pmeWarningBody: {
    color: '#991b1b',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  pmeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 6,
  },
  pmeActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  examList: {
    gap: 10,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  examName: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '600',
  },
  examDetail: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 2,
  },
  statusPillPass: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPassText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
  salarySummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  netLabel: {
    color: '#64748b',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  netAmount: {
    color: '#0284c7',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  netSub: {
    color: '#475569',
    fontSize: 10.5,
  },
  wageItemsList: {
    marginBottom: 12,
  },
  wageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  wageItemLabel: {
    color: '#334155',
    fontSize: 11.5,
  },
  wageItemVal: {
    color: '#0f172a',
    fontSize: 11.5,
    fontWeight: '600',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingVertical: 10,
    borderRadius: 6,
  },
  downloadBtnText: {
    color: '#0369a1',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  otCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  otRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otLabel: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '600',
  },
  otHours: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '800',
  },
  otSub: {
    color: '#14532d',
    fontSize: 10.5,
    marginTop: 4,
  },
  leaveGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  leaveBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center',
  },
  leaveCount: {
    color: '#0284c7',
    fontSize: 18,
    fontWeight: '800',
  },
  leaveType: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
