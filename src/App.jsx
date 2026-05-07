// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root component: handles role selection and top-level navigation state.
//
// Navigation state:
//   role          'teacher' | 'admin' | null
//   currentTeacher  teacher object (teacher mode)
//   currentClassId  number | null
//   currentStudentId number | null
//
// All data lives in the `teachers` array (mutated in place for simplicity).
// For production you would lift this into a proper store or backend.

import React, { useState } from 'react'
import { SEED_TEACHERS } from './data/seed.js'
import RoleSelect from './components/RoleSelect.jsx'
import TeacherDash from './components/TeacherDash.jsx'
import ClassDetail from './components/ClassDetail.jsx'
import StudentDetail from './components/StudentDetail.jsx'
import AdminDash from './components/AdminDash.jsx'

export default function App() {
  // Deep-copy seed data once so mutations don't affect the import
  const [teachers] = useState(() => JSON.parse(JSON.stringify(SEED_TEACHERS)))

  const [role, setRole] = useState(null)                  // 'teacher' | 'admin' | null
  const [currentTeacherId, setCurrentTeacherId] = useState(null)
  const [currentClassId, setCurrentClassId]    = useState(null)
  const [currentStudentId, setCurrentStudentId] = useState(null)

  // ── Derived lookups ──────────────────────────────────────────────────────
  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || null
  const currentClass   = teachers.flatMap(t => t.classes).find(c => c.id === currentClassId) || null
  const currentStudent = teachers.flatMap(t => t.classes).flatMap(c => c.students).find(s => s.id === currentStudentId) || null

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleSelectRole(r) {
    setRole(r)
    if (r === 'teacher') setCurrentTeacherId(teachers[0]?.id || null)
  }

  function handleSignOut() {
    setRole(null)
    setCurrentTeacherId(null)
    setCurrentClassId(null)
    setCurrentStudentId(null)
  }

  function handleOpenClass(classId) {
    setCurrentClassId(classId)
    setCurrentStudentId(null)
  }

  function handleOpenStudent(studentId) {
    setCurrentStudentId(studentId)
  }

  function handleBackFromStudent() {
    setCurrentStudentId(null)
  }

  function handleBackFromClass() {
    setCurrentClassId(null)
    setCurrentStudentId(null)
  }

  function handleSwitchTeacher(teacherId) {
    setCurrentTeacherId(teacherId)
    setCurrentClassId(null)
    setCurrentStudentId(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  // Not logged in
  if (!role) {
    return <RoleSelect onSelect={handleSelectRole} />
  }

  // Admin path
  if (role === 'admin') {
    return (
      <AdminDash
        teachers={teachers}
        onSignOut={handleSignOut}
      />
    )
  }

  // Teacher path — drill-down: dash → class → student
  if (currentStudent && currentClass) {
    return (
      <StudentDetail
        student={currentStudent}
        cls={currentClass}
        teacherName={currentTeacher?.name}
        onBack={handleBackFromStudent}
        onSignOut={handleSignOut}
      />
    )
  }

  if (currentClass) {
    return (
      <ClassDetail
        cls={currentClass}
        teacherName={currentTeacher?.name}
        onBack={handleBackFromClass}
        onOpenStudent={handleOpenStudent}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <TeacherDash
      teachers={teachers}
      currentTeacher={currentTeacher}
      onSwitchTeacher={handleSwitchTeacher}
      onOpenClass={handleOpenClass}
      onSignOut={handleSignOut}
    />
  )
}
