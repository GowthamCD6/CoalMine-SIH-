import {
  initialOrganizations,
  initialMines,
  initialUsers,
  initialRoles,
  initialPermissions,
  initialInspections,
  initialComplianceDocs,
  initialMachinery,
  initialBlockchainLogs,
} from '../data/mockData.js';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const LEGACY_API_URL = 'http://localhost:5000/api';

// In-Memory Diagnostics Log Bus for the Diagnostics Drawer
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

    const logEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method: options.method || 'GET',
      endpoint,
      url,
      status: response.status,
      latencyMs: latency,
      success: response.ok,
      response: responseData,
    };

    broadcastLog(logEntry);

    if (!response.ok) {
      const errorObj = new Error(responseData?.message || `HTTP ${response.status}: Request failed`);
      errorObj.status = response.status;
      errorObj.data = responseData;
      
      // Check for structured Zod validation errors from error.middleware.js
      if (responseData?.error?.code === 'VALIDATION_ERROR' || responseData?.code === 'VALIDATION_ERROR') {
        errorObj.isValidationError = true;
        errorObj.fieldErrors = {};
        const issues = responseData?.error?.details || responseData?.details || [];
        issues.forEach((issue) => {
          if (issue.field) {
            errorObj.fieldErrors[issue.field] = issue.message;
          }
        });
      }

      // Check for Scoped RBAC error
      if (response.status === 403) {
        errorObj.isForbidden = true;
        errorObj.scopeDenied = true;
      }

      throw errorObj;
    }

    return responseData?.data || responseData;
  } catch (err) {
    if (!err.status) {
      // Network failure / Server offline
      broadcastLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: options.method || 'GET',
        endpoint,
        url,
        status: 0,
        latencyMs: Math.round(performance.now() - startTime),
        success: false,
        error: err.message,
      });
    }
    throw err;
  }
}

// In-Memory mutable store for fallback data so user updates persist across views
let fallbackOrgs = [...initialOrganizations];
let fallbackMines = [...initialMines];
let fallbackUsers = [...initialUsers];
let fallbackInspections = [...initialInspections];
let fallbackMachinery = [...initialMachinery];

