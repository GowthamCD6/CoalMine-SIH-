import express from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

export const mobileOpsRouter = express.Router();

// In-memory persistent stores with initial wireframe seed data
let inspectionsStore = [
  {
    id: 'V-992',
    observation_type: 'Roof Support Degradation',
    inspector: 'S. Verma',
    location: 'Jharia - Level 3',
    deadline: '2026-09-05',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
  },
  {
    id: 'V-991',
    observation_type: 'Missing PPE (Contractor)',
    inspector: 'M. Singh',
    location: 'Godavari - Zone B',
    deadline: '2026-09-01',
    severity: 'MEDIUM',
    status: 'PENDING_REVIEW',
    created_at: new Date().toISOString(),
  },
  {
    id: 'S-402',
    observation_type: 'Routine Vent Shaft Check',
    inspector: 'Auto-Sensor',
    location: 'Talcher - Shaft 4',
    deadline: '2026-08-30',
    severity: 'LOW',
    status: 'RESOLVED',
    created_at: new Date().toISOString(),
  },
];

let hazardsStore = [
  {
    id: 'HAZ-402',
    hazard_type: 'Sub-surface Methane Seepage',
    location_name: 'Jharia Deep Shaft #2',
    latitude: 23.7957,
    longitude: 86.4304,
    depth_meters: -120,
    zone_tag: 'Level 3 - Sector B',
    status: 'PENDING_SYNC',
    reporter: 'Ramesh Kumar (EMP-8492)',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'HAZ-398',
    hazard_type: 'Hydraulic Fluid Leak on Excavator',
    location_name: 'Pit 4 Quarry',
    latitude: 23.7921,
    longitude: 86.4299,
    depth_meters: 0,
    zone_tag: 'Surface Pit 4',
    status: 'SYNCED',
    reporter: 'Field Tech S. Verma',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

let sosAlertsStore = [];
let broadcastsStore = [
  {
    id: 'BRD-001',
    type: 'ROUTINE',
    message: 'Routine radio check completed. All nodes responsive.',
    sender: 'System Admin',
    timestamp: new Date().toISOString(),
  },
];

// Optional auth for operations
mobileOpsRouter.use(authenticate);

// --- INSPECTIONS ---
mobileOpsRouter.get(
  '/inspections',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, inspectionsStore, 'Inspections retrieved successfully');
  })
);

mobileOpsRouter.post(
  '/inspections',
  asyncHandler(async (req, res) => {
    const { observation_type, location, severity = 'MEDIUM', deadline, notes } = req.body;
    const newInspection = {
      id: 'V-' + Math.floor(100 + Math.random() * 900),
      observation_type: observation_type || 'General Safety Observation',
      inspector: req.user?.username || 'Field Inspector',
      location: location || 'Zone A',
      deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      severity: String(severity).toUpperCase(),
      status: 'IN_PROGRESS',
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
    inspectionsStore.unshift(newInspection);
    return ApiResponse.created(res, newInspection, 'Inspection logged successfully');
  })
);

mobileOpsRouter.patch(
  '/inspections/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, severity, notes } = req.body;
    const item = inspectionsStore.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inspection record not found' });
    }
    if (status) item.status = status;
    if (severity) item.severity = severity;
    if (notes) item.notes = notes;
    return ApiResponse.success(res, item, 'Inspection updated successfully');
  })
);

// --- HAZARDS (Camera / Geotag) ---
mobileOpsRouter.get(
  '/hazards',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, hazardsStore, 'Hazards retrieved successfully');
  })
);

mobileOpsRouter.post(
  '/hazards',
  asyncHandler(async (req, res) => {
    const {
      hazard_type,
      location_name,
      latitude = 23.7957,
      longitude = 86.4304,
      depth_meters = -120,
      zone_tag = 'Level 3 - Sector B',
      notes,
    } = req.body;

    const newHazard = {
      id: 'HAZ-' + Math.floor(100 + Math.random() * 900),
      hazard_type: hazard_type || 'Unspecified Hazard',
      location_name: location_name || 'Underground Tunnel',
      latitude: Number(latitude),
      longitude: Number(longitude),
      depth_meters: Number(depth_meters),
      zone_tag,
      notes: notes || '',
      status: 'SYNCED',
      reporter: req.user?.username || 'Field Agent',
      timestamp: new Date().toISOString(),
    };

    hazardsStore.unshift(newHazard);
    return ApiResponse.created(res, newHazard, 'Hazard report captured and synced successfully');
  })
);

