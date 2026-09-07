import express from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { optionalAuthenticate } from '../../middlewares/auth.middleware.js';

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
mobileOpsRouter.use(optionalAuthenticate);

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

// Predefined Subterranean Mine Zones & Mesh Signal Nodes
export const MINE_SIGNAL_ZONES = [
  {
    id: 'ALL',
    name: 'Entire Mine (All Surface & Underground Sectors)',
    signal_node: 'ALL_NODES',
    depth_range: 'Surface to -250m',
    signal_strength: '100% Mesh Coverage',
    workers_online: 48,
    status: 'NORMAL',
  },
  {
    id: 'SHAFT_4_L3',
    name: 'Shaft 4 - Level 3 (-120m Incline)',
    signal_node: 'MESH-S4-L3',
    depth_range: '-120m',
    signal_strength: '-62 dBm (Strong)',
    workers_online: 16,
    status: 'NORMAL',
  },
  {
    id: 'ZONE_B_L4',
    name: 'Zone B - Level 4 Deep (-150m Extraction Face)',
    signal_node: 'MESH-ZB-L4',
    depth_range: '-150m',
    signal_strength: '-71 dBm (Nominal)',
    workers_online: 12,
    status: 'NORMAL',
  },
  {
    id: 'SECTOR_C_FACE',
    name: 'Sector C - Longwall Seam 5 (-180m)',
    signal_node: 'MESH-SC-L5',
    depth_range: '-180m',
    signal_strength: '-78 dBm (Sub-surface Mesh)',
    workers_online: 9,
    status: 'NORMAL',
  },
  {
    id: 'PIT_2_SURFACE',
    name: 'Surface Pit 2 / Haulage Yard (0m)',
    signal_node: 'GPS-SURFACE-P2',
    depth_range: '0m Surface',
    signal_strength: 'Cellular / GPS 4G Locked',
    workers_online: 7,
    status: 'NORMAL',
  },
  {
    id: 'VENT_AIRWAY_1',
    name: 'Ventilation Shaft 1 Return Airway (-90m)',
    signal_node: 'MESH-VENT-01',
    depth_range: '-90m',
    signal_strength: '-66 dBm (High Priority)',
    workers_online: 4,
    status: 'NORMAL',
  },
];

const SECTOR_ROSTERS = {
  SHAFT_4_L3: [
    { id: 'EMP-7729', name: 'nandha (Staff)', role: 'Field Mining Supervisor', depth: -120, lat: 23.795765, lng: 86.430432, battery: 92, status: 'UNACCOUNTED' },
    { id: 'EMP-4102', name: 'Ramesh Kumar', role: 'Continuous Miner Operator', depth: -125, lat: 23.795810, lng: 86.430510, battery: 88, status: 'UNACCOUNTED' },
    { id: 'EMP-5519', name: 'Sunil Soren', role: 'Roof Bolting Crew', depth: -118, lat: 23.795690, lng: 86.430380, battery: 76, status: 'UNACCOUNTED' },
    { id: 'EMP-8812', name: 'Vikram Singh', role: 'Ventilation & Gas Sentry', depth: -122, lat: 23.795740, lng: 86.430490, battery: 84, status: 'UNACCOUNTED' },
  ],
  ZONE_B_L4: [
    { id: 'EMP-3301', name: 'Amit Mondal', role: 'Shuttle Car Operator', depth: -150, lat: 23.796120, lng: 86.431200, battery: 85, status: 'UNACCOUNTED' },
    { id: 'EMP-6623', name: 'Deepak Bauri', role: 'Blasting Assistant', depth: -155, lat: 23.796210, lng: 86.431350, battery: 79, status: 'UNACCOUNTED' },
    { id: 'EMP-9904', name: 'Rajesh Murmu', role: 'Electrical Support', depth: -148, lat: 23.796050, lng: 86.431110, battery: 91, status: 'UNACCOUNTED' },
  ],
  SECTOR_C_FACE: [
    { id: 'EMP-1102', name: 'Kishore Mahato', role: 'Shearer Driver', depth: -180, lat: 23.794900, lng: 86.429800, battery: 82, status: 'UNACCOUNTED' },
    { id: 'EMP-4421', name: 'Sanjay Hembram', role: 'Powered Roof Support Specialist', depth: -182, lat: 23.794950, lng: 86.429870, battery: 74, status: 'UNACCOUNTED' },
  ],
  PIT_2_SURFACE: [
    { id: 'EMP-2208', name: 'Pooja Sharma', role: 'Surface Dispatch Clerk', depth: 0, lat: 23.797200, lng: 86.433100, battery: 98, status: 'UNACCOUNTED' },
    { id: 'EMP-7711', name: 'Gopal Yadav', role: 'Haulage Yard Incharge', depth: 0, lat: 23.797150, lng: 86.433050, battery: 95, status: 'UNACCOUNTED' },
  ],
  VENT_AIRWAY_1: [
    { id: 'EMP-5503', name: 'Manoj Majhi', role: 'Vent Fan Technician', depth: -90, lat: 23.794100, lng: 86.428900, battery: 89, status: 'UNACCOUNTED' },
  ],
};

