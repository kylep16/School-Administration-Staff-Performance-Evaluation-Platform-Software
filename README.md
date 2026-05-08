# EduIQ

A school administration and staff performance evaluation platform built for K-12 institutions. Supports three distinct user roles with purpose-built workflows for each.

---

## Features

### Admin Portal
- School-wide dashboard with live stats: total students, teacher count, classes at benchmark, pending reviews and observations
- Full drill-down navigation: Admin > Teacher > Class > Student
- **Performance Review workflow** - structured rubric scoring across 5 categories (Instructional Quality, Classroom Environment, Professionalism, Professional Growth, Collaboration), freeform notes, and AI-generated formal summaries written to HR standards. Completed reviews persist to the database
- **Classroom Observation workflow** - schedule formal, walkthrough, or informal observations, score 4 metrics in real time, capture commendations and recommendations, generate AI observation reports. Saved observations persist to the database
- Unified student roster deduplicating 300 students across 15 classes with search, filter tabs, and at-risk highlighting
- Analytics page with class performance table and teacher comparison chart

### Teacher Portal
- Class overview with stamp cards colored green or red based on benchmark performance
- Large class accommodation: classes with 30+ students show ! / !! / !!!+ instead of individual dots
- Per-class student roster with aligned progress bars and benchmark tick marks
- All-students dashboard overlay grouped by grade level
- Add Score workflow with multi-step modal: select class, select students, enter scores with live pass/fail feedback
- Goal tracking with progress visualization

### Student Detail
- Score history grid and bar chart
- Topic-by-topic breakdown sorted by greatest need
- Admin-only class switcher dropdown: shows all enrolled classes across teachers with per-class averages
- Teachers only see scores for their own class

### AI Features
- Streaming AI notes on every teacher dashboard, class detail, student detail, performance review, and classroom observation
- Global AI ON/OFF toggle via React Context, shared across all components
- All prompts are context-aware: student name, class, scores, benchmark, and trend data are injected before calling the model

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Runtime | Bun |
| Backend / Database | Supabase (PostgreSQL) |
| API | Supabase REST API via supabase-js |
| AI | Anthropic Claude API (claude-sonnet-4-5, streaming) |
| State | React useState / useContext |
| Styling | Inline styles with consistent design tokens |

---

## Architecture

### Frontend
Single-page React app with no router. Navigation is handled as a state machine in App.jsx where each view is conditionally rendered based on role, currentClassId, and currentStudentId. This keeps the codebase flat and is straightforward to migrate to React Router when needed.

### Backend
Supabase provides a managed PostgreSQL database with an auto-generated REST API. The src/supabase.js module handles all database operations. The frontend reads from the seed data layer for speed and writes mutations (new students, finalized reviews, saved observations) to the database for persistence.

### Database Schema

```
teachers
  id, name, subject, email, avatar

classes
  id, teacher_id (fk), name, period, benchmark

students
  id, name, grade

enrollments
  id, student_id (fk), class_id (fk)   -- many-to-many join table

scores
  id, enrollment_id (fk), topic, score

performance_reviews
  id, teacher_id (fk), reviewer, cycle, status, overall,
  instruction, classroom, professionalism, growth, collaboration,
  strengths, improvements, goals, ai_summary, review_date

observations
  id, teacher_id (fk), class_id (fk), observer, observation_date,
  duration, type, status, environment, engagement, instruction,
  management, notes, commendations, recommendations, ai_summary
```

Row Level Security is enabled on all tables. The prototype uses open policies for the anon key. In production these would be scoped to authenticated users by role.

### Data Flow
- **Reads**: seed data in src/data/seed.js -- 300 students across 15 classes, structured to mirror the database schema
- **Writes**: new students, performance reviews, and observations are written to Supabase on save
- **AI**: all AI calls use server-sent events streaming via the Anthropic API. A single streamClaude utility handles streaming across all components

### Enrollment Model
All 300 students are enrolled in Math, English, and Science at the same period slot with no conflicts. The admin class switcher resolves cross-teacher enrollment by matching students by name. In production this would be a foreign key lookup against the enrollments table.

---

## Project Structure

```
src/
  components/
    AdminDash.jsx       -- Admin portal, all pages and drill-down navigation
    TeacherDash.jsx     -- Teacher dashboard with class stamp cards
    ClassDetail.jsx     -- Per-class student roster and all-students overlay
    StudentDetail.jsx   -- Student profile, score history, class switcher
    RoleSelect.jsx      -- Landing page and role selection
    UI.jsx              -- Shared components: Modal, FormGroup, AIBox, BackBtn
  data/
    seed.js             -- 300 students across 15 classes, no scheduling conflicts
  supabase.js           -- All database operations (addStudent, saveReview, saveObservation)
  AIContext.jsx         -- Global AI toggle state via React Context
  App.jsx               -- Top-level routing via state machine
  utils.js              -- classAvg, classPassing, getAvg helpers
supabase_schema.sql     -- Full database schema, run in Supabase SQL Editor
```

---

## Setup

```bash
# Install dependencies
bun install

# Add environment variables to .env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_KEY=your_anthropic_key

# Run the schema in your Supabase SQL Editor
# (see supabase_schema.sql)

# Start dev server
bun dev
```

To add a hero image on the landing page, open RoleSelect.jsx and set:

```js
const HERO_IMAGE_SRC = '/your-image.jpg' // place image in /public
```

---

## Key Implementation Decisions

**Supabase for backend.** Supabase provides a production-grade PostgreSQL database with a REST API and SDK with no server to manage. The schema uses foreign keys and a normalized enrollment join table rather than embedding student arrays in teacher documents, which would be the wrong structure for a relational data model.

**Writes to database, reads from seed.** Rather than doing a full Supabase migration for 300 students, the prototype uses structured seed data for reads and Supabase for writes. This keeps the demo fast while demonstrating real database persistence for the operations that matter: adding students, completing reviews, and saving observations.

**Streaming AI responses.** Each AI call opens a Server-Sent Events stream and appends chunks to state as they arrive. The user sees text appear in real time rather than waiting for a full response. A single streamClaude utility handles this across all components.

**Role-aware components.** StudentDetail accepts a role prop. Admins see a class switcher dropdown showing all enrolled classes. Teachers see only their own class data. The same component serves both use cases without duplication.

**No router.** Navigation is a state machine in App.jsx. The admin view uses a single adminView object with type, teacherId, classId, studentId, and origin to handle the full Teacher > Class > Student drill-down and back navigation without URL routing.

---

Built by Kyle Phan for the Dynamic Active internship evaluation.