// ─── EduPulse Utility Helpers ────────────────────────────────────────────────

/** Average of a score array, rounded to nearest integer */
export function getAvg(scores) {
  if (!scores || scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

/** Class-wide average across all students */
export function classAvg(cls) {
  if (!cls.students.length) return 0
  return Math.round(cls.students.reduce((a, s) => a + getAvg(s.scores), 0) / cls.students.length)
}

/** Count of students at or above benchmark */
export function classPassing(cls) {
  return cls.students.filter(s => getAvg(s.scores) >= cls.benchmark).length
}

/** Avatar background/text color pair based on name hash */
export function avatarColors(str) {
  const palette = [
    ['#e8e4ff', '#4040b0'],
    ['#ffeacc', '#8a5200'],
    ['#d0f5e8', '#0d5c40'],
    ['#ffd8dc', '#7a1522'],
    ['#d8eaff', '#0d3077'],
    ['#f5e8ff', '#5a1a7a'],
  ]
  let hash = 0
  for (const c of str) hash += c.charCodeAt(0)
  return palette[hash % palette.length]
}

/** Score color: green if passing, red if not */
export function scoreColor(score, benchmark) {
  return score >= benchmark ? 'var(--mint)' : 'var(--rose)'
}

/** Badge variant based on score vs benchmark */
export function scoreBadge(score, benchmark) {
  return score >= benchmark ? 'badge-mint' : 'badge-rose'
}

/** Generate initials from full name */
export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/** Clamp a number to [0, 100] for progress bars */
export function clamp100(val) {
  return Math.min(100, Math.max(0, Math.round(val)))
}