// --- EMERGENCY & SOS ---
mobileOpsRouter.get(
  '/emergencies/alerts',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, {
      sos_alerts: sosAlertsStore,
      broadcasts: broadcastsStore,
      status: sosAlertsStore.length > 0 ? 'CRITICAL' : 'CLEAR',
    });
  })
);

mobileOpsRouter.post(
  '/emergencies/sos',
  asyncHandler(async (req, res) => {
    const { zone = 'Zone B (Deep)', depth = -150, latitude = 23.7957, longitude = 86.4304 } = req.body;
    const alert = {
      id: 'SOS-' + Date.now(),
      worker_id: req.user?.id,
      worker_name: req.user?.username || 'Field Personnel',
      zone,
      depth,
      latitude,
      longitude,
      status: 'ACTIVE_DISTRESS',
      timestamp: new Date().toISOString(),
    };
    sosAlertsStore.unshift(alert);

    // Broadcast emergency log
    broadcastsStore.unshift({
      id: 'BRD-' + Date.now(),
      type: 'DISTRESS',
      message: `DISTRESS BEACON ACTIVATED by ${alert.worker_name} at ${zone}! Emergency rescue dispatched.`,
      sender: 'SOS System',
      timestamp: alert.timestamp,
    });

    return ApiResponse.created(res, alert, 'EMERGENCY SOS BROADCAST ACTIVATED! Rescue team alerted.');
  })
);

mobileOpsRouter.post(
  '/emergencies/broadcast',
  asyncHandler(async (req, res) => {
    const { type = 'EVACUATION', message } = req.body;
    const broadcast = {
      id: 'BRD-' + Date.now(),
      type,
      message: message || (type === 'EVACUATION' ? 'TRIGGER FULL EVACUATION ALARM!' : 'SOUND MUSTER ALARM!'),
      sender: req.user?.username || 'Command Center',
      timestamp: new Date().toISOString(),
    };
    broadcastsStore.unshift(broadcast);
    return ApiResponse.created(res, broadcast, `${type} alert broadcast successfully`);
  })
);

// --- RFID BEACON PROXIMITY PASS ---
mobileOpsRouter.get(
  '/rfid-pass',
  asyncHandler(async (req, res) => {
    const user = req.user;
    return ApiResponse.success(res, {
      id: user.id,
      name: `${user.first_name || user.username} ${user.last_name || ''}`.trim(),
      username: user.username,
      employee_code: user.employee_code || `EMP-${8000 + user.id}`,
      role: user.role || 'Field Personnel',
      cleared_zones: ['Zone A', 'Zone B', 'Zone C'],
      qr_payload: JSON.stringify({
        uid: user.id,
        code: user.employee_code || `EMP-${8000 + user.id}`,
        token: 'BEACON-PASS-' + user.id,
        exp: new Date(Date.now() + 86400000).toISOString(),
      }),
      status: 'ACTIVE_CLEARED',
    });
  })
);

// --- OCR SCANNER EXTRACTION SIMULATION ---
mobileOpsRouter.post(
  '/ocr/extract',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, {
      extracted_words: 452,
      raw_text: `SHIFT LOG - SHAFT 3 (2026-09-05)\nVentilation: 18.5 m3/s (Nominal)\nMethane CH4: 0.12% (Safe threshold)\nPersonnel checked in: 120 miners\nEquipment: EX-400 Excavator operational\nRemarks: Maintenance due on Conveyor C-2 next shift.`,
      metadata: {
        document_type: 'Shift Report & Daily Ledger',
        confidence: 0.97,
        timestamp: new Date().toISOString(),
      },
    }, 'OCR Text extracted successfully');
  })
);

export default mobileOpsRouter;