function buildSectorRoster(targetZone) {
  if (targetZone === 'ALL') {
    return Object.values(SECTOR_ROSTERS).flat().map((w) => ({
      ...w,
      status: 'UNACCOUNTED',
      last_ping: new Date().toLocaleTimeString(),
    }));
  }
  const roster = SECTOR_ROSTERS[targetZone] || SECTOR_ROSTERS.SHAFT_4_L3;
  return roster.map((w) => ({
    ...w,
    status: 'UNACCOUNTED',
    last_ping: new Date().toLocaleTimeString(),
  }));
}

// --- EMERGENCY & SOS DISPATCH SYSTEM ---

// 1. Get all signal nodes and zones
mobileOpsRouter.get(
  '/emergencies/signals',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, MINE_SIGNAL_ZONES, 'Mine signal nodes and zones retrieved');
  })
);

// 2. Get alerts (strictly filtered by target zone when requested)
mobileOpsRouter.get(
  '/emergencies/alerts',
  asyncHandler(async (req, res) => {
    const { zone, signal } = req.query;

    let filteredBroadcasts = broadcastsStore;
    if (zone && zone !== 'ALL') {
      const zLower = zone.toLowerCase();
      filteredBroadcasts = broadcastsStore.filter((b) => {
        // In life-safety operations, any Evacuation order or Critical alert must be delivered to all workers
        if (b.target_zone === 'ALL' || b.type === 'EVACUATION' || b.severity === 'CRITICAL') return true;
        const tzLower = String(b.target_zone || '').toLowerCase();
        const tznLower = String(b.target_zone_name || '').toLowerCase();
        return (
          zLower.includes(tzLower) ||
          tzLower.includes(zLower) ||
          zLower.includes(tznLower) ||
          tznLower.includes(zLower) ||
          (tzLower.includes('shaft_4') && zLower.includes('shaft 4')) ||
          (tzLower.includes('zone_b') && zLower.includes('zone b')) ||
          (tzLower.includes('sector_c') && zLower.includes('sector c')) ||
          (tzLower.includes('pit_2') && zLower.includes('pit 2')) ||
          (tzLower.includes('vent') && zLower.includes('vent'))
        );
      });
    }
    if (signal && signal !== 'ALL_NODES') {
      filteredBroadcasts = filteredBroadcasts.filter(
        (b) => b.signal_filter === 'ALL_NODES' || b.signal_filter === signal
      );
    }

    const hasActiveCritical = broadcastsStore.some(
      (b) => b.status === 'ACTIVE' && b.severity === 'CRITICAL'
    ) || sosAlertsStore.some((s) => s.status === 'ACTIVE_DISTRESS');

    return ApiResponse.success(res, {
      sos_alerts: sosAlertsStore,
      broadcasts: filteredBroadcasts,
      all_broadcasts: broadcastsStore,
      signals: MINE_SIGNAL_ZONES,
      status: hasActiveCritical ? 'CRITICAL' : 'CLEAR',
    });
  })
);

