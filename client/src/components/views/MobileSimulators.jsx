import React, { useState } from 'react';
import { 
  Camera, 
  Wifi, 
  Radio, 
  ShieldCheck, 
  FileText, 
  QrCode, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  HardHat,
  Battery,
  Signal
} from 'lucide-react';

export default function MobileSimulators({ activeSubScreen = 'camera', onShowToast }) {
  const [currentScreen, setCurrentScreen] = useState(activeSubScreen);
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(3);
  const [sosFired, setSosFired] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrText, setOcrText] = useState(null);

  const handleSnapPhoto = () => {
    setPhotoSnapped(true);
    setTimeout(() => setPhotoSnapped(false), 200);
    if (onShowToast) onShowToast('📸 Hazard photo captured & geotagged (Depth: -120m, Lat: 23.7957° N)');
  };

  const handleSyncQueue = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setQueueCount(0);
      if (onShowToast) onShowToast('✓ 3 cached offline hazard reports synced with surface cloud!');
    }, 1200);
  };

  const handleSosPress = () => {
    setSosFired(true);
    if (onShowToast) onShowToast('🚨 DISTRESS BEACON ACTIVATED! Surface rescue alerted.', true);
  };

  const handleRunOcr = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOcrText('EXTRACTED LOGBOOK TEXT: Shift 2 Ventilation: 98.4 m³/s. Gas test at 08:30: CH4=0.18%, CO=4ppm. Statutory safety inspection passed.');
      if (onShowToast) onShowToast('✨ Handwritten logbook digitized: 42 words extracted.');
    }, 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', alignItems: 'center' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', maxWidth: '640px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Field Agent Mobile Device Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
          Simulates subterranean edge tools used by underground miners and statutory safety inspectors
        </p>

        {/* Screen Switcher Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '1rem',
          backgroundColor: '#ffffff',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'camera', label: 'Hazard Camera', icon: Camera },
            { id: 'sync', label: 'Offline Sync', icon: Wifi },
            { id: 'sos', label: 'SOS Panic Button', icon: Radio },
            { id: 'rfid', label: 'Beacon Pass', icon: ShieldCheck },
            { id: 'ocr', label: 'OCR Scanner', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentScreen(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-body)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div style={{
        width: '340px',
        height: '650px',
        backgroundColor: '#0f172a',
        borderRadius: '44px',
        border: '10px solid #1e293b',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 2px #cbd5e1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Mobile Notch & Status Bar */}
        <div style={{
          height: '34px',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 600,
          zIndex: 10,
        }}>
          <span>09:42</span>
          {/* Dynamic Island / Speaker Pill */}
          <div style={{
            width: '80px',
            height: '16px',
            backgroundColor: '#000000',
            borderRadius: '10px',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Signal size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Screen Content */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* 1. Camera View */}
          {currentScreen === 'camera' && (
            <div style={{ flex: 1, position: 'relative', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column' }}>
              {/* Simulated Camera Feed Background */}
              <div style={{
                flex: 1,
                backgroundImage: 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {photoSnapped && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff', zIndex: 20 }} />
                )}

                {/* Viewfinder Reticle */}
                <div style={{
                  width: '180px',
                  height: '180px',
                  border: '2px dashed rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' }} />
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' }} />
                </div>

                {/* Geotag Overlay HUD */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.3,
                }}>
                  <div style={{ color: 'var(--primary-border)', fontWeight: 700 }}>GEO-STAMP SENSOR MESH</div>
                  <div>LAT: 23.7957° N | LON: 86.4304° E</div>
                  <div>DEPTH: -120m | SEAM: Jharia Seam 4</div>
                  <div>BEARING: 184° S | METHANE: 0.18%</div>
                </div>
              </div>

              {/* Shutter Controls */}
              <div style={{
                height: '90px',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <button
                  onClick={handleSnapPhoto}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '3px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                </button>
              </div>
            </div>
          )}

          {/* 2. Offline Sync View */}
          {currentScreen === 'sync' && (
            <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <Wifi size={28} />
                </div>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Surface Mesh Detected</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tunnel Gateway Node #04 Connected
                </span>
              </div>

              <div className="card-white" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Offline Storage Queue</span>
                  <span className="badge-pill badge-warning">{queueCount} Pending</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  IndexedDB local store holds 3 geotagged photos & safety notes captured underground.
                </div>
              </div>

              <button
                onClick={handleSyncQueue}
                disabled={syncing || queueCount === 0}
                style={{
                  padding: '12px',
                  backgroundColor: queueCount === 0 ? 'var(--bg-surface-subtle)' : 'var(--primary)',
                  color: queueCount === 0 ? 'var(--text-muted)' : '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} />
                <span>{syncing ? 'Syncing Payloads...' : queueCount === 0 ? 'All Payloads Synced' : 'Sync Offline Payloads'}</span>
              </button>
            </div>
          )}

          {/* 3. SOS Panic Button */}
          {currentScreen === 'sos' && (
            <div style={{
              flex: 1,
              backgroundColor: '#000000',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '2rem' }}>
                Glove-friendly tactile trigger.<br />Tap to instantly blast location to surface command.
              </p>

              {/* Giant Red SOS Trigger Button */}
              <div
                onClick={handleSosPress}
                style={{
                  width: '170px',
                  height: '170px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  letterSpacing: '3px',
                  boxShadow: '0 0 50px rgba(239, 68, 68, 0.7)',
                  cursor: 'pointer',
                  border: '8px solid rgba(255, 255, 255, 0.25)',
                  animation: 'pulseGlow 1.5s infinite ease-in-out',
                }}
              >
                <span>S O S</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1px' }}>PANIC</span>
              </div>

              {sosFired && (
                <div style={{
                  marginTop: '2rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--danger)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  BEACON TRANSMITTING ON 433.92 MHz
                </div>
              )}
            </div>
          )}

          {/* 4. Beacon Proximity Pass */}
          {currentScreen === 'rfid' && (
            <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
              <div className="card-white" style={{
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}>
                  RK
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Ramesh Kumar</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sr. Field Rescue Technician • EMP-8492
                </span>

                {/* Simulated QR Code */}
                <div style={{
                  margin: '1.25rem 0',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                }}>
                  <div style={{
                    width: '130px',
                    height: '130px',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}>
                    <QrCode size={100} />
                  </div>
                </div>

                <span className="badge-pill badge-success" style={{ padding: '6px 12px' }}>
                  ✓ Cleared for Zones A, B, C & Deep Incline
                </span>
              </div>
            </div>
          )}

          {/* 5. OCR Scanner */}
          {currentScreen === 'ocr' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
              {/* Camera Scanner Reticle */}
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
              }}>
                <div style={{
                  width: '100%',
                  height: '180px',
                  border: '2px dashed #3b82f6',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  padding: '10px',
                }}>
                  {/* Laser Scan Line */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 8px #ef4444',
                    animation: 'pulseGlow 1s infinite alternate',
                  }} />
                  <span>Align physical logbook text within frame</span>
                </div>
              </div>

              {/* Extracted Text Output */}
              {ocrText && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '10px 14px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  {ocrText}
                </div>
              )}

              {/* Action Button */}
              <div style={{ padding: '1rem', backgroundColor: '#1e293b' }}>
                <button
                  onClick={handleRunOcr}
                  disabled={ocrScanning}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} />
                  <span>{ocrScanning ? 'Scanning Logbook...' : 'Run OCR Text Extraction'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Home Indicator Bar */}
        <div style={{
          height: '20px',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ width: '100px', height: '4px', backgroundColor: '#475569', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
}
