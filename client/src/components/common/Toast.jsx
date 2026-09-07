import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: toast.isDanger ? 'var(--danger-light)' : '#ffffff',
        border: `1px solid ${toast.isDanger ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 2000,
        maxWidth: '420px',
        animation: 'slideUp 0.2s ease-out',
      }}
    >
      {toast.isDanger ? (
        <AlertTriangle size={20} color="var(--danger)" />
      ) : (
        <CheckCircle2 size={20} color="var(--success)" />
      )}

      <div style={{
        fontSize: '0.84rem',
        fontWeight: 600,
        color: toast.isDanger ? 'var(--danger-text)' : 'var(--text-main)',
        flex: 1,
      }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          color: toast.isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
          padding: '2px',
          borderRadius: '4px',
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
