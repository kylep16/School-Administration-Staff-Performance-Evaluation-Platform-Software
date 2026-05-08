# EduIQ

A school administration and staff performance evaluation platform built for K-12 institutions. Supports three distinct user roles with purpose-built workflows for each.

---

## Features

### Admin Portal
- School-wide dashboard with live stats: total students, teacher count, classes at benchmark, pending reviews and observations
- Full drill-down navigation: Admin > Teacher > Class > Student
- **Performance Review workflow** - structured rubric scoring across 5 categories (Instructional Quality, Classroom Environment, Professionalism, Professional Growth, Collaboration), freeform notes, and AI-generated formal summaries written to HR standards
- **Classroom Observation workflow** - schedule formal, walkthrough, or informal observations, score 4 metrics in real time, capture commendations and recommendations, generate AI observation reports
- Unified student roster deduplicating 300 students across 15 classes with search, filter tabs, and at-risk highlighting
- Analytics page with class performance table and teacher comparison chart

### Teacher Portal
- Class overview with stamp cards colored green or red based on benchmark performance
- Large class accommodation: classes with 30+ students show `!` / `!!` / `!!!+` instead of individual dots
- Per-class student roster with aligned progress bars and benchmark tick marks
- All-students dashboard overlay grouped by grade level
- Add Score workflow with multi-step modal: select class, select students, enter scores with live pass/fail feedback
- Goal tracking with progress visualization

### Student Detail
- Score history grid and bar chart
- Topic-by-topic breakdown sorted by greatest need
- Admin-only class switcher dropdown: shows all enrolled classes across teachers with per-class averages. Uses `position: fixed` and `getBoundingClientRect()` so it renders above all parent overflow constraints
- Teachers only see scores for their own class

### AI Features
- Streaming AI notes on every teacher dashboard, class detail, student detail, performance review, and classroom observation
- Global AI ON/OFF toggle via React Context, shared across all components. Disabling it skips all API calls instantly
- All prompts are context-aware: student name, class, scores, benchmark, and trend data are injected before calling the model

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Runtime | Bun |
| Styling | Inline styles with consistent design tokens |
| AI | Anthropic Claude API (claude-sonnet-4-5, streaming) |
| State | React useState / useContext |
| Data | Structured seed layer (300 students, 3 teachers, 15 classes) |

No backend, no database, no build-time CSS framework. All state lives in React. The seed data structure mirrors a normalized relational schema (teachers > classes > students) and is designed to be swapped for real API calls with minimal refactoring.

---

## Project Structure

```
src/
  components/
    AdminDash.jsx       # Admin portal, all pages and drill-down navigation
    TeacherDash.jsx     # Teacher dashboard with class stamp cards
    ClassDetail.jsx     # Per-class student roster and all-students overlay
    StudentDetail.jsx   # Student profile, score history, class switcher
    RoleSelect.jsx      # Landing page and role selection
    UI.jsx              # Shared components: Modal, FormGroup, AIBox, BackBtn
  data/
    seed.js             # 300 students across 15 classes, no scheduling conflicts
  AIContext.jsx         # Global AI toggle state via React Context
  App.jsx               # Top-level routing via state machine
  utils.js              # classAvg, classPassing, getAvg helpers
```

---

## Setup

```bash
# Install dependencies
bun install

# Add your Anthropic API key to .env
echo "VITE_ANTHROPIC_KEY=your_key_here" > .env

# Start dev server
bun dev
```

Requires Node 18+ or Bun. API key must have access to `claude-sonnet-4-5`.

To add a hero image on the landing page, open `RoleSelect.jsx` and set:

```js
const HERO_IMAGE_SRC = '/your-image.jpg' // place image in /public
```

---

## Data Model

Each student is enrolled in one class per teacher with no period conflicts. All 300 students attend Math, English, and Science at the same period slot. The admin class switcher resolves cross-teacher enrollment by matching students on name across the seed data.

```
Teacher (3)
  Class (5 per teacher, 60 students each)
    Student (name, grade, scores[], topics[])
```

20 students are seeded below benchmark across all classes to demonstrate the at-risk workflows.

---

## Key Implementation Decisions

**No router.** Navigation is a state machine in `App.jsx`. Each view is conditionally rendered based on `role`, `currentClassId`, and `currentStudentId`. This keeps the codebase flat and eliminates route configuration overhead for a prototype.

**Streaming AI responses.** Each AI call opens a Server-Sent Events stream and appends chunks to state as they arrive. The user sees text appear in real time rather than waiting for a full response. A single `streamClaude` utility function handles this across all components.

**Role-aware components.** `StudentDetail` accepts a `role` prop. Admins see the class switcher dropdown showing all enrolled classes. Teachers see only their own class data. The same component serves both use cases.

**Admin drill-down without a router.** The admin view uses a single `adminView` state object with `{ type, teacherId, classId, studentId, origin }`. Switching between Teacher > Class > Student > back to Students list is handled by updating this object, not navigating to a URL.

---

Built by Kyle Phan for the Dynamic Active internship evaluation.
