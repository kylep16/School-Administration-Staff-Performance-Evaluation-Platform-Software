import React, { useState, useEffect } from 'react'

const F = "'Bricolage Grotesque', sans-serif"

// ── Hero Image ────────────────────────────────────────────────────────────────
// Replace the src below with your own image URL or import.
// Recommended: a school photo, classroom shot, or dashboard screenshot.
// Aspect ratio ~4:3 works best. Drop your image in /public/ and reference it as '/your-image.jpg'
const HERO_IMAGE_SRC = 'https://plus.unsplash.com/premium_photo-1733353256078-54e117018245?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // ← PASTE YOUR IMAGE URL OR PATH HERE

function HeroImage() {
  const [imgError, setImgError] = React.useState(false)

  if (HERO_IMAGE_SRC && !imgError) {
    return (
      <img
        src={HERO_IMAGE_SRC}
        alt="School dashboard"
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 28, minHeight: 400, display: 'block' }}
      />
    )
  }

  // Placeholder shown when no image is set
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '48px 32px', textAlign: 'center', minHeight: 400 }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: '#d4d0c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect x="4" y="8" width="28" height="20" rx="3" stroke="#8888aa" strokeWidth="2" fill="none"/>
          <circle cx="13" cy="16" r="3" stroke="#8888aa" strokeWidth="1.5" fill="none"/>
          <path d="M4 24 L11 18 L16 22 L22 15 L32 24" stroke="#8888aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#6b6b5a', fontFamily: F, marginBottom: 6 }}>Add your school photo here</div>
        <div style={{ fontSize: 12, color: '#9a9a8a', lineHeight: 1.6, maxWidth: 240 }}>
          Open <code style={{ background: '#d4d0c4', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>RoleSelect.jsx</code> and set <code style={{ background: '#d4d0c4', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>HERO_IMAGE_SRC</code> to your image path
        </div>
      </div>
    </div>
  )
}

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
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e', letterSpacing: '-0.3px' }}>EduIQ</span>
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

        {/* Left text */}
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
            Manage teachers, monitor student benchmarks, and get AI-powered insights all in one place.
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

        {/* Right illustration placeholder + floating cards */}
        <div style={{ position: 'relative', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'all .7s ease .1s' }}>

          {/* Main illustration area replace with your own school photo */}
          <div style={{ background: '#eae6d8', borderRadius: 28, padding: 0, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <HeroImage />
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
            EduIQ gives teachers a clear view of every student's progress, and gives admins the school-wide visibility they need. From benchmark tracking to AI-generated notes, everything you need is one click away.
          </p>
          <p style={{ fontSize: 15, color: '#5a5a4a', lineHeight: 1.75, fontWeight: 400, marginTop: 12 }}>
            Set goals, monitor class averages, and let the AI flag who needs attention, before it's too late.
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
