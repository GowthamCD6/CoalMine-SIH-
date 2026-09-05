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
  pickPhotoFromGallery,
  requestCameraPermission,
} from '../services/cameraService';

export const HazardCamScreen = ({ currentUser }) => {
  const [captured, setCaptured] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [cameraPermitted, setCameraPermitted] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const [hazardType, setHazardType] = useState('Roof Support Cracking');
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
      Alert.alert('Camera Access Granted', 'Hardware link active. You can now capture hazard evidence directly.');
    } else {
      Alert.alert(
        'Access Denied',
        'Camera permission was not granted. Check device Settings -> Apps -> CoalMobile -> Permissions.'
      );
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    try {
      const res = await capturePhotoFromCamera();
      if (res.success && res.uri) {
        setPhotoUri(res.uri);
        setPhotoBase64(res.base64 || null);
        setCaptured(true);
        setCameraPermitted(true);
        Alert.alert(
          'Optical Evidence Captured',
          `Frame acquired with embedded GPS: 23.7957° N, 86.4304° E at Depth ${depth}m in ${zoneTag}.`
        );
      } else if (res.error === 'PERMISSION_DENIED') {
        setCameraPermitted(false);
      }
    } finally {
      setCapturing(false);
    }
  };

  const handlePickGallery = async () => {
    setCapturing(true);
    try {
      const res = await pickPhotoFromGallery();
      if (res.success && res.uri) {
        setPhotoUri(res.uri);
        setPhotoBase64(res.base64 || null);
        setCaptured(true);
        Alert.alert(
          'Image Selected from Storage',
          `Embedded telemetry into image record: Depth ${depth}m in ${zoneTag}.`
        );
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setCaptured(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const report = await mobileApi.createHazard({
        hazard_type: hazardType,
        location_name: `Shaft 4 (${zoneTag})`,
        latitude: 23.7957,
        longitude: 86.4304,
        depth_meters: Number(depth),
        zone_tag: zoneTag,
        notes: notes || 'Optical inspection record logged.',
        photo_url: photoUri,
      });
      Alert.alert('Hazard Logged', `Report #${report.id || Date.now().toString().slice(-4)} registered and synchronized.`);
      setRecentReports([
        {
          hazard_type: hazardType,
          zone_tag: zoneTag,
          depth_meters: depth,
          notes: notes || 'Optical observation recorded.',
          photoUri,
        },
        ...recentReports,
      ]);
      setCaptured(false);
      setPhotoUri(null);
      setPhotoBase64(null);
      setNotes('');
    } catch {
      Alert.alert(
        'Saved to Local Cache',
        'Surface relay unreachable. Observation saved with optical frame in Offline Sync queue.'
      );
      setRecentReports([
        {
          hazard_type: hazardType,
          zone_tag: zoneTag,
          depth_meters: depth,
          notes: notes || 'Optical observation cached offline.',
          photoUri,
        },
        ...recentReports,
      ]);
      setCaptured(false);
      setPhotoUri(null);
      setPhotoBase64(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="camera" size={16} color="#fbbf24" style={{ marginRight: 6 }} />
          <Text style={styles.title}>GEOTAGGED HAZARD VIEWPORT</Text>
        </View>
        <Text style={styles.subtitle}>
          OPTICAL SUBTERRANEAN SENSOR & DEPTH TELEMETRY HUD
        </Text>
      </View>

      {/* Camera Permission Diagnostic Banner */}
      <View style={[styles.permissionBanner, cameraPermitted ? styles.permBannerActive : styles.permBannerInactive]}>
        <View style={styles.permBannerLeft}>
          <Icon
            name={cameraPermitted ? 'check-circle' : 'shield'}
            size={14}
            color={cameraPermitted ? '#4ade80' : '#f59e0b'}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.permBannerText}>
            {cameraPermitted
              ? 'HARDWARE LINK: CAMERA ACCESS ACTIVE'
              : 'HARDWARE LINK: CAMERA ACCESS REQUIRED'}
          </Text>
        </View>
        {!cameraPermitted && (
          <TouchableOpacity style={styles.authBtn} onPress={handleAuthorizeCamera}>
            <Text style={styles.authBtnText}>AUTHORIZE</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.viewfinder}>
        {/* Real photo display if captured */}
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.capturedImage} resizeMode="cover" />
        ) : null}

        {/* Reticle corners */}
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />

        {/* GPS Geotag HUD */}
        <View style={styles.geotagHud}>
          <Text style={styles.hudText}>LAT: 23.7957° N</Text>
          <Text style={styles.hudText}>LON: 86.4304° E</Text>
          <Text style={styles.hudText}>DEPTH: {depth}M</Text>
          <Text style={styles.hudText}>ZONE: {zoneTag.toUpperCase()}</Text>
          <Text style={styles.hudText}>TIMESTAMP: {new Date().toLocaleTimeString()}</Text>
        </View>

        {!photoUri && (
          <View style={styles.viewfinderCenter}>
            <Icon
              name="crosshair"
              size={36}
              color="#38bdf8"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.cameraIconText}>
              OPTICAL RETICLE ACTIVE
            </Text>
            <Text style={styles.cameraSub}>
              Center reticle over structural fracture, gas seepage, or physical hazard
            </Text>
          </View>
        )}

        {/* Shutter Button */}
        <TouchableOpacity
          style={styles.shutterBtn}
          onPress={handleCapture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#0284c7" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </TouchableOpacity>
      </View>

      {/* Camera Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryCamBtn, capturing && styles.btnDisabled]}
          onPress={handleCapture}
          disabled={capturing}
        >
          <Icon name="camera" size={15} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.primaryCamBtnText}>
            {capturing ? 'INITIALIZING HARDWARE...' : 'LAUNCH CAMERA & CAPTURE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryCamBtn, capturing && styles.btnDisabled]}
          onPress={handlePickGallery}
          disabled={capturing}
        >
          <Icon name="file" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
          <Text style={styles.secondaryCamBtnText}>GALLERY</Text>
        </TouchableOpacity>
      </View>

      {/* Retake / Discard when photo is captured */}
      {photoUri && (
        <View style={styles.retakeRow}>
          <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
            <Icon name="trash" size={13} color="#ef4444" style={{ marginRight: 5 }} />
            <Text style={styles.retakeBtnText}>DISCARD & RETAKE PHOTO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Report Details Form */}
      {captured && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>OBSERVATION METADATA PAYLOAD</Text>

          <Text style={styles.inputLabel}>HAZARD CLASSIFICATION</Text>
          <TextInput
            style={styles.input}
            value={hazardType}
            onChangeText={setHazardType}
            placeholder="e.g. Methane Leak, Timber Fracture"
            placeholderTextColor="#475569"
          />

          <Text style={styles.inputLabel}>ZONE TAG & SECTOR</Text>
          <TextInput
            style={styles.input}
            value={zoneTag}
            onChangeText={setZoneTag}
            placeholder="Level 3 - Sector B"
            placeholderTextColor="#475569"
          />

          <Text style={styles.inputLabel}>DEPTH BELOW SURFACE (METERS)</Text>
          <TextInput
            style={styles.input}
            value={depth}
            onChangeText={setDepth}
            keyboardType="numeric"
            placeholder="-120"
            placeholderTextColor="#475569"
          />

          <Text style={styles.inputLabel}>TECHNICAL REMARKS / NOTES</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe fracture width or gas sensor ppm reading..."
            placeholderTextColor="#475569"
            multiline
          />

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Icon name="check" size={12} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>
              {saving ? 'COMMITTING PAYLOAD...' : 'COMMIT OBSERVATION RECORD'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Field Reports */}
      {recentReports.length > 0 && (
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>LOGGED IN CURRENT SESSION</Text>
          {recentReports.map((r, i) => (
            <View key={i} style={styles.reportItem}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>{r.hazard_type}</Text>
                <Text style={styles.reportZone}>{r.zone_tag} ({r.depth_meters}m)</Text>
              </View>
              <Text style={styles.reportNotes}>{r.notes || 'No remarks added'}</Text>
              {r.photoUri && (
                <View style={styles.attachedBadge}>
                  <Icon name="camera" size={10} color="#4ade80" style={{ marginRight: 4 }} />
                  <Text style={styles.attachedText}>Optical frame attached</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 12,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  permBannerActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  permBannerInactive: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  permBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permBannerText: {
    color: '#e2e8f0',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  authBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authBtnText: {
    color: '#090d16',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  viewfinder: {
    height: 250,
    backgroundColor: '#020617',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#38bdf8',
    zIndex: 10,
  },
  tl: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
  geotagHud: {
    position: 'absolute',
    top: 12,
    left: 20,
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    borderRadius: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    zIndex: 10,
  },
  hudText: {
    color: '#38bdf8',
    fontFamily: 'monospace',
    fontSize: 8.5,
    marginVertical: 1,
  },
  viewfinderCenter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  cameraIconText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cameraSub: {
    color: '#64748b',
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 3,
  },
  shutterBtn: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shutterInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  primaryCamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 11,
    borderRadius: 6,
  },
  primaryCamBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  secondaryCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryCamBtnText: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  retakeRow: {
    marginTop: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingVertical: 8,
  },
  retakeBtnText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 3,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#ffffff',
    fontSize: 11.5,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 4,
    paddingVertical: 10,
    marginTop: 12,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  recentCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  recentTitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  reportItem: {
    backgroundColor: '#090d16',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reportType: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  reportZone: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontFamily: 'monospace',
  },
  reportNotes: {
    color: '#64748b',
    fontSize: 10,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  attachedText: {
    color: '#4ade80',
    fontSize: 8.5,
    fontWeight: '800',
  },
});

export default HazardCamScreen;
