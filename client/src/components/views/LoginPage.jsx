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
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.18) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(15, 23, 42, 1) 0px, transparent 100%)
      `,
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}>
        {/* Top Header Banner */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem 2rem 1.75rem',
          textAlign: 'center',
          borderBottom: '1px solid #334155',
          color: '#ffffff',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.35)',
            marginBottom: '1rem',
          }}>
            <Pickaxe size={26} />
          </div>

          <h1 style={{
            margin: 0,
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}>
            CoalMin Platform
          </h1>
          <p style={{
            margin: '6px 0 0 0',
            color: '#94a3b8',
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
                  placeholder="admin@coalmin.org or superadmin"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
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
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
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
              style={{
                marginTop: '0.5rem',
                padding: '12px 18px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              {loading ? 'Verifying & Signing In...' : 'Sign In to Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Credential Quickfill Helper */}
          <div style={{
            marginTop: '1.75rem',
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
              Quick Logins (Seeded Admins)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin@coalmin.org', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.78rem',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <div>👑 Super Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>superadmin</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('jaison7373@gmail.com', 'Admin@12345')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.78rem',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <div>👤 Jaison Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>jaison</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.78rem',
          color: '#64748b',
        }}>
          Personnel accounts are provisioned exclusively by Super Administrators.
        </div>
      </div>
    </div>
  );
}
