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

export const FormJScreen = ({ currentUser, onNavigate }) => {
  const [incidentType, setIncidentType] = useState('Near-Miss / High Potential');
  const [seamLocation, setSeamLocation] = useState('Seam III • Panel 4 West (Depth -180m)');
  const [injurySeverity, setInjurySeverity] = useState('Nil Injury (Near Miss)');
  const [eyewitness, setEyewitness] = useState('');
  const [cause, setCause] = useState('Roof Spalling / Delamination');
  const [immediateAction, setImmediateAction] = useState('Barricaded gallery & installed 4 hydraulic props');
  const [submitted, setSubmitted] = useState(false);

  const INCIDENT_TYPES = [
    'Near-Miss / High Potential',
    'Minor First Aid Injury',
    'Reportable Injury (>72h Absence)',
    'Serious Bodily Injury',
    'Dangerous Occurrence (Gas/Inrush)',
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert(
      'Form J Statutory Notice Logged',
      `Accident notice under Regulation 8/Mines Act Sec 23 filed successfully.\n\nSeverity: ${incidentType}\nLocation: ${seamLocation}\nLogged by: ${currentUser?.username || 'Worker'}\nDispatched to Internal Safety Organization (ISO) & DGMS Zonal Office.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DGMS STATUTORY FORM J</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>MINES ACT 1952</Text>
          </View>
        </View>
        <Text style={styles.title}>Digital Form J (Accident & Near-Miss)</Text>
        <Text style={styles.subtitle}>
          Statutory notification of accidents, hazardous occurrences, eyewitness statements, and immediate corrective controls.
        </Text>
      </View>

      {/* Quick Camera Link for Near-Miss Photo */}
      <TouchableOpacity
        style={styles.camLinkCard}
        onPress={() => onNavigate && onNavigate('hazard-cam')}
      >
        <View style={styles.camIconBox}>
          <Icon name="camera" size={20} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.camCardTitle}>Attach Optical Hazard Evidence</Text>
          <Text style={styles.camCardSub}>
            Snap photos of unstable roofs, ventilation issues or water accumulation with GPS HUD.
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color="#0284c7" />
      </TouchableOpacity>

      {/* Form J Step-by-Step */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <Icon name="clipboard" size={16} color="#0284c7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Incident Classification</Text>
            <Text style={styles.cardSubtitle}>Select statutory incident severity tier</Text>
          </View>
        </View>

        <View style={styles.pillSelector}>
          {INCIDENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.pillOption, incidentType === type && styles.pillOptionActive]}
              onPress={() => setIncidentType(type)}
            >
              <Text style={[styles.pillOptionText, incidentType === type && styles.pillOptionTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location & Seam */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Exact Mine Stope / Seam Location</Text>
          <TextInput
            style={styles.textInput}
            value={seamLocation}
            onChangeText={setSeamLocation}
            placeholder="e.g. Seam III • Panel 4 West"
          />
        </View>

        {/* Cause / Mechanism */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nature / Cause of Incident</Text>
          <TextInput
            style={styles.textInput}
            value={cause}
            onChangeText={setCause}
            placeholder="e.g. Roof Spalling, Heavy Haulage, Gas Pockets"
          />
        </View>

        {/* Eyewitness Statement */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Eyewitness Statement & Worker Names</Text>
          <TextInput
            style={[styles.textInput, { height: 60 }]}
            value={eyewitness}
            onChangeText={setEyewitness}
            placeholder="Names of workers present and their primary observations..."
            multiline
          />
        </View>

        {/* Corrective Action */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Immediate Corrective Actions Taken</Text>
          <TextInput
            style={[styles.textInput, { height: 60 }]}
            value={immediateAction}
            onChangeText={setImmediateAction}
            placeholder="Immediate steps executed to isolate the danger..."
            multiline
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>
            {submitted ? 'STATUTORY FORM J RECORDED' : 'SUBMIT STATUTORY FORM J LOG'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 14,
    ...theme.cardShadow,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#dc2626',
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
  camLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  camIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  camCardTitle: {
    color: '#0369a1',
    fontSize: 12.5,
    fontWeight: '700',
  },
  camCardSub: {
    color: '#0284c7',
    fontSize: 10.5,
    marginTop: 2,
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
    backgroundColor: '#f1f5f9',
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
  pillSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  pillOption: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillOptionActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  pillOptionText: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
  },
  pillOptionTextActive: {
    color: '#0284c7',
    fontWeight: '700',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
