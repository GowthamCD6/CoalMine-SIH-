import React, { useState, useEffect } from 'react';
import { 
  Pickaxe, 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  Radio, 
  TrendingUp, 
  RefreshCw,
  Server,
  Database
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [serverOnline, setServerOnline] = useState(false);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/health');
      if (res.ok) {
        setServerOnline(true);
        const statsRes = await fetch('http://localhost:5000/api/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setServerStats(data);
        }
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    } finally {
      setLoading(false);
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Pickaxe size={22} />
          </div>
          <div>
            <div className="brand-name">CoalMin</div>
            <span className="brand-tag">SIH Platform</span>
          </div>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Live Telemetry</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'mines' ? 'active' : ''}`}
            onClick={() => setActiveTab('mines')}
          >
            <Layers size={18} />
            <span>Mine Sites</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <ShieldAlert size={18} />
            <span>Safety & Alerts</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'sensors' ? 'active' : ''}`}
            onClick={() => setActiveTab('sensors')}
          >
            <Cpu size={18} />
            <span>IoT Sensors</span>
          </button>
        </nav>
      </aside>

      {/* Main Dashboard */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Operational Overview</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Real-time telemetry and management portal
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`server-status-pill ${serverOnline ? 'online' : 'offline'}`}>
              <div className="pulse-dot" />
              <span>{serverOnline ? 'Node Server Connected' : 'Server Offline (Port 5000)'}</span>
            </div>

            <button 
              className="nav-btn glass-panel" 
              style={{ padding: '0.5rem 0.85rem' }}
              onClick={fetchServerStatus}
              title="Refresh server status"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span style={{ fontSize: '0.8rem' }}>Check Status</span>
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="metrics-grid">
          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span>Active Mining Units</span>
              <Layers size={18} color="var(--amber-400)" />
            </div>
            <div className="metric-value">{serverStats ? serverStats.minesActive : '12'}</div>
            <div className="metric-sub">Across 4 regional sectors</div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span>Daily Output (Tons)</span>
              <TrendingUp size={18} color="var(--emerald-400)" />
            </div>
            <div className="metric-value">{serverStats ? serverStats.productionTodayTons.toLocaleString() : '4,520'}</div>
            <div className="metric-sub">+6.4% vs yesterday target</div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span>Active IoT Mesh</span>
              <Radio size={18} color="var(--cyan-400)" />
            </div>
            <div className="metric-value">{serverStats ? serverStats.sensorsOnline : '148'}</div>
            <div className="metric-sub">Gas, Temp & Vibration nodes</div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span>Operational Efficiency</span>
              <ShieldAlert size={18} color="var(--amber-500)" />
            </div>
            <div className="metric-value">{serverStats ? serverStats.operationalEfficiency : '94.8%'}</div>
            <div className="metric-sub">Zero critical incidents logged</div>
          </div>
        </section>

        {/* Dynamic Sections */}
        <div className="dashboard-sections">
          <div className="glass-panel section-card">
            <div className="section-title">Active Pit & Shaft Monitoring</div>
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>Site Code</th>
                  <th>Zone / Seam</th>
                  <th>CH4 Gas Level</th>
                  <th>Ventilation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>PIT-ALPHA-01</td>
                  <td>Eastern Seam #4</td>
                  <td>0.18% (Safe)</td>
                  <td>98.2 m³/s</td>
                  <td><span className="badge badge-success">Nominal</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>SHAFT-BETA-03</td>
                  <td>Underground Block C</td>
                  <td>0.31% (Normal)</td>
                  <td>112.5 m³/s</td>
                  <td><span className="badge badge-success">Nominal</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>PIT-GAMMA-09</td>
                  <td>Deep Incline Quarry</td>
                  <td>0.48% (Elevated)</td>
                  <td>84.0 m³/s</td>
                  <td><span className="badge badge-warning">Caution</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>EXP-DELTA-02</td>
                  <td>South Expansion Track</td>
                  <td>0.12% (Safe)</td>
                  <td>95.0 m³/s</td>
                  <td><span className="badge badge-success">Nominal</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="glass-panel section-card">
            <div className="section-title">Backend Architecture</div>
            <div className="logs-list">
              <div className="log-item">
                <Server size={18} color="var(--emerald-400)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Node.js & Express API</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Listening on port 5000 (CORS enabled)
                  </div>
                </div>
              </div>

              <div className="log-item">
                <Database size={18} color="var(--cyan-400)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Health & Stats Endpoint</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <code>/api/health</code>, <code>/api/stats</code>
                  </div>
                </div>
              </div>

              <div className="log-item">
                <Pickaxe size={18} color="var(--amber-400)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Vite React Frontend</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Package: <code>coalmin</code> | React 19
                  </div>
                </div>
              </div>
            </div>
            {lastCheck && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Last checked: {lastCheck}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
