import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, ShieldCheck, Activity, Video, Info } from 'lucide-react';

const CAMERAS = [
  {
    id: 'cam-01',
    name: 'CAM-01 (Shaft Alpha)',
    videoSrc: '/videos/test.mp4',
    status: 'CLEAR',
    confidence: '99%',
    details: 'Baseline conditions normal. No particulate anomalies detected in air quality sensors.',
    color: 'var(--success)'
  },
  {
    id: 'cam-02',
    name: 'CAM-02 (Conveyor Belt C)',
    videoSrc: '/videos/light-smoke.mp4',
    status: 'WARNING',
    confidence: '78%',
    details: 'AI Vision detects low-density smoke patterns. Potential overheating or early-stage combustion. Ventilation system alerted.',
    color: 'var(--warning)'
  },
  {
    id: 'cam-03',
    name: 'CAM-03 (Processing Plant)',
    videoSrc: '/videos/high-smoke.mp4',
    status: 'CRITICAL',
    confidence: '96%',
    details: 'High-density smoke hazard detected. Opacity levels exceed safety thresholds. Immediate evacuation protocol recommended.',
    color: 'var(--danger)'
  }
];

export default function SmokeDetectionView() {
  const [activeCam, setActiveCam] = useState(CAMERAS[0]);
  const [isScanning, setIsScanning] = useState(true);

  // Re-trigger scanning animation when camera changes
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, [activeCam.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={26} color="var(--primary)" />
            AI CCTV Smoke Detection
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
            Real-time computer vision analysis of underground and surface camera feeds.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge-pill badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> AI Engine Active
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Video Player Section */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} color="var(--primary)" /> Live Feed: {activeCam.name}
            </h3>
            <span style={{ color: activeCam.color, fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeCam.color, 
                boxShadow: `0 0 8px ${activeCam.color}` 
              }} />
              REC
            </span>
          </div>
          
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            backgroundColor: '#000', 
            borderRadius: '8px', 
            overflow: 'hidden',
            aspectRatio: '16/9',
            border: `2px solid ${activeCam.status === 'CLEAR' ? 'transparent' : activeCam.color}`
          }}>
            {/* The Video Element */}
            <video 
              key={activeCam.videoSrc}
              src={activeCam.videoSrc} 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* AI Scanning Overlay */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(180deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 100%)',
                borderTop: '2px solid var(--primary)',
                animation: 'scan 2s ease-in-out infinite alternate',
                pointerEvents: 'none'
              }} />
            )}

            {/* AI Overlay Stats */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              padding: '8px 12px',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              border: `1px solid ${activeCam.color}`
            }}>
              <div>TARGET: {activeCam.id.toUpperCase()}</div>
              <div>MODEL: Vision-Ops-v3</div>
              <div style={{ color: activeCam.color, marginTop: '4px' }}>
                STATUS: {activeCam.status} [{activeCam.confidence}]
              </div>
            </div>
            
            {/* Crosshairs to look cool */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', top: '50%', left: '-20px' }} />
              <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', left: '50%', top: '-20px' }} />
            </div>
          </div>
        </div>

        {/* Sidebar Controls Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Camera Selection */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>Select Camera Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {CAMERAS.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => setActiveCam(cam)}
                  className="sleek-btn"
                  style={{
                    justifyContent: 'flex-start',
                    backgroundColor: activeCam.id === cam.id ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                    border: activeCam.id === cam.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    padding: '12px',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ fontWeight: '600', color: activeCam.id === cam.id ? 'var(--primary)' : 'var(--text-main)' }}>
                      {cam.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: cam.color }}>
                      {cam.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Analysis Results */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} /> Analysis Report
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: `${activeCam.color}20`,
                  color: activeCam.color 
                }}>
                  {activeCam.status === 'CLEAR' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current State</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: activeCam.color }}>{activeCam.status}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
              
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Confidence</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: activeCam.confidence, height: '100%', backgroundColor: activeCam.color, transition: 'width 0.5s ease-out' }} />
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{activeCam.confidence}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Actionable Insights</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: 0, color: 'var(--text-body)' }}>
                  {activeCam.details}
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
