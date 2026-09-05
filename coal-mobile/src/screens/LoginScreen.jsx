import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Icon } from '../components/Icon';
import {
  mobileApi,
  setApiBaseUrl,
  getApiBaseUrl,
  testEndpointHealth,
  autoDetectWorkingEndpoint,
  CANDIDATE_ENDPOINTS,
} from '../services/api';

const PRESET_USERS = [
  { tier: 'SUPERADMIN', name: 'Global Superadmin', email: 'admin@coalmin.org', pass: 'Admin@12345', desc: 'Full Wildcard Scope (*)', icon: 'shield', color: '#f59e0b' },
  { tier: 'ORG_ADMIN', name: 'ECL Org Admin', email: 'admin@ecl.coalmin.org', pass: 'Admin@12345', desc: 'Scope: Organization #1 (ECL)', icon: 'users', color: '#38bdf8' },
  { tier: 'MINE_ADMIN', name: 'Rajmahal Mine Admin', email: 'admin@rajmahal.coalmin.org', pass: 'Admin@12345', desc: 'Scope: Rajmahal Mine #1', icon: 'mining', color: '#60a5fa' },
  { tier: 'STAFF', name: 'Safety Officer', email: 'safety@rajmahal.coalmin.org', pass: 'Admin@12345', desc: 'Read-only field officer (No Delegation)', icon: 'clipboard', color: '#34d399' },
  { tier: 'WORKER', name: 'Unassigned Worker', email: 'sollamaten@gmail.com', pass: 'Admin@12345', desc: 'Standard field worker (Zero Roles)', icon: 'user', color: '#94a3b8' },
];

