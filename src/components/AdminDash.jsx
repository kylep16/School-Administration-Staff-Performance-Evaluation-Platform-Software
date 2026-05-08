import React, { useState, useEffect } from 'react'
import { classAvg, getAvg } from '../utils.js'
import { Modal, FormGroup, TextInput, Btn, Notification } from './UI.jsx'
import { useAI, AIToggleBtn } from '../AIContext.jsx'
import StudentDetail from './StudentDetail.jsx'
import { addStudent as dbAddStudent, saveReview as dbSaveReview, saveObservation as dbSaveObservation } from '../supabase.js'

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

function PersonIcon({ size = 36, bg, color }) {
  const r = size / 2, headR = size * 0.22, headCY = size * 0.33, bodyR = size * 0.32, bodyCY = size * 0.84
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={headCY} r={headR} fill={color} opacity="0.9" />
        <circle cx={r} cy={bodyCY} r={bodyR} fill={color} opacity="0.9" />
      </svg>
    </div>
  )
}
function PersonIconSquare({ size = 36, borderRadius = 12, bg, color }) {
  const r = size / 2, headR = size * 0.22, headCY = size * 0.33, bodyR = size * 0.32, bodyCY = size * 0.84
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
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 400, stream: true, messages: [{ role: 'user', content: prompt }] }),
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
  } catch (err) { onChunk('Error: ' + (err.message || 'API call failed')); }
  onDone?.()
}

// ── Seed data for reviews & observations ─────────────────────────────────────
const INITIAL_REVIEWS = [
  { id: 1, teacherId: 1, reviewer: 'Dr. Ashley Kauffman', date: '2025-03-15', cycle: 'Spring 2025', status: 'completed', overall: 4, categories: { instruction: 4, classroom: 5, professionalism: 4, growth: 3, collaboration: 4 }, strengths: 'Exceptional classroom management and student engagement. Strong use of formative assessments.', improvements: 'Could incorporate more differentiated instruction strategies for advanced learners.', goals: 'Implement 2 new inquiry-based learning activities per quarter.', aiSummary: '' },
  { id: 2, teacherId: 2, reviewer: 'Dr. Ashley Kauffman', date: '2025-03-20', cycle: 'Spring 2025', status: 'completed', overall: 3, categories: { instruction: 3, classroom: 3, professionalism: 4, growth: 3, collaboration: 3 }, strengths: 'Strong professional demeanor and effective communication with parents.', improvements: 'Essay scoring consistency needs improvement. Consider using shared rubrics.', goals: 'Complete calibration training for AP Language scoring by end of semester.', aiSummary: '' },
  { id: 3, teacherId: 3, reviewer: 'Dr. Ashley Kauffman', date: '2025-04-01', cycle: 'Spring 2025', status: 'in_progress', overall: 0, categories: { instruction: 0, classroom: 0, professionalism: 0, growth: 0, collaboration: 0 }, strengths: '', improvements: '', goals: '', aiSummary: '' },
]

