import React, { useEffect, useState } from 'react'
import { classAvg, classPassing, getAvg } from '../utils.js'
import { pastel, AIBox, BackBtn, Modal, FormGroup, TextInput, Notification } from './UI.jsx'
import { useAI, AIToggleBtn } from '../AIContext.jsx'

const F = "'Bricolage Grotesque', sans-serif"

function PersonIconSquare({ size = 36, borderRadius = 12, bg, color }) {
  const r = size / 2
  const headR  = size * 0.22
  const headCY = size * 0.33
  const bodyR  = size * 0.32
  const bodyCY = size * 0.84
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
    onChunk('Error: ' + (err.message || 'API call failed — check your VITE_ANTHROPIC_KEY in .env'))
  }
  onDone?.()
}

// ── All-Students Dashboard ────────────────────────────────────────────────────
function AllStudentsDashboard({ cls, onClose, onOpenStudent }) {
  const passing = cls.students.filter(s => getAvg(s.scores) >= cls.benchmark)
  const failing  = cls.students.filter(s => getAvg(s.scores) <  cls.benchmark)
  const avg = classAvg(cls)
  const isPassing = avg >= cls.benchmark

  // Group by grade
  const byGrade = {}
  cls.students.forEach(s => {
    const g = s.grade || '?'
    if (!byGrade[g]) byGrade[g] = []
    byGrade[g].push(s)
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f7f4f0', borderRadius: 28, width: '100%', maxWidth: 860, boxShadow: '0 24px 80px rgba(26,26,46,0.25)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: isPassing ? '#dcfce7' : '#fee2e2', padding: '24px 32px', borderBottom: `3px solid ${isPassing ? '#86efac' : '#fca5a5'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: isPassing ? '#166534' : '#991b1b', marginBottom: 4 }}>ALL STUDENTS · {cls.period.toUpperCase()} PERIOD</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 28, color: isPassing ? '#14532d' : '#7f1d1d', letterSpacing: '-0.5px' }}>{cls.name}</div>
            <div style={{ fontSize: 12, color: isPassing ? '#166534' : '#991b1b', fontWeight: 600, marginTop: 4, opacity: .75 }}>
              {cls.students.length} STUDENTS · {passing.length} PASSING · {failing.length} BELOW · CLASS AVG {avg}%
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: isPassing ? '#bbf7d0' : '#fecaca', color: isPassing ? '#166534' : '#991b1b', fontSize: 18, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '24px 32px' }}>

          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { val: cls.students.length, label: 'TOTAL', color: '#1a1a2e', bg: '#f0ece6' },
              { val: passing.length, label: 'PASSING', color: '#166534', bg: '#dcfce7' },
              { val: failing.length, label: 'NEED HELP', color: '#991b1b', bg: '#fee2e2' },
              { val: `${avg}%`, label: 'CLASS AVG', color: '#1a3a8a', bg: '#e8f2ff' },
              { val: `${cls.benchmark}%`, label: 'BENCHMARK', color: '#7a4f00', bg: '#fef3c7' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: 26, color: s.color, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: .65, marginTop: 4, letterSpacing: '1.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Students needing help — highlighted section */}
          {failing.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#991b1b', letterSpacing: '2px', marginBottom: 10 }}>⚠ BELOW BENCHMARK</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                {failing.sort((a,b) => getAvg(a.scores) - getAvg(b.scores)).map((s, i) => {
                  const savg = getAvg(s.scores)
                  const gap  = cls.benchmark - savg
                  return (
                    <div key={s.id} onClick={() => onOpenStudent(s.id)} style={{
                      background: '#fff', border: '2px solid #fca5a5', borderRadius: 14,
                      padding: '14px 16px', cursor: 'pointer', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <PersonIconSquare size={40} borderRadius={10} bg="#fee2e2" color="#991b1b" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: '#991b1b', fontWeight: 700, marginTop: 2 }}>GR. {s.grade || '?'} · {savg}% · -{gap}PTS</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#991b1b', fontFamily: F }}>{savg}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All students by grade */}
          {Object.keys(byGrade).sort().map(grade => (
            <div key={grade} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 8 }}>GRADE {grade}</div>
              <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #ede8e0' }}>
                {byGrade[grade].map((s, i) => {
                  const savg = getAvg(s.scores)
                  const ok   = savg >= cls.benchmark
                  const sp   = pastel(i)
                  const isLast = i === byGrade[grade].length - 1
                  return (
                    <div key={s.id} onClick={() => onOpenStudent(s.id)} style={{
                      display: 'flex', alignItems: 'center', padding: '13px 18px',
                      borderBottom: isLast ? 'none' : '1px solid #f7f4f0',
                      gap: 14, cursor: 'pointer', transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7f4f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <PersonIconSquare size={38} borderRadius={10} bg={sp.bg} color={sp.dark} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, letterSpacing: '.5px', marginTop: 1 }}>
                          {s.scores.length} ASSESSMENTS · LATEST: {s.scores[s.scores.length-1]}%
                        </div>
                      </div>
                      {/* Mini bar */}
                      <div style={{ width: 80 }}>
                        <div style={{ height: 4, background: '#f0ece6', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${savg}%`, background: ok ? '#86efac' : '#fca5a5', borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: ok ? '#166534' : '#991b1b', minWidth: 46, textAlign: 'right', fontFamily: F }}>{savg}%</div>
                      <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 4, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b', fontWeight: 800, minWidth: 72, textAlign: 'center' }}>
                        {ok ? 'PASSING' : 'NEEDS HELP'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClassDetail({ cls, teacherName, onBack, onOpenStudent, onSignOut }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [showAllStudents, setShowAllStudents] = useState(false)
  const [sForm, setSForm] = useState({ name: '', score: '', grade: '' })
  const [bmForm, setBmForm] = useState(String(cls.benchmark))
  const [notif, setNotif] = useState(null)
  const [, forceUpdate] = useState(0)

  const avg = classAvg(cls)
  const passing = classPassing(cls)
  const isPassing = avg >= cls.benchmark
  const p = pastel(cls.id % 7)

  // Card colors: green/red
  const heroBg     = isPassing ? '#dcfce7' : '#fee2e2'
  const heroBorder = isPassing ? '#86efac' : '#fca5a5'
  const heroDark   = isPassing ? '#14532d' : '#7f1d1d'

  const { aiEnabled } = useAI()

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    if (!aiEnabled) { setAiText('AI is disabled. Toggle it on to generate analysis.'); setAiLoading(false); return }
    const below = cls.students.filter(s => getAvg(s.scores) < cls.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
    const above = cls.students.filter(s => getAvg(s.scores) >= cls.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
    const critical = cls.students.filter(s => getAvg(s.scores) < 60).map(s => s.name)
    const topicTotals = {}
    cls.students.forEach(s => {
      s.topics.forEach((t, i) => {
        if (!topicTotals[t]) topicTotals[t] = []
        topicTotals[t].push(s.scores[i] || 0)
      })
    })
    const weakestTopic = Object.entries(topicTotals)
      .map(([t, scores]) => ({ topic: t, avg: Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) }))
      .sort((a,b) => a.avg - b.avg)[0]
    const prompt = `You are an education coach giving a teacher specific class-level feedback. Use bullet points. Reference students by name. Be direct.\n\nClass: ${cls.name}\nBenchmark: ${cls.benchmark}%\nClass average: ${avg}%\nStudents below benchmark: ${below.length ? below.join(', ') : 'none'}\nStudents at/above benchmark: ${above.join(', ')}\nCritical (below 60%): ${critical.length ? critical.join(', ') : 'none'}\nWeakest class topic: ${weakestTopic ? weakestTopic.topic + ' (' + weakestTopic.avg + '% avg)' : 'unknown'}\n\nGive 3-4 bullet points. No intro text, just bullets. One sentence each.`
    streamClaude(prompt, c => setAiText(prev => prev + c), () => setAiLoading(false))
  }, [cls.id])

  function addStudent() {
    if (!sForm.name) { setNotif('Name required'); return }
    cls.students.push({ id: Date.now(), name: sForm.name, grade: parseInt(sForm.grade) || 9, scores: [parseInt(sForm.score) || 70], topics: ['Topic 1'] })
    setSForm({ name: '', score: '', grade: '' }); setModal(null); setNotif(`${sForm.name} added!`); forceUpdate(n => n + 1)
  }

  function saveBenchmark() {
    cls.benchmark = parseInt(bmForm) || 70
    setModal(null); setNotif(`Benchmark updated to ${cls.benchmark}%`); forceUpdate(n => n + 1)
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
        <BackBtn label="Back to Classes" onClick={onBack} />

        {/* Hero — green or red based on benchmark */}
        <div style={{ background: heroBg, padding: '30px 36px', marginBottom: 0, position: 'relative', overflow: 'hidden', borderTop: `4px solid ${heroBorder}` }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: heroDark, opacity: .05 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: heroDark, opacity: .6, marginBottom: 6 }}>{cls.period.toUpperCase()} PERIOD</div>
              <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: 40, color: heroDark, letterSpacing: '-1px', lineHeight: 1, marginBottom: 8 }}>{cls.name.toUpperCase()}</h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setModal('benchmark')} style={{ padding: '7px 16px', border: `2px solid ${heroDark}44`, borderRadius: 4, background: 'rgba(255,255,255,0.45)', color: heroDark, fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>EDIT BENCHMARK</button>
                <button onClick={() => setModal('addStudent')} style={{ padding: '7px 16px', border: 'none', borderRadius: 4, background: heroDark, color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>+ ADD STUDENT</button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 64, color: heroDark, lineHeight: 1 }}>{avg}<span style={{ fontSize: 28 }}>%</span></div>
              <div style={{ fontSize: 10, fontWeight: 800, color: heroDark, opacity: .55, letterSpacing: '2px' }}>CLASS AVERAGE</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: heroDark, opacity: .6, marginTop: 4 }}>GOAL: {cls.benchmark}% · {passing}/{cls.students.length} PASSING</div>
            </div>
          </div>
        </div>

        {/* Students list */}
        <div style={{ background: '#fff', borderRadius: 0, padding: '0', borderBottom: '1px solid #ede8e0' }}>
          <div style={{ padding: '18px 28px 12px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa' }}>ROSTER — {cls.students.length} STUDENTS</div>
            {/* Clicking this opens the all-students dashboard */}
            <button onClick={() => setShowAllStudents(true)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2ddd6',
              background: 'transparent', color: '#1a1a2e', fontWeight: 800, fontSize: 11,
              cursor: 'pointer', fontFamily: F, letterSpacing: '1px',
            }}>
              VIEW ALL DASHBOARD →
            </button>
          </div>

          {cls.students.length === 0 && (
            <div style={{ padding: '32px 28px', color: '#8888aa', fontSize: 14, fontFamily: F }}>No students yet — add one above.</div>
          )}

          {cls.students.map((s, i) => {
            const savg = getAvg(s.scores)
            const ok = savg >= cls.benchmark
            const sp = pastel(i)
            const isLast = i === cls.students.length - 1
            return (
              <div key={s.id} onClick={() => onOpenStudent(s.id)} style={{
                display: 'flex', alignItems: 'center', padding: '13px 28px',
                borderBottom: isLast ? 'none' : '1px solid #f7f4f0',
                gap: 14, cursor: 'pointer', transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f4f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Circle avatar — smaller */}
                <PersonIconSquare size={36} borderRadius="50%" bg={sp.bg} color={sp.dark} />

                {/* Name + sub info — flex 1 so it takes remaining space */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, letterSpacing: '.5px', marginTop: 1 }}>
                    {s.scores.length} ASSESSMENTS · LATEST: {s.scores[s.scores.length-1]}%
                  </div>
                </div>

                {/* Progress bar — fixed width so all bars start/end at same column */}
                <div style={{ width: 140, flexShrink: 0 }}>
                  <div style={{ position: 'relative', height: 6, background: '#f0ece6', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${savg}%`, background: ok ? '#86efac' : '#fca5a5', borderRadius: 3, borderRight: `2px solid ${ok ? '#166534' : '#991b1b'}` }} />
                    {/* Benchmark tick mark */}
                    <div style={{ position: 'absolute', top: -2, left: `${cls.benchmark}%`, width: 2, height: 10, background: '#94a3b8', borderRadius: 1 }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, marginTop: 3, letterSpacing: '.5px' }}>{savg}% / {cls.benchmark}% GOAL</div>
                </div>

                {/* Score — fixed width */}
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: ok ? '#166534' : '#991b1b', width: 54, textAlign: 'right', flexShrink: 0 }}>{savg}%</div>

                {/* Badge — fixed width */}
                <span style={{ fontSize: 10, padding: '4px 0', borderRadius: 4, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b', fontWeight: 800, fontFamily: F, letterSpacing: '1px', width: 82, textAlign: 'center', flexShrink: 0, display: 'inline-block' }}>
                  {ok ? 'PASSING' : 'NEEDS HELP'}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 0 }}>
          <AIBox text={aiText} loading={aiLoading} />
        </div>
      </div>

      {/* All-students dashboard overlay */}
      {showAllStudents && (
        <AllStudentsDashboard
          cls={cls}
          onClose={() => setShowAllStudents(false)}
          onOpenStudent={(id) => { setShowAllStudents(false); onOpenStudent(id) }}
        />
      )}

      {modal === 'addStudent' && (
        <Modal title={`Add Student to ${cls.name}`} onClose={() => setModal(null)}>
          <FormGroup label="Student Name"><TextInput value={sForm.name} onChange={v => setSForm(f=>({...f,name:v}))} placeholder="First Last" /></FormGroup>
          <FormGroup label="Grade Level"><TextInput type="number" value={sForm.grade} onChange={v => setSForm(f=>({...f,grade:v}))} placeholder="9" /></FormGroup>
          <FormGroup label="Initial Score (%)"><TextInput type="number" value={sForm.score} onChange={v => setSForm(f=>({...f,score:v}))} placeholder="78" /></FormGroup>
          <button onClick={addStudent} style={{ width:'100%',padding:'12px',borderRadius:0,border:'none',background:'#a8c8f8',color:'#1a3a8a',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:F,marginTop:4,letterSpacing:'1px' }}>ADD STUDENT</button>
        </Modal>
      )}
      {modal === 'benchmark' && (
        <Modal title={`Edit Benchmark — ${cls.name}`} onClose={() => setModal(null)}>
          <FormGroup label="Benchmark (%)"><TextInput type="number" value={bmForm} onChange={setBmForm} placeholder="75" /></FormGroup>
          <button onClick={saveBenchmark} style={{ width:'100%',padding:'12px',borderRadius:0,border:'none',background:'#a8c8f8',color:'#1a3a8a',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:F,marginTop:4,letterSpacing:'1px' }}>SAVE</button>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}
