import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  Database,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Server,
  BellRing,
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function DashboardOverview({ serverStatus, onNavigateTo }) {
  const [counts, setCounts] = useState({
    orgs: 0,
    mines: 0,
    users: 0,
    roles: 0,
    permissions: 0,
    auditLogs: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [orgsRes, minesRes, usersRes, rolesRes, permsRes, auditRes] = await Promise.allSettled([
          api.getOrganizations({ limit: 1 }),
          api.getMines({ limit: 1 }),
          api.getUsers({ limit: 1 }),
          api.getRoles({ limit: 1 }),
          api.getPermissions({ limit: 1 }),
          api.getAuditLogs({ limit: 5 }),
        ]);

        setCounts({
          orgs: orgsRes.status === 'fulfilled' ? (orgsRes.value?.meta?.total ?? (Array.isArray(orgsRes.value) ? orgsRes.value.length : 0)) : 0,
          mines: minesRes.status === 'fulfilled' ? (minesRes.value?.meta?.total ?? (Array.isArray(minesRes.value) ? minesRes.value.length : 0)) : 0,
          users: usersRes.status === 'fulfilled' ? (usersRes.value?.meta?.total ?? (Array.isArray(usersRes.value) ? usersRes.value.length : 0)) : 0,
          roles: rolesRes.status === 'fulfilled' ? (rolesRes.value?.meta?.total ?? (Array.isArray(rolesRes.value) ? rolesRes.value.length : 0)) : 0,
          permissions: permsRes.status === 'fulfilled' ? (permsRes.value?.meta?.total ?? (Array.isArray(permsRes.value) ? permsRes.value.length : 0)) : 0,
          auditLogs: auditRes.status === 'fulfilled' ? (auditRes.value?.meta?.total ?? (Array.isArray(auditRes.value) ? auditRes.value.length : 0)) : 0,
        });

        if (auditRes.status === 'fulfilled') {
          const logsList = Array.isArray(auditRes.value) ? auditRes.value : (auditRes.value?.logs || auditRes.value?.rows || []);
          setRecentLogs(logsList.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { title: 'Organizations', count: counts.orgs, icon: Building2, color: '#2563eb', tab: 'organizations' },
    { title: 'Mines / Sites', count: counts.mines, icon: Layers, color: '#059669', tab: 'mines' },
    { title: 'Registered Users', count: counts.users, icon: Users, color: '#7c3aed', tab: 'users' },
    { title: 'RBAC Roles', count: counts.roles, icon: ShieldCheck, color: '#d97706', tab: 'rbac' },
    { title: 'Safety & Alerts Dispatch', count: 'Live Matrix', icon: BellRing, color: '#dc2626', tab: 'alerts' },
    { title: 'Audit Trail Records', count: counts.auditLogs, icon: FileText, color: '#0284c7', tab: 'audit' },
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: serverStatus.online ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: serverStatus.online ? '#4ade80' : '#f87171',
              fontSize: '0.8rem',
              fontWeight: '600',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: serverStatus.online ? '#22c55e' : '#ef4444',
              }} />
              {serverStatus.online ? 'TiDB Connected' : 'Server Offline'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>SIH26024 Backend v1.0.0</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>CoalMin Enterprise Management</h1>
          <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            Multi-tier Role-Based Access Control & Core Mining Governance Platform
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="sleek-card" style={{
            padding: '1rem 1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TiDB SSL</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0284c7', marginTop: '4px' }}>TLSv1.2</div>
          </div>
          <div className="sleek-card" style={{
            padding: '1rem 1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Prefix</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a34a', marginTop: '4px' }}>/api/v1</div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="sleek-card"
              onClick={() => onNavigateTo && onNavigateTo(card.tab)}
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={18} style={{ color: '#94a3b8' }} />
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>
                  {loading ? '...' : card.count}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                  {card.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Audit Logs & System Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Audit Activity */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>Recent System Audit Events</h3>
            <button
              onClick={() => onNavigateTo && onNavigateTo('audit')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Full Trail &rarr;
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              No recent audit log entries. Perform write operations to view the live audit trail.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: log.action === 'CREATE' ? '#dcfce7' : log.action === 'UPDATE' ? '#fef3c7' : '#fee2e2',
                      color: log.action === 'CREATE' ? '#166534' : log.action === 'UPDATE' ? '#92400e' : '#991b1b',
                    }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      by {log.username || (log.user_id ? `User #${log.user_id}` : 'System')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System & Architecture Info */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>System Stack</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Database Engine</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>TiDB Serverless</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Protocol</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>MySQL 8.0+ Compatible</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Authentication</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>JWT + Sessions Table</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>RBAC Inheritance</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Role + Subrole Union</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Swagger Spec</span>
              <a href="http://localhost:5001/api/docs" target="_blank" rel="noreferrer" style={{ fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}>
                /api/docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
