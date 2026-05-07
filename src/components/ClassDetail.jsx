import React, { useEffect, useState } from 'react'
import { classAvg, classPassing, getAvg } from '../utils.js'
import { pastel, AIBox, BackBtn, Modal, FormGroup, TextInput, Notification } from './UI.jsx'

const F = "'Bricolage Grotesque', sans-serif"

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

export default function ClassDetail({ cls, teacherName, onBack, onOpenStudent, onSignOut }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [sForm, setSForm] = useState({ name: '', score: '' })
  const [bmForm, setBmForm] = useState(String(cls.benchmark))
  const [notif, setNotif] = useState(null)
  const [, forceUpdate] = useState(0)

  const avg = classAvg(cls)
  const passing = classPassing(cls)
  const isPassing = avg >= cls.benchmark
  const p = pastel(cls.id % 7)

  useEffect(() => {
    setAiText(''); setAiLoading(true)
    const below = cls.students.filter(s => getAvg(s.scores) < cls.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
    const above = cls.students.filter(s => getAvg(s.scores) >= cls.benchmark).map(s => `${s.name} (${getAvg(s.scores)}%)`)
    const critical = cls.students.filter(s => getAvg(s.scores) < 60).map(s => s.name)

    // Find weakest topic across all students
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

    const prompt = `You are an education coach giving a teacher specific class-level feedback. Use bullet points. Reference students by name. Be direct.

Class: ${cls.name}
Benchmark: ${cls.benchmark}%
Class average: ${avg}%
Students below benchmark: ${below.length ? below.join(', ') : 'none'}
Students at/above benchmark: ${above.join(', ')}
Critical (below 60%): ${critical.length ? critical.join(', ') : 'none'}
Weakest class topic: ${weakestTopic ? weakestTopic.topic + ' (' + weakestTopic.avg + '% avg)' : 'unknown'}

Give 3-4 bullet points using specific language like:
- "Re-teach [topic] to the whole class — class average is X%"
- "Call on [student] more to check their understanding of [topic]"
- "Consider pulling [students] for a small group session on [topic]"
- "Re-test [topic] after a targeted review session"
- "[Student] is close to benchmark — a little extra attention could push them over"
No intro text, just bullets. One sentence each.`
    streamClaude(prompt, c => setAiText(prev => prev + c), () => setAiLoading(false))
  }, [cls.id])

  function addStudent() {
    if (!sForm.name) { setNotif('Name required'); return }
    cls.students.push({ id: Date.now(), name: sForm.name, scores: [parseInt(sForm.score) || 70], topics: ['Topic 1'] })
    setSForm({ name: '', score: '' }); setModal(null); setNotif(`${sForm.name} added!`); forceUpdate(n => n + 1)
  }

  function saveBenchmark() {
    cls.benchmark = parseInt(bmForm) || 70
    setModal(null); setNotif(`Benchmark updated to ${cls.benchmark}%`); forceUpdate(n => n + 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4f0', fontFamily: F }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede8e0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>EduPulse</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ background: '#a8c8f8', color: '#1a3a8a', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: F }}>{teacherName}</span>
          <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #e2ddd6', background: 'transparent', color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
        <BackBtn label="Back to Classes" onClick={onBack} />

        {/* Hero — sharp top border, no rounded corners */}
        <div style={{ background: p.bg, padding: '30px 36px', marginBottom: 0, position: 'relative', overflow: 'hidden', borderTop: `4px solid ${p.dark}` }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: p.dark, opacity: .05 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: p.dark, opacity: .6, marginBottom: 6 }}>{cls.period.toUpperCase()} PERIOD</div>
              <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: 40, color: p.dark, letterSpacing: '-1px', lineHeight: 1, marginBottom: 8 }}>{cls.name.toUpperCase()}</h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setModal('benchmark')} style={{ padding: '7px 16px', border: `2px solid ${p.dark}44`, borderRadius: 4, background: 'rgba(255,255,255,0.45)', color: p.dark, fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>EDIT BENCHMARK</button>
                <button onClick={() => setModal('addStudent')} style={{ padding: '7px 16px', border: 'none', borderRadius: 4, background: p.dark, color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: F, letterSpacing: '1px' }}>+ ADD STUDENT</button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 64, color: p.dark, lineHeight: 1 }}>{avg}<span style={{ fontSize: 28 }}>%</span></div>
              <div style={{ fontSize: 10, fontWeight: 800, color: p.dark, opacity: .55, letterSpacing: '2px' }}>CLASS AVERAGE</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: p.dark, opacity: .6, marginTop: 4 }}>GOAL: {cls.benchmark}% · {passing}/{cls.students.length} PASSING</div>
            </div>
          </div>
        </div>

        {/* Students list — sharp white box */}
        <div style={{ background: '#fff', borderRadius: 0, padding: '0', borderBottom: '1px solid #ede8e0' }}>
          <div style={{ padding: '18px 28px 12px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: '#8888aa' }}>ROSTER — {cls.students.length} STUDENTS</div>
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
                display: 'flex', alignItems: 'center', padding: '16px 28px',
                borderBottom: isLast ? 'none' : '1px solid #f7f4f0',
                gap: 16, cursor: 'pointer', transition: 'background .12s',
                background: 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7f4f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar — rounded square */}
                <div style={{ width: 46, height: 46, borderRadius: 12, background: sp.bg, color: sp.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: F }}>
                  {s.name.split(' ').map(w => w[0]).join('')}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', fontFamily: F }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '.5px', marginTop: 2 }}>
                    {s.scores.length} ASSESSMENTS · LATEST: {s.scores[s.scores.length-1]}%
                  </div>
                </div>

                {/* Inline bar */}
                <div style={{ width: 100 }}>
                  <div style={{ height: 5, background: '#f0ece6', borderRadius: 0 }}>
                    <div style={{ height: '100%', width: `${savg}%`, background: ok ? '#a8e6cf' : '#f5b8c4', borderRadius: 0, borderRight: `2px solid ${ok ? '#0d5c30' : '#7a1522'}` }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, marginTop: 3, letterSpacing: '.5px' }}>{savg}% / {cls.benchmark}% GOAL</div>
                </div>

                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 22, color: ok ? '#0d5c30' : '#7a1522', minWidth: 52, textAlign: 'right' }}>{savg}%</div>

                {/* Sharp badge */}
                <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, background: ok ? '#a8e6cf' : '#f5b8c4', color: ok ? '#0d5c30' : '#7a1522', fontWeight: 800, fontFamily: F, letterSpacing: '1px', minWidth: 80, textAlign: 'center' }}>
                  {ok ? 'PASSING' : 'NEEDS HELP'}
                </span>
              </div>
            )
          })}
        </div>

        {/* AI Notes */}
        <div style={{ marginTop: 0 }}>
          <AIBox text={aiText} loading={aiLoading} />
        </div>
      </div>

      {modal === 'addStudent' && (
        <Modal title={`Add Student to ${cls.name}`} onClose={() => setModal(null)}>
          <FormGroup label="Student Name"><TextInput value={sForm.name} onChange={v => setSForm(f=>({...f,name:v}))} placeholder="First Last" /></FormGroup>
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
