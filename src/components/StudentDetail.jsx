import React, { useEffect, useState, useRef } from 'react'
import { getAvg } from '../utils.js'
import { pastel, AIBox, BackBtn, Modal, FormGroup, TextInput, Notification } from './UI.jsx'
import { useAI, AIToggleBtn } from '../AIContext.jsx'

const F = "'Bricolage Grotesque', sans-serif"

function PersonIconSquare({ size = 36, borderRadius = 12, bg, color }) {
  const r = size / 2
  const headR  = size * 0.22, headCY = size * 0.33
  const bodyR  = size * 0.32, bodyCY = size * 0.84
  return (
    <div style={{ width: size, height: size, borderRadius, background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={headCY} r={headR} fill={color} opacity="0.9" />
        <circle cx={r} cy={bodyCY} r={bodyR} fill={color} opacity="0.9" />
      </svg>
    </div>
  )
}

async function streamClaude(prompt, onChunk, onDone) {
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 300, stream: true, messages: [{ role: 'user', content: prompt }] }),
    })
    const reader = resp.body.getReader(); const dec = new TextDecoder(); let buf = ''
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop()
      for (const line of lines) {
        if (line.startsWith('data: ')) { const d = line.slice(6); if (d === '[DONE]') continue
          try { const j = JSON.parse(d); if (j.type === 'content_block_delta' && j.delta?.text) onChunk(j.delta.text) } catch (_) {} }
      }
    }
  } catch (err) {
    console.error('Claude API error:', err)
    onChunk('Error: ' + (err.message || 'API call failed'))
  }
  onDone?.()
}

