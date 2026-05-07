import React, { useState, useEffect } from 'react'
import { classAvg, getAvg } from '../utils.js'
import { Modal, FormGroup, TextInput, Btn, Notification } from './UI.jsx'

const F = "'Bricolage Grotesque', sans-serif"

// Pastel palette — each class/teacher gets one
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
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 350, stream: true, messages: [{ role: 'user', content: prompt }] }),
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

export default function AdminDash({ teachers, onSignOut }) {
  const [page, setPage] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', email: '' })
  const [studentForm, setStudentForm] = useState({ teacherId: '', classId: '', name: '', score: '' })
  const [notif, setNotif] = useState(null)
  const [, forceUpdate] = useState(0)

  const allClasses = teachers.flatMap(t => t.classes)
  const totalStudents = allClasses.reduce((a, c) => a + c.students.length, 0)
  const classesAtBenchmark = allClasses.filter(c => classAvg(c) >= c.benchmark).length
  const overallAvg = allClasses.length ? Math.round(allClasses.reduce((a, c) => a + classAvg(c), 0) / allClasses.length) : 0

  function saveTeacher() {
    if (!teacherForm.name || !teacherForm.subject) { setNotif('Name and subject required'); return }
    const inits = teacherForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    teachers.push({ id: Date.now(), name: teacherForm.name, subject: teacherForm.subject, email: teacherForm.email, avatar: inits, classes: [], goals: [] })
    setTeacherForm({ name: '', subject: '', email: '' }); setModal(null); setNotif(`${teacherForm.name} added!`); forceUpdate(n => n + 1)
  }

  const selTeacher = teachers.find(t => t.id === parseInt(studentForm.teacherId))
  function saveStudent() {
    const cls = selTeacher?.classes.find(c => c.id === parseInt(studentForm.classId))
    if (!studentForm.name || !cls) { setNotif('Fill all fields'); return }
    cls.students.push({ id: Date.now(), name: studentForm.name, scores: [parseInt(studentForm.score) || 70], topics: ['Topic 1'] })
    setStudentForm({ teacherId: '', classId: '', name: '', score: '' }); setModal(null); setNotif(`${studentForm.name} added!`); forceUpdate(n => n + 1)
  }

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'teachers',  label: 'TEACHERS'  },
    { id: 'students',  label: 'STUDENTS'  },
    { id: 'analytics', label: 'ANALYTICS' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#fff',
        borderRight: '1px solid #ede8e0',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        <div style={{ padding: '28px 20px 20px' }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: '-0.5px', fontFamily: F }}>EduPulse</div>
          <div style={{ fontSize: 11, color: '#8888aa', marginTop: 2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</div>
        </div>

        <nav style={{ padding: '8px 12px', flex: 1 }}>
          {navItems.map((item, i) => {
            const active = page === item.id
            const p = pastel(i)
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '11px 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: active ? p.bg : 'transparent',
                color: active ? p.dark : '#3d3d5c',
                fontWeight: active ? 800 : 400, fontSize: 13, fontFamily: F,
                marginBottom: 4, transition: 'all .15s', letterSpacing: active ? '0.5px' : '0',
              }}>
                {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.dark, marginRight: 8, flexShrink: 0 }} />}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => setModal('addTeacher')} style={{ width: '100%', padding: '10px', borderRadius: 14, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>+ Add Teacher</button>
          <button onClick={() => setModal('addStudent')} style={{ width: '100%', padding: '10px', borderRadius: 14, border: '1.5px solid #e2ddd6', background: '#fff', color: '#3d3d5c', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}>+ Add Student</button>
          <button onClick={onSignOut} style={{ width: '100%', padding: '8px', borderRadius: 14, border: 'none', background: 'transparent', color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {page === 'dashboard' && <DashPage teachers={teachers} allClasses={allClasses} totalStudents={totalStudents} classesAtBenchmark={classesAtBenchmark} overallAvg={overallAvg} />}
        {page === 'teachers'  && <TeachersPage teachers={teachers} />}
        {page === 'students'  && <StudentsPage teachers={teachers} allClasses={allClasses} />}
        {page === 'analytics' && <AnalyticsPage teachers={teachers} allClasses={allClasses} />}
      </main>

      {modal === 'addTeacher' && (
        <Modal title="Add New Teacher" onClose={() => setModal(null)}>
          <FormGroup label="Full Name"><TextInput value={teacherForm.name} onChange={v => setTeacherForm(f=>({...f,name:v}))} placeholder="Ms. Jane Smith" /></FormGroup>
          <FormGroup label="Subject"><TextInput value={teacherForm.subject} onChange={v => setTeacherForm(f=>({...f,subject:v}))} placeholder="Mathematics" /></FormGroup>
          <FormGroup label="Email"><TextInput type="email" value={teacherForm.email} onChange={v => setTeacherForm(f=>({...f,email:v}))} placeholder="j.smith@school.edu" /></FormGroup>
          <Btn variant="primary" style={{ width: '100%', justifyContent: 'center', background: '#a8c8f8', color: '#1a3a8a', border: 'none', fontWeight: 800 }} onClick={saveTeacher}>Add Teacher</Btn>
        </Modal>
      )}
      {modal === 'addStudent' && (
        <Modal title="Add Student" onClose={() => setModal(null)}>
          <FormGroup label="Teacher">
            <select value={studentForm.teacherId} onChange={e => setStudentForm(f=>({...f,teacherId:e.target.value,classId:''}))} style={{ fontSize:14,padding:'9px 14px',border:'1.5px solid #e2ddd6',borderRadius:10,width:'100%',background:'#fff',fontFamily:F }}>
              <option value="">Select teacher...</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FormGroup>
          {selTeacher && (
            <FormGroup label="Class">
              <select value={studentForm.classId} onChange={e=>setStudentForm(f=>({...f,classId:e.target.value}))} style={{ fontSize:14,padding:'9px 14px',border:'1.5px solid #e2ddd6',borderRadius:10,width:'100%',background:'#fff',fontFamily:F }}>
                <option value="">Select class...</option>
                {selTeacher.classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>
          )}
          <FormGroup label="Student Name"><TextInput value={studentForm.name} onChange={v=>setStudentForm(f=>({...f,name:v}))} placeholder="First Last" /></FormGroup>
          <FormGroup label="Initial Score (%)"><TextInput type="number" value={studentForm.score} onChange={v=>setStudentForm(f=>({...f,score:v}))} placeholder="78" /></FormGroup>
          <Btn variant="primary" style={{ width:'100%',justifyContent:'center',marginTop:8,background:'#a8c8f8',color:'#1a3a8a',border:'none',fontWeight:800 }} onClick={saveStudent}>Add Student</Btn>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function DashPage({ teachers, allClasses, totalStudents, classesAtBenchmark, overallAvg }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    const summaries = teachers.map(t => {
      const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
      const belowClasses = t.classes.filter(c => classAvg(c) < c.benchmark)
      const criticalStudents = t.classes.flatMap(c => c.students.filter(s => getAvg(s.scores) < 60).map(s => s.name + ' in ' + c.name))
      return t.name + ' (' + t.subject + '): avg ' + tavg + '%' + (belowClasses.length ? ', classes below benchmark: ' + belowClasses.map(c => c.name + ' ' + classAvg(c) + '%').join(', ') : ', all on track') + (criticalStudents.length ? ', critical: ' + criticalStudents.join(', ') : '')
    }).join(' | ')
    const prompt = `
You are generating an executive summary for district administrators.

Return EXACTLY 4 bullet points.

STRICT RULES:
- One COMPLETE sentence per bullet.
- Maximum 16 words per bullet.
- Never repeat students, teachers, classes, or percentages.
- Never combine unrelated thoughts into one sentence.
- Do not duplicate information across bullets.
- Use proper grammar and punctuation.
- Do not cut sentences off.
- Do not repeat phrases like "meet benchmark expectations."
- Do not repeat department names.
- Each bullet must communicate ONE clear idea only.

PRIORITY ORDER:
1. Most at-risk students
2. Teachers/classes needing intervention
3. Overall benchmark progress
4. Highest-performing teacher/department

OUTPUT STRUCTURE:
- Bullet 1 → Critical students
- Bullet 2 → Priority teacher/class
- Bullet 3 → Overall district benchmark summary
- Bullet 4 → Top-performing teacher/department

GOOD EXAMPLES:
- "Tyler Nguyen and Layla Hassan require immediate academic intervention."
- "Mr. Kim's English 10 class requires curriculum support and administrative review."
- "8 of 11 classes currently meet district benchmark expectations."
- "Dr. Patel's science department leads the district with full benchmark compliance."

BAD EXAMPLES:
- Repeating names twice
- Combining multiple ideas into one sentence
- Duplicate percentages
- Broken grammar
- Run-on sentences

DATA:
${summaries}

OVERALL METRICS:
- District Average: ${overallAvg}%
- Benchmark Classes: ${classesAtBenchmark}/${allClasses.length}

Return ONLY bullet points.
`;
    streamClaude(prompt, c => setAiText(p => p + c), () => setAiLoading(false))
  }, [])

  const atRisk = allClasses.flatMap(cls =>
    cls.students.filter(s => getAvg(s.scores) < cls.benchmark).map(s => ({
      name: s.name, avg: getAvg(s.scores), benchmark: cls.benchmark, class: cls.name,
      teacher: teachers.find(t => t.classes.find(c => c.id === cls.id))?.name.split(' ').slice(1).join(' '),
    }))
  ).sort((a,b) => a.avg - b.avg).slice(0, 6)

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>Admin</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { val: teachers.length,      label: 'TEACHERS',        p: pastel(0) },
          { val: totalStudents,         label: 'STUDENTS',        p: pastel(1) },
          { val: `${overallAvg}%`,      label: 'SCHOOL AVG',      p: pastel(2) },
          { val: `${classesAtBenchmark}/${allClasses.length}`, label: 'AT BENCHMARK', p: pastel(3) },
        ].map((s, i) => (
          <div key={i} style={{ background: s.p.bg, borderRadius: 24, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: s.p.dark, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.p.dark, opacity: .7, marginTop: 6, letterSpacing: '1.5px' }}>{s.label}</div>
            <div style={{ position: 'absolute', right: -16, bottom: -16, width: 80, height: 80, borderRadius: '50%', background: s.p.dark, opacity: .06 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Performance chart */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>OVERVIEW</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 18, fontFamily: F }}>Class Performance</div>
          <CurveChart classes={allClasses} />
        </div>

        {/* Teacher list */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>STAFF</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontFamily: F }}>Teachers</div>
          {teachers.map((t, i) => {
            const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
            const p = pastel(i)
            const ok = tavg >= 75
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0ece6' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: p.bg, color: p.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0, fontFamily: F }}>
                  {t.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{t.name.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px' }}>{t.subject.toUpperCase()}</div>
                </div>
                <div style={{ background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', borderRadius: 20, padding: '4px 12px', fontWeight: 800, fontSize: 13, fontFamily: F }}>
                  {tavg}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* At-risk students */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>ATTENTION NEEDED</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontFamily: F }}>Students at Risk</div>
          {atRisk.length === 0 && <p style={{ fontSize: 14, color: '#8888aa', fontFamily: F }}>All students at benchmark!</p>}
          {atRisk.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f0ece6' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5b8c4', color: '#7a1522', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                {s.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#8888aa' }}>{s.class} · {s.teacher}</div>
              </div>
              <div style={{ background: '#f5b8c4', color: '#7a1522', borderRadius: 20, padding: '3px 10px', fontWeight: 800, fontSize: 13 }}>{s.avg}%</div>
            </div>
          ))}
        </div>

        {/* Goals */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>PROGRESS</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontFamily: F }}>Teacher Goals</div>
          {teachers.flatMap((t,ti) => t.goals.map(g => ({ ...g, teacher: t.name.split(' ').slice(1).join(' '), p: pastel(ti) }))).slice(0, 5).map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            return (
              <div key={g.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600 }}>{g.teacher.toUpperCase()} · {g.due}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: g.p.dark, fontFamily: F }}>{pct}%</div>
                </div>
                <div style={{ height: 8, background: '#f0ece6', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: g.p.bg, borderRadius: 4, transition: 'width .6s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Notes */}
      <div style={{ background: '#c8b8f0', borderRadius: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a1a80', animation: aiLoading ? 'aipulse 1.4s infinite' : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: F }}>AI Notes</span>
        </div>
        <p style={{ fontSize: 15, color: aiLoading && !aiText ? '#7a6aaa' : '#2a1a5e', lineHeight: 1.7, fontStyle: aiLoading && !aiText ? 'italic' : 'normal', fontFamily: F }}>
          {aiLoading && !aiText ? 'Analyzing school performance...' : (aiText || 'No analysis yet.')}
        </p>
        <style>{`@keyframes aipulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
      </div>
    </>
  )
}

// ── Curve Chart ────────────────────────────────────────────────────────────────
function CurveChart({ classes }) {
  const W = 560, H = 140, PAD = 20
  const avgs = classes.map(c => classAvg(c))
  const max = Math.max(...avgs, 100)
  const pts = avgs.map((v, i) => {
    const x = PAD + (i / Math.max(avgs.length - 1, 1)) * (W - PAD * 2)
    const y = H - PAD - ((v / max) * (H - PAD * 2))
    return [x, y]
  })

  // Build smooth SVG path
  function smooth(points) {
    if (points.length < 2) return ''
    let d = `M ${points[0][0]} ${points[0][1]}`
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1], [x1, y1] = points[i]
      const cx = (x0 + x1) / 2
      d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
    }
    return d
  }

  const linePath = smooth(pts)
  const areaPath = linePath + ` L ${pts[pts.length-1][0]} ${H} L ${pts[0][0]} ${H} Z`

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8c8f8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a8c8f8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#2255cc" strokeWidth="2.5" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill="#2255cc" />
            <circle cx={x} cy={y} r={3} fill="#fff" />
            <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1a2e" fontFamily={F}>{avgs[i]}%</text>
            <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="#8888aa" fontFamily={F}>{classes[i]?.name?.slice(0,6)}</text>
          </g>
        ))}
        {/* Benchmark line at 75% */}
        <line x1={PAD} y1={H - PAD - (0.75 * (H - PAD*2))} x2={W - PAD} y2={H - PAD - (0.75 * (H - PAD*2))} stroke="#f5b8c4" strokeWidth="1.5" strokeDasharray="4,4" />
      </svg>
    </div>
  )
}

// ── Teachers Page ──────────────────────────────────────────────────────────────
function TeachersPage({ teachers }) {
  return (
    <>
      <PageHeader label="STAFF" title="Teachers" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {teachers.map((t, i) => {
          const p = pastel(i)
          const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
          const atBench = t.classes.filter(c => classAvg(c) >= c.benchmark).length
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
              <div style={{ background: p.bg, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, background: p.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, fontFamily: F }}>{t.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: p.dark, fontFamily: F }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: p.dark, opacity: .7, fontWeight: 700, letterSpacing: '1px' }}>{t.subject.toUpperCase()}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 26, color: p.dark, fontFamily: F }}>{tavg}%</div>
              </div>
              <div style={{ padding: '16px 22px' }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                  {[['Classes', t.classes.length], ['Students', t.classes.reduce((a,c)=>a+c.students.length,0)], ['At Goal', `${atBench}/${t.classes.length}`], ['Goals', t.goals.length]].map(([l,v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', fontFamily: F }}>{v}</div>
                      <div style={{ fontSize: 10, color: '#8888aa', fontWeight: 700, letterSpacing: '1px' }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.classes.map((cls, ci) => {
                    const avg = classAvg(cls); const ok = avg >= cls.benchmark; const cp = pastel(ci)
                    return (
                      <span key={cls.id} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: ok ? cp.bg : '#f5b8c4', color: ok ? cp.dark : '#7a1522', fontWeight: 700 }}>
                        {cls.name}: {avg}%
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Students Page ─────────────────────────────────────────────────────────────
function StudentsPage({ teachers, allClasses }) {
  const all = allClasses.flatMap(cls =>
    cls.students.map(s => ({
      ...s, avg: getAvg(s.scores), benchmark: cls.benchmark, className: cls.name,
      teacher: teachers.find(t=>t.classes.find(c=>c.id===cls.id))?.name.split(' ').slice(1).join(' '),
    }))
  ).sort((a,b) => a.avg - b.avg)
  const atRisk = all.filter(s => s.avg < s.benchmark)
  const passing = all.filter(s => s.avg >= s.benchmark)

  return (
    <>
      <PageHeader label="ROSTER" title="Students" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#a8e6cf', borderRadius: 24, padding: '20px 22px' }}>
          <div style={{ fontWeight: 800, fontSize: 36, color: '#0d5c30', fontFamily: F }}>{passing.length}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0d5c30', opacity: .7, letterSpacing: '1.5px' }}>PASSING</div>
        </div>
        <div style={{ background: '#f5b8c4', borderRadius: 24, padding: '20px 22px' }}>
          <div style={{ fontWeight: 800, fontSize: 36, color: '#7a1522', fontFamily: F }}>{atRisk.length}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a1522', opacity: .7, letterSpacing: '1.5px' }}>BELOW BENCHMARK</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', marginBottom: 16, boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 14 }}>NEEDS ATTENTION</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 10 }}>
          {atRisk.map((s, i) => (
            <div key={i} style={{ background: '#fff5f6', border: '1.5px solid #f5b8c4', borderRadius: 18, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5b8c4', color: '#7a1522', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, fontFamily: F }}>
                  {s.name.split(' ').map(w=>w[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e', fontFamily: F }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>{s.className}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#7a1522', fontFamily: F }}>{s.avg}%</div>
              </div>
              <div style={{ height: 5, background: '#f5d8dc', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${s.avg}%`, background: '#f5b8c4', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Analytics Page ─────────────────────────────────────────────────────────────
function AnalyticsPage({ teachers, allClasses }) {
  return (
    <>
      <PageHeader label="DATA" title="Analytics" />
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', marginBottom: 16, boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 14 }}>ALL CLASSES</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: F }}>
          <thead>
            <tr>
              {['CLASS','TEACHER','STUDENTS','AVG','BENCHMARK','STATUS'].map(h => (
                <th key={h} style={{ textAlign: h==='CLASS'||h==='TEACHER'?'left':'center', padding: '8px 10px', color: '#8888aa', fontWeight: 700, fontSize: 11, letterSpacing: '1px', borderBottom: '2px solid #f0ece6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allClasses.map((cls, i) => {
              const teacher = teachers.find(t => t.classes.find(c => c.id === cls.id))
              const avg = classAvg(cls); const ok = avg >= cls.benchmark; const p = pastel(i)
              return (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{cls.name}</td>
                  <td style={{ padding: '10px', color: '#3d3d5c' }}>{teacher?.name.split(' ').slice(1).join(' ')}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#3d3d5c' }}>{cls.students.length}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: ok ? '#0d5c30' : '#7a1522', fontFamily: F }}>{avg}%</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#3d3d5c' }}>{cls.benchmark}%</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', fontWeight: 700 }}>
                      {ok ? 'On Track' : 'Below'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 14 }}>BY TEACHER</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 8, minHeight: 160 }}>
          {teachers.map((t, i) => {
            const p = pastel(i)
            const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
            const h = Math.round((tavg / 100) * 120)
            return (
              <div key={t.id} style={{ textAlign: 'center', minWidth: 80, flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: p.dark, marginBottom: 4, fontFamily: F }}>{tavg}%</div>
                <div style={{ width: 56, height: h, margin: '0 auto', background: p.bg, borderRadius: '10px 10px 0 0', border: `2px solid ${p.dark}22` }} />
                <div style={{ fontSize: 11, color: '#8888aa', marginTop: 6, fontWeight: 600 }}>{t.name.split(' ').slice(1).join(' ')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function PageHeader({ label, title }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>{title}</h1>
    </div>
  )
}
