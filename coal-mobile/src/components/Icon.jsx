import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Professional, zero-dependency Industrial Vector Icon Component
 * Renders precision glyphs, geometric stroke badges, and technical markers.
 * Strictly no cartoon emojis.
 */
export const Icon = ({ name, size = 18, color = '#94a3b8', style }) => {
  const s = size;

  switch (name) {
    case 'dashboard':
    case 'chart':
      return (
        <View style={[{ width: s, height: s, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: s * 0.08 }, style]}>
          <View style={{ width: s * 0.22, height: s * 0.45, backgroundColor: color, borderRadius: 1.5 }} />
          <View style={{ width: s * 0.22, height: s * 0.85, backgroundColor: color, borderRadius: 1.5 }} />
          <View style={{ width: s * 0.22, height: s * 0.65, backgroundColor: color, borderRadius: 1.5 }} />
        </View>
      );

    case 'users':
    case 'delegation':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.42, height: s * 0.42, borderRadius: s * 0.21, borderWidth: 1.8, borderColor: color, marginBottom: 1 }} />
          <View style={{ width: s * 0.78, height: s * 0.38, borderTopLeftRadius: s * 0.38, borderTopRightRadius: s * 0.38, borderWidth: 1.8, borderBottomWidth: 0, borderColor: color }} />
        </View>
      );

    case 'user':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.45, height: s * 0.45, borderRadius: s * 0.225, borderWidth: 1.8, borderColor: color, marginBottom: 1 }} />
          <View style={{ width: s * 0.85, height: s * 0.35, borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35, borderWidth: 1.8, borderBottomWidth: 0, borderColor: color }} />
        </View>
      );

    case 'clipboard':
    case 'inspections':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ position: 'absolute', top: 0, width: s * 0.4, height: s * 0.2, backgroundColor: color, borderRadius: 2, zIndex: 2 }} />
          <View style={{ width: s * 0.75, height: s * 0.88, borderWidth: 1.8, borderColor: color, borderRadius: 3, marginTop: s * 0.08, padding: s * 0.1, justifyContent: 'space-around' }}>
            <View style={{ width: '70%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '85%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '50%', height: 1.5, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'camera':
    case 'hazard':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.3, height: s * 0.12, backgroundColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2, marginBottom: -1 }} />
          <View style={{ width: s * 0.88, height: s * 0.68, borderWidth: 1.8, borderColor: color, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: s * 0.36, height: s * 0.36, borderRadius: s * 0.18, borderWidth: 1.5, borderColor: color }} />
          </View>
        </View>
      );

    case 'alert':
    case 'warning':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.88, height: s * 0.88, borderWidth: 1.8, borderColor: color, borderRadius: 3, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ transform: [{ rotate: '-45deg' }], color: color, fontSize: s * 0.55, fontWeight: '900', lineHeight: s * 0.7 }}>!</Text>
          </View>
        </View>
      );

    case 'emergency':
    case 'siren':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.65, height: s * 0.55, borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
          <View style={{ width: s * 0.85, height: 2, backgroundColor: color }} />
          <View style={{ width: s * 0.45, height: 2, backgroundColor: color, marginTop: 1 }} />
        </View>
      );

    case 'sos':
    case 'panic':
      return (
        <View style={[{ width: s, height: s, borderRadius: s / 2, borderWidth: 1.8, borderColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.35, height: s * 0.35, borderRadius: s * 0.175, backgroundColor: color }} />
        </View>
      );

    case 'wifi':
    case 'sync':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.8, height: s * 0.8, borderRadius: s * 0.4, borderWidth: 1.8, borderColor: color, borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: s * 0.45, height: s * 0.45, borderRadius: s * 0.225, borderWidth: 1.8, borderColor: color, borderBottomColor: 'transparent', borderLeftColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09, backgroundColor: color }} />
            </View>
          </View>
        </View>
      );

    case 'id-card':
    case 'rfid':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.9, height: s * 0.65, borderWidth: 1.8, borderColor: color, borderRadius: 3, padding: 2, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <View style={{ width: s * 0.25, height: s * 0.25, borderRadius: s * 0.125, borderWidth: 1.2, borderColor: color }} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ width: '80%', height: 1.5, backgroundColor: color }} />
              <View style={{ width: '50%', height: 1.5, backgroundColor: color }} />
            </View>
          </View>
        </View>
      );

    case 'ocr':
    case 'scan':
    case 'file-text':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.75, height: s * 0.9, borderWidth: 1.8, borderColor: color, borderRadius: 2, padding: 3, justifyContent: 'space-around' }}>
            <View style={{ width: '80%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '60%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '90%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '40%', height: 1.5, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'check':
    case 'check-circle':
      return (
        <View style={[{ width: s, height: s, borderRadius: s / 2, borderWidth: 1.8, borderColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
          <Text style={{ color: color, fontSize: s * 0.65, fontWeight: '900', marginTop: -1 }}>✓</Text>
        </View>
      );

    case 'lock':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.46, height: s * 0.38, borderTopLeftRadius: s * 0.23, borderTopRightRadius: s * 0.23, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
          <View style={{ width: s * 0.72, height: s * 0.5, backgroundColor: color, borderRadius: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 2, height: 4, backgroundColor: '#0f172a' }} />
          </View>
        </View>
      );

    case 'unlock':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.46, height: s * 0.38, borderTopLeftRadius: s * 0.23, borderTopRightRadius: s * 0.23, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0, alignSelf: 'flex-start', marginLeft: 1 }} />
          <View style={{ width: s * 0.72, height: s * 0.5, backgroundColor: color, borderRadius: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 2, height: 4, backgroundColor: '#0f172a' }} />
          </View>
        </View>
      );

    case 'shield':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.75, height: s * 0.85, borderWidth: 1.8, borderColor: color, borderBottomLeftRadius: s * 0.38, borderBottomRightRadius: s * 0.38, borderTopLeftRadius: 2, borderTopRightRadius: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: s * 0.25, height: s * 0.35, borderBottomLeftRadius: s * 0.15, borderBottomRightRadius: s * 0.15, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'map-pin':
    case 'pin':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.55, height: s * 0.55, borderRadius: s * 0.275, borderWidth: 1.8, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08, backgroundColor: color }} />
          </View>
          <View style={{ width: 2, height: s * 0.25, backgroundColor: color, marginTop: -1 }} />
        </View>
      );

    case 'menu':
      return (
        <View style={[{ width: s, height: s, justifyContent: 'space-around', paddingVertical: s * 0.15 }, style]}>
          <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'more':
      return (
        <View style={[{ width: s, height: s, justifyContent: 'space-around', alignItems: 'center', paddingVertical: s * 0.12 }, style]}>
          <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
          <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
          <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
        </View>
      );

    case 'plus':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ position: 'absolute', width: s * 0.7, height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ position: 'absolute', width: 2, height: s * 0.7, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'close':
    case 'x':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <Text style={{ color: color, fontSize: s * 0.8, fontWeight: '800', lineHeight: s }}>✕</Text>
        </View>
      );

    case 'chevron-right':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <Text style={{ color: color, fontSize: s * 0.9, fontWeight: '800', lineHeight: s }}>›</Text>
        </View>
      );

    case 'refresh':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <Text style={{ color: color, fontSize: s * 0.85, fontWeight: '800', lineHeight: s }}>↻</Text>
        </View>
      );

    case 'crosshair':
    case 'target':
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.85, height: s * 0.85, borderRadius: s * 0.425, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', width: s * 0.95, height: 1, backgroundColor: color }} />
            <View style={{ position: 'absolute', width: 1, height: s * 0.95, backgroundColor: color }} />
            <View style={{ width: s * 0.25, height: s * 0.25, borderRadius: s * 0.125, borderWidth: 1, borderColor: color }} />
          </View>
        </View>
      );

    case 'mining':
    case 'brand':
    default:
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.75, height: s * 0.75, borderWidth: 1.8, borderColor: color, borderRadius: 2, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: s * 0.25, height: s * 0.25, backgroundColor: color }} />
          </View>
        </View>
      );
  }
};

export default Icon;
