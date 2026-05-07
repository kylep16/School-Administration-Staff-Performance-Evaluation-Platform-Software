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
          <div style={{ background: '#eae6d8', borderRadius: 28, padding: '32px 24px 0', minHeight: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

            <svg width="420" height="340" viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg">

              {/* ── Chalkboard on wall ── */}
              <rect x="60" y="20" width="300" height="140" rx="6" fill="#2d4a3e"/>
              <rect x="68" y="28" width="284" height="124" rx="4" fill="#3a5c4e"/>
              {/* Board content - chart lines */}
              <polyline points="90,120 120,90 155,105 190,72 225,85 260,60 295,75 320,55" stroke="#a8e6cf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="120" cy="90" r="4" fill="#a8e6cf"/>
              <circle cx="190" cy="72" r="4" fill="#a8e6cf"/>
              <circle cx="260" cy="60" r="4" fill="#f5d98a"/>
              <circle cx="320" cy="55" r="4" fill="#f5d98a"/>
              {/* Board text */}
              <rect x="90" y="35" width="80" height="7" rx="3" fill="#fff" opacity=".25"/>
              <rect x="90" y="47" width="55" height="5" rx="2" fill="#fff" opacity=".15"/>
              {/* Grid lines on board */}
              <line x1="90" y1="130" x2="330" y2="130" stroke="#fff" strokeWidth=".5" opacity=".15"/>
              <line x1="90" y1="115" x2="330" y2="115" stroke="#fff" strokeWidth=".5" opacity=".1"/>
              <line x1="90" y1="100" x2="330" y2="100" stroke="#fff" strokeWidth=".5" opacity=".1"/>
              <line x1="150" y1="35" x2="150" y2="145" stroke="#fff" strokeWidth=".5" opacity=".08"/>
              <line x1="210" y1="35" x2="210" y2="145" stroke="#fff" strokeWidth=".5" opacity=".08"/>
              <line x1="270" y1="35" x2="270" y2="145" stroke="#fff" strokeWidth=".5" opacity=".08"/>
              {/* Chalk tray */}
              <rect x="60" y="158" width="300" height="8" rx="3" fill="#c8b89a"/>
              <rect x="90" y="159" width="18" height="5" rx="2" fill="#fff" opacity=".7"/>
              <rect x="114" y="159" width="12" height="5" rx="2" fill="#f5d98a" opacity=".8"/>

              {/* ── Floor line ── */}
              <rect x="0" y="320" width="420" height="20" rx="0" fill="#d4cfc0"/>
              <rect x="0" y="318" width="420" height="3" rx="0" fill="#c4bfb0"/>

              {/* ── Teacher ── */}
              {/* Body */}
              <rect x="168" y="210" width="44" height="68" rx="10" fill="#1a1a2e"/>
              {/* Collar / shirt detail */}
              <rect x="181" y="210" width="18" height="20" rx="4" fill="#fff" opacity=".15"/>
              {/* Left arm - pointing at board */}
              <path d="M168 220 Q140 200 115 185" stroke="#1a1a2e" strokeWidth="14" strokeLinecap="round" fill="none"/>
              <path d="M168 220 Q140 200 115 185" stroke="#f5c8a8" strokeWidth="10" strokeLinecap="round" fill="none"/>
              {/* Right arm down */}
              <path d="M212 225 Q220 245 218 260" stroke="#1a1a2e" strokeWidth="14" strokeLinecap="round" fill="none"/>
              <path d="M212 225 Q220 245 218 260" stroke="#f5c8a8" strokeWidth="10" strokeLinecap="round" fill="none"/>
              {/* Legs */}
              <rect x="172" y="274" width="16" height="46" rx="8" fill="#2d2d4e"/>
              <rect x="192" y="274" width="16" height="46" rx="8" fill="#2d2d4e"/>
              {/* Shoes */}
              <ellipse cx="180" cy="320" rx="12" ry="6" fill="#1a1a2e"/>
              <ellipse cx="200" cy="320" rx="12" ry="6" fill="#1a1a2e"/>
              {/* Neck */}
              <rect x="183" y="196" width="14" height="16" rx="5" fill="#f5c8a8"/>
              {/* Head */}
              <ellipse cx="190" cy="186" rx="22" ry="24" fill="#f5c8a8"/>
              {/* Hair */}
              <path d="M168 180 Q170 158 190 162 Q210 158 212 180" fill="#1a1a2e"/>
              {/* Face */}
              <ellipse cx="183" cy="186" rx="3" ry="3.5" fill="#1a1a2e" opacity=".7"/>
              <ellipse cx="197" cy="186" rx="3" ry="3.5" fill="#1a1a2e" opacity=".7"/>
              <path d="M184 196 Q190 201 196 196" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/>
              {/* Glasses */}
              <rect x="179" y="182" width="10" height="8" rx="3" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity=".5"/>
              <rect x="192" y="182" width="10" height="8" rx="3" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity=".5"/>
              <line x1="189" y1="186" x2="192" y2="186" stroke="#1a1a2e" strokeWidth="1.5" opacity=".5"/>
              {/* Pointer */}
              <line x1="115" y1="185" x2="90" y2="108" stroke="#c8b89a" strokeWidth="2.5" strokeLinecap="round"/>

              {/* ── Student 1 (left, sitting) ── */}
              {/* Desk */}
              <rect x="18" y="268" width="72" height="8" rx="3" fill="#c8b89a"/>
              <rect x="28" y="276" width="8" height="44" rx="4" fill="#b8a888"/>
              <rect x="72" y="276" width="8" height="44" rx="4" fill="#b8a888"/>
              {/* Body */}
              <rect x="28" y="230" width="36" height="44" rx="8" fill="#a8c8f8"/>
              {/* Arms on desk */}
              <rect x="16" y="255" width="18" height="12" rx="6" fill="#a8c8f8"/>
              <rect x="62" y="255" width="18" height="12" rx="6" fill="#a8c8f8"/>
              {/* Hands */}
              <ellipse cx="20" cy="264" rx="7" ry="5" fill="#f5d8b8"/>
              <ellipse cx="74" cy="264" rx="7" ry="5" fill="#f5d8b8"/>
              {/* Neck */}
              <rect x="38" y="218" width="12" height="14" rx="4" fill="#f5d8b8"/>
              {/* Head */}
              <ellipse cx="44" cy="208" rx="18" ry="20" fill="#f5d8b8"/>
              {/* Hair */}
              <path d="M26 203 Q28 186 44 188 Q60 186 62 203" fill="#3d2a1a"/>
              {/* Eyes */}
              <ellipse cx="38" cy="208" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              <ellipse cx="50" cy="208" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              {/* Smile */}
              <path d="M39 216 Q44 220 49 216" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>
              {/* Notebook on desk */}
              <rect x="22" y="254" width="52" height="34" rx="3" fill="#fff" opacity=".9"/>
              <rect x="26" y="259" width="30" height="2" rx="1" fill="#8888aa" opacity=".4"/>
              <rect x="26" y="264" width="36" height="2" rx="1" fill="#8888aa" opacity=".3"/>
              <rect x="26" y="269" width="28" height="2" rx="1" fill="#8888aa" opacity=".3"/>
              <rect x="26" y="274" width="20" height="2" rx="1" fill="#a8c8f8" opacity=".6"/>

              {/* ── Student 2 (right, sitting) ── */}
              {/* Desk */}
              <rect x="330" y="268" width="72" height="8" rx="3" fill="#c8b89a"/>
              <rect x="340" y="276" width="8" height="44" rx="4" fill="#b8a888"/>
              <rect x="384" y="276" width="8" height="44" rx="4" fill="#b8a888"/>
              {/* Body */}
              <rect x="342" y="230" width="36" height="44" rx="8" fill="#f5d98a"/>
              {/* Arms */}
              <rect x="330" y="255" width="18" height="12" rx="6" fill="#f5d98a"/>
              <rect x="374" y="255" width="18" height="12" rx="6" fill="#f5d98a"/>
              {/* Hands */}
              <ellipse cx="334" cy="264" rx="7" ry="5" fill="#f5d8b8"/>
              <ellipse cx="388" cy="264" rx="7" ry="5" fill="#f5d8b8"/>
              {/* Neck */}
              <rect x="352" y="218" width="12" height="14" rx="4" fill="#f5d8b8"/>
              {/* Head */}
              <ellipse cx="358" cy="208" rx="18" ry="20" fill="#f5d8b8"/>
              {/* Hair — ponytail */}
              <path d="M340 200 Q342 184 358 186 Q374 184 376 200" fill="#1a1a2e"/>
              <ellipse cx="376" cy="196" rx="6" ry="10" fill="#1a1a2e"/>
              {/* Eyes */}
              <ellipse cx="352" cy="207" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              <ellipse cx="364" cy="207" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              {/* Mouth */}
              <path d="M353 216 Q358 220 363 216" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>
              {/* Laptop on desk */}
              <rect x="334" y="248" width="54" height="34" rx="3" fill="#2d2d4e"/>
              <rect x="337" y="251" width="48" height="26" rx="2" fill="#3d3d5c"/>
              {/* Screen content */}
              <rect x="341" y="255" width="20" height="3" rx="1" fill="#a8c8f8" opacity=".7"/>
              <rect x="341" y="261" width="30" height="2" rx="1" fill="#fff" opacity=".2"/>
              <rect x="341" y="266" width="24" height="2" rx="1" fill="#fff" opacity=".2"/>
              <rect x="341" y="271" width="16" height="3" rx="1" fill="#a8e6cf" opacity=".6"/>
              {/* Laptop base */}
              <rect x="330" y="280" width="62" height="5" rx="2" fill="#1a1a2e" opacity=".5"/>

              {/* ── Student 3 (middle, standing/raising hand) ── */}
              <rect x="252" y="230" width="34" height="50" rx="8" fill="#f5b8c4"/>
              <rect x="244" y="248" width="14" height="28" rx="7" fill="#f5b8c4"/>
              <rect x="286" y="248" width="14" height="28" rx="7" fill="#f5b8c4"/>
              {/* Raised hand */}
              <path d="M252 238 Q238 218 232 195" stroke="#f5b8c4" strokeWidth="13" strokeLinecap="round" fill="none"/>
              <ellipse cx="230" cy="190" rx="9" ry="11" fill="#f5d8b8"/>
              {/* Legs */}
              <rect x="256" y="278" width="14" height="42" rx="7" fill="#3d3d5c"/>
              <rect x="272" y="278" width="14" height="42" rx="7" fill="#3d3d5c"/>
              <ellipse cx="263" cy="320" rx="11" ry="5" fill="#1a1a2e"/>
              <ellipse cx="279" cy="320" rx="11" ry="5" fill="#1a1a2e"/>
              {/* Neck + head */}
              <rect x="262" y="218" width="12" height="14" rx="4" fill="#f5d8b8"/>
              <ellipse cx="268" cy="207" rx="18" ry="20" fill="#f5d8b8"/>
              {/* Hair */}
              <path d="M250 200 Q252 184 268 186 Q284 184 286 200" fill="#8B4513"/>
              {/* Eyes */}
              <ellipse cx="262" cy="207" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              <ellipse cx="274" cy="207" rx="2.5" ry="3" fill="#1a1a2e" opacity=".8"/>
              <path d="M263 216 Q268 220 273 216" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>

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
