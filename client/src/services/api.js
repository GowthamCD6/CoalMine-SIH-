const API_BASE_URL = 'http://localhost:5001/api/v1';
const LEGACY_API_URL = 'http://localhost:5001/api';

// In-Memory Diagnostics Log Bus for Diagnostics Drawer
const diagnosticListeners = new Set();
const apiLogs = [];

export const subscribeToApiLogs = (callback) => {
  diagnosticListeners.add(callback);
  callback([...apiLogs]);
  return () => diagnosticListeners.delete(callback);
};

const broadcastLog = (logEntry) => {
  apiLogs.unshift(logEntry);
  if (apiLogs.length > 50) apiLogs.pop();
  diagnosticListeners.forEach((cb) => cb([...apiLogs]));
};

// Local storage token helpers
export const getAccessToken = () => localStorage.getItem('coalmin_access_token');
export const getRefreshToken = () => localStorage.getItem('coalmin_refresh_token');

export const setAuthTokens = (access, refresh) => {
  if (access) localStorage.setItem('coalmin_access_token', access);
  if (refresh) localStorage.setItem('coalmin_refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('coalmin_access_token');
  localStorage.removeItem('coalmin_refresh_token');
};

// Core HTTP Request Wrapper
async function request(endpoint, options = {}, isLegacy = false) {
  const url = `${isLegacy ? LEGACY_API_URL : API_BASE_URL}${endpoint}`;
  const token = getAccessToken();
  const startTime = performance.now();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const latency = Math.round(performance.now() - startTime);
    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    let requestPayload = null;
    if (options.body) {
      try {
        requestPayload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch {
        requestPayload = options.body;
      }
    }

    const logEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      isoTimestamp: new Date().toISOString(),
      method: options.method || 'GET',
      endpoint,
      url,
      headers,
      requestPayload,
      status: response.status,
      latencyMs: latency,
      success: response.ok,
      response: responseData,
    };

    broadcastLog(logEntry);

    if (!response.ok) {
      if (response.status === 401 && !options._isRefreshRequest) {
        try {
          await api.refreshToken();
          return await request(endpoint, { ...options, _isRefreshRequest: true }, isLegacy);
        } catch (refreshErr) {
          clearAuthTokens();
          window.location.reload();
          throw new Error('Session expired. Please log in again.');
        }
      }

      const errorObj = new Error(responseData?.message || `HTTP ${response.status}: Request failed`);
      errorObj.status = response.status;
      errorObj.data = responseData;

      if (responseData?.error?.code === 'VALIDATION_ERROR') {
        errorObj.isValidationError = true;
        errorObj.fieldErrors = {};
        const issues = responseData?.error?.details || [];
        issues.forEach((issue) => {
          if (issue.field) {
            errorObj.fieldErrors[issue.field] = issue.message;
          }
        });
      }

      if (response.status === 403) {
        errorObj.isForbidden = true;
      }

      throw errorObj;
    }

    return responseData?.data !== undefined ? responseData.data : responseData;
  } catch (err) {
    if (!err.status) {
      broadcastLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: options.method || 'GET',
        endpoint,
        url,
        status: 0,
        latencyMs: Math.round(performance.now() - startTime),
        success: false,
        response: { message: err.message || 'Connection failed / Server offline' },
      });
    }
    throw err;
  }
}

