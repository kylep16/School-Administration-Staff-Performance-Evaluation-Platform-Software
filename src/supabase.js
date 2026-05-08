// src/supabase.js
// All database operations for EduIQ

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Students ──────────────────────────────────────────────────────────────────

export async function addStudent({ name, grade, classId }) {
  // 1. Insert student
  const { data: student, error: sErr } = await supabase
    .from('students')
    .insert({ name, grade })
    .select()
    .single()
  if (sErr) throw sErr

  // 2. Enroll in class
  const { error: eErr } = await supabase
    .from('enrollments')
    .insert({ student_id: student.id, class_id: classId })
  if (eErr) throw eErr

  return student
}

export async function getStudentsForClass(classId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      students ( id, name, grade ),
      scores ( topic, score )
    `)
    .eq('class_id', classId)
  if (error) throw error
  return data
}

// ── Scores ────────────────────────────────────────────────────────────────────

export async function addScore({ studentId, classId, topic, score }) {
  // Find enrollment
  const { data: enrollment, error: eErr } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single()
  if (eErr) throw eErr

  const { data, error } = await supabase
    .from('scores')
    .insert({ enrollment_id: enrollment.id, topic, score })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Performance Reviews ───────────────────────────────────────────────────────

export async function saveReview(review) {
  const payload = {
    teacher_id: review.teacherId,
    reviewer: review.reviewer,
    cycle: review.cycle,
    status: review.status,
    overall: review.overall,
    instruction: review.categories.instruction,
    classroom: review.categories.classroom,
    professionalism: review.categories.professionalism,
    growth: review.categories.growth,
    collaboration: review.categories.collaboration,
    strengths: review.strengths,
    improvements: review.improvements,
    goals: review.goals,
    ai_summary: review.aiSummary,
    review_date: review.date,
  }

  if (review.dbId) {
    // Update existing
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(payload)
      .eq('id', review.dbId)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function getReviews() {
  const { data, error } = await supabase
    .from('performance_reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Observations ──────────────────────────────────────────────────────────────

export async function saveObservation(obs) {
  const payload = {
    teacher_id: obs.teacherId,
    class_id: obs.classId,
    observer: obs.observer,
    observation_date: obs.date,
    duration: obs.duration,
    type: obs.type,
    status: obs.status,
    environment: obs.environment,
    engagement: obs.engagement,
    instruction: obs.instruction,
    management: obs.management,
    notes: obs.notes,
    commendations: obs.commendations,
    recommendations: obs.recommendations,
    ai_summary: obs.aiSummary,
  }

  if (obs.dbId) {
    const { data, error } = await supabase
      .from('observations')
      .update(payload)
      .eq('id', obs.dbId)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('observations')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function getObservations() {
  const { data, error } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
