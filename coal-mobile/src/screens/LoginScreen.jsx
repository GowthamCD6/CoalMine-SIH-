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
  {
    tier: 'FIELD WORKER',
    name: 'Field Worker (Nandha)',
    email: 'sollamaten@gmail.com',
    pass: 'Admin@12345',
    desc: 'Turnstile check-in, SOS beacon, gas monitor & Form B shift muster',
    icon: 'user',
    color: '#0284c7',
  },
];

export const LoginScreen = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('sollamaten@gmail.com');
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
    setHealthStatus({ checking: true, ok: false, message: 'Testing server connection...' });
    const result = await testEndpointHealth(url, 2000);
    if (result.ok) {
      setHealthStatus({
        checking: false,
        ok: true,
        message: `Connected (${result.latency}ms ping • DB: ${result.data?.data?.database || 'OK'})`,
      });
    } else {
      setHealthStatus({
        checking: false,
        ok: false,
        message: `Server unreachable: ${result.error}`,
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
    setHealthStatus({ checking: true, ok: false, message: 'Scanning network channels...' });
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
        message: 'No responsive backend found on port 5001.',
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
      setError(err.message || 'Authentication failed. Please verify credentials or connection.');
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
            <Text style={styles.badgeText}>MINISTRY OF COAL • SIH26024</Text>
          </View>
          <View style={styles.titleRow}>
            <View style={styles.logoBadge}>
              <Icon name="mining" size={20} color="#0284c7" />
            </View>
            <Text style={styles.title}>NexusMine Mobile</Text>
          </View>
          <Text style={styles.subtitle}>Field Worker Subterranean Terminal</Text>
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
              size={14}
              color={healthStatus.ok ? '#059669' : '#dc2626'}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.connStatusTitle,
                  { color: healthStatus.ok ? '#047857' : '#b91c1c' },
                ]}
              >
                {healthStatus.ok ? 'Server Online' : 'Server Unreachable'}
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
              <ActivityIndicator size="small" color="#0284c7" />
            ) : (
              <Text style={styles.retryPingText}>Test</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert" size={14} color="#dc2626" style={{ marginRight: 8, marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Network') && (
                <TouchableOpacity
                  style={styles.autoFixBtn}
                  onPress={handleAutoDetect}
                >
                  <Text style={styles.autoFixBtnText}>Auto-Scan & Fix Connection</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* Quick Endpoint Switcher */}
        <Text style={styles.connPickerLabel}>Connection Channel:</Text>
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
          <Text style={styles.label}>Email or Username</Text>
          <TextInput
            style={styles.input}
            value={login}
            onChangeText={setLogin}
            placeholder="operator@coalmin.org"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
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
            <Text style={styles.loginBtnText}>Log In to Operations</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>FIELD WORKER PROFILE</Text>
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
                <View style={[styles.presetIconBox, { backgroundColor: isSelected ? '#e0f2fe' : '#f1f5f9' }]}>
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
          <Icon name="wifi" size={13} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.configToggleText}>
            {showConfig ? 'Hide Custom Server Host' : 'Configure Custom Server Host'}
          </Text>
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>REST API Endpoint URL:</Text>
            <TextInput
              style={styles.configInput}
              value={serverHost}
              onChangeText={(text) => {
                setServerHost(text);
                setApiBaseUrl(text);
              }}
              placeholder="http://localhost:5001/api/v1"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.scanAllBtn}
              onPress={handleAutoDetect}
            >
              <Icon name="refresh" size={12} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.scanAllBtnText}>Auto-Detect Working Server</Text>
            </TouchableOpacity>
            <Text style={styles.configNote}>
              USB: localhost:5001 • Wi-Fi: 10.232.78.180:5001 • Emulator: 10.0.2.2:5001
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
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
  },
  connectionStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  connOnline: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  connOffline: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  connStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connStatusTitle: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  connStatusSub: {
    color: '#475569',
    fontSize: 10,
    marginTop: 1,
  },
  retryPingBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryPingText: {
    color: '#0284c7',
    fontSize: 10.5,
    fontWeight: '600',
  },
  endpointPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  connPickerLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  endpointChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: 'center',
  },
  endpointChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  endpointChipText: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '500',
  },
  endpointChipTextActive: {
    color: '#0369a1',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
  },
  autoFixBtn: {
    marginTop: 6,
    backgroundColor: '#0284c7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  autoFixBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#0f172a',
    fontSize: 13.5,
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  presetContainer: {
    gap: 8,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  presetBtnActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  presetIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  presetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetName: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '600',
  },
  presetNameActive: {
    color: '#0284c7',
  },
  presetTierBadge: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  presetDesc: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 1,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  configToggleText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  configBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 5,
  },
  configInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#0f172a',
    fontSize: 12,
  },
  scanAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  scanAllBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '600',
  },
  configNote: {
    color: '#64748b',
    fontSize: 9.5,
    marginTop: 6,
    lineHeight: 14,
  },
});

export default LoginScreen;
