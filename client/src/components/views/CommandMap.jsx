import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2, 
  Layers, 
  Info,
  Navigation
} from 'lucide-react';
import { initialMines } from '../../data/mockData.js';

export default function CommandMap({ onShowToast }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedMine, setSelectedMine] = useState(initialMines[1]); // Default Jharia
  const [activeLayer, setActiveLayer] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'OPEN_CAST' | 'UNDERGROUND'

  useEffect(() => {
    // Check if Leaflet L is loaded from window (via index.html CDN)
    if (!window.L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    // Centered around eastern India coal belt
    const map = L.map(mapContainerRef.current).setView([22.8, 85.8], 6);
    mapInstanceRef.current = map;

    // Beautiful Light Theme Tile Layer (Carto Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    // Filter mines based on layer
    const displayMines = initialMines.filter((mine) => {
      if (activeLayer === 'CRITICAL') return mine.id === 2;
      if (activeLayer === 'OPEN_CAST') return mine.mine_type === 'OPEN_CAST';
      if (activeLayer === 'UNDERGROUND') return mine.mine_type === 'UNDERGROUND';
      return true;
    });

    displayMines.forEach((mine) => {
      const isCritical = mine.id === 2; // Jharia has critical sub-surface heating

      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: ${isCritical ? '24px' : '16px'};
              height: ${isCritical ? '24px' : '16px'};
              border-radius: 50%;
              background-color: ${isCritical ? '#ef4444' : '#2563eb'};
              border: 3px solid #ffffff;
              box-shadow: 0 2px 10px ${isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(37, 99, 235, 0.4)'};
            "></div>
            ${isCritical ? `
              <div style="
                position: absolute;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                border: 2px solid rgba(239, 68, 68, 0.5);
                animation: pulseGlow 1.5s infinite ease-in-out;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([mine.lat, mine.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="padding: 6px; font-family: 'Inter', sans-serif;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
            ${mine.name}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            Type: <strong>${mine.mine_type}</strong> • State: <strong>${mine.state}</strong>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            Personnel Underground: <strong>${mine.personnelUnderground}</strong>
          </div>
          <div style="font-size: 12px; color: ${isCritical ? '#ef4444' : '#10b981'}; font-weight: 700;">
            CH4 Level: ${mine.methaneLevel}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedMine(mine);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={28} color="var(--primary)" />
            National GIS Command & Telemetry Map
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '3px' }}>
            Multi-basin geospatial telemetry overlays, subsurface thermal risk zones, and live mine coordinates
          </p>
        </div>

        {/* Layer Filters */}
        <div style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#ffffff',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          {['ALL', 'CRITICAL', 'OPEN_CAST', 'UNDERGROUND'].map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeLayer === layer ? 'var(--primary)' : 'transparent',
                color: activeLayer === layer ? '#ffffff' : 'var(--text-body)',
              }}
            >
              {layer.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Map Card */}
      <div className="card-white" style={{ overflow: 'hidden', padding: '1rem' }}>
        <div
          ref={mapContainerRef}
          style={{
            height: '520px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}
        />
      </div>

      {/* Cluster Telemetry Drilldown Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Selected Mine Spotlight */}
        <div className="card-white" style={{
          padding: '1.25rem',
          borderLeft: `4px solid ${selectedMine.id === 2 ? 'var(--danger)' : 'var(--primary)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge-pill badge-primary" style={{ marginBottom: '6px' }}>
                Selected Basin
              </span>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{selectedMine.name}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Code: <strong>{selectedMine.code}</strong> • {selectedMine.mine_type}
              </span>
            </div>
            <Navigation size={18} color="var(--primary)" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginTop: '1rem',
            padding: '10px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Underground Headcount</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedMine.personnelUnderground}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Methane Level</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedMine.id === 2 ? 'var(--danger)' : 'var(--success)' }}>
                {selectedMine.methaneLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Thermal Hazard Notice */}
        <div className="card-white" style={{
          padding: '1.25rem',
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '6px' }}>
            <Flame size={20} />
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--danger-text)' }}>
              Thermal Heating Zone: Jharia Block II
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.4, margin: '6px 0 12px' }}>
            Subterranean thermal sensors indicate elevated core seam temperatures (+4.2°C anomaly). Continuous nitrogen infusion borehole #09 operational.
          </p>
          <button
            onClick={() => {
              if (onShowToast) onShowToast('Nitrogen purge increased to 450 m³/hr in Jharia Seam 4.');
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            Acknowledge & Boost Nitrogen Flush
          </button>
        </div>

        {/* Talcher Corridor Note */}
        <div className="card-white" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '6px' }}>
            <ShieldCheck size={20} />
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>
              Talcher & Raniganj Corridors
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '6px 0 12px' }}>
            Mahanadi (MCL) and Eastern Coalfields (ECL) rail evacuation corridors operating at 98.2% throughput efficiency with zero safety alerts.
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
            ✓ Next Statutory Flyover Drone Survey: Tomorrow 09:00 AM
          </div>
        </div>
      </div>
    </div>
  );
}
