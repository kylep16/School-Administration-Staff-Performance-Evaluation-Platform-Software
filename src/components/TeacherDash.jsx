import React, { useState, useEffect } from 'react'
import { classAvg, classPassing, getAvg } from '../utils.js'
import { Modal, FormGroup, TextInput, Notification } from './UI.jsx'
import { useAI, AIToggleBtn } from '../AIContext.jsx'

const F = "'Bricolage Grotesque', sans-serif"

const PASTELS = [
  { bg: '#a8c8f8', dark: '#1a3a8a', light: '#e8f2ff' },
  { bg: '#f5d98a', dark: '#7a4f00', light: '#fff8e0' },
  { bg: '#a8e6cf', dark: '#0d5c30', light: '#e0fff5' },
  { bg: '#f5b8c4', dark: '#7a1522', light: '#fff0f3' },
  { bg: '#c8b8f0', dark: '#3a1a80', light: '#f3f0ff' },
  { bg: '#f5c8a8', dark: '#7a2a00', light: '#fff5ee' },
  { bg: '#b8e4f5', dark: '#0a4a6a', light: '#eaf7ff' },
]
function pastel(idx) { return PASTELS[idx % PASTELS.length] }

// Green palette for passing, red palette for failing
const PASS_COLORS  = { bg: '#d1fae5', dark: '#065f46', border: '#6ee7b7' }
const FAIL_COLORS  = { bg: '#fee2e2', dark: '#991b1b', border: '#fca5a5' }

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
        if (line.startsWith('data: ')) {
          const d = line.slice(6); if (d === '[DONE]') continue
          try { const j = JSON.parse(d); if (j.type === 'content_block_delta' && j.delta?.text) onChunk(j.delta.text) } catch (_) {}
        }
      }
    }
  } catch (err) {
    console.error('Claude API error:', err)
    onChunk('Error: ' + (err.message || 'API call failed'))
  }
  onDone?.()
}

