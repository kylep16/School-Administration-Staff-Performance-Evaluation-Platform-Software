import React, { useState, useEffect } from 'react'

const F = "'Bricolage Grotesque', sans-serif"

export const PASTELS = [
  { bg: '#a8c8f8', dark: '#1a3a8a', light: '#e8f2ff' },
  { bg: '#f5d98a', dark: '#7a4f00', light: '#fff8e0' },
  { bg: '#a8e6cf', dark: '#0d5c30', light: '#e0fff5' },
  { bg: '#f5b8c4', dark: '#7a1522', light: '#fff0f3' },
  { bg: '#c8b8f0', dark: '#3a1a80', light: '#f3f0ff' },
  { bg: '#f5c8a8', dark: '#7a2a00', light: '#fff5ee' },
  { bg: '#b8e4f5', dark: '#0a4a6a', light: '#eaf7ff' },
]
export function pastel(idx) { return PASTELS[idx % PASTELS.length] }

export function Nav({ role, teacherName, onSignOut }) {
  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #ede8e0',
      padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.5px' }}>EduPulse</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: '#a8c8f8', color: '#1a3a8a', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: F }}>
          {role === 'admin' ? 'ADMIN' : (teacherName || '')}
        </span>
        <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #e2ddd6', background: 'transparent', color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #ede8e0', padding: '20px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)', ...style }}>
      {children}
    </div>
  )
}

export function StatCard({ value, label, idx = 0 }) {
  const p = pastel(idx)
  return (
    <div style={{ background: p.bg, borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontFamily: F, fontSize: 32, fontWeight: 800, color: p.dark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: p.dark, opacity: .7, marginTop: 6, letterSpacing: '1.5px' }}>{label}</div>
      <div style={{ position: 'absolute', right: -10, bottom: -10, width: 60, height: 60, borderRadius: '50%', background: p.dark, opacity: .06 }} />
    </div>
  )
}

const BADGE_STYLES = {
  'badge-gold':  { background: '#f5d98a', color: '#7a4f00' },
  'badge-mint':  { background: '#a8e6cf', color: '#0d5c30' },
  'badge-rose':  { background: '#f5b8c4', color: '#7a1522' },
  'badge-blue':  { background: '#a8c8f8', color: '#1a3a8a' },
  'badge-gray':  { background: '#f0ece6', color: '#8888aa' },
  'badge-lilac': { background: '#c8b8f0', color: '#3a1a80' },
}
export function Badge({ variant = 'badge-gray', children, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      fontFamily: F, letterSpacing: '.5px',
      ...BADGE_STYLES[variant], ...style,
    }}>
      {children}
    </span>
  )
}

export function Btn({ variant = 'outline', size = 'md', children, onClick, style = {}, disabled = false }) {
  const base = {
    primary: { background: '#1a1a2e', color: '#fff', border: 'none' },
    gold:    { background: '#f5d98a', color: '#7a4f00', border: 'none' },
    mint:    { background: '#a8e6cf', color: '#0d5c30', border: 'none' },
    blue:    { background: '#a8c8f8', color: '#1a3a8a', border: 'none' },
    outline: { background: 'transparent', color: '#3d3d5c', border: '1.5px solid #e2ddd6' },
    danger:  { background: '#f5b8c4', color: '#7a1522', border: 'none' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '6px 14px' : '10px 22px',
      borderRadius: 20, fontSize: size === 'sm' ? 12 : 13,
      fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1, transition: 'all .2s',
      fontFamily: F, letterSpacing: '.5px',
      ...base[variant] || base.outline, ...style,
    }}>
      {children}
    </button>
  )
}

export function ProgressBar({ value, color = 'mint', height = 8, idx = 0 }) {
  const p = pastel(idx)
  const fills = { mint: '#a8e6cf', gold: '#f5d98a', rose: '#f5b8c4', blue: '#a8c8f8', pastel: p.bg }
  return (
    <div style={{ height, background: '#f0ece6', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 4, background: fills[color] || p.bg, width: `${Math.min(100, Math.max(0, value))}%`, transition: 'width .6s ease' }} />
    </div>
  )
}

export function AIBox({ text, loading }) {
  return (
    <div style={{ background: '#c8b8f0', borderRadius: 24, padding: '20px 24px', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a1a80', animation: loading ? 'aipulse 1.4s infinite' : 'none' }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: F }}>AI Notes</span>
      </div>
      <p style={{ fontSize: 14, color: loading && !text ? '#9a8acc' : '#2a1a5e', lineHeight: 1.75, fontStyle: loading && !text ? 'italic' : 'normal', fontFamily: F }}>
        {loading && !text ? 'Analyzing...' : (text || 'No analysis yet.')}
      </p>
      <style>{`@keyframes aipulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  )
}

export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 28, padding: 32, maxWidth: 500, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(26,26,46,0.2)' }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 22, color: '#1a1a2e', marginBottom: 22, letterSpacing: '-0.5px' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 800, color: '#8888aa', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: F }}>{label}</label>
      {children}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
      fontSize: 14, padding: '10px 16px', border: '1.5px solid #e2ddd6',
      borderRadius: 14, outline: 'none', width: '100%', background: '#faf9f6',
      color: '#1a1a2e', fontFamily: F, fontWeight: 500,
      transition: 'border .2s',
    }}
    onFocus={e => e.target.style.borderColor = '#a8c8f8'}
    onBlur={e => e.target.style.borderColor = '#e2ddd6'}
    />
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', padding: 5, borderRadius: 20, width: 'fit-content', border: '1px solid #ede8e0' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '8px 20px', borderRadius: 16, border: 'none', cursor: 'pointer',
          background: active === t.id ? '#1a1a2e' : 'transparent',
          color: active === t.id ? '#fff' : '#8888aa',
          fontWeight: 700, fontSize: 11, letterSpacing: '1px', fontFamily: F, transition: 'all .2s',
        }}>
          {t.label.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children, style = {} }) {
  return (
    <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: '#1a1a2e', marginBottom: 16, letterSpacing: '-0.3px', ...style }}>
      {children}
    </div>
  )
}

export function BackBtn({ label = 'Back', onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 700, color: '#8888aa', cursor: 'pointer',
      marginBottom: 20, padding: '6px 0', background: 'none', border: 'none',
      fontFamily: F, letterSpacing: '1px', textTransform: 'uppercase',
    }}>
      ← {label}
    </button>
  )
}

export function Notification({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, background: '#1a1a2e', color: '#fff',
      padding: '14px 22px', borderRadius: 20, fontSize: 14, zIndex: 300,
      maxWidth: 320, boxShadow: '0 8px 32px rgba(26,26,46,0.25)', fontFamily: F, fontWeight: 600,
    }}>
      {message}
    </div>
  )
}

export function Avatar({ name, size = 38, idx }) {
  const p = idx !== undefined ? pastel(idx) : (() => {
    let hash = 0; for (const c of (name||'')) hash += c.charCodeAt(0)
    return PASTELS[hash % PASTELS.length]
  })()
  const inits = (name||'?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? 16 : '50%',
      background: p.bg, color: p.dark,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.35, flexShrink: 0, fontFamily: F,
    }}>
      {inits}
    </div>
  )
}
