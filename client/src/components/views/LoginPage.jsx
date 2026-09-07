import React, { useState } from 'react';
import { Pickaxe, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Database, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api.js';

export default function LoginPage({ onLoginSuccess }) {
  const [loginInput, setLoginInput] = useState('admin@coalmin.org');
  const [passwordInput, setPasswordInput] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(loginInput, passwordInput);
      onLoginSuccess(res?.user || res);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials. Please check your username/email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (email, pass) => {
    setLoginInput(email);
    setPasswordInput(pass);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-gradient)',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        overflow: 'hidden',
      }}>
        {/* Top Header Banner */}
        <div style={{
          padding: '2rem 2rem 1.75rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        }}>
          <div className="sleek-card" style={{
            width: '52px',
            height: '52px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          }}>
            <Pickaxe size={26} />
          </div>

          <h1 style={{
            margin: 0,
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
          }}>
            CoalMin Platform
          </h1>
          <p style={{
            margin: '6px 0 0 0',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}>
            SIH26024 Multi-Tier Governance & RBAC Portal
          </p>
        </div>

        {/* Form Area */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Login input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }} />
                <input
                  type="text"
                  required
                  autoFocus
                  className="sleek-input"
                  placeholder="admin@coalmin.org or superadmin"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                  }}
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="sleek-input"
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '42px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="sleek-btn"
              style={{
                marginTop: '0.5rem',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'Verifying & Signing In...' : 'Sign In to Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Credential Quickfill Helper */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '8px',
              textAlign: 'center',
            }}>
              Quick Logins (Multi-Tier Hierarchy)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="sleek-btn"
                onClick={() => handleFillCredentials('superadmin', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: 'rgba(254, 252, 232, 0.5)',
                  fontSize: '0.78rem',
                  color: '#92400e',
                  textAlign: 'left',
                }}
              >
                <div>👑 Super Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#b45309' }}>superadmin (Global)</div>
              </button>

              <button
                type="button"
                className="sleek-btn"
                onClick={() => handleFillCredentials('ecl_admin', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: 'rgba(239, 246, 255, 0.5)',
                  fontSize: '0.78rem',
                  color: '#1e40af',
                  textAlign: 'left',
                }}
              >
                <div>🏢 ECL Org Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>ecl_admin (Org Tier)</div>
              </button>

              <button
                type="button"
                className="sleek-btn"
                onClick={() => handleFillCredentials('ecl_advisor', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: 'rgba(248, 250, 252, 0.5)',
                  fontSize: '0.78rem',
                  color: '#334155',
                  textAlign: 'left',
                }}
              >
                <div>👔 ECL Site Advisor</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ecl_advisor (Org Scope)</div>
              </button>

              <button
                type="button"
                className="sleek-btn"
                onClick={() => handleFillCredentials('rj_mine_admin', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: 'rgba(236, 253, 245, 0.5)',
                  fontSize: '0.78rem',
                  color: '#065f46',
                  textAlign: 'left',
                }}
              >
                <div>⛏️ Rajmahal Mine Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#059669' }}>rj_mine_admin (Mine Scope)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          backgroundColor: 'rgba(248, 250, 252, 0.4)',
          padding: '1rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.6)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          Personnel accounts are provisioned exclusively by authorized Administrators.
        </div>
      </div>
    </div>
  );
}
