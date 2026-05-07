import React, { useState, useEffect } from 'react'

const F = "'Bricolage Grotesque', sans-serif"

export default function RoleSelect({ onSelect }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2e8', fontFamily: F, overflow: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', background: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#fff" opacity=".6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#fff" opacity=".6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#fff" opacity=".3"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e', letterSpacing: '-0.3px' }}>EduPulse</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Dashboard', 'Reports', 'Students', 'Support'].map(l => (
            <span key={l} style={{ fontSize: 14, color: '#6b6b6b', cursor: 'pointer', fontWeight: 500 }}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '8px 20px', borderRadius: 100, border: '1.5px solid #d4d0c8', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#3d3d3d', cursor: 'pointer', fontFamily: F }}>Sign In</button>
          <button style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: '#1a1a2e', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: F }}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '40px 48px 0', gap: 40, maxWidth: 1200, margin: '0 auto' }}>

        {/* Left — text */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all .6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e8e4d8', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3d8a6e' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3d3d3d', letterSpacing: '0.5px' }}>Welcome back</span>
          </div>

          <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: 54, color: '#1a1a2e', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 20 }}>
            Track Progress.<br />
            <span style={{ color: '#3d8a6e' }}>Elevate</span> Every<br />
            Classroom.
          </h1>

          <p style={{ fontSize: 16, color: '#6b6b6b', lineHeight: 1.7, marginBottom: 40, maxWidth: 380, fontWeight: 400 }}>
            Manage teachers, monitor student benchmarks, and get AI-powered insights — all in one place.
          </p>

          {/* Role buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <RoleBtn
              label="I'm a Teacher"
              sub="View my classes"
              bg="#a8e6cf"
              dark="#0d5c30"
              onClick={() => onSelect('teacher')}
            />
            <RoleBtn
              label="I'm an Admin"
              sub="School overview"
              bg="#1a1a2e"
              dark="#fff"
              textSub="rgba(255,255,255,0.5)"
              onClick={() => onSelect('admin')}
            />
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex' }}>
              {['#a8c8f8','#f5d98a','#a8e6cf','#f5b8c4'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #f5f2e8', marginLeft: i > 0 ? -8 : 0 }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>Trusted by educators</div>
              <div style={{ fontSize: 11, color: '#9a9a8a', fontWeight: 500 }}>Teachers, admins & students</div>
            </div>
          </div>
        </div>

        {/* Right — illustration placeholder + floating cards */}
        <div style={{ position: 'relative', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'all .7s ease .1s' }}>

          {/* Main illustration area */}
          <div style={{ background: '#eae6d8', borderRadius: 28, padding: '40px', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

            {/* Abstract shapes mimicking illustration */}
            <div style={{ position: 'absolute', top: 30, right: 40, width: 120, height: 120, borderRadius: '50%', background: '#d4d0c4', opacity: .5 }} />
            <div style={{ position: 'absolute', bottom: 20, left: 30, width: 80, height: 80, borderRadius: '50%', background: '#c8c4b4', opacity: .4 }} />

            {/* Center SVG illustration — simplified students */}
            <svg width="260" height="280" viewBox="0 0 260 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Student 1 */}
              <circle cx="90" cy="60" r="28" fill="#1a1a2e" opacity=".9"/>
              <circle cx="90" cy="60" r="22" fill="#eae6d8"/>
              <circle cx="90" cy="55" r="12" fill="#1a1a2e" opacity=".85"/>
              <rect x="62" y="90" width="56" height="70" rx="12" fill="#1a1a2e" opacity=".85"/>
              <rect x="70" y="100" width="20" height="28" rx="4" fill="#a8c8f8"/>
              <rect x="56" y="95" width="14" height="40" rx="7" fill="#1a1a2e" opacity=".7"/>
              <rect x="190" y="95" width="14" height="40" rx="7" fill="#1a1a2e" opacity=".7"/>
              <rect x="68" y="160" width="18" height="55" rx="9" fill="#1a1a2e" opacity=".7"/>
              <rect x="104" y="160" width="18" height="55" rx="9" fill="#1a1a2e" opacity=".7"/>

              {/* Student 2 */}
              <circle cx="175" cy="58" r="26" fill="#1a1a2e" opacity=".85"/>
              <circle cx="175" cy="58" r="20" fill="#eae6d8"/>
              <circle cx="175" cy="53" r="11" fill="#1a1a2e" opacity=".8"/>
              <rect x="150" y="86" width="50" height="68" rx="10" fill="#3d3d5c" opacity=".8"/>
              <rect x="155" y="94" width="18" height="26" rx="4" fill="#f5d98a"/>
              <rect x="144" y="90" width="13" height="38" rx="6.5" fill="#3d3d5c" opacity=".7"/>
              <rect x="154" y="154" width="16" height="52" rx="8" fill="#3d3d5c" opacity=".7"/>
              <rect x="180" y="154" width="16" height="52" rx="8" fill="#3d3d5c" opacity=".7"/>

              {/* Ground line */}
              <rect x="40" y="216" width="180" height="3" rx="1.5" fill="#1a1a2e" opacity=".15"/>

              {/* Floating elements */}
              <rect x="10" y="130" width="52" height="36" rx="10" fill="#a8e6cf"/>
              <rect x="16" y="138" width="20" height="4" rx="2" fill="#0d5c30" opacity=".6"/>
              <rect x="16" y="146" width="30" height="4" rx="2" fill="#0d5c30" opacity=".4"/>
              <text x="36" y="143" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#0d5c30">88%</text>

              <rect x="198" y="118" width="52" height="36" rx="10" fill="#f5b8c4"/>
              <rect x="204" y="126" width="20" height="4" rx="2" fill="#7a1522" opacity=".6"/>
              <rect x="204" y="134" width="30" height="4" rx="2" fill="#7a1522" opacity=".4"/>
              <text x="218" y="131" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#7a1522">72%</text>

              <rect x="95" y="228" width="70" height="30" rx="8" fill="#c8b8f0"/>
              <text x="130" y="248" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#3a1a80">AI NOTES</text>
            </svg>
          </div>

          {/* Floating stat card */}
          <div style={{
            position: 'absolute', top: -16, left: -20,
            background: '#fff', borderRadius: 16, padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(26,26,46,0.12)',
            opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all .6s ease .3s',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#8888aa', letterSpacing: '1.5px', marginBottom: 4 }}>SCHOOL AVG</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 28, color: '#1a1a2e', lineHeight: 1 }}>84%</div>
            <div style={{ fontSize: 11, color: '#3d8a6e', fontWeight: 700, marginTop: 4 }}>↑ 3pts this term</div>
          </div>

          {/* Floating AI badge */}
          <div style={{
            position: 'absolute', bottom: 20, right: -16,
            background: '#c8b8f0', borderRadius: 12, padding: '10px 16px',
            boxShadow: '0 6px 24px rgba(58,26,128,0.15)',
            opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all .6s ease .4s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3a1a80', animation: 'aipulse 1.6s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', letterSpacing: '1px' }}>AI NOTES READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Partners strip ── */}
      <div style={{ padding: '48px 48px 0', maxWidth: 1200, margin: '0 auto', opacity: visible ? 1 : 0, transition: 'opacity .6s ease .5s' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a8a', letterSpacing: '1.5px', marginBottom: 16 }}>BUILT FOR MODERN SCHOOLS</div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          {['Benchmark Tracking', 'AI-Powered Insights', 'Goal Management', 'Performance Reports'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: ['#a8c8f8','#a8e6cf','#f5d98a','#c8b8f0'][i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ['#1a3a8a','#0d5c30','#7a4f00','#3a1a80'][i] }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4a4a' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── About strip ── */}
      <div style={{ margin: '52px 48px 0', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', background: '#eae6d8', borderRadius: 24, padding: '40px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', opacity: visible ? 1 : 0, transition: 'opacity .7s ease .6s' }}>
        <div>
          <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: 36, color: '#1a1a2e', letterSpacing: '-1px', marginBottom: 16 }}>Designed for Educators,<br />Built for Results.</h2>
        </div>
        <div>
          <p style={{ fontSize: 15, color: '#5a5a4a', lineHeight: 1.75, fontWeight: 400 }}>
            EduPulse gives teachers a clear view of every student's progress — and gives admins the school-wide visibility they need. From benchmark tracking to AI-generated notes, everything you need is one click away.
          </p>
          <p style={{ fontSize: 15, color: '#5a5a4a', lineHeight: 1.75, fontWeight: 400, marginTop: 12 }}>
            Set goals, monitor class averages, and let the AI flag who needs attention — before it's too late.
          </p>
        </div>
      </div>

      <div style={{ height: 64 }} />

      <style>{`
        @keyframes aipulse { 0%,100%{opacity:1} 50%{opacity:.25} }
      `}</style>
    </div>
  )
}

function RoleBtn({ label, sub, bg, dark, textSub, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        padding: '16px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
        background: hovered ? (bg === '#1a1a2e' ? '#2d2d4e' : bg) : bg,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 12px 32px ${bg}55` : 'none',
        transition: 'all .2s', minWidth: 160, fontFamily: F,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 15, color: dark, letterSpacing: '-0.2px' }}>{label}</div>
      <div style={{ fontSize: 11, color: textSub || (dark + 'aa'), fontWeight: 600, marginTop: 3, letterSpacing: '.3px' }}>{sub}</div>
    </button>
  )
}
