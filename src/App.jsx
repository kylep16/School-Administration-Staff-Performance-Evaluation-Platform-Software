import React, { useState } from 'react'
import { SEED_TEACHERS } from './data/seed.js'
import RoleSelect from './components/RoleSelect.jsx'
import TeacherDash from './components/TeacherDash.jsx'
import ClassDetail from './components/ClassDetail.jsx'
import StudentDetail from './components/StudentDetail.jsx'
import AdminDash from './components/AdminDash.jsx'
import { AIProvider } from './AIContext.jsx'

export default function App() {
  const [teachers] = useState(() => JSON.parse(JSON.stringify(SEED_TEACHERS)))
  const [role, setRole] = useState(null)
  const [currentTeacherId, setCurrentTeacherId] = useState(null)
  const [currentClassId, setCurrentClassId]     = useState(null)
  const [currentStudentId, setCurrentStudentId] = useState(null)

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || null
  const currentClass   = teachers.flatMap(t => t.classes).find(c => c.id === currentClassId) || null
  const currentStudent = teachers.flatMap(t => t.classes).flatMap(c => c.students).find(s => s.id === currentStudentId) || null

  function handleSelectRole(r) { setRole(r); if (r === 'teacher') setCurrentTeacherId(teachers[0]?.id || null) }
  function handleSignOut() { setRole(null); setCurrentTeacherId(null); setCurrentClassId(null); setCurrentStudentId(null) }
  function handleOpenClass(classId) { setCurrentClassId(classId); setCurrentStudentId(null) }
  function handleOpenStudent(studentId) { setCurrentStudentId(studentId) }
  function handleBackFromStudent() { setCurrentStudentId(null) }
  function handleBackFromClass() { setCurrentClassId(null); setCurrentStudentId(null) }
  function handleSwitchTeacher(teacherId) { setCurrentTeacherId(teacherId); setCurrentClassId(null); setCurrentStudentId(null) }

  return (
    <AIProvider>
      {!role && <RoleSelect onSelect={handleSelectRole} />}

      {role === 'admin' && (
        <AdminDash teachers={teachers} onSignOut={handleSignOut} />
      )}

      {role === 'teacher' && currentStudent && currentClass && (
        <StudentDetail student={currentStudent} cls={currentClass} teacherName={currentTeacher?.name} onBack={handleBackFromStudent} onSignOut={handleSignOut} />
      )}

      {role === 'teacher' && !currentStudent && currentClass && (
        <ClassDetail cls={currentClass} teacherName={currentTeacher?.name} onBack={handleBackFromClass} onOpenStudent={handleOpenStudent} onSignOut={handleSignOut} />
      )}

      {role === 'teacher' && !currentStudent && !currentClass && (
        <TeacherDash teachers={teachers} currentTeacher={currentTeacher} onSwitchTeacher={handleSwitchTeacher} onOpenClass={handleOpenClass} onSignOut={handleSignOut} />
      )}
    </AIProvider>
  )
}