// ── Class Switcher Dropdown (admin only) ──────────────────────────────────────
function ClassSwitcher({ studentId, currentCls, allTeachers, onSwitch }) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const dropRef = useRef(null)

  // Find all classes this student appears in across all teachers (match by name)
  const studentName = allTeachers.flatMap(t => t.classes.flatMap(c => c.students)).find(s => s.id === studentId)?.name || ''
  const allClassesForStudent = []
  allTeachers.forEach(t => {
    t.classes.forEach(cls => {
      const found = cls.students.find(s => s.name === studentName)
      if (found) allClassesForStudent.push({ cls, teacher: t, student: found })
    })
  })

  useEffect(() => {
    function handleClick(e) {
      if (btnRef.current && btnRef.current.contains(e.target)) return
      if (dropRef.current && dropRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 8, left: rect.right - 260 })
    }
    setOpen(v => !v)
  }

  if (allClassesForStudent.length <= 1) return null

  return (
    <>
      <button ref={btnRef} onClick={handleOpen} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 20,
        border: '1.5px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.55)',
        color: '#1a1a2e', fontWeight: 700, fontSize: 11,
        cursor: 'pointer', fontFamily: F, letterSpacing: '.5px',
        backdropFilter: 'blur(4px)',
      }}>
        <span>{currentCls?.name}</span>
        <span style={{ fontSize: 9, opacity: .7 }}>▾</span>
        <span style={{ background: '#a8c8f8', color: '#1a3a8a', borderRadius: 10, padding: '2px 7px', fontSize: 9, fontWeight: 800 }}>
          {allClassesForStudent.length} CLASSES
        </span>
      </button>

      {open && (
        <div ref={dropRef} style={{
          position: 'fixed',
          top: dropPos.top,
          left: Math.max(8, dropPos.left),
          zIndex: 99999,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 16px 56px rgba(26,26,46,0.22), 0 2px 8px rgba(26,26,46,0.08)',
          border: '1px solid #ede8e0',
          minWidth: 260,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 9, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', borderBottom: '1px solid #f0ece6' }}>
            ALL ENROLLED CLASSES
          </div>
          {allClassesForStudent.map(({ cls, teacher, student }, i) => {
            const avg = getAvg(student.scores)
            const ok  = avg >= cls.benchmark
            const p   = pastel(i)
            const active = cls.id === currentCls?.id
            return (
              <button key={cls.id} onClick={() => { onSwitch(cls, student); setOpen(false) }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '11px 16px',
                background: active ? p.bg : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: F,
                borderBottom: i < allClassesForStudent.length - 1 ? '1px solid #f7f4f0' : 'none',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f7f4f0' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? p.bg : 'transparent' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: active ? 800 : 600, fontSize: 13, color: active ? p.dark : '#1a1a2e' }}>{cls.name}</div>
                  <div style={{ fontSize: 10, color: '#8888aa', marginTop: 2 }}>{teacher.name.split(' ').slice(1).join(' ')} · {teacher.subject}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', fontWeight: 800 }}>
                  {avg}%
                </span>
                {active && <span style={{ fontSize: 12, color: p.dark, fontWeight: 800, marginLeft: 2 }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentDetail({ student: initialStudent, cls: initialCls, teacherName, onBack, onSignOut, role = 'teacher', allTeachers = [] }) {
  // Active class context — can be switched by admin
  const [activeCls, setActiveCls] = useState(initialCls)
  const [activeStudent, setActiveStudent] = useState(initialStudent)

  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [scoreForm, setScoreForm] = useState({ topic: '', score: '' })
  const [notif, setNotif] = useState(null)
  const [, forceUpdate] = useState(0)

  const avg = getAvg(activeStudent.scores)
  const benchmark = activeCls?.benchmark || 70
  const isPassing = avg >= benchmark

  let hash = 0; for (const c of activeStudent.name) hash += c.charCodeAt(0)
  const p = pastel(hash % 7)

  const topicScores = activeStudent.topics.map((topic, i) => ({ topic, score: activeStudent.scores[i] ?? avg }))
  const sorted = [...topicScores].sort((a, b) => a.score - b.score)

  const { aiEnabled } = useAI()

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    if (!aiEnabled) { setAiText('AI is disabled. Toggle it on to generate analysis.'); setAiLoading(false); return }
    const scores = activeStudent.topics.map((t, i) => `${t}: ${activeStudent.scores[i]}%`).join(', ')
    const weak = sorted.filter(t => t.score < benchmark)
    const critical = sorted.filter(t => t.score < 60)
    const trend = activeStudent.scores.length >= 3
      ? (activeStudent.scores[activeStudent.scores.length-1] > activeStudent.scores[activeStudent.scores.length-3] ? 'improving' : 'declining')
      : 'insufficient data'
    const prompt = `You are an education coach giving a teacher specific, actionable feedback about one student. Use bullet points. Be direct and use teacher language. Reference the student by name.\n\nStudent: ${activeStudent.name}\nClass: ${activeCls?.name}\nAll scores: ${scores}\nBenchmark: ${benchmark}%\nCurrent average: ${avg}%\nScore trend: ${trend}\nCritical topics (below 60%): ${critical.map(t => t.topic + ' ' + t.score + '%').join(', ') || 'none'}\nBelow benchmark: ${weak.map(t => t.topic + ' ' + t.score + '%').join(', ') || 'none'}\n\nGive 3-4 bullet points. Be specific. No intro text, just bullets.`
    streamClaude(prompt, c => setAiText(prev => prev + c), () => setAiLoading(false))
  }, [activeStudent.id, activeCls?.id])

  function addScore() {
    if (!scoreForm.topic) { setNotif('Topic name required'); return }
    activeStudent.scores.push(parseInt(scoreForm.score) || 0)
    activeStudent.topics.push(scoreForm.topic)
    setScoreForm({ topic: '', score: '' }); setModal(null); setNotif('Score added!'); forceUpdate(n => n + 1)
  }

  function handleClassSwitch(cls, student) {
    setActiveCls(cls)
    setActiveStudent(student)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede8e0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>EduIQ</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <AIToggleBtn />
          <span style={{ background: '#a8c8f8', color: '#1a3a8a', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: F }}>{teacherName}</span>
          <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #e2ddd6', background: 'transparent', color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
        <BackBtn label={activeCls ? `Back to ${activeCls.name}` : 'Back'} onClick={onBack} />

        {/* Hero */}
        <div style={{ background: p.bg, borderRadius: 0, padding: '32px 36px', marginBottom: 0, position: 'relative', overflow: 'hidden', borderTop: `4px solid ${p.dark}` }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: p.dark, opacity: .05 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <PersonIconSquare size={64} borderRadius={14} bg={p.dark} color="#fff" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: p.dark, opacity: .65 }}>{activeCls?.name?.toUpperCase() || 'STUDENT'}</div>
                  {activeStudent.grade && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: p.dark + '22', color: p.dark, letterSpacing: '1px' }}>
                      GRADE {activeStudent.grade}
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: p.dark, letterSpacing: '-0.5px', lineHeight: 1 }}>{activeStudent.name}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              {/* Class switcher — admin only, top right of hero */}
              {role === 'admin' && allTeachers.length > 0 && (
                <div style={{ paddingBottom: 8 }}>
                  <ClassSwitcher
                    studentId={initialStudent.id}
                    currentCls={activeCls}
                    allTeachers={allTeachers}
                    onSwitch={handleClassSwitch}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: F, fontWeight: 800, fontSize: 60, color: p.dark, lineHeight: 1 }}>{avg}<span style={{ fontSize: 26 }}>%</span></div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: p.dark, opacity: .55, letterSpacing: '2px', marginTop: 2 }}>AVERAGE</div>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <span style={{ display: 'block', padding: '6px 16px', borderRadius: 4, background: isPassing ? '#a8e6cf' : '#f5b8c4', color: isPassing ? '#0d5c30' : '#7a1522', fontWeight: 800, fontSize: 11, letterSpacing: '1.5px' }}>
                    {isPassing ? 'PASSING' : 'BELOW BENCHMARK'}
                  </span>
                  <div style={{ fontSize: 11, color: p.dark, opacity: .5, fontWeight: 600, marginTop: 6, letterSpacing: '1px' }}>BENCHMARK: {benchmark}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score history + topic breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, marginBottom: 0 }}>
          <div style={{ background: '#fff', borderRadius: 0, padding: '24px 24px', borderRight: '1px solid #ede8e0', borderBottom: '1px solid #ede8e0' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa', marginBottom: 4 }}>HISTORY</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18, fontFamily: F }}>Score History</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 20 }}>
              {activeStudent.scores.map((sc, i) => (
                <div key={i} title={`${activeStudent.topics[i] || 'Test '+(i+1)}: ${sc}%`} style={{
                  width: 38, height: 38, borderRadius: 4,
                  background: sc >= benchmark ? '#a8e6cf' : '#f5b8c4',
                  color: sc >= benchmark ? '#0d5c30' : '#7a1522',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, fontFamily: F,
                  border: `1px solid ${sc >= benchmark ? '#0d5c3022' : '#7a152222'}`,
                }}>
                  {sc}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 100, borderBottom: '2px solid #f0ece6', paddingBottom: 2 }}>
              {activeStudent.scores.map((sc, i) => {
                const h = Math.round((sc / 100) * 88); const ok = sc >= benchmark
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#888', marginBottom: 2, fontFamily: F }}>{sc}</div>
                    <div style={{ width: '100%', height: h, background: ok ? '#a8e6cf' : '#f5b8c4', borderRadius: 0, borderTop: `2px solid ${ok ? '#0d5c30' : '#7a1522'}` }} />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
              {activeStudent.scores.map((_, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#bbb', fontFamily: F, fontWeight: 600 }}>
                  {activeStudent.topics[i] ? activeStudent.topics[i].slice(0, 4).toUpperCase() : `T${i+1}`}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#faf9f6', borderRadius: 0, padding: '24px 24px', borderBottom: '1px solid #ede8e0' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa', marginBottom: 4 }}>BREAKDOWN</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18, fontFamily: F }}>By Topic</div>
            {topicScores.map((ts, i) => {
              const ok = ts.score >= benchmark
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1a1a2e', fontFamily: F }}>{ts.topic}</div>
                  <div style={{ width: 100 }}>
                    <div style={{ height: 6, background: '#e8e4de', borderRadius: 0 }}>
                      <div style={{ height: '100%', width: `${ts.score}%`, background: ok ? '#a8e6cf' : '#f5b8c4', borderRadius: 0, transition: 'width .5s', borderRight: `2px solid ${ok ? '#0d5c30' : '#7a1522'}` }} />
                    </div>
                  </div>
                  <div style={{ width: 40, textAlign: 'right', fontSize: 15, fontWeight: 800, color: ok ? '#0d5c30' : '#7a1522', fontFamily: F }}>{ts.score}%</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 0, padding: '24px 28px', marginBottom: 0, borderBottom: '1px solid #ede8e0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa', marginBottom: 4 }}>FOCUS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6, fontFamily: F }}>Priority Areas</div>
          <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700, marginBottom: 18, letterSpacing: '.5px' }}>SORTED BY GREATEST NEED</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {sorted.map((ts, i) => {
              const rankColors = [
                { bg: '#f5b8c4', dark: '#7a1522', border: '#f5b8c4' },
                { bg: '#f5d98a', dark: '#7a4f00', border: '#f5d98a' },
                { bg: '#a8e6cf', dark: '#0d5c30', border: '#a8e6cf' },
              ]
              const rc = rankColors[Math.min(i, 2)]
              return (
                <div key={i} style={{ background: '#faf9f6', borderRadius: 0, padding: '14px 16px', borderLeft: `4px solid ${rc.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: rc.bg, color: rc.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, fontFamily: F }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e', fontFamily: F }}>{ts.topic}</div>
                    <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, letterSpacing: '.5px', marginTop: 2 }}>
                      {ts.score < 60 ? 'CRITICAL' : ts.score < benchmark ? 'BELOW GOAL' : 'ON TRACK'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: rc.dark, fontFamily: F }}>{ts.score}%</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 0 }}>
          <AIBox text={aiText} loading={aiLoading} />
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={() => setModal('score')} style={{ padding: '10px 22px', borderRadius: 0, border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F, letterSpacing: '2px' }}>
            + ADD SCORE
          </button>
        </div>
      </div>

      {modal === 'score' && (
        <Modal title={`Add Score — ${activeStudent.name}`} onClose={() => setModal(null)}>
          <FormGroup label="Topic"><TextInput value={scoreForm.topic} onChange={v => setScoreForm(f=>({...f,topic:v}))} placeholder="e.g. Quadratic Equations" /></FormGroup>
          <FormGroup label="Score (%)"><TextInput type="number" value={scoreForm.score} onChange={v => setScoreForm(f=>({...f,score:v}))} placeholder="82" /></FormGroup>
          <button onClick={addScore} style={{ width:'100%',padding:'12px',borderRadius:0,border:'none',background:'#a8c8f8',color:'#1a3a8a',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:F,marginTop:4,letterSpacing:'1px' }}>ADD SCORE</button>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}