export const LoginScreen = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('admin@coalmin.org');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverHost, setServerHost] = useState(getApiBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [healthStatus, setHealthStatus] = useState({ checking: true, ok: false, message: 'Checking backend...' });

  useEffect(() => {
    checkHealth(serverHost);
  }, []);

  const checkHealth = async (url) => {
    setHealthStatus({ checking: true, ok: false, message: 'Probing backend connection...' });
    const result = await testEndpointHealth(url, 2000);
    if (result.ok) {
      setHealthStatus({
        checking: false,
        ok: true,
        message: `Connected (Ping ${result.latency}ms • DB: ${result.data?.data?.database || 'OK'})`,
      });
    } else {
      setHealthStatus({
        checking: false,
        ok: false,
        message: `Unreachable: ${result.error}`,
      });
    }
  };

  const handleSwitchEndpoint = (candidate) => {
    setServerHost(candidate.url);
    setApiBaseUrl(candidate.url);
    setError('');
    checkHealth(candidate.url);
  };

  const handleAutoDetect = async () => {
    setHealthStatus({ checking: true, ok: false, message: 'Scanning all network channels...' });
    const res = await autoDetectWorkingEndpoint();
    if (res.found) {
      setServerHost(res.url);
      setError('');
      setHealthStatus({
        checking: false,
        ok: true,
        message: `Auto-connected to ${res.label || res.url} (${res.latency}ms)`,
      });
    } else {
      setHealthStatus({
        checking: false,
        ok: false,
        message: 'No responsive backend found. Make sure backend is running on port 5000.',
      });
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      setApiBaseUrl(serverHost.trim());
      const res = await mobileApi.login(login.trim(), password);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Verify credentials or server endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (email, pass) => {
    setLogin(email);
    setPassword(pass);
    setError('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>MINISTRY OF COAL / SIH26024</Text>
          </View>
          <View style={styles.titleRow}>
            <View style={styles.logoBadge}>
              <Icon name="mining" size={20} color="#38bdf8" />
            </View>
            <Text style={styles.title}>NEXUSMINE MOBILE</Text>
          </View>
          <Text style={styles.subtitle}>TACTICAL SUBTERRANEAN TERMINAL & GOVERNANCE</Text>
        </View>

        {/* Real-time Server Link Status Badge */}
        <View
          style={[
            styles.connectionStatusCard,
            healthStatus.ok ? styles.connOnline : styles.connOffline,
          ]}
        >
          <View style={styles.connStatusLeft}>
            <Icon
              name={healthStatus.ok ? 'check-circle' : 'alert'}
              size={13}
              color={healthStatus.ok ? '#4ade80' : '#ef4444'}
              style={{ marginRight: 6 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.connStatusTitle,
                  { color: healthStatus.ok ? '#4ade80' : '#f87171' },
                ]}
              >
                BACKEND LINK: {healthStatus.ok ? 'ONLINE' : 'UNREACHABLE'}
              </Text>
              <Text style={styles.connStatusSub}>{healthStatus.message}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.retryPingBtn}
            onPress={() => checkHealth(serverHost)}
            disabled={healthStatus.checking}
          >
            {healthStatus.checking ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : (
              <Text style={styles.retryPingText}>TEST</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert" size={14} color="#ef4444" style={{ marginRight: 6 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Network') && (
                <TouchableOpacity
                  style={styles.autoFixBtn}
                  onPress={handleAutoDetect}
                >
                  <Text style={styles.autoFixBtnText}>AUTO-SCAN & FIX CONNECTION</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* Quick Endpoint Switcher */}
        <Text style={styles.connPickerLabel}>ACTIVE CONNECTION HOST:</Text>
        <View style={styles.endpointPickerRow}>
          {CANDIDATE_ENDPOINTS.slice(0, 3).map((candidate) => {
            const isActive = serverHost === candidate.url;
            return (
              <TouchableOpacity
                key={candidate.id}
                style={[
                  styles.endpointChip,
                  isActive && styles.endpointChipActive,
                ]}
                onPress={() => handleSwitchEndpoint(candidate)}
              >
                <Text
                  style={[
                    styles.endpointChipText,
                    isActive && styles.endpointChipTextActive,
                  ]}
                >
                  {candidate.id.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OPERATOR CREDENTIAL / EMAIL</Text>
          <TextInput
            style={styles.input}
            value={login}
            onChangeText={setLogin}
            placeholder="operator@coalmin.org"
            placeholderTextColor="#475569"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SECURITY ACCESS TOKEN / PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor="#475569"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>VERIFY CREDENTIALS & INITIALIZE SESSION</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>QUICK SWITCH TEST PERSONA</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.presetContainer}>
          {PRESET_USERS.map((preset, idx) => {
            const isSelected = login === preset.email;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                onPress={() => handlePresetSelect(preset.email, preset.pass)}
              >
                <View style={[styles.presetIconBox, { backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#090d16' }]}>
                  <Icon name={preset.icon} size={15} color={preset.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.presetTitleRow}>
                    <Text style={[styles.presetName, isSelected && styles.presetNameActive]}>{preset.name}</Text>
                    <Text style={[styles.presetTierBadge, { color: preset.color }]}>{preset.tier}</Text>
                  </View>
                  <Text style={styles.presetDesc}>{preset.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.configToggle}
          onPress={() => setShowConfig(!showConfig)}
        >
          <Icon name="wifi" size={12} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.configToggleText}>
            {showConfig ? 'HIDE HOST NETWORK ENDPOINT' : 'CONFIGURE CUSTOM HOST URL'}
          </Text>
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>BACKEND REST ENDPOINT URI:</Text>
            <TextInput
              style={styles.configInput}
              value={serverHost}
              onChangeText={(text) => {
                setServerHost(text);
                setApiBaseUrl(text);
              }}
              placeholder="http://localhost:5000/api/v1"
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.scanAllBtn}
              onPress={handleAutoDetect}
            >
              <Icon name="refresh" size={11} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.scanAllBtnText}>AUTO-SCAN AVAILABLE NETWORK CHANNELS</Text>
            </TouchableOpacity>
            <Text style={styles.configNote}>
              USB Cable: localhost:5000 (via adb reverse) • Wi-Fi: 10.150.255.156:5000 • Emulator: 10.0.2.2:5000
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    padding: 14,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeRow: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  connectionStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
    padding: 9,
    marginBottom: 12,
    borderWidth: 1,
  },
  connOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  connOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  connStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connStatusTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  connStatusSub: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 1,
  },
  retryPingBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  retryPingText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  endpointPickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  connPickerLabel: {
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  endpointChip: {
    flex: 1,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  endpointChipActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0284c7',
  },
  endpointChipText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  endpointChipTextActive: {
    color: '#38bdf8',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  autoFixBtn: {
    marginTop: 6,
    backgroundColor: '#0284c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  autoFixBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  dividerText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  presetContainer: {
    gap: 6,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 6,
    padding: 8,
  },
  presetBtnActive: {
    borderColor: '#0284c7',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  presetIconBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  presetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetName: {
    color: '#cbd5e1',
    fontSize: 11.5,
    fontWeight: '700',
  },
  presetNameActive: {
    color: '#38bdf8',
  },
  presetTierBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  presetDesc: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 1,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  configToggleText: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  configBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#090d16',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  configLabel: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  configInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  scanAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 6,
  },
  scanAllBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  configNote: {
    color: '#475569',
    fontSize: 8.5,
    marginTop: 6,
    lineHeight: 12,
  },
});

export default LoginScreen;