// 3. Worker One-Tap SOS Distress Trigger
mobileOpsRouter.post(
  '/emergencies/sos',
  asyncHandler(async (req, res) => {
    const {
      zone = 'Shaft 4 • Level 3',
      depth = -180,
      latitude = 23.7957,
      longitude = 86.4304,
      notes = 'Worker manual SOS panic trigger',
    } = req.body;

    const workerName = req.user ? `${req.user.first_name || req.user.username} (${req.user.employee_code || 'EMP'})` : 'nandha (Field Personnel)';
    const workerId = req.user?.id || 'WORKER-' + Date.now();

    const alert = {
      id: 'SOS-' + Date.now(),
      worker_id: workerId,
      worker_name: workerName,
      zone,
      depth,
      latitude,
      longitude,
      status: 'ACTIVE_DISTRESS',
      notes,
      timestamp: new Date().toISOString(),
    };
    sosAlertsStore.unshift(alert);

    // Map zone to subterranean mesh signal node
    const isShaft4 = zone.toLowerCase().includes('shaft');
    const isZoneB = zone.toLowerCase().includes('zone b');
    const isSectorC = zone.toLowerCase().includes('sector c');
    const isSurface = zone.toLowerCase().includes('surface') || zone.toLowerCase().includes('pit');
    const isVent = zone.toLowerCase().includes('vent');

    let target_zone = 'SHAFT_4_L3';
    let signal_filter = 'MESH-S4-L3';
    let affected_workers_count = 16;

    if (isZoneB) {
      target_zone = 'ZONE_B_L4';
      signal_filter = 'MESH-ZB-L4';
      affected_workers_count = 12;
    } else if (isSectorC) {
      target_zone = 'SECTOR_C_FACE';
      signal_filter = 'MESH-SC-L5';
      affected_workers_count = 9;
    } else if (isSurface) {
      target_zone = 'PIT_2_SURFACE';
      signal_filter = 'GPS-SURFACE-P2';
      affected_workers_count = 7;
    } else if (isVent) {
      target_zone = 'VENT_AIRWAY_1';
      signal_filter = 'MESH-VENT-01';
      affected_workers_count = 4;
    }

    // Automatically create targeted sector broadcast to alert nearby colleagues to help him
    const broadcast = {
      id: 'BRD-' + Date.now(),
      title: `🚨 NEARBY WORKER IN DISTRESS: HELP ${workerName.toUpperCase()}!`,
      type: 'WORKER_DISTRESS',
      severity: 'CRITICAL',
      target_zone,
      target_zone_name: zone,
      signal_filter,
      affected_workers_count,
      distress_worker_id: workerId,
      distress_worker_name: workerName,
      distress_zone: zone,
      distress_depth: depth,
      distress_coords: { latitude, longitude },
      distress_reason: notes,
      message: `🚨 URGENT DISTRESS: Help ${workerName} at ${zone} (${depth}m)! ${notes}. Nearby crew members: proceed immediately to assist him!`,
      exit_route: 'Shaft 4 Incline (Portal Gate)',
      sender_id: workerId,
      sender_name: workerName,
      sender_role: 'WORKER',
      status: 'ACTIVE',
      timestamp: alert.timestamp,
    };
    broadcastsStore.unshift(broadcast);

    return ApiResponse.created(
      res,
      { alert, broadcast },
      `DISTRESS BEACON TRANSMITTED! ${affected_workers_count} nearby crew members in ${zone} alerted to assist.`
    );
  })
);

// 3b. Stand down SOS Distress
mobileOpsRouter.post(
  '/emergencies/sos/:id/resolve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sos = sosAlertsStore.find((s) => s.id === id || s.worker_id === id);
    if (sos) {
      sos.status = 'RESOLVED';
    }
    broadcastsStore.forEach((b) => {
      if (
        (b.type === 'WORKER_DISTRESS' || b.type === 'DISTRESS') &&
        (b.id === id || b.distress_worker_id === id || b.sender_id === id || b.distress_worker_name === sos?.worker_name)
      ) {
        b.status = 'RESOLVED';
        b.resolved_at = new Date().toISOString();
      }
    });
    return ApiResponse.success(res, { id, status: 'RESOLVED' }, 'Worker distress beacon stood down successfully');
  })
);

