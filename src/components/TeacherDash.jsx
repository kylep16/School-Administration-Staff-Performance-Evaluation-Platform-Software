import React, { useState, useEffect } from 'react'
import { classAvg, classPassing, getAvg } from '../utils.js'
import { Nav, Badge, Btn, ProgressBar, AIBox, Modal, FormGroup, TextInput, Notification } from './UI.jsx'

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
    onChunk('Error: ' + (err.message || 'API call failed — check your VITE_ANTHROPIC_KEY in .env'))
  }
  onDone?.()
}

export default function TeacherDash({ teachers, currentTeacher, onSwitchTeacher, onOpenClass, onSignOut }) {
  const [tab, setTab] = useState('classes')
  const [modal, setModal] = useState(null)
  const [goalForm, setGoalForm] = useState({ title: '', current: '', target: '', due: '' })
  const [notif, setNotif] = useState(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const t = currentTeacher
  const totalStudents = t.classes.reduce((a, c) => a + c.students.length, 0)
  const passingClasses = t.classes.filter(c => classAvg(c) >= c.benchmark).length
  const overallAvg = t.classes.length ? Math.round(t.classes.reduce((a, c) => a + classAvg(c), 0) / t.classes.length) : 0

  useEffect(() => {
    if (tab !== 'dashboard') return
    setAiText(''); setAiLoading(true)
    const details = t.classes.map(c => {
      const avg = classAvg(c)
      const below = c.students.filter(s => getAvg(s.scores) < c.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
      const critical = c.students.filter(s => getAvg(s.scores) < 60).map(s => s.name)
      return `${c.name}: avg ${avg}%, benchmark ${c.benchmark}%${below.length ? `, below benchmark: ${below.join(', ')}` : ', all passing'}${critical.length ? `, critical: ${critical.join(', ')}` : ''}`
    }).join(' | ')
    const prompt = `You are an education coach giving a teacher their daily dashboard summary. Use bullet points. Be specific — name students and classes. Use teacher language.

Teacher: ${t.name} (${t.subject})
Classes: ${details}

Give 3-5 bullet points mixing observations and actions, like:
- "Re-teach [topic] in [class]. Class average is X%, below the Y% benchmark"
INSERT NEW LINE. ADD SPACE HERE
- "Call on [student] more in [class]. They may need more engagement to stay on track"
INSERT NEW LINE
- "Consider re-testing [class] on [topic] after a targeted review"
INSERT NEW LINE
- "[Student] in [class] is close to benchmark — a short 1-on-1 could push them over"
INSERT NEW LINE
- "[Class] is performing well. Keep the current pace"
No intro. Just bullets. One sentence each.

Example :
- * "Re-teach Triangles in Math. Class average is 98%, below the 99% benchmark"
- * "Call on Jason Nguyen more in Math. They may need more engagement to stay on track"
- * "Consider re-testing Triangles on Math after a targeted review"
- * "Kyle in Biology is close to benchmark — a short 1-on-1 could push them over"
- * "Biology is performing well. Keep the current pace"
No intro. Just bullets. One sentence each.`

    streamClaude(prompt, c => setAiText(p => p + c), () => setAiLoading(false))
  }, [tab, t.id])

  function saveGoal() {
    if (!goalForm.title) { setNotif('Please enter a goal description'); return }
    t.goals.push({ id: Date.now(), title: goalForm.title, current: parseFloat(goalForm.current)||0, target: parseFloat(goalForm.target)||100, due: goalForm.due||'TBD', created: 'Now' })
    setGoalForm({ title:'',current:'',target:'',due:'' }); setModal(null); setNotif('Goal saved!')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>
      {/* Top nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede8e0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.5px', fontFamily: F }}>EduPulse</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {teachers.map((t2, i) => {
            const p = pastel(i)
            const active = t2.id === t.id
            return (
              <button key={t2.id} onClick={() => onSwitchTeacher(t2.id)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: F,
                background: active ? p.bg : 'transparent', color: active ? p.dark : '#8888aa',
                fontWeight: active ? 800 : 500, fontSize: 13, transition: 'all .15s',
              }}>
                {t2.name.split(' ').slice(1).join(' ')}
              </button>
            )
          })}
          <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #e2ddd6', background: 'transparent', color: '#8888aa', fontSize: 13, cursor: 'pointer', fontFamily: F }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 6 }}>TEACHER PORTAL</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>{t.name}</h1>
            <p style={{ color: '#8888aa', fontSize: 14, marginTop: 4, fontWeight: 600 }}>{t.subject.toUpperCase()} · {t.classes.length} CLASSES · {totalStudents} STUDENTS</p>
          </div>
          <button onClick={() => setModal('goal')} style={{ padding: '12px 22px', borderRadius: 20, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: F }}>+ New Goal</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#fff', padding: 5, borderRadius: 20, width: 'fit-content', border: '1px solid #ede8e0' }}>
          {[['classes','CLASSES'],['goals','GOALS'],['dashboard','DASHBOARD']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '9px 22px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: tab === id ? '#1a1a2e' : 'transparent',
              color: tab === id ? '#fff' : '#8888aa',
              fontWeight: 700, fontSize: 12, letterSpacing: '1px', fontFamily: F, transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'classes'   && <StampPage teacher={t} onOpenClass={onOpenClass} />}
        {tab === 'goals'     && <GoalsTab teacher={t} onNewGoal={() => setModal('goal')} />}
        {tab === 'dashboard' && <DashTab teacher={t} overallAvg={overallAvg} passingClasses={passingClasses} totalStudents={totalStudents} aiText={aiText} aiLoading={aiLoading} />}
      </div>

      {modal === 'goal' && (
        <Modal title="Set New Goal" onClose={() => setModal(null)}>
          <FormGroup label="Goal Description"><TextInput value={goalForm.title} onChange={v=>setGoalForm(f=>({...f,title:v}))} placeholder="e.g. Raise class average to 85%" /></FormGroup>
          <FormGroup label="Current Value"><TextInput type="number" value={goalForm.current} onChange={v=>setGoalForm(f=>({...f,current:v}))} placeholder="72" /></FormGroup>
          <FormGroup label="Target Value"><TextInput type="number" value={goalForm.target} onChange={v=>setGoalForm(f=>({...f,target:v}))} placeholder="85" /></FormGroup>
          <FormGroup label="Due Date"><TextInput value={goalForm.due} onChange={v=>setGoalForm(f=>({...f,due:v}))} placeholder="June 2025" /></FormGroup>
          <button onClick={saveGoal} style={{ width:'100%',padding:'12px',borderRadius:16,border:'none',background:'#a8c8f8',color:'#1a3a8a',fontWeight:800,fontSize:15,cursor:'pointer',fontFamily:F,marginTop:4 }}>Save Goal</button>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
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
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: isPassing ? p.bg : '#f0ece6',
      borderRadius: 24, padding: '22px 20px', cursor: 'pointer',
      transition: 'all .2s', transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
      boxShadow: hovered ? '0 12px 32px rgba(26,26,46,0.12)' : '0 2px 8px rgba(26,26,46,0.06)',
      border: `2px solid ${isPassing ? p.dark + '22' : '#e2ddd6'}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', color: isPassing ? p.dark : '#8888aa', marginBottom: 8 }}>{cls.period.toUpperCase()} PERIOD</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: isPassing ? p.dark : '#3d3d5c', marginBottom: 2, fontFamily: F }}>{cls.name.toUpperCase()}</div>
      <div style={{ fontSize: 11, color: isPassing ? p.dark : '#8888aa', opacity: .7, marginBottom: 16 }}>{cls.students.length} STUDENTS</div>
      <div style={{ fontWeight: 800, fontSize: 44, color: isPassing ? p.dark : '#aaa', lineHeight: 1, fontFamily: F }}>{avg}<span style={{ fontSize: 20 }}>%</span></div>
      <div style={{ fontSize: 11, fontWeight: 700, color: isPassing ? p.dark : '#8888aa', opacity: .7, marginTop: 4 }}>GOAL: {cls.benchmark}%</div>
      {/* Passing dots */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
        {Array.from({ length: cls.students.length }, (_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < passing ? (isPassing ? p.dark : '#aaa') : (isPassing ? p.dark+'33' : '#ddd'),
            transition: 'all .3s',
          }} />
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: isPassing ? p.dark : '#e2ddd6', color: isPassing ? '#fff' : '#8888aa', fontWeight: 700 }}>
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
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
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
          { val: totalStudents,                      label: 'STUDENTS',   i: 0 },
          { val: `${passingClasses}/${teacher.classes.length}`, label: 'AT BENCHMARK', i: 1 },
          { val: `${overallAvg}%`,                   label: 'AVG SCORE',  i: 2 },
          { val: teacher.goals.length,               label: 'GOALS',      i: 3 },
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

      {/* AI Notes */}
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
              <div style={{ width: 36, height: barH, background: p.bg, borderRadius: '10px 10px 0 0', border: `2px solid ${p.dark}33` }} />
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