// Exclamation mark indicator for large classes
function AlertIndicator({ needHelp }) {
  if (needHelp === 0) return null
  const label = needHelp === 1 ? '!' : needHelp === 2 ? '!!' : '!!!+'
  const color  = needHelp === 1 ? '#92400e' : needHelp === 2 ? '#b91c1c' : '#7f1d1d'
  const bg     = needHelp === 1 ? '#fef3c7' : needHelp === 2 ? '#fee2e2' : '#fecaca'
  return (
    <span style={{
      fontSize: 15, fontWeight: 900, color, background: bg,
      padding: '3px 10px', borderRadius: 6, letterSpacing: 1,
      fontFamily: F, display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TeacherDash({ teachers, currentTeacher, onSwitchTeacher, onOpenClass, onSignOut }) {
  const [tab, setTab] = useState('classes')
  const [modal, setModal] = useState(null)
  const [goalForm, setGoalForm] = useState({ title: '', current: '', target: '', due: '' })
  const [notif, setNotif] = useState(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [scoreStep, setScoreStep] = useState(1)
  const [scoreClassId, setScoreClassId] = useState('')
  const [scoreExamName, setScoreExamName] = useState('')
  const [studentScores, setStudentScores] = useState({})
  const [selectedStudents, setSelectedStudents] = useState([])

  const t = currentTeacher
  const totalStudents = t.classes.reduce((a, c) => a + c.students.length, 0)
  const passingClasses = t.classes.filter(c => classAvg(c) >= c.benchmark).length
  const overallAvg = t.classes.length ? Math.round(t.classes.reduce((a, c) => a + classAvg(c), 0) / t.classes.length) : 0

  const { aiEnabled } = useAI()

  useEffect(() => {
    if (tab !== 'dashboard') return
    setAiText(''); setAiLoading(true)
    if (!aiEnabled) { setAiText('AI is disabled. Toggle it on to generate analysis.'); setAiLoading(false); return }
    const details = t.classes.map(c => {
      const avg = classAvg(c)
      const below = c.students.filter(s => getAvg(s.scores) < c.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
      const critical = c.students.filter(s => getAvg(s.scores) < 60).map(s => s.name)
      return `${c.name}: avg ${avg}%, benchmark ${c.benchmark}%${below.length ? `, below benchmark: ${below.join(', ')}` : ', all passing'}${critical.length ? `, critical: ${critical.join(', ')}` : ''}`
    }).join(' | ')
    const prompt = `You are an education coach giving a teacher their daily dashboard summary. Use bullet points. Be specific — name students and classes. Use teacher language.\n\nTeacher: ${t.name} (${t.subject})\nClasses: ${details}\n\nGive 3-5 bullet points mixing observations and actions. No intro. Just bullets. One sentence each.`
    streamClaude(prompt, c => setAiText(p => p + c), () => setAiLoading(false))
  }, [tab, t.id])

  function saveGoal() {
    if (!goalForm.title) { setNotif('Please enter a goal description'); return }
    t.goals.push({ id: Date.now(), title: goalForm.title, current: parseFloat(goalForm.current)||0, target: parseFloat(goalForm.target)||100, due: goalForm.due||'TBD', created: 'Now' })
    setGoalForm({ title:'',current:'',target:'',due:'' }); setModal(null); setNotif('Goal saved!')
  }

  function openAddScore() {
    setScoreStep(1); setScoreClassId(t.classes[0]?.id || ''); setScoreExamName('')
    setStudentScores({}); setSelectedStudents([]); setModal('addScore')
  }

  function nextStep() {
    if (scoreStep === 1) {
      if (!scoreClassId) { setNotif('Select a class'); return }
      const cls = t.classes.find(c => c.id === parseInt(scoreClassId))
      setSelectedStudents(cls?.students.map(s => s.id) || []); setStudentScores({}); setScoreStep(2)
    } else if (scoreStep === 2) {
      if (!scoreExamName.trim()) { setNotif('Enter an exam name'); return }
      setScoreStep(3)
    }
  }

  function toggleStudent(id) {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function saveScores() {
    const cls = t.classes.find(c => c.id === parseInt(scoreClassId))
    if (!cls) return
    let saved = 0
    cls.students.forEach(s => {
      if (selectedStudents.includes(s.id)) {
        const score = parseInt(studentScores[s.id])
        if (!isNaN(score) && score >= 0 && score <= 100) { s.scores.push(score); s.topics.push(scoreExamName); saved++ }
      }
    })
    setModal(null); setNotif(`Saved ${saved} score${saved !== 1 ? 's' : ''} for "${scoreExamName}"`)
  }

  const scoreClass = t.classes.find(c => c.id === parseInt(scoreClassId))

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>

      {/* ── Top Nav ── */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #ede8e0',
        padding: '0 32px', display: 'flex', alignItems: 'stretch',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', letterSpacing: '-0.5px', fontFamily: F, paddingRight: 24, borderRight: '1px solid #ede8e0', height: '100%', display: 'flex', alignItems: 'center' }}>
            EduIQ
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', paddingLeft: 8 }}>
            {teachers.map((t2, i) => {
              const p = pastel(i)
              const active = t2.id === t.id
              return (
                <button key={t2.id} onClick={() => onSwitchTeacher(t2.id)} style={{
                  padding: '0 16px', border: 'none', cursor: 'pointer', fontFamily: F,
                  background: 'transparent',
                  color: active ? p.dark : '#aaa',
                  fontWeight: active ? 800 : 500, fontSize: 13,
                  borderBottom: active ? `3px solid ${p.dark}` : '3px solid transparent',
                  transition: 'all .15s',
                }}>
                  {t2.name.split(' ').slice(1).join(' ')}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AIToggleBtn />
          <NavBtn label="+ ADD SCORE" bg="#a8e6cf" color="#0d5c30" onClick={openAddScore} />
          <NavBtn label="+ NEW GOAL"  bg="#a8c8f8" color="#1a3a8a" onClick={() => setModal('goal')} />
          <button onClick={onSignOut} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid #e2ddd6',
            background: 'transparent', color: '#aaa', fontSize: 12, cursor: 'pointer', fontFamily: F, fontWeight: 600,
          }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 6 }}>TEACHER PORTAL</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>{t.name}</h1>
          <p style={{ color: '#8888aa', fontSize: 13, marginTop: 4, fontWeight: 600, letterSpacing: '.5px' }}>
            {t.subject.toUpperCase()} · {t.classes.length} CLASSES · {totalStudents} STUDENTS
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '2px solid #ede8e0' }}>
          {[['classes','CLASSES'],['goals','GOALS'],['dashboard','DASHBOARD']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '10px 24px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: tab === id ? '#1a1a2e' : '#aaa',
              fontWeight: tab === id ? 800 : 600,
              fontSize: 12, letterSpacing: '1.5px', fontFamily: F,
              borderBottom: tab === id ? '2px solid #1a1a2e' : '2px solid transparent',
              marginBottom: -2, transition: 'all .15s',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'classes'   && <StampPage teacher={t} onOpenClass={onOpenClass} />}
        {tab === 'goals'     && <GoalsTab teacher={t} onNewGoal={() => setModal('goal')} />}
        {tab === 'dashboard' && <DashTab teacher={t} overallAvg={overallAvg} passingClasses={passingClasses} totalStudents={totalStudents} aiText={aiText} aiLoading={aiLoading} />}
      </div>

      {/* ── Goal Modal ── */}
      {modal === 'goal' && (
        <Modal title="Set New Goal" onClose={() => setModal(null)}>
          <FormGroup label="Goal Description"><TextInput value={goalForm.title} onChange={v=>setGoalForm(f=>({...f,title:v}))} placeholder="e.g. Raise class average to 85%" /></FormGroup>
          <FormGroup label="Current Value"><TextInput type="number" value={goalForm.current} onChange={v=>setGoalForm(f=>({...f,current:v}))} placeholder="72" /></FormGroup>
          <FormGroup label="Target Value"><TextInput type="number" value={goalForm.target} onChange={v=>setGoalForm(f=>({...f,target:v}))} placeholder="85" /></FormGroup>
          <FormGroup label="Due Date"><TextInput value={goalForm.due} onChange={v=>setGoalForm(f=>({...f,due:v}))} placeholder="June 2025" /></FormGroup>
          <PastelBtn onClick={saveGoal} bg="#a8c8f8" color="#1a3a8a">Save Goal</PastelBtn>
        </Modal>
      )}

      {/* ── Add Score Modal ── */}
      {modal === 'addScore' && (
        <Modal title="" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
            {[1,2,3].map(s => (
              <React.Fragment key={s}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: scoreStep >= s ? '#1a1a2e' : '#f0ece6',
                  color: scoreStep >= s ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, fontFamily: F, flexShrink: 0,
                }}>{s}</div>
                {s < 3 && <div style={{ flex: 1, height: 2, background: scoreStep > s ? '#1a1a2e' : '#f0ece6', margin: '0 4px' }} />}
              </React.Fragment>
            ))}
          </div>

          {scoreStep === 1 && (
            <>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', marginBottom: 6, fontFamily: F }}>Select a Class</div>
              <div style={{ fontSize: 12, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px', marginBottom: 20 }}>Which class is this exam for?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {t.classes.map((cls, i) => {
                  const p = pastel(i)
                  const selected = scoreClassId === cls.id.toString() || scoreClassId === cls.id
                  return (
                    <button key={cls.id} onClick={() => setScoreClassId(cls.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderRadius: 14, border: `2px solid ${selected ? p.dark : '#ede8e0'}`,
                      background: selected ? p.bg : '#faf9f6',
                      cursor: 'pointer', fontFamily: F, transition: 'all .15s', textAlign: 'left',
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: selected ? p.dark : '#e8e4de', color: selected ? '#fff' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                        {cls.period}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: selected ? p.dark : '#1a1a2e' }}>{cls.name}</div>
                        <div style={{ fontSize: 11, color: selected ? p.dark : '#aaa', fontWeight: 600, opacity: .7 }}>{cls.students.length} STUDENTS · BENCHMARK {cls.benchmark}%</div>
                      </div>
                      {selected && <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18, color: p.dark }}>✓</div>}
                    </button>
                  )
                })}
              </div>
              <PastelBtn onClick={nextStep} bg="#1a1a2e" color="#fff">NEXT →</PastelBtn>
            </>
          )}

          {scoreStep === 2 && (
            <>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', marginBottom: 6, fontFamily: F }}>Exam Details</div>
              <div style={{ fontSize: 12, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px', marginBottom: 20 }}>
                {scoreClass?.name.toUpperCase()} · {scoreClass?.period} PERIOD
              </div>
              <FormGroup label="Exam / Subject Name">
                <TextInput value={scoreExamName} onChange={setScoreExamName} placeholder="e.g. Chapter 4 Quiz, Midterm" />
              </FormGroup>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#8888aa', letterSpacing: '1px', marginBottom: 10 }}>
                  WHO TOOK THIS EXAM? <span style={{ color: '#aaa', fontWeight: 600 }}>({selectedStudents.length}/{scoreClass?.students.length} selected)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                  {scoreClass?.students.map((s, i) => {
                    const sp = pastel(i)
                    const selected = selectedStudents.includes(s.id)
                    return (
                      <button key={s.id} onClick={() => toggleStudent(s.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                        borderRadius: 10, border: `1.5px solid ${selected ? sp.dark : '#ede8e0'}`,
                        background: selected ? sp.bg : '#faf9f6',
                        cursor: 'pointer', fontFamily: F, transition: 'all .12s', textAlign: 'left',
                      }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: selected ? sp.dark : '#e8e4de', color: selected ? '#fff' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                          {s.name.split(' ').map(w=>w[0]).join('')}
                        </div>
                        <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: selected ? sp.dark : '#1a1a2e' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: selected ? sp.dark : '#aaa', fontWeight: 700, opacity: .7 }}>
                          GR.{s.grade} · AVG {getAvg(s.scores)}%
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? sp.dark : '#ddd'}`, background: selected ? sp.dark : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => setSelectedStudents(scoreClass?.students.map(s=>s.id)||[])} style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, textDecoration: 'underline' }}>Select all</button>
                  <button onClick={() => setSelectedStudents([])} style={{ fontSize: 11, fontWeight: 700, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, textDecoration: 'underline' }}>Clear</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setScoreStep(1)} style={{ padding: '12px 18px', borderRadius: 12, border: '1.5px solid #ede8e0', background: 'transparent', color: '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>← Back</button>
                <PastelBtn onClick={nextStep} bg="#1a1a2e" color="#fff" style={{ flex: 1, justifyContent: 'center' }}>ENTER SCORES →</PastelBtn>
              </div>
            </>
          )}

          {scoreStep === 3 && (
            <>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', marginBottom: 4, fontFamily: F }}>{scoreExamName}</div>
              <div style={{ fontSize: 12, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px', marginBottom: 20 }}>
                {scoreClass?.name.toUpperCase()} · {selectedStudents.length} STUDENTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, maxHeight: 320, overflowY: 'auto' }}>
                {scoreClass?.students.filter(s => selectedStudents.includes(s.id)).map((s, i) => {
                  const sp = pastel(i)
                  const val = studentScores[s.id] || ''
                  const numVal = parseInt(val)
                  const isValid = !isNaN(numVal) && numVal >= 0 && numVal <= 100
                  const ok = isValid && numVal >= scoreClass.benchmark
                  return (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      background: val && isValid ? (ok ? '#f0fff8' : '#fff5f6') : '#faf9f6',
                      border: `1.5px solid ${val && isValid ? (ok ? '#a8e6cf' : '#f5b8c4') : '#ede8e0'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: sp.bg, color: sp.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                        {s.name.split(' ').map(w=>w[0]).join('')}
                      </div>
                      <div style={{ flex: 1, fontFamily: F }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>GR. {s.grade}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number" min="0" max="100"
                          value={val}
                          onChange={e => setStudentScores(prev => ({...prev, [s.id]: e.target.value}))}
                          placeholder="0–100"
                          style={{
                            width: 72, padding: '8px 10px', borderRadius: 8,
                            border: `1.5px solid ${val && isValid ? (ok ? '#a8e6cf' : '#f5b8c4') : '#ede8e0'}`,
                            fontSize: 16, fontWeight: 800, fontFamily: F,
                            color: val && isValid ? (ok ? '#0d5c30' : '#7a1522') : '#1a1a2e',
                            background: '#fff', textAlign: 'center', outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#aaa' }}>%</span>
                        {val && isValid && (
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', fontWeight: 800 }}>
                            {ok ? 'PASS' : 'FAIL'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {Object.keys(studentScores).length > 0 && (
                <div style={{ background: '#f7f4f0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 20 }}>
                  {(() => {
                    const entries = Object.entries(studentScores).filter(([,v]) => !isNaN(parseInt(v)))
                    const avg = entries.length ? Math.round(entries.reduce((a,[,v])=>a+parseInt(v),0)/entries.length) : 0
                    const passing = entries.filter(([,v]) => parseInt(v) >= (scoreClass?.benchmark||70)).length
                    return <>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', fontFamily: F }}>{avg}%</div><div style={{ fontSize: 10, color: '#aaa', fontWeight: 700 }}>CLASS AVG</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: '#0d5c30', fontFamily: F }}>{passing}</div><div style={{ fontSize: 10, color: '#aaa', fontWeight: 700 }}>PASSING</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: '#7a1522', fontFamily: F }}>{entries.length - passing}</div><div style={{ fontSize: 10, color: '#aaa', fontWeight: 700 }}>BELOW</div></div>
                    </>
                  })()}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setScoreStep(2)} style={{ padding: '12px 18px', borderRadius: 12, border: '1.5px solid #ede8e0', background: 'transparent', color: '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>← Back</button>
                <PastelBtn onClick={saveScores} bg="#a8e6cf" color="#0d5c30" style={{ flex: 1, justifyContent: 'center' }}>SAVE SCORES</PastelBtn>
              </div>
            </>
          )}
        </Modal>
      )}

      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function NavBtn({ label, bg, color, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 8, border: 'none',
      background: hov ? bg : bg + 'cc',
      color, fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F,
      letterSpacing: '1px', transition: 'all .15s',
    }}>{label}</button>
  )
}

function PastelBtn({ children, onClick, bg, color, style = {} }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '12px 22px', borderRadius: 12, border: 'none',
      background: bg, color, fontWeight: 800, fontSize: 13,
      cursor: 'pointer', fontFamily: F, letterSpacing: '.5px',
      width: '100%', justifyContent: 'center',
      ...style,
    }}>{children}</button>
  )
}

// ── Stamp Page ────────────────────────────────────────────────────────────────
function StampPage({ teacher, onOpenClass }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {teacher.classes.map((cls, i) => {
        const avg = classAvg(cls)
        const passing = classPassing(cls)
        const isPassing = avg >= cls.benchmark
        const p = pastel(i)
        return <StampCard key={cls.id} cls={cls} avg={avg} passing={passing} isPassing={isPassing} p={p} onClick={() => onOpenClass(cls.id)} />
      })}
    </div>
  )
}

function StampCard({ cls, avg, passing, isPassing, p, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  const isLargeClass = cls.students.length >= 30
  const needHelp = cls.students.filter(s => getAvg(s.scores) < cls.benchmark).length

  // Color scheme: green if passing, red if not
  const cardBg     = isPassing ? '#dcfce7' : '#fee2e2'
  const cardBorder = isPassing ? '#86efac' : '#fca5a5'
  const cardDark   = isPassing ? '#166534' : '#991b1b'
  const cardMid    = isPassing ? '#16a34a' : '#dc2626'

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: cardBg,
      borderRadius: 24, padding: '22px 20px', cursor: 'pointer',
      transition: 'all .2s', transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
      boxShadow: hovered ? '0 12px 32px rgba(26,26,46,0.12)' : '0 2px 8px rgba(26,26,46,0.06)',
      border: `2px solid ${cardBorder}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', color: cardDark, marginBottom: 8, opacity: .75 }}>
        {cls.period.toUpperCase()} PERIOD
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, color: cardDark, marginBottom: 2, fontFamily: F }}>
        {cls.name.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: cardDark, opacity: .65, marginBottom: 16 }}>{cls.students.length} STUDENTS</div>

      <div style={{ fontWeight: 800, fontSize: 44, color: cardDark, lineHeight: 1, fontFamily: F }}>
        {avg}<span style={{ fontSize: 20 }}>%</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: cardDark, opacity: .65, marginTop: 4 }}>GOAL: {cls.benchmark}%</div>

      {/* Student status display — dots for small, exclamations for large */}
      <div style={{ marginTop: 14 }}>
        {isLargeClass ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: cardDark, opacity: .65, fontWeight: 600 }}>NEEDS HELP:</span>
            {needHelp === 0
              ? <span style={{ fontSize: 12, fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>ALL CLEAR ✓</span>
              : <AlertIndicator needHelp={needHelp} />
            }
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: cls.students.length }, (_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < passing ? cardMid : cardMid + '33',
                transition: 'all .3s',
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <span style={{
          fontSize: 11, padding: '4px 12px', borderRadius: 20,
          background: isPassing ? '#166534' : '#991b1b',
          color: '#fff', fontWeight: 700,
        }}>
          {isPassing ? `${passing}/${cls.students.length} PASSING` : `${cls.benchmark - avg}PTS BELOW`}
        </span>
      </div>
    </div>
  )
}

// ── Goals Tab ──────────────────────────────────────────────────────────────────
function GoalsTab({ teacher, onNewGoal }) {
  if (!teacher.goals.length) return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <p style={{ fontSize: 16, color: '#8888aa', fontFamily: F, fontWeight: 600 }}>No goals set yet.</p>
      <button onClick={onNewGoal} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 20, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: F }}>+ Add Goal</button>
    </div>
  )
  return (
    <div>
      {teacher.goals.map((g, i) => {
        const pct = Math.min(100, Math.round((g.current / g.target) * 100))
        const done = g.current >= g.target
        const p = pastel(i)
        return (
          <div key={g.id} style={{ background: '#fff', borderRadius: 24, padding: '20px 24px', marginBottom: 12, boxShadow: '0 2px 12px rgba(26,26,46,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e', fontFamily: F }}>{g.title}</div>
                <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 700, letterSpacing: '1px', marginTop: 2 }}>DUE: {g.due}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 28, color: p.dark, fontFamily: F }}>{pct}%</div>
            </div>
            <div style={{ height: 10, background: p.light || '#f0ece6', borderRadius: 5 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: p.bg, borderRadius: 5, transition: 'width .6s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#8888aa', fontWeight: 600 }}>{g.current} / {g.target}</span>
              <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: done ? '#a8e6cf' : p.bg, color: done ? '#0d5c30' : p.dark, fontWeight: 700 }}>
                {done ? 'COMPLETE' : 'IN PROGRESS'}
              </span>
            </div>
          </div>
        )
      })}
      <button onClick={onNewGoal} style={{ padding: '10px 22px', borderRadius: 20, border: '1.5px solid #e2ddd6', background: 'transparent', color: '#3d3d5c', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>+ Add Goal</button>
    </div>
  )
}

// ── Dashboard Tab ──────────────────────────────────────────────────────────────
function DashTab({ teacher, overallAvg, passingClasses, totalStudents, aiText, aiLoading }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { val: totalStudents, label: 'STUDENTS', i: 0 },
          { val: `${passingClasses}/${teacher.classes.length}`, label: 'AT BENCHMARK', i: 1 },
          { val: `${overallAvg}%`, label: 'AVG SCORE', i: 2 },
          { val: teacher.goals.length, label: 'GOALS', i: 3 },
        ].map(s => {
          const p = pastel(s.i)
          return (
            <div key={s.label} style={{ background: p.bg, borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 32, color: p.dark, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: p.dark, opacity: .7, marginTop: 6, letterSpacing: '1.5px' }}>{s.label}</div>
              <div style={{ position: 'absolute', right: -10, bottom: -10, width: 60, height: 60, borderRadius: '50%', background: p.dark, opacity: .06 }} />
            </div>
          )
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', marginBottom: 16, boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>PERFORMANCE</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 18, fontFamily: F }}>Class Averages vs Benchmarks</div>
        <ClassBarChart teacher={teacher} />
      </div>

      <div style={{ background: '#c8b8f0', borderRadius: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a1a80', animation: aiLoading ? 'aipulse2 1.4s infinite' : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: F }}>AI Notes</span>
        </div>
        <p style={{ fontSize: 15, color: aiLoading && !aiText ? '#9a8acc' : '#2a1a5e', lineHeight: 1.7, fontStyle: aiLoading && !aiText ? 'italic' : 'normal', fontFamily: F }}>
          {aiLoading && !aiText ? 'Analyzing your classes...' : (aiText || 'No analysis yet.')}
        </p>
        <style>{`@keyframes aipulse2{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
      </div>
    </>
  )
}

function ClassBarChart({ teacher }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 8 }}>
      {teacher.classes.map((cls, i) => {
        const avg = classAvg(cls); const ok = avg >= cls.benchmark
        const p = pastel(i)
        const barH = Math.round((avg / 100) * 120)
        const goalH = Math.round((cls.benchmark / 100) * 120)
        return (
          <div key={cls.id} style={{ textAlign: 'center', minWidth: 80, flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: p.dark, marginBottom: 4, fontFamily: F }}>{avg}%</div>
            <div style={{ position: 'relative', height: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
              <div style={{ width: 36, height: barH, background: ok ? '#dcfce7' : '#fee2e2', borderRadius: '10px 10px 0 0', border: `2px solid ${ok ? '#86efac' : '#fca5a5'}` }} />
              <div style={{ width: 3, height: goalH, background: '#f5b8c4', borderRadius: 2 }} title={`Goal: ${cls.benchmark}%`} />
            </div>
            <div style={{ fontSize: 11, color: '#8888aa', marginTop: 4, fontWeight: 600 }}>{cls.name}</div>
            <div style={{ fontSize: 10, color: '#aaa', fontWeight: 500 }}>GOAL: {cls.benchmark}%</div>
          </div>
        )
      })}
    </div>
  )
}