const INITIAL_OBSERVATIONS = [
  { id: 1, teacherId: 1, classId: 101, observer: 'Dr. Ashley Kauffman', date: '2025-03-10', duration: 45, type: 'formal', status: 'completed', environment: 4, engagement: 5, instruction: 4, management: 5, notes: 'Students were highly engaged during the systems of equations lesson. Teacher used think-pair-share effectively. Excellent use of whiteboards for collaborative problem solving. Three students in the back row needed redirection twice.', commendations: 'Outstanding use of manipulatives and visual aids. Strong questioning technique that pushed student thinking.', recommendations: 'Consider pre-assigning pairs to ensure mixed-ability groupings.', aiSummary: '' },
  { id: 2, teacherId: 1, classId: 102, observer: 'Dr. Ashley Kauffman', date: '2025-03-24', duration: 30, type: 'walkthrough', status: 'completed', environment: 4, engagement: 3, instruction: 4, management: 4, notes: 'Geometry proof lesson. Most students were on task. Good use of the projector for visual demonstrations. A few students appeared disengaged during independent work time.', commendations: 'Clear learning objectives posted and referenced throughout the lesson.', recommendations: 'Add a brief mid-lesson check-in to re-engage students during independent practice.', aiSummary: '' },
  { id: 3, teacherId: 2, classId: 201, observer: 'Dr. Ashley Kauffman', date: '2025-04-02', duration: 45, type: 'formal', status: 'completed', environment: 3, engagement: 3, instruction: 3, management: 3, notes: 'Essay workshop lesson. Teacher provided writing feedback but pacing was slow. Some students finished early with no extension activity available.', commendations: 'Positive classroom environment. Students felt comfortable sharing drafts.', recommendations: 'Prepare extension activities for early finishers. Consider a writing workshop rotation model.', aiSummary: '' },
  { id: 4, teacherId: 3, classId: 301, observer: 'Dr. Ashley Kauffman', date: '2025-04-10', duration: 45, type: 'formal', status: 'scheduled', environment: 0, engagement: 0, instruction: 0, management: 0, notes: '', commendations: '', recommendations: '', aiSummary: '' },
]

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDash({ teachers, onSignOut }) {
  const [page, setPage] = useState('dashboard')
  // Admin drill-down: teacher → class → student
  const [adminView, setAdminView] = useState(null)  // { type: 'teacher'|'class'|'student', teacherId, classId, studentId }
  const [modal, setModal] = useState(null)
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', email: '' })
  const [studentForm, setStudentForm] = useState({ teacherId: '', classId: '', name: '', grade: '9', score: '' })
  const [notif, setNotif] = useState(null)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [observations, setObservations] = useState(INITIAL_OBSERVATIONS)
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
  async function saveStudent() {
    const cls = selTeacher?.classes.find(c => c.id === parseInt(studentForm.classId))
    if (!studentForm.name || !cls) { setNotif('Fill all fields'); return }
    // Add to local state immediately
    const localId = Date.now()
    cls.students.push({ id: localId, name: studentForm.name, grade: parseInt(studentForm.grade) || 9, scores: [parseInt(studentForm.score) || 70], topics: ['Topic 1'] })
    setStudentForm({ teacherId: '', classId: '', name: '', grade: '9', score: '' }); setModal(null)
    forceUpdate(n => n + 1)
    // Persist to Supabase
    try {
      await dbAddStudent({ name: studentForm.name, grade: parseInt(studentForm.grade) || 9, classId: parseInt(studentForm.classId) })
      setNotif(`${studentForm.name} added and saved to database!`)
    } catch (err) {
      console.error('Supabase error:', err)
      setNotif(`${studentForm.name} added locally (database sync failed)`)
    }
  }

  const navItems = [
    { id: 'dashboard',    label: 'DASHBOARD',     icon: '▦' },
    { id: 'teachers',     label: 'TEACHERS',      icon: '◈' },
    { id: 'students',     label: 'STUDENTS',      icon: '◉' },
    { id: 'reviews',      label: 'PERFORMANCE',   icon: '◎' },
    { id: 'observations', label: 'OBSERVATIONS',  icon: '◐' },
    { id: 'analytics',    label: 'ANALYTICS',     icon: '◆' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>
      <aside style={{ width: 220, flexShrink: 0, background: '#fff', borderRight: '1px solid #ede8e0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '28px 20px 20px' }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: '-0.5px', fontFamily: F }}>EduIQ</div>
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
                marginBottom: 4, transition: 'all .15s', letterSpacing: active ? '0.5px' : '0', gap: 8,
              }}>
                {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.dark, flexShrink: 0 }} />}
                {item.label}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '12px 12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AIToggleBtn />
          <button onClick={() => setModal('addTeacher')} style={{ width: '100%', padding: '10px', borderRadius: 14, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>+ Add Teacher</button>
          <button onClick={() => setModal('addStudent')} style={{ width: '100%', padding: '10px', borderRadius: 14, border: '1.5px solid #e2ddd6', background: '#fff', color: '#3d3d5c', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}>+ Add Student</button>
          <button onClick={onSignOut} style={{ width: '100%', padding: '8px', borderRadius: 14, border: 'none', background: 'transparent', color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Sign Out</button>
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {/* Admin drill-down: student detail */}
        {adminView?.type === 'student' && (() => {
          const cls = teachers.flatMap(t => t.classes).find(c => c.id === adminView.classId)
          const student = cls?.students.find(s => s.id === adminView.studentId)
          const teacher = teachers.find(t => t.classes.find(c => c.id === adminView.classId))
          if (!student || !cls) return null
          return (
            <StudentDetail
              student={student} cls={cls}
              teacherName={teacher?.name || 'Admin'}
              onBack={() => {
                if (adminView.origin === 'students') { setAdminView(null); setPage('students') }
                else setAdminView({ type: 'class', teacherId: adminView.teacherId, classId: adminView.classId })
              }}
              onSignOut={onSignOut}
              role="admin"
              allTeachers={teachers}
            />
          )
        })()}

        {/* Admin drill-down: class detail */}
        {adminView?.type === 'class' && (() => {
          const teacher = teachers.find(t => t.id === adminView.teacherId)
          const cls = teacher?.classes.find(c => c.id === adminView.classId)
          if (!cls) return null
          return (
            <AdminClassView
              cls={cls} teacher={teacher}
              onBack={() => setAdminView({ type: 'teacher', teacherId: adminView.teacherId })}
              onOpenStudent={studentId => setAdminView({ type: 'student', teacherId: adminView.teacherId, classId: adminView.classId, studentId })}
              onSignOut={onSignOut}
            />
          )
        })()}

        {/* Admin drill-down: teacher's classes */}
        {adminView?.type === 'teacher' && (() => {
          const teacher = teachers.find(t => t.id === adminView.teacherId)
          if (!teacher) return null
          return (
            <AdminTeacherView
              teacher={teacher}
              onBack={() => { setAdminView(null); setPage('teachers') }}
              onOpenClass={classId => setAdminView({ type: 'class', teacherId: adminView.teacherId, classId })}
              onSignOut={onSignOut}
            />
          )
        })()}

        {/* Normal pages — only when not in drill-down */}
        {!adminView && page === 'dashboard'    && <DashPage teachers={teachers} allClasses={allClasses} totalStudents={totalStudents} classesAtBenchmark={classesAtBenchmark} overallAvg={overallAvg} onNavigate={setPage} reviews={reviews} observations={observations} />}
        {!adminView && page === 'teachers'     && <TeachersPage teachers={teachers} onOpenTeacher={id => setAdminView({ type: 'teacher', teacherId: id })} />}
        {!adminView && page === 'students'     && <StudentsPage teachers={teachers} allClasses={allClasses} onOpenStudent={(studentId, classId) => { const teacher = teachers.find(t => t.classes.find(c => c.id === classId)); setAdminView({ type: 'student', teacherId: teacher?.id, classId, studentId, origin: 'students' }) }} />}
        {!adminView && page === 'reviews'      && <PerformanceReviewsPage teachers={teachers} reviews={reviews} setReviews={setReviews} setNotif={setNotif} />}
        {!adminView && page === 'observations' && <ObservationsPage teachers={teachers} allClasses={allClasses} observations={observations} setObservations={setObservations} setNotif={setNotif} />}
        {!adminView && page === 'analytics'    && <AnalyticsPage teachers={teachers} allClasses={allClasses} />}
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
          <FormGroup label="Grade Level">
            <select value={studentForm.grade} onChange={e=>setStudentForm(f=>({...f,grade:e.target.value}))} style={{ fontSize:14,padding:'9px 14px',border:'1.5px solid #e2ddd6',borderRadius:10,width:'100%',background:'#fff',fontFamily:F }}>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </FormGroup>
          <FormGroup label="Initial Score (%)"><TextInput type="number" value={studentForm.score} onChange={v=>setStudentForm(f=>({...f,score:v}))} placeholder="78" /></FormGroup>
          <Btn variant="primary" style={{ width:'100%',justifyContent:'center',marginTop:8,background:'#a8c8f8',color:'#1a3a8a',border:'none',fontWeight:800 }} onClick={saveStudent}>Add Student</Btn>
        </Modal>
      )}
      {notif && <Notification message={notif} onDone={() => setNotif(null)} />}
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function DashPage({ teachers, allClasses, totalStudents, classesAtBenchmark, overallAvg, onNavigate, reviews, observations }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const { aiEnabled } = useAI()

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    if (!aiEnabled) { setAiText('AI is disabled. Toggle it on to generate analysis.'); setAiLoading(false); return }
    const summaries = teachers.map(t => {
      const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
      const belowClasses = t.classes.filter(c => classAvg(c) < c.benchmark)
      const criticalStudents = t.classes.flatMap(c => c.students.filter(s => getAvg(s.scores) < 60).map(s => s.name + ' in ' + c.name))
      return t.name + ' (' + t.subject + '): avg ' + tavg + '%' + (belowClasses.length ? ', classes below benchmark: ' + belowClasses.map(c => c.name + ' ' + classAvg(c) + '%').join(', ') : ', all on track') + (criticalStudents.length ? ', critical: ' + criticalStudents.join(', ') : '')
    }).join(' | ')
    const prompt = 'You are a school principal AI giving an executive summary. Use bullet points. Name specific teachers, classes, and students.\n\nData: ' + summaries + '\nOverall avg: ' + overallAvg + '%, ' + classesAtBenchmark + '/' + allClasses.length + ' classes at benchmark.\n\nGive 4-5 bullets. No intro. Just bullets. One sentence each.'
    streamClaude(prompt, c => setAiText(p => p + c), () => setAiLoading(false))
  }, [aiEnabled])

  const atRisk = allClasses.flatMap(cls =>
    cls.students.filter(s => getAvg(s.scores) < cls.benchmark).map(s => ({
      name: s.name, avg: getAvg(s.scores), benchmark: cls.benchmark, class: cls.name,
      teacher: teachers.find(t => t.classes.find(c => c.id === cls.id))?.name.split(' ').slice(1).join(' '),
    }))
  ).sort((a,b) => a.avg - b.avg).slice(0, 6)

  const completedReviews = reviews.filter(r => r.status === 'completed').length
  const scheduledObs = observations.filter(o => o.status === 'scheduled').length

  const statCards = [
    { val: teachers.length, label: 'TEACHERS', p: pastel(0), nav: 'teachers', clickable: true },
    { val: totalStudents, label: 'STUDENTS', p: pastel(1), nav: 'students', clickable: true },
    { val: `${overallAvg}%`, label: 'SCHOOL AVG', p: pastel(2), nav: null, clickable: false },
    { val: `${classesAtBenchmark}/${allClasses.length}`, label: 'AT BENCHMARK', p: pastel(3), nav: null, clickable: false },
    { val: `${completedReviews}/${reviews.length}`, label: 'REVIEWS DONE', p: pastel(4), nav: 'reviews', clickable: true },
    { val: scheduledObs, label: 'OBS SCHEDULED', p: pastel(5), nav: 'observations', clickable: true },
  ]

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>Admin</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>Dashboard</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} onClick={s.clickable ? () => onNavigate(s.nav) : undefined}
            style={{ background: s.p.bg, borderRadius: 24, padding: '20px 22px', position: 'relative', overflow: 'hidden', cursor: s.clickable ? 'pointer' : 'default', transition: s.clickable ? 'transform .15s, box-shadow .15s' : 'none', boxShadow: '0 2px 8px rgba(26,26,46,0.06)' }}
            onMouseEnter={e => { if (s.clickable) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,26,46,0.13)' }}}
            onMouseLeave={e => { if (s.clickable) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,26,46,0.06)' }}}>
            <div style={{ fontSize: 34, fontWeight: 800, color: s.p.dark, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.p.dark, opacity: .7, marginTop: 6, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.label}{s.clickable && <span style={{ opacity: .6 }}>→</span>}
            </div>
            <div style={{ position: 'absolute', right: -16, bottom: -16, width: 80, height: 80, borderRadius: '50%', background: s.p.dark, opacity: .06 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>OVERVIEW</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 18, fontFamily: F }}>Class Performance</div>
          <CurveChart classes={allClasses} />
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>STAFF</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontFamily: F }}>Teachers</div>
          {teachers.map((t, i) => {
            const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
            const p = pastel(i); const ok = tavg >= 75
            const review = reviews.find(r => r.teacherId === t.id)
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0ece6' }}>
                <PersonIconSquare size={36} borderRadius={12} bg={p.bg} color={p.dark} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{t.name.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px' }}>{t.subject.toUpperCase()}</div>
                </div>
                {review && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: review.status === 'completed' ? '#a8e6cf' : '#f5d98a', color: review.status === 'completed' ? '#0d5c30' : '#7a4f00', fontWeight: 700 }}>{review.status === 'completed' ? '✓ REVIEWED' : 'PENDING'}</span>}
                <div style={{ background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', borderRadius: 20, padding: '4px 12px', fontWeight: 800, fontSize: 13, fontFamily: F }}>{tavg}%</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 4 }}>ATTENTION NEEDED</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontFamily: F }}>Students at Risk</div>
          {atRisk.length === 0 && <p style={{ fontSize: 14, color: '#8888aa', fontFamily: F }}>All students at benchmark!</p>}
          {atRisk.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f0ece6' }}>
              <PersonIcon size={32} bg="#fee2e2" color="#991b1b" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#8888aa' }}>{s.class} · {s.teacher}</div>
              </div>
              <div style={{ background: '#f5b8c4', color: '#7a1522', borderRadius: 20, padding: '3px 10px', fontWeight: 800, fontSize: 13 }}>{s.avg}%</div>
            </div>
          ))}
        </div>
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

// ── Performance Reviews Page ───────────────────────────────────────────────────
function PerformanceReviewsPage({ teachers, reviews, setReviews, setNotif }) {
  const [selected, setSelected] = useState(null) // review id being viewed/edited
  const [newReviewTeacherId, setNewReviewTeacherId] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [aiText, setAiText] = useState({})
  const [aiLoading, setAiLoading] = useState({})
  const { aiEnabled } = useAI()

  const CATEGORIES = [
    { key: 'instruction', label: 'Instructional Quality' },
    { key: 'classroom', label: 'Classroom Environment' },
    { key: 'professionalism', label: 'Professionalism' },
    { key: 'growth', label: 'Professional Growth' },
    { key: 'collaboration', label: 'Collaboration' },
  ]

  function getRatingLabel(n) {
    return ['', 'Unsatisfactory', 'Developing', 'Proficient', 'Accomplished', 'Distinguished'][n] || ''
  }
  function getRatingColor(n) {
    return ['', '#fee2e2', '#fef3c7', '#e0f2fe', '#dcfce7', '#a8e6cf'][n] || '#f0ece6'
  }
  function getRatingText(n) {
    return ['', '#991b1b', '#92400e', '#0369a1', '#166534', '#0d5c30'][n] || '#aaa'
  }

  function updateReview(id, field, value) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }
  function updateCategory(id, cat, val) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, categories: { ...r.categories, [cat]: val } } : r))
  }
  async function completeReview(id) {
    const r = reviews.find(r => r.id === id)
    const avg = Math.round(Object.values(r.categories).reduce((a,b)=>a+b,0) / Object.values(r.categories).length)
    const updated = { ...r, status: 'completed', overall: avg }
    setReviews(prev => prev.map(rv => rv.id === id ? updated : rv))
    try {
      const saved = await dbSaveReview(updated)
      setReviews(prev => prev.map(rv => rv.id === id ? { ...rv, dbId: saved.id } : rv))
      setNotif('Review completed and saved to database!')
    } catch (err) {
      console.error('Supabase error:', err)
      setNotif('Review completed (database sync failed)')
    }
  }
  function startNewReview() {
    if (!newReviewTeacherId) { setNotif('Select a teacher'); return }
    const newR = {
      id: Date.now(), teacherId: parseInt(newReviewTeacherId),
      reviewer: 'Dr. Ashley Kauffman', date: new Date().toISOString().split('T')[0],
      cycle: 'Spring 2026', status: 'in_progress', overall: 0,
      categories: { instruction: 0, classroom: 0, professionalism: 0, growth: 0, collaboration: 0 },
      strengths: '', improvements: '', goals: '', aiSummary: '',
    }
    setReviews(prev => [...prev, newR])
    setSelected(newR.id); setShowNewForm(false); setNotif('New review started!')
  }

  function generateAISummary(review) {
    if (!aiEnabled) { setNotif('Enable AI to generate summaries'); return }
    const teacher = teachers.find(t => t.id === review.teacherId)
    const catText = Object.entries(review.categories).map(([k, v]) => `${k}: ${v}/5 (${getRatingLabel(v)})`).join(', ')
    const prompt = `You are a school administrator writing a formal performance review summary for a teacher evaluation.\n\nTeacher: ${teacher?.name}\nSubject: ${teacher?.subject}\nReview cycle: ${review.cycle}\nRatings: ${catText}\nOverall: ${review.overall}/5\nStrengths noted: ${review.strengths}\nAreas for improvement: ${review.improvements}\nGoals: ${review.goals}\n\nWrite a professional 3-sentence summary paragraph suitable for an official HR record. Be specific and constructive. No bullet points.`
    setAiLoading(prev => ({ ...prev, [review.id]: true }))
    setAiText(prev => ({ ...prev, [review.id]: '' }))
    streamClaude(prompt,
      c => setAiText(prev => ({ ...prev, [review.id]: (prev[review.id] || '') + c })),
      () => {
        setAiLoading(prev => ({ ...prev, [review.id]: false }))
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, aiSummary: aiText[review.id] || '' } : r))
      }
    )
  }

  const selectedReview = reviews.find(r => r.id === selected)
  const selectedTeacher = selectedReview ? teachers.find(t => t.id === selectedReview.teacherId) : null

  if (selected && selectedReview) {
    const p = pastel(teachers.findIndex(t => t.id === selectedReview.teacherId))
    const isEditable = selectedReview.status === 'in_progress'
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#8888aa', fontFamily: F, fontWeight: 700, fontSize: 13, marginBottom: 24, padding: 0 }}>
          ← Back to Reviews
        </button>

        {/* Header */}
        <div style={{ background: p.bg, borderRadius: 24, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PersonIconSquare size={56} borderRadius={16} bg={p.dark + '33'} color={p.dark} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 24, color: p.dark, fontFamily: F }}>{selectedTeacher?.name}</div>
              <div style={{ fontSize: 12, color: p.dark, opacity: .7, fontWeight: 700, letterSpacing: '1px' }}>{selectedTeacher?.subject?.toUpperCase()} · {selectedReview.cycle}</div>
              <div style={{ fontSize: 11, color: p.dark, opacity: .6, marginTop: 2 }}>Reviewed by {selectedReview.reviewer} · {selectedReview.date}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, padding: '6px 16px', borderRadius: 20, background: selectedReview.status === 'completed' ? '#166534' : '#92400e', color: '#fff', fontWeight: 800, letterSpacing: '1px' }}>
              {selectedReview.status === 'completed' ? '✓ COMPLETED' : 'IN PROGRESS'}
            </span>
            {selectedReview.status === 'completed' && (
              <div style={{ fontWeight: 800, fontSize: 40, color: p.dark, fontFamily: F, marginTop: 8 }}>{selectedReview.overall}<span style={{ fontSize: 18 }}>/5</span></div>
            )}
          </div>
        </div>

        {/* Category Ratings */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 16 }}>EVALUATION RUBRIC</div>
          {CATEGORIES.map(cat => {
            const val = selectedReview.categories[cat.key]
            return (
              <div key={cat.key} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F }}>{cat.label}</div>
                  {val > 0 && <span style={{ fontSize: 11, padding: '3px 12px', borderRadius: 20, background: getRatingColor(val), color: getRatingText(val), fontWeight: 800 }}>{getRatingLabel(val)}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => isEditable && updateCategory(selectedReview.id, cat.key, n)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: `2px solid ${val === n ? getRatingText(n) : '#ede8e0'}`,
                      background: val === n ? getRatingColor(n) : '#faf9f6',
                      color: val === n ? getRatingText(n) : '#aaa',
                      fontWeight: val === n ? 800 : 500, fontSize: 13, cursor: isEditable ? 'pointer' : 'default',
                      fontFamily: F, transition: 'all .15s',
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Text fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { field: 'strengths', label: 'STRENGTHS', placeholder: 'Document observed strengths...' },
            { field: 'improvements', label: 'AREAS FOR IMPROVEMENT', placeholder: 'Note areas requiring development...' },
            { field: 'goals', label: 'PROFESSIONAL GOALS', placeholder: 'Set measurable goals for next cycle...' },
          ].map(({ field, label, placeholder }) => (
            <div key={field} style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', boxShadow: '0 2px 12px rgba(26,26,46,0.05)', gridColumn: field === 'goals' ? 'span 2' : 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 10 }}>{label}</div>
              {isEditable ? (
                <textarea value={selectedReview[field]} onChange={e => updateReview(selectedReview.id, field, e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2ddd6', fontFamily: F, fontSize: 14, color: '#1a1a2e', background: '#faf9f6', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              ) : (
                <p style={{ fontSize: 14, color: '#3d3d5c', lineHeight: 1.7, fontFamily: F, margin: 0 }}>{selectedReview[field] || <span style={{ color: '#ccc' }}>None recorded</span>}</p>
              )}
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div style={{ background: '#c8b8f0', borderRadius: 20, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a1a80', animation: aiLoading[selectedReview.id] ? 'aipulse 1.4s infinite' : 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: F }}>AI Summary</span>
            </div>
            <button onClick={() => generateAISummary(selectedReview)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#3a1a80', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: F }}>
              {aiLoading[selectedReview.id] ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <p style={{ fontSize: 14, color: '#2a1a5e', lineHeight: 1.7, fontFamily: F, fontStyle: (!aiText[selectedReview.id] && !selectedReview.aiSummary) ? 'italic' : 'normal', margin: 0 }}>
            {aiLoading[selectedReview.id] && !aiText[selectedReview.id] ? 'Writing formal summary...' : (aiText[selectedReview.id] || selectedReview.aiSummary || 'Click Generate to create an AI-written formal review summary.')}
          </p>
          <style>{`@keyframes aipulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
        </div>

        {isEditable && (
          <button onClick={() => completeReview(selectedReview.id)} style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: '#166534', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>
            ✓ FINALIZE REVIEW
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>Performance Reviews</h1>
        </div>
        <button onClick={() => setShowNewForm(v => !v)} style={{ padding: '12px 22px', borderRadius: 14, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: F }}>
          + New Review
        </button>
      </div>

      {showNewForm && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 16px rgba(26,26,46,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <select value={newReviewTeacherId} onChange={e => setNewReviewTeacherId(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2ddd6', fontFamily: F, fontSize: 14, background: '#fff' }}>
            <option value="">Select teacher to review...</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
          </select>
          <button onClick={startNewReview} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#1a1a2e', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: F }}>Start Review</button>
          <button onClick={() => setShowNewForm(false)} style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e2ddd6', background: 'transparent', color: '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>Cancel</button>
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { val: reviews.filter(r=>r.status==='completed').length, label: 'COMPLETED', bg: '#dcfce7', color: '#166534' },
          { val: reviews.filter(r=>r.status==='in_progress').length, label: 'IN PROGRESS', bg: '#fef3c7', color: '#92400e' },
          { val: teachers.length - reviews.length > 0 ? teachers.length - new Set(reviews.map(r=>r.teacherId)).size : 0, label: 'NOT STARTED', bg: '#fee2e2', color: '#991b1b' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ fontWeight: 800, fontSize: 32, color: s.color, fontFamily: F }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: s.color, opacity: .7, letterSpacing: '1.5px', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Review cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {teachers.map((t, i) => {
          const review = reviews.find(r => r.teacherId === t.id)
          const p = pastel(i)
          const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 20, padding: '18px 22px', boxShadow: '0 2px 12px rgba(26,26,46,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <PersonIconSquare size={48} borderRadius={14} bg={p.bg} color={p.dark} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e', fontFamily: F }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600, letterSpacing: '.5px', marginTop: 2 }}>{t.subject.toUpperCase()} · CLASS AVG {tavg}%</div>
              </div>
              {review ? (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#8888aa', fontWeight: 700, letterSpacing: '1px', marginBottom: 2 }}>CYCLE</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3d3d5c', fontFamily: F }}>{review.cycle}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#8888aa', fontWeight: 700, letterSpacing: '1px', marginBottom: 2 }}>OVERALL</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: review.overall >= 4 ? '#166534' : review.overall >= 3 ? '#92400e' : '#991b1b', fontFamily: F }}>
                      {review.status === 'completed' ? `${review.overall}/5` : '—'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '5px 14px', borderRadius: 20, background: review.status === 'completed' ? '#dcfce7' : '#fef3c7', color: review.status === 'completed' ? '#166534' : '#92400e', fontWeight: 800 }}>
                    {review.status === 'completed' ? '✓ DONE' : 'IN PROGRESS'}
                  </span>
                  <button onClick={() => setSelected(review.id)} style={{ padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2ddd6', background: 'transparent', color: '#3d3d5c', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: F }}>
                    {review.status === 'completed' ? 'View' : 'Continue →'}
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 11, padding: '5px 14px', borderRadius: 20, background: '#fee2e2', color: '#991b1b', fontWeight: 800 }}>NOT REVIEWED</span>
                  <button onClick={() => { setNewReviewTeacherId(String(t.id)); setShowNewForm(false); const newR = { id: Date.now(), teacherId: t.id, reviewer: 'Dr. Ashley Kauffman', date: new Date().toISOString().split('T')[0], cycle: 'Spring 2026', status: 'in_progress', overall: 0, categories: { instruction: 0, classroom: 0, professionalism: 0, growth: 0, collaboration: 0 }, strengths: '', improvements: '', goals: '', aiSummary: '' }; setReviews(prev => [...prev, newR]); setSelected(newR.id) }} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#a8c8f8', color: '#1a3a8a', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: F }}>
                    Start Review
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Classroom Observations Page ────────────────────────────────────────────────
function ObservationsPage({ teachers, allClasses, observations, setObservations, setNotif }) {
  const [selected, setSelected] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newObs, setNewObs] = useState({ teacherId: '', classId: '', date: '', duration: '45', type: 'formal' })
  const [aiText, setAiText] = useState({})
  const [aiLoading, setAiLoading] = useState({})
  const { aiEnabled } = useAI()

  const METRICS = [
    { key: 'environment', label: 'Learning Environment', abbr: 'ENV' },
    { key: 'engagement',  label: 'Student Engagement',   abbr: 'ENG' },
    { key: 'instruction', label: 'Instructional Delivery', abbr: 'INS' },
    { key: 'management',  label: 'Classroom Management',  abbr: 'MGT' },
  ]
  const SCORE_LABELS = { 1: 'Unsatisfactory', 2: 'Developing', 3: 'Proficient', 4: 'Accomplished', 5: 'Distinguished' }

  function updateObs(id, field, value) {
    setObservations(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))
  }
  function updateMetric(id, key, val) {
    setObservations(prev => prev.map(o => o.id === id ? { ...o, [key]: val } : o))
  }
  async function completeObservation(id) {
    const obs = observations.find(o => o.id === id)
    const updated = { ...obs, status: 'completed' }
    setObservations(prev => prev.map(o => o.id === id ? updated : o))
    try {
      const saved = await dbSaveObservation(updated)
      setObservations(prev => prev.map(o => o.id === id ? { ...o, dbId: saved.id } : o))
      setNotif('Observation saved to database!')
    } catch (err) {
      console.error('Supabase error:', err)
      setNotif('Observation saved locally (database sync failed)')
    }
  }
  function startNewObs() {
    if (!newObs.teacherId || !newObs.classId || !newObs.date) { setNotif('Fill in all fields'); return }
    const obs = {
      id: Date.now(), teacherId: parseInt(newObs.teacherId), classId: parseInt(newObs.classId),
      observer: 'Dr. Ashley Kauffman', date: newObs.date, duration: parseInt(newObs.duration) || 45,
      type: newObs.type, status: 'in_progress',
      environment: 0, engagement: 0, instruction: 0, management: 0,
      notes: '', commendations: '', recommendations: '', aiSummary: '',
    }
    setObservations(prev => [...prev, obs])
    setSelected(obs.id); setShowNewForm(false); setNotif('Observation started!')
  }

  function generateAISummary(obs) {
    if (!aiEnabled) { setNotif('Enable AI to generate summaries'); return }
    const teacher = teachers.find(t => t.id === obs.teacherId)
    const cls = allClasses.find(c => c.id === obs.classId)
    const metricsText = METRICS.map(m => `${m.label}: ${obs[m.key]}/5 (${SCORE_LABELS[obs[m.key]] || 'not rated'})`).join(', ')
    const prompt = `You are a school administrator writing an official classroom observation report.\n\nTeacher: ${teacher?.name} (${teacher?.subject})\nClass: ${cls?.name}\nDate: ${obs.date}\nDuration: ${obs.duration} minutes\nObservation type: ${obs.type}\nMetrics: ${metricsText}\nObservation notes: ${obs.notes}\nCommendations: ${obs.commendations}\nRecommendations: ${obs.recommendations}\n\nWrite a professional 3-4 sentence observation summary for a teacher's personnel file. Be specific and constructive. No bullet points.`
    setAiLoading(prev => ({ ...prev, [obs.id]: true }))
    setAiText(prev => ({ ...prev, [obs.id]: '' }))
    let accumulated = ''
    streamClaude(prompt,
      c => { accumulated += c; setAiText(prev => ({ ...prev, [obs.id]: accumulated })) },
      () => {
        setAiLoading(prev => ({ ...prev, [obs.id]: false }))
        setObservations(prev => prev.map(o => o.id === obs.id ? { ...o, aiSummary: accumulated } : o))
      }
    )
  }

  const selObs = observations.find(o => o.id === selected)
  const selTeacher = selObs ? teachers.find(t => t.id === selObs.teacherId) : null
  const selClass = selObs ? allClasses.find(c => c.id === selObs.classId) : null
  const newObsTeacher = teachers.find(t => t.id === parseInt(newObs.teacherId))

  // ── Detail view ───────────────────────────────────────────────────────────────
  if (selected && selObs) {
    const p = pastel(teachers.findIndex(t => t.id === selObs.teacherId))
    const isEditable = selObs.status !== 'completed'
    const scoredM = METRICS.filter(m => selObs[m.key] > 0)
    const avgScore = scoredM.length > 0
      ? (scoredM.reduce((a, m) => a + selObs[m.key], 0) / scoredM.length).toFixed(1) : null

    const typePalette = {
      formal:      { bg: '#a8c8f8', dark: '#1a3a8a' },
      walkthrough: { bg: '#a8e6cf', dark: '#0d5c30' },
      informal:    { bg: '#f5d98a', dark: '#7a4f00' },
    }[selObs.type] || pastel(0)

    const statusBadge = {
      completed:   { bg: '#a8e6cf', color: '#0d5c30', label: '✓ COMPLETED' },
      in_progress: { bg: '#f5d98a', color: '#7a4f00', label: 'IN PROGRESS' },
      scheduled:   { bg: '#a8c8f8', color: '#1a3a8a', label: 'SCHEDULED'   },
    }[selObs.status]

    return (
      <div>
        {/* Back button — matches PerformanceReviews style */}
        <button onClick={() => setSelected(null)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8888aa', fontFamily: F, fontWeight: 700, fontSize: 13,
          marginBottom: 24, padding: 0,
        }}>
          ← Back to Observations
        </button>

        {/* Hero — pastel card matching rest of app */}
        <div style={{ background: p.bg, borderRadius: 24, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PersonIconSquare size={56} borderRadius={16} bg={p.dark + '33'} color={p.dark} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 24, color: p.dark, fontFamily: F }}>{selTeacher?.name}</div>
              <div style={{ fontSize: 12, color: p.dark, opacity: .7, fontWeight: 700, letterSpacing: '1px', marginTop: 2 }}>
                {selClass?.name?.toUpperCase()} · {selObs.type.toUpperCase()} OBSERVATION
              </div>
              <div style={{ fontSize: 11, color: p.dark, opacity: .6, marginTop: 2 }}>
                {selObs.date} · {selObs.duration} min · {selObs.observer}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '5px 14px', borderRadius: 20, background: statusBadge.bg, color: statusBadge.color, fontWeight: 800 }}>
              {statusBadge.label}
            </span>
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: typePalette.bg, color: typePalette.dark, fontWeight: 700 }}>
              {selObs.type.charAt(0).toUpperCase() + selObs.type.slice(1)}
            </span>
            {avgScore && (
              <div style={{ fontWeight: 800, fontSize: 40, color: p.dark, fontFamily: F, lineHeight: 1 }}>
                {avgScore}<span style={{ fontSize: 18, opacity: .5 }}>/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Rubric — white card matching rest of app */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 16px rgba(26,26,46,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 20 }}>EVALUATION RUBRIC</div>
          {METRICS.map((m, mi) => {
            const val = selObs[m.key]
            const textColor = val === 0 ? '#ccc' : val <= 2 ? '#991b1b' : val === 3 ? '#92400e' : '#166534'
            return (
              <div key={m.key} style={{ marginBottom: mi < METRICS.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{m.label}</div>
                  {val > 0 && (
                    <span style={{
                      fontSize: 11, padding: '3px 12px', borderRadius: 20,
                      background: val <= 2 ? '#fee2e2' : val === 3 ? '#fef3c7' : '#dcfce7',
                      color: textColor, fontWeight: 800,
                    }}>
                      {SCORE_LABELS[val]}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => {
                    const active = val === n
                    const btnColors = { 1: ['#fee2e2','#991b1b'], 2: ['#fef3c7','#92400e'], 3: ['#e0f2fe','#0369a1'], 4: ['#dcfce7','#166534'], 5: ['#a8e6cf','#0d5c30'] }
                    const [bg, col] = btnColors[n]
                    return (
                      <button key={n} onClick={() => isEditable && updateMetric(selObs.id, m.key, n)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10,
                        border: `2px solid ${active ? col : '#ede8e0'}`,
                        background: active ? bg : '#faf9f6',
                        color: active ? col : '#aaa',
                        fontWeight: active ? 800 : 500, fontSize: 14,
                        cursor: isEditable ? 'pointer' : 'default',
                        fontFamily: F, transition: 'all .15s',
                      }}>{n}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes — two-column white cards matching the review page */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { field: 'notes',           label: 'OBSERVATION NOTES',  placeholder: 'Record what you observed during the visit...', span: 2, labelColor: '#8888aa' },
            { field: 'commendations',   label: 'COMMENDATIONS',      placeholder: 'What was done particularly well...',           span: 1, labelColor: '#0d5c30' },
            { field: 'recommendations', label: 'RECOMMENDATIONS',    placeholder: 'Specific, actionable suggestions...',          span: 1, labelColor: '#7a1522' },
          ].map(({ field, label, placeholder, span, labelColor }) => (
            <div key={field} style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', boxShadow: '0 2px 12px rgba(26,26,46,0.05)', gridColumn: `span ${span}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: labelColor, marginBottom: 10 }}>{label}</div>
              {isEditable ? (
                <textarea value={selObs[field]} onChange={e => updateObs(selObs.id, field, e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '100%', minHeight: field === 'notes' ? 110 : 90, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2ddd6', fontFamily: F, fontSize: 14, color: '#1a1a2e', background: '#faf9f6', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              ) : (
                <p style={{ fontSize: 14, color: '#3d3d5c', lineHeight: 1.7, fontFamily: F, margin: 0 }}>
                  {selObs[field] || <span style={{ color: '#ccc' }}>None recorded</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* AI Summary — matches the #c8b8f0 card used everywhere else */}
        <div style={{ background: '#c8b8f0', borderRadius: 24, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a1a80', animation: aiLoading[selObs.id] ? 'aipulse 1.4s infinite' : 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#3a1a80', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: F }}>AI Summary</span>
            </div>
            <button onClick={() => generateAISummary(selObs)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#3a1a80', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: F }}>
              {aiLoading[selObs.id] ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <p style={{ fontSize: 14, color: aiLoading[selObs.id] && !aiText[selObs.id] ? '#9a8acc' : '#2a1a5e', lineHeight: 1.7, fontFamily: F, fontStyle: (!aiText[selObs.id] && !selObs.aiSummary) ? 'italic' : 'normal', margin: 0 }}>
            {aiLoading[selObs.id] && !aiText[selObs.id] ? 'Writing observation summary...' : (aiText[selObs.id] || selObs.aiSummary || 'Click Generate to produce an AI-written summary for this observation.')}
          </p>
          <style>{`@keyframes aipulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
        </div>

        {isEditable && (
          <button onClick={() => completeObservation(selObs.id)} style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: '#166534', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>
            ✓ SAVE OBSERVATION
          </button>
        )}
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header — matches other pages */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>Classroom Observations</h1>
        </div>
        <button onClick={() => setShowNewForm(v => !v)} style={{
          padding: '12px 22px', borderRadius: 14, border: 'none',
          background: showNewForm ? '#f5b8c4' : '#a8e6cf',
          color: showNewForm ? '#7a1522' : '#0d5c30',
          fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: F, transition: 'all .15s',
        }}>
          {showNewForm ? '× Cancel' : '+ New Observation'}
        </button>
      </div>

      {/* New form — white card matching rest of app */}
      {showNewForm && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '22px 24px', marginBottom: 20, boxShadow: '0 2px 16px rgba(26,26,46,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 14 }}>NEW OBSERVATION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', marginBottom: 6 }}>TEACHER</div>
              <select value={newObs.teacherId} onChange={e => setNewObs(f=>({...f,teacherId:e.target.value,classId:''}))} style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2ddd6',fontFamily:F,fontSize:14,background:'#fff' }}>
                <option value="">Select teacher...</option>
                {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', marginBottom: 6 }}>CLASS</div>
              <select value={newObs.classId} onChange={e=>setNewObs(f=>({...f,classId:e.target.value}))} disabled={!newObs.teacherId} style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2ddd6',fontFamily:F,fontSize:14,background:'#fff' }}>
                <option value="">Select class...</option>
                {newObsTeacher?.classes.map(c=><option key={c.id} value={c.id}>{c.name} ({c.period} period)</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', marginBottom: 6 }}>DATE</div>
              <input type="date" value={newObs.date} onChange={e=>setNewObs(f=>({...f,date:e.target.value}))} style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2ddd6',fontFamily:F,fontSize:14,background:'#fff',boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', marginBottom: 6 }}>DURATION (MIN)</div>
              <input type="number" value={newObs.duration} onChange={e=>setNewObs(f=>({...f,duration:e.target.value}))} style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2ddd6',fontFamily:F,fontSize:14,background:'#fff',boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', marginBottom: 6 }}>TYPE</div>
              <select value={newObs.type} onChange={e=>setNewObs(f=>({...f,type:e.target.value}))} style={{ width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2ddd6',fontFamily:F,fontSize:14,background:'#fff' }}>
                <option value="formal">Formal</option>
                <option value="walkthrough">Walkthrough</option>
                <option value="informal">Informal</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={startNewObs} style={{ padding:'10px 24px',borderRadius:12,border:'none',background:'#1a1a2e',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer',fontFamily:F }}>Create Observation</button>
            <button onClick={() => setShowNewForm(false)} style={{ padding:'10px 16px',borderRadius:12,border:'1.5px solid #e2ddd6',background:'transparent',color:'#aaa',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:F }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stat cards — same pastel card style as dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { val: observations.length,                                          label: 'TOTAL',       p: pastel(0) },
          { val: observations.filter(o=>o.status==='completed').length,        label: 'COMPLETED',   p: pastel(2) },
          { val: observations.filter(o=>o.status==='in_progress').length,      label: 'IN PROGRESS', p: pastel(1) },
          { val: observations.filter(o=>o.status==='scheduled').length,        label: 'SCHEDULED',   p: pastel(4) },
        ].map(s => (
          <div key={s.label} style={{ background: s.p.bg, borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 32, color: s.p.dark, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.p.dark, opacity: .7, letterSpacing: '1.5px', marginTop: 6 }}>{s.label}</div>
            <div style={{ position: 'absolute', right: -12, bottom: -12, width: 60, height: 60, borderRadius: '50%', background: s.p.dark, opacity: .06 }} />
          </div>
        ))}
      </div>

      {/* Observation cards — white cards with pastel accents, matching teachers/students pages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {observations.map((obs, i) => {
          const teacher = teachers.find(t => t.id === obs.teacherId)
          const cls = allClasses.find(c => c.id === obs.classId)
          const p = pastel(teachers.findIndex(t => t.id === obs.teacherId))
          const scoredM = METRICS.filter(m => obs[m.key] > 0)
          const avgScore = scoredM.length > 0 ? (scoredM.reduce((a,m) => a + obs[m.key], 0) / scoredM.length).toFixed(1) : null
          const scoreNum = parseFloat(avgScore)
          const scoreColor = !avgScore ? '#aaa' : scoreNum >= 4 ? '#0d5c30' : scoreNum >= 3 ? '#7a4f00' : '#7a1522'
          const scoreBg   = !avgScore ? '#f0ece6' : scoreNum >= 4 ? '#a8e6cf' : scoreNum >= 3 ? '#f5d98a' : '#f5b8c4'

          const statusBadge = {
            completed:   { bg: '#a8e6cf', color: '#0d5c30', label: '✓ COMPLETED'   },
            in_progress: { bg: '#f5d98a', color: '#7a4f00', label: 'IN PROGRESS'   },
            scheduled:   { bg: '#a8c8f8', color: '#1a3a8a', label: 'SCHEDULED'     },
          }[obs.status]

          const typeBadge = {
            formal:      { bg: '#b8e4f5', color: '#0a4a6a' },
            walkthrough: { bg: '#a8e6cf', color: '#0d5c30' },
            informal:    { bg: '#f5d98a', color: '#7a4f00' },
          }[obs.type] || pastel(0)

          return (
            <div key={obs.id} style={{ background: '#fff', borderRadius: 20, padding: '18px 22px', boxShadow: '0 2px 12px rgba(26,26,46,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <PersonIconSquare size={48} borderRadius={14} bg={p.bg} color={p.dark} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e', fontFamily: F }}>{teacher?.name}</div>
                <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>{cls?.name}</span>
                  <span>·</span>
                  <span>{obs.date}</span>
                  <span>·</span>
                  <span>{obs.duration} min</span>
                  <span style={{ padding: '1px 8px', borderRadius: 20, background: typeBadge.bg, color: typeBadge.color, fontWeight: 700, fontSize: 10 }}>
                    {obs.type.charAt(0).toUpperCase() + obs.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Mini metric dots */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {METRICS.map(m => {
                  const v = obs[m.key]
                  const dotColor = v === 0 ? '#e2ddd6' : v <= 2 ? '#fca5a5' : v === 3 ? '#fde68a' : '#86efac'
                  return <div key={m.key} title={`${m.label}: ${v}/5`} style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor }} />
                })}
              </div>

              {avgScore && (
                <div style={{ textAlign: 'center', minWidth: 52 }}>
                  <div style={{ background: scoreBg, borderRadius: 20, padding: '4px 12px', display: 'inline-block' }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: scoreColor, fontFamily: F }}>{avgScore}</span>
                    <span style={{ fontSize: 10, color: scoreColor, opacity: .6 }}>/5</span>
                  </div>
                </div>
              )}

              <span style={{ fontSize: 11, padding: '5px 14px', borderRadius: 20, background: statusBadge.bg, color: statusBadge.color, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {statusBadge.label}
              </span>

              <button onClick={() => setSelected(obs.id)} style={{
                padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2ddd6',
                background: 'transparent', color: '#3d3d5c', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f4f0' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                {obs.status === 'completed' ? 'View' : obs.status === 'scheduled' ? 'Begin →' : 'Continue →'}
              </button>
            </div>
          )
        })}
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
  const areaPath = pts.length > 1 ? linePath + ` L ${pts[pts.length-1][0]} ${H} L ${pts[0][0]} ${H} Z` : ''
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a8c8f8" stopOpacity="0.5" /><stop offset="100%" stopColor="#a8c8f8" stopOpacity="0.02" /></linearGradient></defs>
        {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
        <path d={linePath} fill="none" stroke="#2255cc" strokeWidth="2.5" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill="#2255cc" />
            <circle cx={x} cy={y} r={3} fill="#fff" />
            <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1a2e" fontFamily={F}>{avgs[i]}%</text>
            <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="#8888aa" fontFamily={F}>{classes[i]?.name?.slice(0,6)}</text>
          </g>
        ))}
        <line x1={PAD} y1={H - PAD - (0.75 * (H - PAD*2))} x2={W - PAD} y2={H - PAD - (0.75 * (H - PAD*2))} stroke="#f5b8c4" strokeWidth="1.5" strokeDasharray="4,4" />
      </svg>
    </div>
  )
}

// ── Teachers Page ──────────────────────────────────────────────────────────────
function TeachersPage({ teachers, onOpenTeacher }) {
  return (
    <>
      <PageHeader label="STAFF" title="Teachers" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {teachers.map((t, i) => {
          const p = pastel(i)
          const tavg = t.classes.length ? Math.round(t.classes.reduce((a,c)=>a+classAvg(c),0)/t.classes.length) : 0
          const atBench = t.classes.filter(c => classAvg(c) >= c.benchmark).length
          return (
            <div key={t.id} onClick={() => onOpenTeacher(t.id)} style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(26,26,46,0.05)', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,26,46,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(26,26,46,0.05)' }}>
              <div style={{ background: p.bg, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <PersonIconSquare size={52} borderRadius={18} bg={p.dark + '33'} color={p.dark} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: p.dark, fontFamily: F }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: p.dark, opacity: .7, fontWeight: 700, letterSpacing: '1px' }}>{t.subject.toUpperCase()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 26, color: p.dark, fontFamily: F }}>{tavg}%</div>
                  <span style={{ fontSize: 10, color: p.dark, opacity: .6, fontWeight: 700, letterSpacing: '1px' }}>VIEW CLASSES →</span>
                </div>
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
                    return <span key={cls.id} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: ok ? cp.bg : '#f5b8c4', color: ok ? cp.dark : '#7a1522', fontWeight: 700 }}>{cls.name}: {avg}%</span>
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

// ── Admin Teacher View (class cards drill-down) ───────────────────────────────
function AdminTeacherView({ teacher, onBack, onOpenClass, onSignOut }) {
  const p = pastel(0)
  const tavg = teacher.classes.length ? Math.round(teacher.classes.reduce((a,c)=>a+classAvg(c),0)/teacher.classes.length) : 0
  return (
    <div>
      <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',color:'#8888aa',fontFamily:F,fontWeight:700,fontSize:13,marginBottom:24,padding:0 }}>
        ← Back to Teachers
      </button>
      {/* Teacher hero */}
      <div style={{ background: p.bg, borderRadius: 24, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <PersonIconSquare size={60} borderRadius={18} bg={p.dark + '33'} color={p.dark} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: p.dark, opacity: .6, marginBottom: 4 }}>STAFF · {teacher.subject.toUpperCase()}</div>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 28, color: p.dark, letterSpacing: '-0.5px' }}>{teacher.name}</div>
          <div style={{ fontSize: 12, color: p.dark, opacity: .65, marginTop: 4, fontWeight: 600 }}>
            {teacher.classes.length} classes · {teacher.classes.reduce((a,c)=>a+c.students.length,0)} students
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 44, color: p.dark, fontFamily: F }}>{tavg}%</div>
      </div>
      {/* Class stamp cards — same as TeacherDash StampCard */}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', marginBottom: 16 }}>CLASSES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {teacher.classes.map((cls, i) => {
          const avg = classAvg(cls)
          const isPassing = avg >= cls.benchmark
          const needHelp = cls.students.filter(s => getAvg(s.scores) < cls.benchmark).length
          const isLarge = cls.students.length >= 30
          const cardBg     = isPassing ? '#dcfce7' : '#fee2e2'
          const cardBorder = isPassing ? '#86efac' : '#fca5a5'
          const cardDark   = isPassing ? '#166534' : '#991b1b'
          const cardMid    = isPassing ? '#16a34a' : '#dc2626'
          const passing    = cls.students.filter(s => getAvg(s.scores) >= cls.benchmark).length
          return (
            <div key={cls.id} onClick={() => onOpenClass(cls.id)} style={{
              background: cardBg, borderRadius: 24, padding: '22px 20px', cursor: 'pointer',
              border: `2px solid ${cardBorder}`, transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,26,46,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', color: cardDark, marginBottom: 6, opacity: .7 }}>{cls.period.toUpperCase()} PERIOD</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: cardDark, fontFamily: F, marginBottom: 2 }}>{cls.name.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: cardDark, opacity: .6, marginBottom: 14 }}>{cls.students.length} STUDENTS</div>
              <div style={{ fontWeight: 800, fontSize: 40, color: cardDark, lineHeight: 1, fontFamily: F }}>{avg}<span style={{ fontSize: 18 }}>%</span></div>
              <div style={{ fontSize: 10, fontWeight: 700, color: cardDark, opacity: .6, marginTop: 4 }}>GOAL: {cls.benchmark}%</div>
              <div style={{ marginTop: 12 }}>
                {isLarge ? (
                  <span style={{ fontSize: 14, fontWeight: 900, color: needHelp === 0 ? '#166534' : needHelp === 1 ? '#92400e' : '#991b1b', background: needHelp === 0 ? '#dcfce7' : needHelp === 1 ? '#fef3c7' : '#fee2e2', padding: '3px 10px', borderRadius: 6 }}>
                    {needHelp === 0 ? 'ALL CLEAR ✓' : needHelp === 1 ? '!' : needHelp === 2 ? '!!' : '!!!+'}
                  </span>
                ) : (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Array.from({ length: cls.students.length }, (_, idx) => (
                      <div key={idx} style={{ width: 10, height: 10, borderRadius: '50%', background: idx < passing ? cardMid : cardMid + '33' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Admin Class View (student list drill-down) ────────────────────────────────
function AdminClassView({ cls, teacher, onBack, onOpenStudent, onSignOut }) {
  const avg = classAvg(cls)
  const isPassing = avg >= cls.benchmark
  const cardBg = isPassing ? '#dcfce7' : '#fee2e2'
  const cardBorder = isPassing ? '#86efac' : '#fca5a5'
  const cardDark = isPassing ? '#14532d' : '#7f1d1d'

  return (
    <div>
      <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',color:'#8888aa',fontFamily:F,fontWeight:700,fontSize:13,marginBottom:24,padding:0 }}>
        ← Back to {teacher.name.split(' ').slice(1).join(' ')}'s Classes
      </button>

      {/* Class hero */}
      <div style={{ background: cardBg, padding: '28px 32px', marginBottom: 0, borderTop: `4px solid ${cardBorder}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: cardDark, opacity: .6, marginBottom: 6 }}>{cls.period.toUpperCase()} PERIOD · {teacher.name.toUpperCase()}</div>
          <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: 36, color: cardDark, letterSpacing: '-1px', lineHeight: 1, marginBottom: 8 }}>{cls.name.toUpperCase()}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: isPassing ? '#166534' : '#991b1b', color: '#fff', fontWeight: 800 }}>
              {isPassing ? `ABOVE BENCHMARK` : `BELOW BENCHMARK`}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 56, color: cardDark, lineHeight: 1 }}>{avg}<span style={{ fontSize: 22 }}>%</span></div>
          <div style={{ fontSize: 11, fontWeight: 600, color: cardDark, opacity: .6, marginTop: 4 }}>
            GOAL: {cls.benchmark}% · {cls.students.filter(s=>getAvg(s.scores)>=cls.benchmark).length}/{cls.students.length} PASSING
          </div>
        </div>
      </div>

      {/* Student roster */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede8e0' }}>
        <div style={{ padding: '16px 28px 12px', borderBottom: '1px solid #f0ece6', fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa' }}>
          ROSTER — {cls.students.length} STUDENTS
        </div>
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
              <PersonIconSquare size={36} borderRadius="50%" bg={sp.bg} color={sp.dark} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, letterSpacing: '.5px', marginTop: 1 }}>
                  {s.scores.length} ASSESSMENTS · LATEST: {s.scores[s.scores.length-1]}%
                </div>
              </div>
              <div style={{ width: 140, flexShrink: 0 }}>
                <div style={{ position: 'relative', height: 6, background: '#f0ece6', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${savg}%`, background: ok ? '#86efac' : '#fca5a5', borderRadius: 3, borderRight: `2px solid ${ok ? '#166634' : '#991b1b'}` }} />
                  <div style={{ position: 'absolute', top: -2, left: `${cls.benchmark}%`, width: 2, height: 10, background: '#94a3b8', borderRadius: 1 }} />
                </div>
                <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, marginTop: 3 }}>{savg}% / {cls.benchmark}% GOAL</div>
              </div>
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: ok ? '#166534' : '#991b1b', width: 54, textAlign: 'right', flexShrink: 0 }}>{savg}%</div>
              <span style={{ fontSize: 10, padding: '4px 0', borderRadius: 4, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b', fontWeight: 800, fontFamily: F, letterSpacing: '1px', width: 82, textAlign: 'center', flexShrink: 0, display: 'inline-block' }}>
                {ok ? 'PASSING' : 'NEEDS HELP'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Students Page ─────────────────────────────────────────────────────────────
function StudentsPage({ teachers, allClasses, onOpenStudent }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'passing' | 'atrisk'

  // Build one entry per unique student name, aggregating across all their classes
  const studentMap = {}
  allClasses.forEach(cls => {
    const teacher = teachers.find(t => t.classes.find(c => c.id === cls.id))
    cls.students.forEach(s => {
      if (!studentMap[s.name]) {
        studentMap[s.name] = {
          name: s.name, grade: s.grade,
          enrollments: [], // { cls, student, teacher, avg, passing }
        }
      }
      const avg = getAvg(s.scores)
      studentMap[s.name].enrollments.push({
        cls, student: s, teacher,
        avg, passing: avg >= cls.benchmark,
      })
    })
  })

  const allStudents = Object.values(studentMap).map(entry => {
    const totalAvg = Math.round(entry.enrollments.reduce((a, e) => a + e.avg, 0) / entry.enrollments.length)
    const failingClasses = entry.enrollments.filter(e => !e.passing)
    const allPassing = failingClasses.length === 0
    // Use first enrollment for click-through
    const firstEnroll = entry.enrollments[0]
    return { ...entry, totalAvg, failingClasses, allPassing, firstEnroll }
  }).sort((a, b) => a.totalAvg - b.totalAvg)

  const atRisk  = allStudents.filter(s => !s.allPassing)
  const passing = allStudents.filter(s => s.allPassing)

  const filtered = (filter === 'atrisk' ? atRisk : filter === 'passing' ? passing : allStudents)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  function handleOpenStudent(entry) {
    const e = entry.firstEnroll
    onOpenStudent(e.student.id, e.cls.id)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: '#8888aa', textTransform: 'uppercase', marginBottom: 6 }}>ROSTER</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1px', fontFamily: F }}>Students</h1>
        </div>
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search students..."
          style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid #e2ddd6', fontFamily: F, fontSize: 13, width: 220, outline: 'none', background: '#fff', color: '#1a1a2e' }}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { val: allStudents.length, label: 'TOTAL STUDENTS', bg: pastel(0).bg, color: pastel(0).dark },
          { val: passing.length,     label: 'ALL PASSING',    bg: '#a8e6cf',    color: '#0d5c30' },
          { val: atRisk.length,      label: 'NEEDS ATTENTION',bg: '#f5b8c4',    color: '#7a1522' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 20, padding: '18px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 34, color: s.color, fontFamily: F, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.color, opacity: .7, letterSpacing: '1.5px', marginTop: 6 }}>{s.label}</div>
            <div style={{ position: 'absolute', right: -12, bottom: -12, width: 60, height: 60, borderRadius: '50%', background: s.color, opacity: .06 }} />
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '2px solid #ede8e0' }}>
        {[['all','ALL STUDENTS'], ['atrisk','NEEDS ATTENTION'], ['passing','PASSING']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            padding: '10px 22px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: filter === id ? '#1a1a2e' : '#aaa',
            fontWeight: filter === id ? 800 : 600,
            fontSize: 11, letterSpacing: '1.5px', fontFamily: F,
            borderBottom: filter === id ? '2px solid #1a1a2e' : '2px solid transparent',
            marginBottom: -2, transition: 'all .15s',
          }}>{label} <span style={{ fontSize: 10, opacity: .6 }}>({(id === 'all' ? allStudents : id === 'atrisk' ? atRisk : passing).length})</span></button>
        ))}
      </div>

      {/* Student list */}
      <div style={{ background: '#fff', borderRadius: '0 0 24px 24px', boxShadow: '0 2px 16px rgba(26,26,46,0.05)', overflow: 'hidden' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8888aa', fontFamily: F, fontSize: 14 }}>
            {search ? `No students matching "${search}"` : 'No students in this category'}
          </div>
        )}
        {filtered.map((entry, i) => {
          const sp = pastel(i % 7)
          const isLast = i === filtered.length - 1
          return (
            <div key={entry.name} onClick={() => handleOpenStudent(entry)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 24px',
              borderBottom: isLast ? 'none' : '1px solid #f7f4f0',
              cursor: 'pointer', transition: 'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7f4f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              {/* Avatar */}
              <PersonIconSquare size={38} borderRadius="50%" bg={sp.bg} color={sp.dark} />

              {/* Name + failing classes */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: F }}>{entry.name}</div>
                {entry.grade && (
                  <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, letterSpacing: '.5px', marginTop: 1 }}>
                    GRADE {entry.grade}
                  </div>
                )}
                {!entry.allPassing && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {entry.failingClasses.map(e => (
                      <span key={e.cls.id} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 6,
                        background: '#fee2e2', color: '#991b1b', fontWeight: 700,
                      }}>
                        {e.cls.name} · {e.avg}%
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Class count pills */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {entry.enrollments.map(e => {
                  const cp = pastel(teachers.findIndex(t => t.id === e.teacher?.id))
                  return (
                    <span key={e.cls.id} title={`${e.cls.name}: ${e.avg}%`} style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 8,
                      background: e.passing ? cp.bg : '#fee2e2',
                      color: e.passing ? cp.dark : '#991b1b',
                      fontWeight: 700,
                    }}>
                      {e.cls.name.split(' ')[0]}
                    </span>
                  )
                })}
              </div>

              {/* Overall avg */}
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: entry.allPassing ? '#166534' : '#991b1b', width: 52, textAlign: 'right', flexShrink: 0 }}>
                {entry.totalAvg}%
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 20,
                background: entry.allPassing ? '#dcfce7' : '#fee2e2',
                color: entry.allPassing ? '#166534' : '#991b1b',
                fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {entry.allPassing ? 'PASSING' : `${entry.failingClasses.length} CLASS${entry.failingClasses.length > 1 ? 'ES' : ''} BELOW`}
              </span>

              <span style={{ fontSize: 12, color: '#ccc', flexShrink: 0 }}>→</span>
            </div>
          )
        })}
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
          <thead><tr>{['CLASS','TEACHER','STUDENTS','AVG','BENCHMARK','STATUS'].map(h => <th key={h} style={{ textAlign: h==='CLASS'||h==='TEACHER'?'left':'center', padding: '8px 10px', color: '#8888aa', fontWeight: 700, fontSize: 11, letterSpacing: '1px', borderBottom: '2px solid #f0ece6' }}>{h}</th>)}</tr></thead>
          <tbody>
            {allClasses.map((cls, i) => {
              const teacher = teachers.find(t => t.classes.find(c => c.id === cls.id))
              const avg = classAvg(cls); const ok = avg >= cls.benchmark
              return (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#1a1a2e', fontFamily: F }}>{cls.name}</td>
                  <td style={{ padding: '10px', color: '#3d3d5c' }}>{teacher?.name.split(' ').slice(1).join(' ')}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#3d3d5c' }}>{cls.students.length}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: ok ? '#0d5c30' : '#7a1522', fontFamily: F }}>{avg}%</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#3d3d5c' }}>{cls.benchmark}%</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}><span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', fontWeight: 700 }}>{ok ? 'On Track' : 'Below'}</span></td>
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
