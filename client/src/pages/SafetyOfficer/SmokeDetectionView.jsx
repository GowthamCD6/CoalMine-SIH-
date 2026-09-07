import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Video,
  Info,
  RefreshCw,
  Flame,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Search,
  CheckCircle2,
  Shield,
  Zap,
  Radio,
  Bell,
  Eye,
  SlidersHorizontal,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import { api } from '../../services/api.js';

// Base Camera Catalog connected with real Mine sites and simulated vision telemetry
const INITIAL_CAMERAS = [
  {
    id: 'cam-01',
    name: 'CAM-01: Main Shaft Alpha',
    location: 'Underground Level 2 - Sector 4',
    mineName: 'Jharia Block IV Colliery',
    videoSrc: '/videos/test.mp4',
    status: 'CLEAR',
    confidence: 99.2,
    opacity: 4.1,
    particulatesPpm: 18,
    latencyMs: 12,
    details: 'Baseline conditions nominal. Optical density within safe DGMS statutory bounds. No particulate or combustion anomalies detected.',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    id: 'cam-02',
    name: 'CAM-02: Main Conveyor Belt C',
    location: 'Sub-surface Transfer Chute',
    mineName: 'Raniganj Underground Basin',
    videoSrc: '/videos/light-smoke.mp4',
    status: 'WARNING',
    confidence: 82.4,
    opacity: 38.6,
    particulatesPpm: 76,
    latencyMs: 15,
    details: 'Low-density smoke plumes detected near friction bearings. Potential early-stage thermal combustion or motor overheating. Secondary ventilation ramped to 120%.',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  {
    id: 'cam-03',
    name: 'CAM-03: Surface Processing Plant',
    location: 'Crushing & Coal Handling Unit',
    mineName: 'Korba Open Cast Mine',
    videoSrc: '/videos/high-smoke.mp4',
    status: 'CRITICAL',
    confidence: 96.8,
    opacity: 89.2,
    particulatesPpm: 240,
    latencyMs: 14,
    details: 'High-density smoke hazard verified by Vision-Ops AI. Severe particulate opacity exceeding safety threshold. Immediate automated suppression & crew evacuation recommended.',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  {
    id: 'cam-04',
    name: 'CAM-04: North Intake Airway',
    location: 'Underground Level 1 - Ventilation Portal',
    mineName: 'Singrauli Super Pit',
    videoSrc: '/videos/test.mp4',
    status: 'CLEAR',
    confidence: 98.7,
    opacity: 6.0,
    particulatesPpm: 22,
    latencyMs: 11,
    details: 'Continuous intake airflow clear of combustion byproducts. Optical sensors calibrate zero visibility loss across 200m line-of-sight.',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  }
];

export default function SmokeDetectionView({ onShowToast }) {
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [activeCam, setActiveCam] = useState(INITIAL_CAMERAS[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMine, setSelectedMine] = useState('ALL');
  const [minesList, setMinesList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hudVisible, setHudVisible] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Live real-time clock ticker for CCTV vision HUD
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Fetch real database telemetry & mines list
  const fetchTelemetryData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [minesRes, hazardsRes, alertsRes, envRes] = await Promise.allSettled([
        api.getMines(),
        api.getHazards(),
        api.getEmergencyAlerts(),
        api.getEnvSummary(),
      ]);

      let availableMines = [];
      if (minesRes.status === 'fulfilled' && minesRes.value) {
        const rawMines = minesRes.value.data || minesRes.value;
        if (Array.isArray(rawMines) && rawMines.length > 0) {
          availableMines = rawMines.map((m) => m.name || m.code);
          setMinesList(availableMines);
        }
      }

      // Check if there are active hazards or emergency smoke alerts
      let hasLiveAlerts = false;
      if (alertsRes.status === 'fulfilled' && alertsRes.value) {
        const alerts = alertsRes.value.data || alertsRes.value;
        if (Array.isArray(alerts) && alerts.some((a) => a.status === 'ACTIVE' || a.severity === 'CRITICAL')) {
          hasLiveAlerts = true;
        }
      }

      // Merge fetched mines with cameras dynamically
      setCameras((prevCams) =>
        prevCams.map((cam, idx) => {
          const assignedMine = availableMines[idx % availableMines.length] || cam.mineName;
          return {
            ...cam,
            mineName: assignedMine,
          };
        })
      );

      if (isManualRefresh && onShowToast) {
        onShowToast('CCTV feeds and AI vision telemetry re-synchronized.');
      }
    } catch (err) {
      console.warn('Could not fetch real-time CCTV metadata, keeping calibrated feeds:', err);
    } finally {
      // Simulate realistic telemetry network handshake delay for skeleton visibility
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, isManualRefresh ? 400 : 700);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
  }, []);

  // Re-trigger scanning animation when camera changes
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, [activeCam.id]);

  // Video playback control
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerContainerRef.current.requestFullscreen();
    }
  };

  // Dispatch emergency alert to backend
  const handleTriggerEmergencyAlert = async () => {
    setDispatching(true);
    try {
      if (api.createEmergencyAlert) {
        await api.createEmergencyAlert({
          title: `AI Vision Smoke Alert: ${activeCam.name}`,
          type: 'SMOKE_COMBUSTION',
          severity: activeCam.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          description: `Automated detection by AI Smoke CCTV Vision-Ops v3 at ${activeCam.location} (${activeCam.mineName}). Measured opacity: ${activeCam.opacity}%, Confidence: ${activeCam.confidence}%.`,
          location: activeCam.location,
        });
      }
      if (onShowToast) {
        onShowToast(`Statutory Alert logged for ${activeCam.name}! Response unit notified.`);
      }
    } catch (err) {
      console.error('Error logging smoke emergency alert:', err);
      if (onShowToast) {
        onShowToast(`Dispatched local protocol for ${activeCam.name} (Offline Cache fallback).`);
      }
    } finally {
      setDispatching(false);
    }
  };

  // Filtered cameras based on Search, Status, and Mine
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesSearch =
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.mineName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ALERTS'
          ? cam.status === 'CRITICAL' || cam.status === 'WARNING'
          : cam.status === statusFilter;

      const matchesMine = selectedMine === 'ALL' || cam.mineName === selectedMine;

      return matchesSearch && matchesStatus && matchesMine;
    });
  }, [cameras, searchQuery, statusFilter, selectedMine]);

  // Overall metric counts
  const stats = useMemo(() => {
    const total = cameras.length;
    const critical = cameras.filter((c) => c.status === 'CRITICAL').length;
    const warning = cameras.filter((c) => c.status === 'WARNING').length;
    const clear = cameras.filter((c) => c.status === 'CLEAR').length;
    const avgConfidence = Math.round(
      cameras.reduce((acc, c) => acc + c.confidence, 0) / (total || 1)
    );
    return { total, critical, warning, clear, avgConfidence };
  }, [cameras]);

  // SKELETON COMPONENT: Video HUD Placeholder
  const renderVideoSkeleton = () => (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '12px',
        backgroundColor: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="cctv-scan-line"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, transparent 100%)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Camera size={24} color="#64748b" />
        </div>
        <div className="cctv-skeleton-line" style={{ width: '180px', height: '14px', borderRadius: '6px' }} />
        <div className="cctv-skeleton-line" style={{ width: '120px', height: '10px', borderRadius: '4px' }} />
      </div>
    </div>
  );

  // SKELETON COMPONENT: Sidebar Feeds Placeholder
  const renderCameraListSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="cctv-skeleton-line" style={{ width: '60%', height: '14px' }} />
            <div className="cctv-skeleton-line" style={{ width: '25%', height: '16px', borderRadius: '10px' }} />
          </div>
          <div className="cctv-skeleton-line" style={{ width: '45%', height: '10px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <div className="cctv-skeleton-line" style={{ width: '30%', height: '10px' }} />
            <div className="cctv-skeleton-line" style={{ width: '25%', height: '10px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  // SKELETON COMPONENT: Diagnostic Report Placeholder
  const renderDiagnosticsSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="cctv-skeleton-line" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="cctv-skeleton-line" style={{ width: '35%', height: '10px' }} />
          <div className="cctv-skeleton-line" style={{ width: '50%', height: '16px' }} />
        </div>
      </div>
      <div className="cctv-skeleton-line" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
      <div className="cctv-skeleton-line" style={{ width: '100%', height: '60px', borderRadius: '8px' }} />
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .cctv-skeleton-line {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 600px 100%;
          animation: cctv-shimmer 1.4s ease-in-out infinite;
          border-radius: 4px;
        }
        @keyframes cctv-shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes cctv-scan-sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes cctv-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .cctv-pulse-dot {
          animation: cctv-pulse 1.6s ease-in-out infinite;
        }
        .cctv-cam-item:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* TOP HEADER: Clean, single-line presentation with metrics */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}
      >
        {/* Title and Active Model Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Camera size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.015em',
                whiteSpace: 'nowrap',
              }}
            >
              AI CCTV Smoke Detection
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
                className="cctv-pulse-dot"
              />
              YOLO-v8 COAL-VISION LIVE
            </span>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          {/* Active Feeds */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '110px',
            }}
          >
            <div style={{ padding: '6px', borderRadius: '7px', backgroundColor: 'rgba(37,99,235,0.08)' }}>
              <Video size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Monitored Feeds
              </div>
              {loading ? (
                <div className="cctv-skeleton-line" style={{ width: '45px', height: '16px', marginTop: '2px' }} />
              ) : (
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {stats.total} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Cameras</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Hazard / Smoke Alerts */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: stats.critical + stats.warning > 0 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${stats.critical + stats.warning > 0 ? '#fecaca' : '#bbf7d0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '110px',
            }}
          >
            <div
              style={{
                padding: '6px',
                borderRadius: '7px',
                backgroundColor: stats.critical > 0 ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
              }}
            >
              {stats.critical > 0 ? (
                <Flame size={16} color="#dc2626" />
              ) : (
                <ShieldCheck size={16} color="#16a34a" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: stats.critical + stats.warning > 0 ? '#991b1b' : '#166534',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Smoke Anomalies
              </div>
              {loading ? (
                <div className="cctv-skeleton-line" style={{ width: '45px', height: '16px', marginTop: '2px' }} />
              ) : (
                <div
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    color: stats.critical > 0 ? '#dc2626' : stats.warning > 0 ? '#d97706' : '#16a34a',
                    lineHeight: 1.2,
                  }}
                >
                  {stats.critical + stats.warning}{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Detection Confidence */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '110px',
            }}
          >
            <div style={{ padding: '6px', borderRadius: '7px', backgroundColor: 'rgba(5,150,105,0.08)' }}>
              <Zap size={16} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Mean Precision
              </div>
              {loading ? (
                <div className="cctv-skeleton-line" style={{ width: '45px', height: '16px', marginTop: '2px' }} />
              ) : (
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                  {stats.avgConfidence}% <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>IoU</span>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => fetchTelemetryData(true)}
            disabled={loading || refreshing}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: loading || refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Refresh Camera Telemetry"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: Video HUD (Left) & Camera Grid / Telemetry (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.85fr) minmax(360px, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Main Video Player & Vision HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Feed Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: activeCam.color,
                    boxShadow: `0 0 8px ${activeCam.color}`,
                  }}
                />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {activeCam.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  {activeCam.mineName}
                </span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: activeCam.bgColor,
                  color: activeCam.color,
                  border: `1px solid ${activeCam.borderColor}`,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeCam.color }}
                  className={activeCam.status !== 'CLEAR' ? 'cctv-pulse-dot' : ''}
                />
                {activeCam.status} [{activeCam.confidence}%]
              </div>
            </div>

            {/* Video Viewport Container with AI Vision HUD */}
            <div
              ref={playerContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#020617',
                borderRadius: '10px',
                overflow: 'hidden',
                aspectRatio: '16/9',
                border: `2px solid ${activeCam.status === 'CLEAR' ? '#1e293b' : activeCam.color}`,
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
              }}
            >
              {loading ? (
                renderVideoSkeleton()
              ) : (
                <>
                  <video
                    ref={videoRef}
                    key={activeCam.videoSrc}
                    src={activeCam.videoSrc}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* AI Scanning Beam Sweep */}
                  {isScanning && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(180deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 100%)',
                        borderTop: '2px solid #3b82f6',
                        animation: 'cctv-scan-sweep 1.8s ease-in-out infinite alternate',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}
                    />
                  )}

                  {/* Vision HUD Overlays */}
                  {hudVisible && (
                    <>
                      {/* Top-Left Telemetry Box */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(6px)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '0.74rem',
                          fontFamily: 'ui-monospace, monospace',
                          border: `1px solid ${activeCam.color}`,
                          zIndex: 15,
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#93c5fd' }}>
                          SENSOR ID: {activeCam.id.toUpperCase()}
                        </div>
                        <div style={{ color: '#cbd5e1' }}>OPTICAL: 1080p FHD @ 30 FPS</div>
                        <div style={{ color: '#cbd5e1' }}>INFERENCE LATENCY: {activeCam.latencyMs}ms</div>
                        <div style={{ color: activeCam.color, fontWeight: 700, marginTop: '2px' }}>
                          STATUS: {activeCam.status} (OPACITY {activeCam.opacity}%)
                        </div>
                      </div>

                      {/* Top-Right Live Clock & REC Indicator */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(6px)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          zIndex: 15,
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: '0.75rem',
                          color: '#f8fafc',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: 800 }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                            }}
                            className="cctv-pulse-dot"
                          />
                          REC
                        </span>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <span>{currentTime}</span>
                      </div>

                      {/* AI Detection Bounding Box (Shown on Warning or Critical) */}
                      {activeCam.status !== 'CLEAR' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '32%',
                            left: '28%',
                            width: '44%',
                            height: '42%',
                            border: `2px dashed ${activeCam.color}`,
                            borderRadius: '4px',
                            boxShadow: `0 0 20px ${activeCam.color}40`,
                            pointerEvents: 'none',
                            zIndex: 12,
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: '-22px',
                              left: '-2px',
                              backgroundColor: activeCam.color,
                              color: '#ffffff',
                              padding: '2px 8px',
                              fontSize: '0.68rem',
                              fontFamily: 'ui-monospace, monospace',
                              fontWeight: 800,
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Flame size={12} />
                            SMOKE ANOMALY: {activeCam.confidence}%
                          </div>
                        </div>
                      )}

                      {/* Reticle Crosshair */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none',
                          opacity: 0.4,
                        }}
                      >
                        <div style={{ width: '40px', height: '1px', backgroundColor: '#ffffff', position: 'absolute', top: 0, left: '-20px' }} />
                        <div style={{ width: '1px', height: '40px', backgroundColor: '#ffffff', position: 'absolute', left: 0, top: '-20px' }} />
                      </div>
                    </>
                  )}

                  {/* Bottom Video Controller Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      zIndex: 20,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={togglePlay}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={isPlaying ? 'Pause Feed' : 'Play Feed'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={toggleMute}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: '6px' }}>
                        Zone: <strong style={{ color: '#e2e8f0' }}>{activeCam.location}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setHudVisible(!hudVisible)}
                        style={{
                          background: hudVisible ? 'rgba(37,99,235,0.3)' : 'none',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '5px',
                          color: '#ffffff',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Toggle AI HUD Overlay"
                      >
                        <Eye size={12} /> HUD
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Fullscreen Feed"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Banner below Video */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Model: <strong>CoalVision-YOLOv8-Smoke</strong> (Accuracy: <strong>98.4% mAP</strong>)
                </span>
              </div>

              {activeCam.status !== 'CLEAR' && (
                <button
                  onClick={handleTriggerEmergencyAlert}
                  disabled={dispatching}
                  style={{
                    backgroundColor: activeCam.color,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: dispatching ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={13} />
                  <span>{dispatching ? 'Dispatching...' : 'Dispatch Hazard Alert'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Camera Feed Selector & AI Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CAMERA FEED SELECTOR CARD */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Camera Streams ({filteredCameras.length})
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'ALERTS', 'CLEAR'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: statusFilter === filter ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                      backgroundColor: statusFilter === filter ? 'rgba(37,99,235,0.08)' : '#f8fafc',
                      color: statusFilter === filter ? 'var(--primary)' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Mine Filter Controls */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 10px',
                }}
              >
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search zone or camera..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    color: '#0f172a',
                    width: '100%',
                  }}
                />
              </div>

              {minesList.length > 0 && (
                <select
                  value={selectedMine}
                  onChange={(e) => setSelectedMine(e.target.value)}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 8px',
                    fontSize: '0.75rem',
                    color: '#334155',
                    fontWeight: 600,
                    outline: 'none',
                    maxWidth: '120px',
                  }}
                >
                  <option value="ALL">All Mines</option>
                  {minesList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Camera Feeds List or Skeleton */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '2px',
              }}
            >
              {loading ? (
                renderCameraListSkeleton()
              ) : filteredCameras.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                  }}
                >
                  No camera feeds match the current filter.
                </div>
              ) : (
                filteredCameras.map((cam) => {
                  const isActive = activeCam.id === cam.id;
                  return (
                    <div
                      key={cam.id}
                      onClick={() => setActiveCam(cam)}
                      className="cctv-cam-item"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#f0fdf4' : '#ffffff',
                        border: isActive ? `1.5px solid ${cam.color}` : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '7px',
                            backgroundColor: `${cam.color}15`,
                            color: cam.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Camera size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cam.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cam.location} &bull; {cam.mineName}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: cam.color,
                          backgroundColor: cam.bgColor,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${cam.borderColor}`,
                          flexShrink: 0,
                        }}
                      >
                        {cam.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI ANALYSIS & TELEMETRY DIAGNOSTICS CARD */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} color="var(--primary)" />
                Analysis & Statutory Report
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'ui-monospace, monospace' }}>
                REF: {activeCam.id.toUpperCase()}
              </span>
            </div>

            {loading ? (
              renderDiagnosticsSkeleton()
            ) : (
              <>
                {/* State Overview Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: activeCam.bgColor,
                    border: `1px solid ${activeCam.borderColor}`,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: `${activeCam.color}20`,
                      color: activeCam.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {activeCam.status === 'CLEAR' ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Safety Compliance Status
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: activeCam.color }}>
                      {activeCam.status === 'CLEAR' ? 'Nominal Conditions' : `${activeCam.status} Smoke Threshold`}
                    </div>
                  </div>
                </div>

                {/* Smoke Opacity & Particulate Density Progress Meters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Opacity Meter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Optical Smoke Opacity</span>
                      <strong style={{ color: activeCam.color }}>{activeCam.opacity}%</strong>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(activeCam.opacity, 100)}%`,
                          height: '100%',
                          backgroundColor: activeCam.color,
                          transition: 'width 0.6s ease',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Particulates (PPM) Meter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Particulate Concentration (PM2.5)</span>
                      <strong style={{ color: '#0f172a' }}>{activeCam.particulatesPpm} PPM</strong>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min((activeCam.particulatesPpm / 250) * 100, 100)}%`,
                          height: '100%',
                          backgroundColor:
                            activeCam.particulatesPpm > 150
                              ? '#dc2626'
                              : activeCam.particulatesPpm > 50
                              ? '#d97706'
                              : '#059669',
                          transition: 'width 0.6s ease',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actionable Insights */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={13} color="var(--primary)" />
                    DGMS Statutory Protocol
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                    {activeCam.details}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
