import React, { useState } from 'react';
import { 
  Search, 
  Activity, 
  Terminal, 
  User, 
  LogOut, 
  ShieldCheck, 
  RefreshCw,
  BookOpen
} from 'lucide-react';

export default function Header({
  serverStatus,
  onRefreshStatus,
  isRefreshing,
  onToggleDiagnostics,
  diagnosticsCount,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      {/* Title / Scope info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
          CoalMin REST API Management
        </span>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          fontWeight: '600',
        }}>
          Express 4.21 + TiDB
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Backend Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: serverStatus.online ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${serverStatus.online ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: serverStatus.online ? '#065f46' : '#991b1b',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: serverStatus.online ? '#10b981' : '#ef4444',
          }} />
          <span>{serverStatus.online ? 'TiDB Cloud API Online' : 'Backend Offline'}</span>
          <button 
            onClick={onRefreshStatus}
            title="Recheck Server Health"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'inherit',
              padding: '2px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Swagger Docs Link */}
        <a
          href="http://localhost:5000/api/docs"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#334155',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <BookOpen size={15} color="#2563eb" />
          <span>Swagger Docs</span>
        </a>

        {/* API Diagnostics Drawer Toggle */}
        <button
          onClick={onToggleDiagnostics}
          title="Open API & Diagnostics Inspector"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Terminal size={15} color="#2563eb" />
          <span>API Inspector</span>
          {diagnosticsCount > 0 && (
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700,
            }}>
              {diagnosticsCount}
            </span>
          )}
        </button>

        {/* User Profile / Auth */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 6px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              {currentUser.first_name ? currentUser.first_name[0] : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                {currentUser.first_name || currentUser.username} {currentUser.last_name || ''}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
                {currentUser.email || 'Super Administrator'}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Logout session"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                color: '#ef4444',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginLeft: '4px',
              }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
