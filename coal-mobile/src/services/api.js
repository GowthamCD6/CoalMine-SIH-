import { Platform } from 'react-native';

export const CANDIDATE_ENDPOINTS = [
  {
    id: 'usb',
    label: 'USB ADB (localhost)',
    url: 'http://localhost:5000/api/v1',
    desc: 'For physical phone connected via USB cable with adb reverse',
  },
  {
    id: 'wifi',
    label: 'Wi-Fi LAN (10.150.255.156)',
    url: 'http://10.150.255.156:5000/api/v1',
    desc: 'For wireless phone connected to same Wi-Fi network',
  },
  {
    id: 'emulator',
    label: 'Android Emulator (10.0.2.2)',
    url: 'http://10.0.2.2:5000/api/v1',
    desc: 'For Android Studio virtual emulator',
  },
  {
    id: 'ethernet',
    label: 'LAN Ethernet (10.251.188.198)',
    url: 'http://10.251.188.198:5000/api/v1',
    desc: 'Secondary local network interface',
  },
];

// Default to localhost:5000 (works over USB via adb reverse, iOS, and desktop)
let currentBaseUrl = 'http://localhost:5000/api/v1';
let activeAccessToken = null;
let activeRefreshToken = null;
let cachedCurrentUser = null;

export const setApiBaseUrl = (url) => {
  if (!url) return;
  // Strip trailing slashes
  currentBaseUrl = url.replace(/\/+$/, '');
};

export const getApiBaseUrl = () => currentBaseUrl;

export const setAuthToken = (access, refresh) => {
  activeAccessToken = access;
  if (refresh !== undefined) activeRefreshToken = refresh;
};

export const getAuthToken = () => activeAccessToken;

export const clearAuth = () => {
  activeAccessToken = null;
  activeRefreshToken = null;
  cachedCurrentUser = null;
};

export const setCurrentCachedUser = (user) => {
  cachedCurrentUser = user;
};

export const getCurrentCachedUser = () => cachedCurrentUser;

/**
 * Ping an endpoint with a quick timeout to check if it is reachable
 */
export const testEndpointHealth = async (endpointUrl, timeoutMs = 2500) => {
  const cleanUrl = endpointUrl.replace(/\/+$/, '');
  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${cleanUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json();
      return { ok: true, latency, data, url: cleanUrl };
    }
    return { ok: false, error: `HTTP ${res.status}`, latency, url: cleanUrl };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError';
    return {
      ok: false,
      error: isTimeout ? 'Connection timed out' : (err.message || 'Network unreachable'),
      url: cleanUrl,
    };
  }
};

/**
 * Automatically probe candidate endpoints and pick the first responsive one
 */
export const autoDetectWorkingEndpoint = async () => {
  // Check current URL first
  const currentCheck = await testEndpointHealth(currentBaseUrl, 1500);
  if (currentCheck.ok) {
    return { found: true, url: currentBaseUrl, latency: currentCheck.latency };
  }

  // Probe other candidates in parallel
  const probes = CANDIDATE_ENDPOINTS.map(async (candidate) => {
    const check = await testEndpointHealth(candidate.url, 2500);
    return { ...candidate, ...check };
  });

  const results = await Promise.all(probes);
  const working = results.find((r) => r.ok);

  if (working) {
    setApiBaseUrl(working.url);
    return { found: true, url: working.url, latency: working.latency, label: working.label };
  }

  return { found: false, tried: results };
};

/**
 * Core HTTP Request Wrapper with Auto-Fallback on Network Error
 */
async function request(endpoint, options = {}, retryOnNetworkError = true) {
  const url = `${currentBaseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(activeAccessToken ? { Authorization: `Bearer ${activeAccessToken}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let responseData = null;
    try {
      responseData = await res.json();
    } catch {
      responseData = null;
    }

    if (!res.ok) {
      const errorMsg = responseData?.message || `HTTP ${res.status}: Request failed`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = responseData;
      throw err;
    }

    return responseData?.data !== undefined ? responseData.data : responseData;
  } catch (err) {
    // If it's an HTTP error with a status code (e.g. 401, 403, 404), throw directly
    if (err.status) {
      throw err;
    }

    // Network level error (cannot connect to server IP/port)
    const isNetworkError =
      err.message?.includes('Network') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('network') ||
      err.name === 'TypeError';

    if (isNetworkError && retryOnNetworkError) {
      // Attempt auto-detection of a responsive host
      const detectResult = await autoDetectWorkingEndpoint();
      if (detectResult.found && detectResult.url !== currentBaseUrl) {
        // Retry once on the newly discovered working endpoint
        return request(endpoint, options, false);
      }
    }

    // Provide friendly diagnostic message
    const friendlyError = new Error(
      `Network Error: Cannot reach server at ${currentBaseUrl}. Check that backend is running and select your connection mode (USB localhost or Wi-Fi).`
    );
    friendlyError.originalError = err;
    throw friendlyError;
  }
}

export const mobileApi = {
  // Diagnostic
  testHealth: (url) => testEndpointHealth(url || currentBaseUrl),
  autoDetectHost: autoDetectWorkingEndpoint,

  // Auth
  async login(login, password = 'Admin@12345') {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password, device_id: 'coalmin-mobile-app' }),
    });
    if (res?.tokens?.accessToken) {
      setAuthToken(res.tokens.accessToken, res.tokens.refreshToken);
    }
    if (res?.user) {
      setCurrentCachedUser(res.user);
    }
    return res;
  },

  async getMe() {
    const res = await request('/auth/me');
    setCurrentCachedUser(res);
    return res;
  },

  logout() {
    clearAuth();
  },

  // Delegation Workflow
  async getDelegationScope() {
    return request('/delegation/scope');
  },

  async assignUserSubrole(userId, subroleId, status = 'ACTIVE') {
    return request(`/users/${userId}/subroles`, {
      method: 'POST',
      body: JSON.stringify({ subrole_id: subroleId, status }),
    });
  },

  async revokeUserSubrole(userId, subroleId) {
    return request(`/users/${userId}/subroles/${subroleId}`, {
      method: 'DELETE',
    });
  },

  // Inspections
  async getInspections() {
    return request('/inspections');
  },

  async createInspection(data) {
    return request('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInspectionStatus(id, status) {
    return request(`/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Hazards (Camera)
  async getHazards() {
    return request('/hazards');
  },

  async createHazard(data) {
    return request('/hazards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Emergency & SOS
  async getEmergencyAlerts() {
    return request('/emergencies/alerts');
  },

  async triggerSos(zone = 'Zone B (Deep)', depth = -150) {
    return request('/emergencies/sos', {
      method: 'POST',
      body: JSON.stringify({ zone, depth }),
    });
  },

  async triggerBroadcast(type = 'EVACUATION', message) {
    return request('/emergencies/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type, message }),
    });
  },

  // RFID Beacon Pass
  async getRfidPass() {
    return request('/rfid-pass');
  },

  // OCR Extraction
  async runOcr() {
    return request('/ocr/extract', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

export default mobileApi;
