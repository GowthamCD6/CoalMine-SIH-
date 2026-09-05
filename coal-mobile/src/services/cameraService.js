import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

/**
 * Request system camera permission on Android.
 */
export async function requestCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (check) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Access Required',
        message:
          'CoalMobile requires camera access to photograph subterranean structural hazards and scan physical shift ledgers.',
        buttonNeutral: 'Ask Later',
        buttonNegative: 'Deny',
        buttonPositive: 'Grant Access',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission check error:', err);
    return false;
  }
}

/**
 * Capture a photo using the native device camera.
 */
export async function capturePhotoFromCamera(options = {}) {
  const hasPermission = await requestCameraPermission();

  if (!hasPermission) {
    Alert.alert(
      'Camera Permission Required',
      'Please allow camera permissions so CoalMobile can capture optical hazard evidence.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return { success: false, error: 'PERMISSION_DENIED' };
  }

  const defaultOptions = {
    mediaType: 'photo',
    cameraType: 'back',
    quality: 0.85,
    saveToPhotos: false,
    includeBase64: true,
    ...options,
  };

  try {
    const result = await launchCamera(defaultOptions);

    if (result.didCancel) {
      return { success: false, cancelled: true };
    }

    if (result.errorCode) {
      return { success: false, error: result.errorMessage || result.errorCode };
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        success: true,
        uri: asset.uri,
        base64: asset.base64,
        fileName: asset.fileName || `hazard_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
      };
    }

    return { success: false, error: 'NO_IMAGE_CAPTURED' };
  } catch (err) {
    console.warn('launchCamera error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Pick an existing photo from the device image gallery / files.
 */
export async function pickPhotoFromGallery(options = {}) {
  const defaultOptions = {
    mediaType: 'photo',
    quality: 0.85,
    includeBase64: true,
    ...options,
  };

  try {
    const result = await launchImageLibrary(defaultOptions);

    if (result.didCancel) {
      return { success: false, cancelled: true };
    }

    if (result.errorCode) {
      return { success: false, error: result.errorMessage || result.errorCode };
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        success: true,
        uri: asset.uri,
        base64: asset.base64,
        fileName: asset.fileName || `gallery_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
      };
    }

    return { success: false, error: 'NO_IMAGE_SELECTED' };
  } catch (err) {
    console.warn('launchImageLibrary error:', err);
    return { success: false, error: err.message };
  }
}