// Build query string helper
const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  // Health & Server Status
  getHealth: async () => {
    try {
      const data = await request('/health');
      return { online: true, database: data?.database || 'connected', raw: data };
    } catch {
      return { online: false, database: 'offline', raw: null };
    }
  },

  getDbStatus: () => request('/db-status', {}, true),

  // Auth
  login: async (login, password, device_id = 'web-dashboard') => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password, device_id }),
    });
    if (res?.tokens) {
      setAuthTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    return res;
  },

  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');
    const res = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
      _isRefreshRequest: true
    });
    if (res?.tokens) {
      setAuthTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    return res;
  },

  logout: async () => {
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refresh }),
        });
      }
    } catch (err) {
      console.warn('Backend logout failed, forcing local logout:', err.message);
    } finally {
      clearAuthTokens();
    }
  },

  getMe: () => request('/auth/me'),

  // Organizations
  getOrganizations: (params) => request(`/organizations${toQueryString(params)}`),
  getOrganization: (id) => request(`/organizations/${id}`),
  createOrganization: (data) => request('/organizations', { method: 'POST', body: JSON.stringify(data) }),
  updateOrganization: (id, data) => request(`/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrganization: (id) => request(`/organizations/${id}`, { method: 'DELETE' }),

  // Mines
  getMines: (params) => request(`/mines${toQueryString(params)}`),
  getMine: (id) => request(`/mines/${id}`),
  createMine: (data) => request('/mines', { method: 'POST', body: JSON.stringify(data) }),
  updateMine: (id, data) => request(`/mines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMine: (id) => request(`/mines/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: (params) => request(`/users${toQueryString(params)}`),
  getUser: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getUserSessions: (userId) => request(`/users/${userId}/sessions`),

  // Roles
  getRoles: (params) => request(`/roles${toQueryString(params)}`),
  getRole: (id) => request(`/roles/${id}`),
  createRole: (data) => request('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id, data) => request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id) => request(`/roles/${id}`, { method: 'DELETE' }),
  getRolePermissions: (roleId) => request(`/roles/${roleId}/permissions`),
  attachRolePermission: (roleId, permission_id) => request(`/roles/${roleId}/permissions`, { method: 'POST', body: JSON.stringify({ permission_id }) }),
  detachRolePermission: (roleId, permissionId) => request(`/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' }),

  // Subroles
  getSubroles: (params) => request(`/subroles${toQueryString(params)}`),
  getSubrole: (id) => request(`/subroles/${id}`),
  createSubrole: (data) => request('/subroles', { method: 'POST', body: JSON.stringify(data) }),
  updateSubrole: (id, data) => request(`/subroles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubrole: (id) => request(`/subroles/${id}`, { method: 'DELETE' }),
  getSubrolePermissions: (subroleId) => request(`/subroles/${subroleId}/permissions`),
  attachSubrolePermission: (subroleId, permission_id) => request(`/subroles/${subroleId}/permissions`, { method: 'POST', body: JSON.stringify({ permission_id }) }),
  detachSubrolePermission: (subroleId, permissionId) => request(`/subroles/${subroleId}/permissions/${permissionId}`, { method: 'DELETE' }),

  // User Subroles
  getUserSubroles: (userId) => request(`/users/${userId}/subroles`),
  assignUserSubrole: (userId, data) => request(`/users/${userId}/subroles`, { method: 'POST', body: JSON.stringify(data) }),
  updateUserSubrole: (userId, subroleId, data) => request(`/users/${userId}/subroles/${subroleId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  unassignUserSubrole: (userId, subroleId) => request(`/users/${userId}/subroles/${subroleId}`, { method: 'DELETE' }),
  getSubroleUsers: (subroleId) => request(`/subroles/${subroleId}/users`),

  // Permissions
  getPermissions: (params) => request(`/permissions${toQueryString(params)}`),
  getPermission: (id) => request(`/permissions/${id}`),
  createPermission: (data) => request('/permissions', { method: 'POST', body: JSON.stringify(data) }),
  updatePermission: (id, data) => request(`/permissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePermission: (id) => request(`/permissions/${id}`, { method: 'DELETE' }),

  // Pages
  getPages: (params) => request(`/pages${toQueryString(params)}`),
  getPageTree: () => request('/pages/tree'),
  getPage: (id) => request(`/pages/${id}`),
  createPage: (data) => request('/pages', { method: 'POST', body: JSON.stringify(data) }),
  updatePage: (id, data) => request(`/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePage: (id) => request(`/pages/${id}`, { method: 'DELETE' }),
  getPagePermissions: (pageId) => request(`/pages/${pageId}/permissions`),
  attachPagePermission: (pageId, permission_id) => request(`/pages/${pageId}/permissions`, { method: 'POST', body: JSON.stringify({ permission_id }) }),
  detachPagePermission: (pageId, permissionId) => request(`/pages/${pageId}/permissions/${permissionId}`, { method: 'DELETE' }),

  // Sessions
  revokeSession: (sessionId) => request(`/sessions/${sessionId}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: (params) => request(`/audit-logs${toQueryString(params)}`),

  // Hazards & Photo Upload Logs
  getHazards: () => request('/hazards'),
  createHazard: (data) => request('/hazards', { method: 'POST', body: JSON.stringify(data) }),
  getUploadLogs: () => request('/uploads/logs'),

  // Emergency & Safety Alerts
  getEmergencyAlerts: (params) => request(`/emergencies/alerts${toQueryString(params)}`),
  getEmergencySignals: () => request('/emergencies/signals'),
  createEmergencyAlert: (data) => request('/emergencies/alerts', { method: 'POST', body: JSON.stringify(data) }),
  resolveEmergencyAlert: (id) => request(`/emergencies/alerts/${id}/resolve`, { method: 'POST' }),
  triggerEmergencySos: (data) => request('/emergencies/sos', { method: 'POST', body: JSON.stringify(data) }),
  resolveEmergencySos: (id) => request(`/emergencies/sos/${id}/resolve`, { method: 'POST' }),
  reportEvacuationSafe: (data) => request('/emergencies/evacuation/report-safe', { method: 'POST', body: JSON.stringify(data) }),
  dispatchRescueTeam: (data) => request('/emergencies/rescue/dispatch', { method: 'POST', body: JSON.stringify(data) }),
  respondToDistress: (id, data) => request(`/emergencies/sos/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