export const api = {
  // System Health
  async getHealth() {
    try {
      const data = await request('/health');
      return { online: true, ...data };
    } catch {
      try {
        const legacy = await request('/health', {}, true);
        return { online: true, ...legacy };
      } catch {
        return { online: false, database: 'offline', uptime: 0 };
      }
    }
  },

  // Legacy Telemetry Stats
  async getStats() {
    try {
      return await request('/stats', {}, true);
    } catch {
      return {
        minesActive: fallbackMines.filter((m) => m.status === 'ACTIVE').length,
        productionTodayTons: 4520,
        sensorsOnline: 148,
        operationalEfficiency: '94.8%',
      };
    }
  },

  // Authentication
  async login(login, password) {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      });
      if (res?.tokens?.accessToken) {
        setAuthTokens(res.tokens.accessToken, res.tokens.refreshToken);
      }
      return res;
    } catch (err) {
      // If server is unreachable, allow demo login for preset roles
      if (!err.status || err.status >= 500) {
        const user = fallbackUsers.find((u) => u.email === login || u.username === login) || fallbackUsers[0];
        const mockToken = 'mock-jwt-token-' + user.id;
        setAuthTokens(mockToken, 'mock-refresh-token');
        return { user, tokens: { accessToken: mockToken } };
      }
      throw err;
    }
  },

  async register(userData) {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (err) {
      if (!err.status || err.status >= 500) {
        const newUser = {
          id: Date.now(),
          ...userData,
          status: 'ACTIVE',
          role: 'Field Technician',
          scope_type: 'MINE',
          scope_target: 'Local Site',
        };
        fallbackUsers.push(newUser);
        return newUser;
      }
      throw err;
    }
  },

  async getMe() {
    try {
      return await request('/auth/me');
    } catch {
      return fallbackUsers[0];
    }
  },

  logout() {
    clearAuthTokens();
  },

  // Organizations
  async getOrganizations() {
    try {
      const res = await request('/organizations');
      if (Array.isArray(res)) return res;
      if (res?.items && Array.isArray(res.items)) return res.items;
      return fallbackOrgs;
    } catch {
      return fallbackOrgs;
    }
  },

  async createOrganization(data) {
    try {
      return await request('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.isValidationError) throw err;
      const created = { id: Date.now(), ...data, status: data.status || 'ACTIVE', minesCount: 0 };
      fallbackOrgs.unshift(created);
      return created;
    }
  },

  async updateOrganization(id, data) {
    try {
      return await request(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.isValidationError) throw err;
      fallbackOrgs = fallbackOrgs.map((org) => (org.id === Number(id) ? { ...org, ...data } : org));
      return { id, ...data };
    }
  },

  // Mines
  async getMines(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/mines${query ? `?${query}` : ''}`);
      if (Array.isArray(res)) return res;
      if (res?.items && Array.isArray(res.items)) return res.items;
      return fallbackMines;
    } catch {
      return fallbackMines;
    }
  },

  async createMine(data) {
    try {
      return await request('/mines', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.isValidationError) throw err;
      const created = { id: Date.now(), ...data, status: data.status || 'ACTIVE', personnelUnderground: 120, methaneLevel: '0.10%' };
      fallbackMines.unshift(created);
      return created;
    }
  },

  async updateMine(id, data) {
    try {
      return await request(`/mines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.isValidationError) throw err;
      fallbackMines = fallbackMines.map((m) => (m.id === Number(id) ? { ...m, ...data } : m));
      return { id, ...data };
    }
  },

  // Users
  async getUsers() {
    try {
      const res = await request('/users');
      if (Array.isArray(res)) return res;
      if (res?.items && Array.isArray(res.items)) return res.items;
      return fallbackUsers;
    } catch {
      return fallbackUsers;
    }
  },

  async createUser(data) {
    try {
      return await request('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.isValidationError) throw err;
      const created = { id: Date.now(), ...data, status: data.status || 'ACTIVE' };
      fallbackUsers.unshift(created);
      return created;
    }
  },

  // Roles & Permissions
  async getRoles() {
    try {
      const res = await request('/roles');
      return Array.isArray(res) ? res : fallbackRoles;
    } catch {
      return initialRoles;
    }
  },

  async getPermissions() {
    try {
      const res = await request('/permissions');
      return Array.isArray(res) ? res : initialPermissions;
    } catch {
      return initialPermissions;
    }
  },

  // Inspections
  getInspections() {
    return [...fallbackInspections];
  },

  createInspection(inspection) {
    const created = {
      id: 'V-' + Math.floor(100 + Math.random() * 900),
      ...inspection,
      status: 'In Progress',
    };
    fallbackInspections.unshift(created);
    return created;
  },

  updateInspectionStatus(id, newStatus) {
    fallbackInspections = fallbackInspections.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    return fallbackInspections;
  },

  // Compliance Documents
  getComplianceDocs() {
    return [...initialComplianceDocs];
  },

  // Machinery
  getMachinery() {
    return [...fallbackMachinery];
  },

  moveMachineryLocation(id, targetLocation) {
    fallbackMachinery = fallbackMachinery.map((item) =>
      item.id === id ? { ...item, location: targetLocation } : item
    );
    return fallbackMachinery;
  },

  // Blockchain Logs
  getBlockchainLogs() {
    return [...initialBlockchainLogs];
  },

  // Audit Logs
  async getAuditLogs() {
    try {
      const res = await request('/audit-logs');
      return Array.isArray(res) ? res : initialBlockchainLogs;
    } catch {
      return initialBlockchainLogs;
    }
  },

  // Sessions
  async getSessions() {
    try {
      return await request('/sessions');
    } catch {
      return [
        { id: 1, device_id: 'Chrome on Windows 11 (Host)', ip_address: '127.0.0.1', created_at: new Date().toISOString(), status: 'Active' },
        { id: 2, device_id: 'Android Mobile Field Unit #08', ip_address: '192.168.1.45', created_at: new Date(Date.now() - 3600000).toISOString(), status: 'Active' },
      ];
    }
  },
};
