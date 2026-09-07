import React, { useState } from 'react';
import { Pickaxe, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api.js';

export default function LoginPage({ onLoginSuccess }) {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(loginInput, passwordInput);
      let userProfile = res?.user || res;
      try {
        const me = await api.getMe();
        if (me && me.id) {
          userProfile = me;
        }
      } catch (meErr) {
        console.warn('Could not fetch enriched profile, using login payload:', meErr.message);
      }
      onLoginSuccess(userProfile);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials. Please check your username/email and password.');
    } finally {
      setLoading(false);
    }
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
                  placeholder="Enter username or email address"
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
