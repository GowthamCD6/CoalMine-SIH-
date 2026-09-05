import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  AlertTriangle, 
  Activity, 
  Terminal, 
  User, 
  LogOut, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

export default function Header({
  serverStatus,
  onRefreshStatus,
  isRefreshing,
  onTriggerEmergency,
  onToggleDiagnostics,
  diagnosticsCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onSearch,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '380px' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-light)',
        }} />
        <input
          type="text"
          placeholder="Search mines, violations, personnel, or equipment..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="input-white"
          style={{
            paddingLeft: '40px',
            paddingRight: '60px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid transparent',
            fontSize: '0.85rem',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            if (!searchValue) e.target.style.backgroundColor = 'var(--bg-surface-subtle)';
            e.target.style.borderColor = 'transparent';
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.7rem',
          color: 'var(--text-light)',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 600,
        }}>⌘K</span>
      </form>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Backend Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: serverStatus.online ? 'var(--success-light)' : 'var(--warning-light)',
          border: `1px solid ${serverStatus.online ? 'var(--success-border)' : 'var(--warning-border)'}`,
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: serverStatus.online ? 'var(--success-text)' : 'var(--warning-text)',
        }}>
          <div className="pulse-dot" style={{
            backgroundColor: serverStatus.online ? 'var(--success)' : 'var(--warning)',
          }} />
          <span>{serverStatus.online ? 'Node API v1 Online' : 'Demo / Standalone Mode'}</span>
          <button 
            onClick={onRefreshStatus}
            title="Recheck Server Health"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'inherit',
              padding: '2px',
              borderRadius: '4px',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
          </button>
        </div>

        {/* Emergency SOS Broadcast Header Button */}
        <button
          onClick={onTriggerEmergency}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            backgroundColor: 'var(--danger)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.03em',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
            border: 'none',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
        >
          <AlertTriangle size={15} />
          <span>EMERGENCY SOS</span>
        </button>

        {/* API Diagnostics Drawer Toggle */}
        <button
          onClick={onToggleDiagnostics}
          title="Open API & RBAC Scope Diagnostics Console"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--text-body)',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <Terminal size={15} color="var(--primary)" />
          <span>API Diagnostics</span>
          {diagnosticsCount > 0 && (
            <span style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
            }}>
              {diagnosticsCount}
            </span>
          )}
        </button>

        {/* User Profile / Switch Role Badge */}
        {currentUser ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 6px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              {currentUser.first_name ? currentUser.first_name[0] : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {currentUser.first_name} {currentUser.last_name || ''}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                {currentUser.role || 'Superadmin'} • {currentUser.scope_type || 'GLOBAL'}
              </span>
            </div>
            <button
              onClick={onOpenAuth}
              title="Switch user or view permissions"
              style={{
                padding: '4px 6px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                borderRadius: '4px',
                marginLeft: '4px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Switch
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