// 4. Create Alert (Hierarchical: Higher roles select target zone & filter by signal)
mobileOpsRouter.post(
  '/emergencies/alerts',
  asyncHandler(async (req, res) => {
    const {
      title,
      message,
      type = 'EVACUATION',
      severity = 'CRITICAL',
      target_zone = 'ALL',
      signal_node,
      exit_route = 'Shaft 4 Incline (Portal Gate)',
      sender_name,
      sender_role,
    } = req.body;

    const effectiveRole = sender_role || req.user?.role || req.user?.mobileRole || 'SUPERADMIN';
    const effectiveSender = sender_name || (req.user ? `${req.user.first_name || req.user.username}` : 'Safety Command');

    // Find zone information for signal mapping
    const matchedZone = MINE_SIGNAL_ZONES.find((z) => z.id === target_zone) || MINE_SIGNAL_ZONES[0];
    const targetSignalNode = signal_node || matchedZone.signal_node;
    const affectedCount = matchedZone.workers_online;

    const roster = buildSectorRoster(matchedZone.id);

    const newAlert = {
      id: 'ALT-' + Date.now(),
      title: title || (type === 'EVACUATION' ? '🚨 IMMEDIATE SECTOR EVACUATION ORDER' : '⚠️ STATUTORY SAFETY ALERT'),
      type,
      severity,
      target_zone: matchedZone.id,
      target_zone_name: matchedZone.name,
      signal_filter: targetSignalNode,
      affected_workers_count: roster.length || affectedCount,
      message: message || `Critical order for ${matchedZone.name}. Evacuate immediately via ${exit_route}.`,
      exit_route,
      sender_name: effectiveSender,
      sender_role: effectiveRole,
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      muster: {
        total_workers: roster.length || affectedCount,
        safe_count: 0,
        unaccounted_count: roster.length || affectedCount,
        confirmed_safe: [],
        unaccounted_workers: roster,
        rescue_dispatches: [],
      },
    };

    broadcastsStore.unshift(newAlert);
    return ApiResponse.created(res, newAlert, `Alert dispatched to ${matchedZone.name} (Signal: ${targetSignalNode})`);
  })
);

// 4b. Worker Reports Evacuation Safe / Confirms Accountability
mobileOpsRouter.post(
  '/emergencies/evacuation/report-safe',
  asyncHandler(async (req, res) => {
    const {
      alert_id,
      worker_id,
      worker_name,
      status = 'EVACUATED_SAFE_SURFACE',
      latitude = 23.795765,
      longitude = 86.430432,
      depth = 0,
      zone = 'Surface Portal Area',
      notes = 'Worker checked in safe at surface assembly portal',
    } = req.body;

    // Find the active or relevant alert
    const alert = alert_id
      ? broadcastsStore.find((b) => b.id === alert_id)
      : broadcastsStore.find((b) => b.status === 'ACTIVE' && b.type === 'EVACUATION') || broadcastsStore[0];

    if (alert) {
      if (!alert.muster) {
        const roster = buildSectorRoster(alert.target_zone);
        alert.muster = {
          total_workers: roster.length,
          safe_count: 0,
          unaccounted_count: roster.length,
          confirmed_safe: [],
          unaccounted_workers: roster,
          rescue_dispatches: [],
        };
      }

      const safeEntry = {
        worker_id: worker_id || 'EMP-7729',
        worker_name: worker_name || 'Field Miner',
        status,
        safe_location_name:
          status === 'SAFE_REFUGE_CHAMBER'
            ? 'Underground Refuge Chamber 2'
            : status === 'SAFE_MAIN_INCLINE'
            ? 'Fresh Air Intake Incline'
            : 'Surface Portal Assembly Station',
        reported_at: new Date().toLocaleTimeString(),
        latitude,
        longitude,
        depth,
        zone,
        notes,
      };

      const alreadySafe = alert.muster.confirmed_safe.some(
        (w) =>
          w.worker_id === safeEntry.worker_id ||
          (safeEntry.worker_name && w.worker_name?.toLowerCase() === safeEntry.worker_name.toLowerCase())
      );

      if (!alreadySafe) {
        alert.muster.confirmed_safe.unshift(safeEntry);
        alert.muster.unaccounted_workers = alert.muster.unaccounted_workers.filter(
          (w) =>
            w.id !== safeEntry.worker_id &&
            (!safeEntry.worker_name || !w.name?.toLowerCase().includes(safeEntry.worker_name.toLowerCase()))
        );
        alert.muster.safe_count = alert.muster.confirmed_safe.length;
        alert.muster.unaccounted_count = Math.max(0, alert.muster.total_workers - alert.muster.safe_count);
      }

      return ApiResponse.success(
        res,
        { alert_id: alert.id, muster: alert.muster, safe_entry: safeEntry },
        `Safety confirmed: ${safeEntry.worker_name} logged at ${safeEntry.safe_location_name}`
      );
    }

    return ApiResponse.success(res, { status: 'RECORDED' }, 'Safety status recorded in subterranean ledger');
  })
);

