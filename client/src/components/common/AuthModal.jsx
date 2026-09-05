import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Fingerprint, 
  Building2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { initialUsers } from '../../data/mockData.js';
import { api } from '../../services/api.js';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, currentUserId }) {
  const [tab, setTab] = useState('preset'); // 'preset' | 'login' | 'register'
  const [loginInput, setLoginInput] = useState('admin@coalmin.gov.in');
  const [passwordInput, setPasswordInput] = useState('SecretPass123');
  const [mfaInput, setMfaInput] = useState('649 218');
  
  // Registration fields
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    employee_code: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleSelectPresetUser = (user) => {
    onLoginSuccess(user);
    onClose();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFieldErrors({});

    try {
      const res = await api.login(loginInput, passwordInput);
      onLoginSuccess(res.user || initialUsers[0]);
      onClose();
    } catch (err) {
      if (err.isValidationError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setErrorMsg(err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFieldErrors({});

    try {
      const res = await api.register(regData);
      onLoginSuccess(res);
      onClose();
    } catch (err) {
      if (err.isValidationError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setErrorMsg(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Authentication & Scope Profile</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                CoalMin Restricted Enterprise Access Protocol
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)',
        }}>
          <button
            onClick={() => setTab('preset')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'preset' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === 'preset' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: tab === 'preset' ? '#ffffff' : 'transparent',
            }}
          >
            1-Click Role Switcher
          </button>
          <button
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: tab === 'login' ? '#ffffff' : 'transparent',
            }}
          >
            Sign In (API)
          </button>
          <button
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: tab === 'register' ? '#ffffff' : 'transparent',
            }}
          >
            New Account
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '520px', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-text)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'preset' && (
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Instantly switch roles to test multi-tier RBAC scopes and permissions across National, Corporate, and Mine levels:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {initialUsers.map((u) => {
                  const isCurrent = currentUserId === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectPresetUser(u)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        backgroundColor: isCurrent ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                          color: isCurrent ? '#ffffff' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}>
                          {u.first_name[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              {u.first_name} {u.last_name}
                            </span>
                            {isCurrent && (
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--primary)',
                                color: '#ffffff',
                                fontWeight: 700,
                              }}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {u.role} • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.scope_target}</span>
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: u.scope_type === 'GLOBAL' ? 'var(--purple-light)' : u.scope_type === 'ORGANIZATION' ? 'var(--info-light)' : 'var(--warning-light)',
                        color: u.scope_type === 'GLOBAL' ? 'var(--purple)' : u.scope_type === 'ORGANIZATION' ? 'var(--info)' : 'var(--warning-text)',
                        border: '1px solid currentColor',
                      }}>
                        {u.scope_type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className={`input-white ${fieldErrors.login ? 'input-error' : ''}`}
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. admin@coalmin.gov.in"
                  />
                </div>
                {fieldErrors.login && <span className="field-error-msg">{fieldErrors.login}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Passphrase
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`input-white ${fieldErrors.password ? 'input-error' : ''}`}
                    style={{ paddingLeft: '38px' }}
                    placeholder="Enter password"
                  />
                </div>
                {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  MFA Hardware Token / Biometric
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={mfaInput}
                    onChange={(e) => setMfaInput(e.target.value)}
                    className="input-white"
                    style={{ textAlign: 'center', letterSpacing: '3px', fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    style={{
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--primary)',
                    }}
                    title="Scan Biometrics"
                  >
                    <Fingerprint size={20} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '42px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={regData.first_name}
                    onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                    className={`input-white ${fieldErrors.first_name ? 'input-error' : ''}`}
                    placeholder="Rajesh"
                  />
                  {fieldErrors.first_name && <span className="field-error-msg">{fieldErrors.first_name}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Last Name</label>
                  <input
                    type="text"
                    value={regData.last_name}
                    onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                    className="input-white"
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Username</label>
                  <input
                    type="text"
                    required
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    className={`input-white ${fieldErrors.username ? 'input-error' : ''}`}
                    placeholder="miner_rajesh"
                  />
                  {fieldErrors.username && <span className="field-error-msg">{fieldErrors.username}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Employee Code</label>
                  <input
                    type="text"
                    value={regData.employee_code}
                    onChange={(e) => setRegData({ ...regData, employee_code: e.target.value })}
                    className="input-white"
                    placeholder="EMP-9021"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Official Email</label>
                <input
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className={`input-white ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="rajesh@coalmin.org"
                />
                {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className={`input-white ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="Min. 8 characters"
                />
                {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
