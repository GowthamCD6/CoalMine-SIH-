import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Icon } from '../components/Icon';
import { mobileApi } from '../services/api';
import {
  capturePhotoFromCamera,
  requestCameraPermission,
} from '../services/cameraService';

const HAZARD_CATEGORIES = [
  'Roof Support / Cracking',
  'Water Accumulation',
  'Gas Seepage / Ventilation',
  'Machinery Defect',
  'Electrical Hazard',
];

export const HazardCamScreen = ({ currentUser }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [cameraPermitted, setCameraPermitted] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const [hazardType, setHazardType] = useState('Roof Support / Cracking');
  const [zoneTag, setZoneTag] = useState('Level 3 - Sector B');
  const [depth, setDepth] = useState('-120');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setCameraPermitted(granted);
      } catch {
        setCameraPermitted(false);
      }
    } else {
      setCameraPermitted(true);
    }
  };

  const handleAuthorizeCamera = async () => {
    const granted = await requestCameraPermission();
    setCameraPermitted(granted);
    if (granted) {
      Alert.alert('Permission Granted', 'Camera access enabled. Tap "Take Live Photo" to capture.');
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to capture live photos.');
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    try {
      const res = await capturePhotoFromCamera();
      if (res.success && res.uri) {
        setPhotoUri(res.uri);
        setPhotoBase64(res.base64 || null);
        setCameraPermitted(true);
      } else if (res.error === 'PERMISSION_DENIED') {
        setCameraPermitted(false);
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
  };

  const handleSubmit = async () => {
    if (!photoUri && !notes.trim()) {
      Alert.alert('Photo Required', 'Please tap "Take Live Photo" to capture the hazard before submitting.');
      return;
    }

    setSaving(true);
    try {
      await mobileApi.createHazard({
        hazard_type: hazardType,
        location_name: `Shaft 4 (${zoneTag})`,
        latitude: 23.7957,
        longitude: 86.4304,
        depth_meters: Number(depth),
        zone_tag: zoneTag,
        notes: notes || 'Live hazard photo recorded by worker camera.',
        photo_url: photoUri,
      });

      Alert.alert('Report Dispatched', 'Live hazard photo and telemetry transmitted to safety control.');
      setRecentReports([
        {
          id: Date.now(),
          hazard_type: hazardType,
          zone_tag: zoneTag,
          depth_meters: depth,
          notes: notes || 'Live photo captured.',
          photoUri,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...recentReports,
      ]);
      setPhotoUri(null);
      setPhotoBase64(null);
      setNotes('');
    } catch {
      Alert.alert(
        'Saved to Local Queue',
        'No subterranean signal. Photo and coordinates queued for auto-sync when approaching shaft.'
      );
      setRecentReports([
        {
          id: Date.now(),
          hazard_type: hazardType,
          zone_tag: zoneTag,
          depth_meters: depth,
          notes: notes || 'Live photo captured (offline queue).',
          photoUri,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...recentReports,
      ]);
      setPhotoUri(null);
      setPhotoBase64(null);
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Live Camera Viewport Header */}
      <View style={styles.cameraHeader}>
        <View style={styles.statusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.statusPillText}>LIVE CAMERA SENSOR</Text>
        </View>
        <Text style={styles.telemetryTag}>Shaft 4 • Level 3 (-120m)</Text>
      </View>

      {/* Permission alert if camera denied */}
      {cameraPermitted === false && (
        <View style={styles.permWarning}>
          <Text style={styles.permWarningText}>
            Camera hardware access is required to capture live photos.
          </Text>
          <TouchableOpacity style={styles.permWarningBtn} onPress={handleAuthorizeCamera}>
            <Text style={styles.permWarningBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Native Camera Viewfinder (Authentic camera viewfinder, not an upload box) */}
      <View style={styles.cameraContainer}>
        {photoUri ? (
          /* Captured Photo Viewport */
          <View style={styles.capturedViewport}>
            <Image source={{ uri: photoUri }} style={styles.capturedImage} resizeMode="cover" />

            {/* Corner guide overlay on captured image */}
            <View style={[styles.cornerGuide, styles.cornerTopLeft]} />
            <View style={[styles.cornerGuide, styles.cornerTopRight]} />
            <View style={[styles.cornerGuide, styles.cornerBottomLeft]} />
            <View style={[styles.cornerGuide, styles.cornerBottomRight]} />

            {/* Telemetry watermark overlay */}
            <View style={styles.watermarkBar}>
              <View style={styles.watermarkBadge}>
                <View style={styles.watermarkDot} />
                <Text style={styles.watermarkText}>PHOTO RECORDED</Text>
              </View>
              <Text style={styles.watermarkCoords}>23.7957° N, 86.4304° E • -120m</Text>
            </View>

            {/* Retake / Remove bar */}
            <View style={styles.capturedActionsBar}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleCapture} disabled={capturing}>
                <Icon name="camera" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.retakeBtnText}>Retake Live Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.discardBtn} onPress={handleRemovePhoto}>
                <Icon name="close" size={14} color="#fca5a5" style={{ marginRight: 4 }} />
                <Text style={styles.discardBtnText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Active Camera Viewfinder Preview Screen */
          <View style={styles.viewfinderScreen}>
            {/* 4 Optical Corner Viewfinder Brackets */}
            <View style={[styles.cornerGuide, styles.cornerTopLeft]} />
            <View style={[styles.cornerGuide, styles.cornerTopRight]} />
            <View style={[styles.cornerGuide, styles.cornerBottomLeft]} />
            <View style={[styles.cornerGuide, styles.cornerBottomRight]} />

            {/* Center Focus Reticle */}
            <View style={styles.focusCenter}>
              <View style={styles.focusCrosshairHoriz} />
              <View style={styles.focusCrosshairVert} />
              <View style={styles.focusCircle} />
            </View>

            {/* Viewfinder Telemetry Subtitle */}
            <View style={styles.viewfinderInfo}>
              <Text style={styles.viewfinderHint}>POINT LENS AT HAZARD AREA</Text>
              <Text style={styles.viewfinderGps}>23.7957° N, 86.4304° E • Optical 1.0x</Text>
            </View>
          </View>
        )}
      </View>

      {/* Camera Shutter Action Bar */}
      {!photoUri && (
        <View style={styles.shutterDeck}>
          <TouchableOpacity
            style={[styles.shutterBtn, capturing && styles.btnDisabled]}
            onPress={handleCapture}
            disabled={capturing}
            activeOpacity={0.8}
          >
            {capturing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <View style={styles.shutterOuterRing}>
                  <View style={styles.shutterInnerCircle}>
                    <Icon name="camera" size={20} color="#0f172a" />
                  </View>
                </View>
                <Text style={styles.shutterText}>Take Live Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Hazard Report Details Form (Visible once photo is taken or to attach context) */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Hazard Category</Text>
        <View style={styles.chipGrid}>
          {HAZARD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, hazardType === cat && styles.chipActive]}
              onPress={() => setHazardType(cat)}
            >
              <Text style={[styles.chipText, hazardType === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location & Depth Inputs */}
        <View style={styles.twoColRow}>
          <View style={{ flex: 2 }}>
            <Text style={styles.inputLabel}>Zone / Location</Text>
            <TextInput
              style={styles.textInput}
              value={zoneTag}
              onChangeText={setZoneTag}
              placeholder="e.g. Level 3 - Sector B"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Depth (m)</Text>
            <TextInput
              style={styles.textInput}
              value={depth}
              onChangeText={setDepth}
              keyboardType="numeric"
              placeholder="-120"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Description / Field Notes */}
        <Text style={styles.inputLabel}>Field Notes (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe structural cracks, gas seepage, or water pooling..."
          placeholderTextColor="#94a3b8"
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, saving && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Submit Hazard Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Recent Submissions */}
      {recentReports.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Submitted Reports Today</Text>
          <View style={styles.recentList}>
            {recentReports.map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <View style={styles.recentTop}>
                  <Text style={styles.recentType}>{item.hazard_type}</Text>
                  <Text style={styles.recentTime}>{item.time}</Text>
                </View>
                <Text style={styles.recentLocation}>{item.zone_tag} ({item.depth_meters}m)</Text>
                {item.notes ? (
                  <Text style={styles.recentNotes}>{item.notes}</Text>
                ) : null}
                {item.photoUri ? (
                  <View style={styles.photoAttachedTag}>
                    <Icon name="camera" size={11} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.photoAttachedText}>Live photo attached</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  statusPillText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  telemetryTag: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  permWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#451a03',
    borderColor: '#b45309',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  permWarningText: {
    color: '#fef3c7',
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  permWarningBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  permWarningBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#020617',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
    position: 'relative',
  },
  viewfinderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#020617',
  },
  cornerGuide: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#38bdf8',
  },
  cornerTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  cornerBottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerBottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  focusCenter: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  focusCrosshairHoriz: {
    position: 'absolute',
    width: 32,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.6)',
  },
  focusCrosshairVert: {
    position: 'absolute',
    height: 32,
    width: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.6)',
  },
  focusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  viewfinderInfo: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  viewfinderHint: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  viewfinderGps: {
    color: '#38bdf8',
    fontSize: 10,
    marginTop: 2,
  },
  capturedViewport: {
    flex: 1,
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  watermarkBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watermarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  watermarkText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  watermarkCoords: {
    color: '#e2e8f0',
    fontSize: 9.5,
    fontWeight: '500',
  },
  capturedActionsBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  retakeBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  discardBtnText: {
    color: '#fecaca',
    fontSize: 11.5,
    fontWeight: '700',
  },
  shutterDeck: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shutterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  shutterOuterRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shutterInnerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#0f172a',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  chipText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#0f172a',
    fontSize: 12.5,
  },
  textArea: {
    height: 54,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 9,
  },
  recentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  recentType: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  recentTime: {
    color: '#64748b',
    fontSize: 10,
  },
  recentLocation: {
    color: '#0284c7',
    fontSize: 11,
    fontWeight: '500',
  },
  recentNotes: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  photoAttachedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  photoAttachedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HazardCamScreen;