// 4c. Dispatch Mine Rescue Brigade to Unaccounted Coordinates
mobileOpsRouter.post(
  '/emergencies/rescue/dispatch',
  asyncHandler(async (req, res) => {
    const {
      alert_id,
      target_worker_id,
      target_worker_name,
      sector = 'Shaft 4 • Level 3',
      coordinates = '23.795765° N, 86.430432° E',
      depth = -180,
      rescue_team_name = 'Alpha Subterranean Rescue Brigade',
    } = req.body;

    const alert = alert_id ? broadcastsStore.find((b) => b.id === alert_id) : broadcastsStore[0];

    const mission = {
      dispatch_id: 'RSC-' + Date.now(),
      target_worker_id: target_worker_id || 'UNKNOWN',
      target_worker_name: target_worker_name || 'Unaccounted Personnel',
      rescue_team_name,
      sector,
      target_coordinates: coordinates,
      target_depth: depth,
      status: 'EN_ROUTE',
      dispatched_at: new Date().toLocaleTimeString(),
      estimated_arrival: '3-5 minutes',
    };

    if (alert && alert.muster) {
      if (!alert.muster.rescue_dispatches) alert.muster.rescue_dispatches = [];
      alert.muster.rescue_dispatches.unshift(mission);

      const unacc = alert.muster.unaccounted_workers.find((w) => w.id === target_worker_id);
      if (unacc) {
        unacc.status = 'RESCUE_DISPATCHED';
        unacc.rescue_mission_id = mission.dispatch_id;
      }
    }

    return ApiResponse.created(
      res,
      mission,
      `Emergency Rescue Team dispatched to ${target_worker_name} at ${sector} (${depth}m)`
    );
  })
);

// 4d. Nearby Worker Responds to Colleague SOS Distress
mobileOpsRouter.post(
  '/emergencies/sos/:id/respond',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      responder_id = 'WORKER-' + Date.now(),
      responder_name = 'Nearby Colleague',
      responder_zone = 'Shaft 4 • Level 3',
      responder_distance = '~35m',
    } = req.body;

    const responderEntry = {
      responder_id,
      responder_name,
      responder_zone,
      responder_distance,
      responded_at: new Date().toLocaleTimeString(),
    };

    const sos = sosAlertsStore.find((s) => s.id === id || s.worker_id === id);
    if (sos) {
      if (!sos.responders) sos.responders = [];
      sos.responders.push(responderEntry);
    }

    broadcastsStore.forEach((b) => {
      if (b.id === id || b.distress_worker_id === id) {
        if (!b.responders) b.responders = [];
        b.responders.push(responderEntry);
      }
    });

    return ApiResponse.success(res, responderEntry, 'Colleague rescue response dispatched and logged');
  })
);

// 5. Stand Down / Resolve Alert
mobileOpsRouter.post(
  '/emergencies/alerts/:id/resolve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const alert = broadcastsStore.find((a) => a.id === id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'RESOLVED';
    alert.resolved_at = new Date().toISOString();
    alert.resolved_by = req.user?.username || 'Safety Officer';

    return ApiResponse.success(res, alert, 'Emergency alert stood down and resolved');
  })
);

// 6. Legacy /emergencies/broadcast endpoint backwards compatibility
mobileOpsRouter.post(
  '/emergencies/broadcast',
  asyncHandler(async (req, res) => {
    const { type = 'EVACUATION', message, target_zone = 'ALL' } = req.body;
    const matchedZone = MINE_SIGNAL_ZONES.find((z) => z.id === target_zone) || MINE_SIGNAL_ZONES[0];

    const broadcast = {
      id: 'BRD-' + Date.now(),
      title: `${type} BROADCAST`,
      type,
      severity: 'CRITICAL',
      target_zone: matchedZone.id,
      target_zone_name: matchedZone.name,
      signal_filter: matchedZone.signal_node,
      affected_workers_count: matchedZone.workers_online,
      message: message || (type === 'EVACUATION' ? 'TRIGGER FULL EVACUATION ALARM!' : 'SOUND MUSTER ALARM!'),
      exit_route: 'Shaft 4 Incline (Portal Gate)',
      sender_name: req.user?.username || 'Command Center',
      sender_role: req.user?.role || 'SUPERADMIN',
      status: 'ACTIVE',
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
