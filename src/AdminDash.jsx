import React, { useState, useEffect, useRef } from 'react'
import { classAvg, classPassing, getAvg, avatarColors } from '../utils.js'
import { Modal, FormGroup, TextInput, Btn, Notification, Badge } from './UI.jsx'

const HEL = 'Helvetica Neue, Helvetica, Arial, sans-serif'

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  blue:    '#1a56db',
  blueL:   '#3b82f6',
  blueSoft:'#eff6ff',
  blueMid: '#dbeafe',
  teal:    '#0891b2',
  tealL:   '#22d3ee',
  green:   '#059669',
  greenL:  '#34d399',
  amber:   '#d97706',
  amberL:  '#fbbf24',
  red:     '#dc2626',
  redL:    '#f87171',
  ink:     '#1e3a5f',
  ink2:    '#3b5998',
  ink3:    '#6b8cc7',
  bg:      '#f8faff',
  card:    '#ffffff',
  border:  '#e2ecff',
}

async function streamClaude(prompt, onChunk, onDone) {
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, stream: true, messages: [{ role: 'user', content: prompt }] }),
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
  } catch (_) { onChunk('AI unavailable — check your API connection.') }
  onDone?.()
}

// ── Main AdminDash ─────────────────────────────────────────────────────────────
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

  const selectedTeacher = teachers.find(t => t.id === parseInt(studentForm.teacherId))
  function saveStudent() {
    const cls = selectedTeacher?.classes.find(c => c.id === parseInt(studentForm.classId))
    if (!studentForm.name || !cls) { setNotif('Fill all fields'); return }
    cls.students.push({ id: Date.now(), name: studentForm.name, scores: [parseInt(studentForm.score) || 70], topics: ['Topic 1'] })
    setStudentForm({ teacherId: '', classId: '', name: '', score: '' }); setModal(null)
    setNotif(`${studentForm.name} added!`); forceUpdate(n => n + 1)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: DashIcon },
    { id: 'teachers',  label: 'Teachers',   icon: TeacherIcon },
    { id: 'students',  label: 'Students',   icon: StudentsIcon },
    { id: 'analytics', label: 'Analytics',  icon: ChartIcon },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: HEL }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#fff',
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        boxShadow: '2px 0 12px rgba(26,86,219,0.06)',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.blue, letterSpacing: '-0.5px' }}>EduPulse</div>
          <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>Admin Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map(item => {
            const active = page === item.id
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? C.blueSoft : 'transparent',
                color: active ? C.blue : C.ink2,
                fontWeight: active ? 600 : 400, fontSize: 14, fontFamily: HEL,
                marginBottom: 2, transition: 'all .15s',
              }}>
                <item.icon color={active ? C.blue : C.ink3} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Add buttons */}
        <div style={{ padding: '12px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => setModal('addTeacher')} style={{
            width: '100%', padding: '9px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueL})`,
            color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 6, fontFamily: HEL,
          }}>+ Add Teacher</button>
          <button onClick={() => setModal('addStudent')} style={{
            width: '100%', padding: '9px', borderRadius: 10,
            border: `1.5px solid ${C.border}`, background: '#fff',
            color: C.ink2, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: HEL,
          }}>+ Add Student</button>
          <button onClick={onSignOut} style={{
            width: '100%', padding: '9px', borderRadius: 10, border: 'none',
            background: 'transparent', color: C.ink3, fontSize: 13, cursor: 'pointer', marginTop: 4, fontFamily: HEL,
          }}>Sign Out</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minWidth: 0 }}>

        {page === 'dashboard' && (
          <DashboardPage teachers={teachers} allClasses={allClasses} totalStudents={totalStudents}
            classesAtBenchmark={classesAtBenchmark} overallAvg={overallAvg} />
        )}
        {page === 'teachers'  && <TeachersPage teachers={teachers} />}
        {page === 'students'  && <StudentsPage teachers={teachers} allClasses={allClasses} />}
        {page === 'analytics' && <AnalyticsPage teachers={teachers} allClasses={allClasses} />}
      </main>

      {/* Modals */}
      {modal === 'addTeacher' && (
        <Modal title="Add New Teacher" onClose={() => setModal(null)}>
          <FormGroup label="Full Name"><TextInput value={teacherForm.name} onChange={v => setTeacherForm(f=>({...f,name:v}))} placeholder="Ms. Jane Smith" /></FormGroup>
          <FormGroup label="Subject"><TextInput value={teacherForm.subject} onChange={v => setTeacherForm(f=>({...f,subject:v}))} placeholder="Mathematics" /></FormGroup>
          <FormGroup label="Email"><TextInput type="email" value={teacherForm.email} onChange={v => setTeacherForm(f=>({...f,email:v}))} placeholder="j.smith@school.edu" /></FormGroup>
          <Btn variant="primary" style={{ width: '100%', justifyContent: 'center', background: `linear-gradient(135deg,${C.blue},${C.blueL})`, border: 'none' }} onClick={saveTeacher}>Add Teacher</Btn>
        </Modal>
      )}
      {modal === 'addStudent' && (
        <Modal title="Add Student" onClose={() => setModal(null)}>
          <FormGroup label="Teacher">
            <select value={studentForm.teacherId} onChange={e => setStudentForm(f => ({...f, teacherId: e.target.value, classId: ''}))}
              style={{ fontSize: 14, padding: '9px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, width: '100%', background: '#fff', fontFamily: HEL, color: C.ink }}>
              <option value="">Select teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FormGroup>
          {selectedTeacher && (
            <FormGroup label="Class">
              <select value={studentForm.classId} onChange={e => setStudentForm(f => ({...f, classId: e.target.value}))}
                style={{ fontSize: 14, padding: '9px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, width: '100%', background: '#fff', fontFamily: HEL, color: C.ink }}>
                <option value="">Select class...</option>
                {selectedTeacher.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>
          )}
          <FormGroup label="Student Name"><TextInput value={studentForm.name} onChange={v => setStudentForm(f=>({...f,name:v}))} placeholder="First Last" /></FormGroup>
          <FormGroup label="Initial Score (%)"><TextInput type="number" value={studentForm.score} onChange={v => setStudentForm(f=>({...f,score:v}))} placeholder="78" /></FormGroup>
          <Btn variant="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, background: `linear-gradient(135deg,${C.blue},${C.blueL})`, border: 'none' }} onClick={saveStudent}>Add Student</Btn>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function DashboardPage({ teachers, allClasses, totalStudents, classesAtBenchmark, overallAvg }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    const teacherSummaries = teachers.map(t => {
      const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
      const below = t.classes.filter(c => classAvg(c) < c.benchmark).map(c => c.name)
      return `${t.name} (${t.subject}): avg ${tavg}%${below.length ? `, struggling classes: ${below.join(', ')}` : ''}`
    }).join('; ')
    const prompt = `You are a school principal's AI assistant. Write a 3-sentence executive summary. Name specific teachers and students who need attention. Be direct and actionable.

Data: ${teacherSummaries}
School avg: ${overallAvg}%, ${classesAtBenchmark}/${allClasses.length} classes at benchmark, ${totalStudents} students total.

Format: Overall school status. Who specifically needs attention and why. One concrete recommendation.`
    streamClaude(prompt, c => setAiText(p => p + c), () => setAiLoading(false))
  }, [])

  // Students needing attention (below benchmark)
  const atRisk = allClasses.flatMap(cls =>
    cls.students.filter(s => getAvg(s.scores) < cls.benchmark).map(s => ({
      name: s.name, avg: getAvg(s.scores), benchmark: cls.benchmark, class: cls.name,
      teacher: teachers.find(t => t.classes.find(c => c.id === cls.id))?.name.split(' ').slice(1).join(' '),
    }))
  ).sort((a, b) => a.avg - b.avg).slice(0, 5)

  return (
    <>
      <PageHeader title="Dashboard" subtitle="School-wide overview" />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <GradientStatCard value={teachers.length} label="Teachers" from="#1a56db" to="#3b82f6" icon={TeacherIcon} />
        <GradientStatCard value={totalStudents} label="Total Students" from="#0891b2" to="#22d3ee" icon={StudentsIcon} />
        <GradientStatCard value={`${overallAvg}%`} label="School Average" from="#059669" to="#34d399" icon={ChartIcon} />
        <GradientStatCard value={`${classesAtBenchmark}/${allClasses.length}`} label="Classes at Goal" from="#7c3aed" to="#a78bfa" icon={DashIcon} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <SectionCard title="Class Performance Overview">
          <BarChart classes={allClasses} teachers={teachers} />
        </SectionCard>

        {/* Teacher summary */}
        <SectionCard title="Teacher Performance">
          {teachers.map(t => {
            const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
            const ok = tavg >= 75
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <MiniAvatar name={t.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.ink3 }}>{t.subject} · {t.classes.length} classes</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: ok ? C.green : C.red }}>{tavg}%</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: ok ? '#d1fae5' : '#fee2e2', color: ok ? C.green : C.red, fontWeight: 600 }}>
                  {ok ? 'On Track' : 'Support'}
                </span>
              </div>
            )
          })}
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* At-risk students */}
        <SectionCard title="Students Needing Attention">
          {atRisk.length === 0 && <p style={{ fontSize: 14, color: C.ink3 }}>All students at benchmark.</p>}
          {atRisk.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <MiniAvatar name={s.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.ink3 }}>{s.class} · {s.teacher}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.red }}>{s.avg}%</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: C.red, fontWeight: 600 }}>
                -{s.benchmark - s.avg}pts
              </span>
            </div>
          ))}
        </SectionCard>

        {/* Goals progress */}
        <SectionCard title="Teacher Goals Progress">
          {teachers.flatMap(t => t.goals.map(g => ({ ...g, teacher: t.name.split(' ').slice(1).join(' ') }))).slice(0, 5).map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            return (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>{g.teacher} · Due {g.due}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{pct}%</div>
                </div>
                <div style={{ height: 6, background: C.blueMid, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.blueL})`, borderRadius: 3, transition: 'width .6s' }} />
                </div>
              </div>
            )
          })}
        </SectionCard>
      </div>

      {/* AI Summary */}
      <AINotesBox text={aiText} loading={aiLoading} />
    </>
  )
}

// ── Teachers Page ──────────────────────────────────────────────────────────────
function TeachersPage({ teachers }) {
  return (
    <>
      <PageHeader title="Teachers" subtitle={`${teachers.length} staff members`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {teachers.map(t => {
          const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
          const atBench = t.classes.filter(c => classAvg(c) >= c.benchmark).length
          const ok = tavg >= 75
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,86,219,0.05)' }}>
              <div style={{ padding: '16px 20px 12px', background: `linear-gradient(135deg, ${ok ? '#eff6ff' : '#fef2f2'}, #fff)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MiniAvatar name={t.name} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: C.ink3 }}>{t.subject} · {t.email}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 22, color: ok ? C.green : C.red }}>{tavg}%</div>
                </div>
              </div>
              <div style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.blue }}>{t.classes.length}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>Classes</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.blue }}>{t.classes.reduce((a,c)=>a+c.students.length,0)}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>Students</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.blue }}>{atBench}/{t.classes.length}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>At Goal</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.blue }}>{t.goals.length}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>Goals</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.classes.map(cls => {
                    const avg = classAvg(cls); const ok2 = avg >= cls.benchmark
                    return (
                      <span key={cls.id} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: ok2 ? '#d1fae5' : '#fee2e2', color: ok2 ? C.green : C.red, fontWeight: 500 }}>
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
  const allStudents = allClasses.flatMap(cls =>
    cls.students.map(s => ({
      ...s, avg: getAvg(s.scores), benchmark: cls.benchmark, className: cls.name,
      teacher: teachers.find(t => t.classes.find(c => c.id === cls.id))?.name.split(' ').slice(1).join(' '),
    }))
  ).sort((a, b) => a.avg - b.avg)

  const atRisk = allStudents.filter(s => s.avg < s.benchmark)
  const passing = allStudents.filter(s => s.avg >= s.benchmark)

  return (
    <>
      <PageHeader title="Students" subtitle={`${allStudents.length} students across all classes`} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <GradientStatCard value={passing.length} label="Passing" from="#059669" to="#34d399" icon={ChartIcon} />
        <GradientStatCard value={atRisk.length} label="Below Benchmark" from="#dc2626" to="#f87171" icon={StudentsIcon} />
      </div>
      <SectionCard title="Students Needing Attention" style={{ marginBottom: 16 }}>
        {atRisk.length === 0 && <p style={{ fontSize: 14, color: C.ink3 }}>All students are at benchmark.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {atRisk.map((s, i) => (
            <div key={i} style={{ background: '#fff9f9', border: `1px solid #fecaca`, borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MiniAvatar name={s.name} size={32} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.ink3 }}>{s.className} · {s.teacher}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18, color: C.red }}>{s.avg}%</div>
              </div>
              <div style={{ height: 5, background: '#fee2e2', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${s.avg}%`, background: `linear-gradient(90deg,${C.red},${C.redL})`, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: C.ink3, marginTop: 4 }}>Goal: {s.benchmark}% · {s.benchmark - s.avg}pts below</div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="All Passing Students">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {passing.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <MiniAvatar name={s.name} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.ink3 }}>{s.className}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>{s.avg}%</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  )
}

// ── Analytics Page ─────────────────────────────────────────────────────────────
function AnalyticsPage({ teachers, allClasses }) {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Performance breakdown across all classes" />
      <SectionCard title="All Classes" style={{ marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: HEL }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['Class','Teacher','Students','Average','Benchmark','Gap','Status'].map(h => (
                <th key={h} style={{ textAlign: h==='Class'||h==='Teacher'?'left':'center', padding: '8px 10px', color: C.ink3, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allClasses.map(cls => {
              const teacher = teachers.find(t => t.classes.find(c => c.id === cls.id))
              const avg = classAvg(cls); const ok = avg >= cls.benchmark; const gap = avg - cls.benchmark
              return (
                <tr key={cls.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px', fontWeight: 500, color: C.ink }}>{cls.name}</td>
                  <td style={{ padding: '10px', color: C.ink2 }}>{teacher?.name.split(' ').slice(1).join(' ')}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: C.ink2 }}>{cls.students.length}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: ok ? C.green : C.red }}>{avg}%</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: C.ink2 }}>{cls.benchmark}%</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: ok ? C.green : C.red }}>{gap > 0 ? '+' : ''}{gap}pts</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: ok ? '#d1fae5' : '#fee2e2', color: ok ? C.green : C.red, fontWeight: 600 }}>
                      {ok ? 'On Track' : 'Below'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* Per-teacher bar chart */}
      <SectionCard title="Average Score by Teacher">
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', padding: '12px 0', overflowX: 'auto' }}>
          {teachers.map(t => {
            const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
            const h = Math.round((tavg / 100) * 140)
            const ok = tavg >= 75
            return (
              <div key={t.id} style={{ textAlign: 'center', minWidth: 80, flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: ok ? C.green : C.red, marginBottom: 4 }}>{tavg}%</div>
                <div style={{
                  width: 48, height: h, margin: '0 auto',
                  background: ok ? `linear-gradient(180deg,${C.green},${C.greenL})` : `linear-gradient(180deg,${C.red},${C.redL})`,
                  borderRadius: '6px 6px 0 0',
                }} />
                <div style={{ fontSize: 11, color: C.ink3, marginTop: 6, wordBreak: 'break-word', maxWidth: 80 }}>
                  {t.name.split(' ').slice(1).join(' ')}
                </div>
                <div style={{ fontSize: 10, color: C.ink3 }}>{t.subject}</div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ classes, teachers }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '8px 0', overflowX: 'auto', minHeight: 160 }}>
      {classes.map(cls => {
        const avg = classAvg(cls); const ok = avg >= cls.benchmark
        const barH = Math.round((avg / 100) * 120)
        const goalH = Math.round((cls.benchmark / 100) * 120)
        return (
          <div key={cls.id} style={{ textAlign: 'center', minWidth: 52, flexShrink: 0 }}>
            <div style={{ position: 'relative', height: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
              <div style={{
                width: 28, height: barH,
                background: ok ? `linear-gradient(180deg,${C.blue},${C.blueL})` : `linear-gradient(180deg,${C.red},${C.redL})`,
                borderRadius: '4px 4px 0 0', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: -16, width: '200%', left: '-50%', textAlign: 'center', fontSize: 10, fontWeight: 600, color: C.ink2 }}>{avg}%</div>
              </div>
              <div style={{ width: 3, height: goalH, background: C.ink3, borderRadius: 2, opacity: .4 }} title={`Goal: ${cls.benchmark}%`} />
            </div>
            <div style={{ fontSize: 10, color: C.ink3, marginTop: 4, maxWidth: 52, wordBreak: 'break-word' }}>{cls.name}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontFamily: HEL, fontWeight: 800, fontSize: 26, color: C.ink, letterSpacing: '-0.5px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, color: C.ink3, marginTop: 4, fontFamily: HEL }}>{subtitle}</p>}
    </div>
  )
}

function GradientStatCard({ value, label, from, to, icon: Icon }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      borderRadius: 16, padding: '20px 22px',
      boxShadow: `0 4px 20px ${from}33`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon && <Icon color="#fff" size={20} />}
      </div>
      <div>
        <div style={{ fontFamily: HEL, fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontFamily: HEL }}>{label}</div>
      </div>
    </div>
  )
}

function SectionCard({ title, children, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '18px 20px', boxShadow: '0 2px 12px rgba(26,86,219,0.04)', ...style }}>
      {title && <div style={{ fontFamily: HEL, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14 }}>{title}</div>}
      {children}
    </div>
  )
}

function MiniAvatar({ name, size = 36 }) {
  const palette = [
    ['#dbeafe','#1d4ed8'],['#d1fae5','#065f46'],['#fce7f3','#9d174d'],
    ['#fef3c7','#92400e'],['#ede9fe','#5b21b6'],['#cffafe','#0e7490'],
  ]
  let hash = 0; for (const c of (name||'')) hash += c.charCodeAt(0)
  const [bg, fg] = palette[hash % palette.length]
  const inits = (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size*0.35, flexShrink: 0, fontFamily: HEL }}>
      {inits}
    </div>
  )
}

function AINotesBox({ text, loading }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.blueSoft}, #f0f4ff)`,
      border: `1px solid ${C.blueMid}`, borderRadius: 16, padding: '18px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue, animation: loading ? 'aipulse 1.4s infinite' : 'none' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: HEL }}>AI Notes</span>
      </div>
      <p style={{ fontSize: 14, color: loading && !text ? C.ink3 : C.ink, lineHeight: 1.75, fontStyle: loading && !text ? 'italic' : 'normal', fontFamily: HEL }}>
        {loading && !text ? 'Analyzing school performance...' : (text || 'No analysis yet.')}
      </p>
      <style>{`@keyframes aipulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function DashIcon({ color = '#6b8cc7', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={color}/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={color} opacity=".6"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={color} opacity=".6"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={color} opacity=".3"/>
    </svg>
  )
}
function TeacherIcon({ color = '#6b8cc7', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" fill={color}/>
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function StudentsIcon({ color = '#6b8cc7', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="2.5" fill={color}/>
      <circle cx="10.5" cy="5" r="2.5" fill={color} opacity=".6"/>
      <path d="M1 14c0-2.761 2.015-5 4.5-5s4.5 2.239 4.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 9c2.485 0 4.5 2.239 4.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
    </svg>
  )
}
function ChartIcon({ color = '#6b8cc7', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="3" height="7" rx="1" fill={color} opacity=".4"/>
      <rect x="6" y="5" width="3" height="10" rx="1" fill={color} opacity=".7"/>
      <rect x="11" y="2" width="3" height="13" rx="1" fill={color}/>
    </svg>
  )
}
