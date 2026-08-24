# Class Coursework Management System — Build Plan

Derived from `business-logic.md`, `design.md`, and `tech-stack.md`. Phases are ordered by
dependency: each phase assumes the previous ones are functionally complete. Do not skip ahead —
e.g. marking cannot be built meaningfully without submissions, and submissions cannot be built
without published coursework, which cannot exist without courses/groups/lecturers.

Stack lock-in (from tech-stack.md, do not deviate without a reason):
Next.js + TypeScript, Tailwind + shadcn/ui, Prisma + PostgreSQL (Supabase), Supabase Auth,
Supabase Storage, Zod + React Hook Form, Vercel hosting.

---

## Phase 0 — Project Foundation

**Goal:** A running skeleton with no business logic yet, but every architectural decision made.

- [ ] `create-next-app` with TypeScript, App Router, Tailwind, strict mode.
- [ ] Init shadcn/ui; pull in Button, Input, Select, Dialog, Dropdown Menu, Tabs, Table, Card,
      Badge, Toast, Alert, Calendar, Date Picker, Sidebar, Form.
- [ ] Create Supabase project (dev). Capture `DATABASE_URL`, `DIRECT_URL`,
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
      in `.env.local` (never committed).
- [ ] Install core deps: `prisma @prisma/client @supabase/supabase-js @supabase/ssr zod
      react-hook-form @hookform/resolvers`.
- [ ] Scaffold folder structure per tech-stack.md §35: `app/{login,admin,lecturer,leader,api}`,
      `components/{ui,dashboard,coursework,submissions,marking,groups}`,
      `lib/{auth,db,storage,validation,permissions}`, `prisma/`, `types/`, `tests/`.
- [ ] Define design tokens in Tailwind config: colors (bg `#F8FAFC`, surface `#FFFFFF`, text
      `#0F172A`/`#64748B`, border `#E2E8F0`, one indigo/blue accent, green/amber/red semantic
      colors), spacing scale (4/8/12/16/20/24/32/40/48), radii (buttons/inputs 8px, cards
      10–12px, dialogs 12px), type scale per design.md §7.
- [ ] Set up GitHub repo with `main` + `development` branches; branch protection optional but
      recommended.
- [ ] Deploy an empty shell to Vercel early so the pipeline is proven before real work starts.

**Definition of done:** `npm run dev` boots, Tailwind + shadcn render a styled placeholder page,
Vercel preview deploy succeeds, Supabase connection verified with a trivial query.

---

## Phase 1 — Data Model & Auth Foundation

**Goal:** Every entity in business-logic.md §34 exists as a Prisma schema with correct
relationships and constraints; the three roles can be authenticated.

### 1.1 Prisma schema

Model exactly these entities and relationships (business-logic.md §34, tech-stack.md §8/§24):

```
User (id, email, role[ADMIN|LECTURER|GROUP_LEADER], name, active, timestamps)
Course (id, name, code, lecturerId, timestamps)
Group (id, name, courseId, leaderId, timestamps)
GroupMember (id, groupId, name, registrationNumber, course, timestamps)
Coursework (id, courseId, lecturerId, title, instructions, maxMarks, deadline,
            allowLateSubmission, status[DRAFT|PUBLISHED|CLOSED], createdAt, publishedAt)
CourseworkGroup (courseworkId, groupId)  -- join table for "assigned groups"
Submission (id, courseworkId, groupId, fileName, filePath, fileSize, mimeType,
            submittedAt, version, status[SUBMITTED|LATE])
Mark (id, submissionId, awarded, maxMarks, feedback, rubricJson?, status[SAVED|PUBLISHED],
      markedAt, publishedAt)
AuditLog (id, userId, action, resourceType, resourceId, metadata(json), createdAt)
```

- [ ] Enforce constraints from business-logic.md §30 at the schema/application level:
  - Group must belong to a Course; one leader per Group.
  - Coursework must belong to a Course, must have title/instructions/deadline, `maxMarks > 0`.
  - Submission must reference an assigned Group + existing Coursework.
  - Mark: `0 <= awarded <= maxMarks`, enforced via Zod AND a DB check constraint.
- [ ] Index: `User.email`, `Group.courseId`, `Group.leaderId`, `Coursework.courseId`,
      `Coursework.deadline`, `CourseworkGroup.courseworkId/groupId`,
      `Submission.courseworkId/groupId/submittedAt`, `Mark.submissionId`.
- [ ] Submission history: never overwrite a Submission row on resubmission — insert a new
      version, keep prior versions queryable (business-logic.md §13).
- [ ] Mark belongs to Submission, not Group (tech-stack.md §19) — this is the one detail most
      likely to be modeled wrong if rushed.
- [ ] Run first migration against Supabase dev DB.

### 1.2 Auth

- [ ] Wire Supabase Auth (`@supabase/ssr`) for login/logout/session refresh.
- [ ] Only Admin, Lecturer, and Group Leader get Supabase Auth accounts — group members never
      do (business-logic.md §1). Enforce this at the account-creation boundary, not just in UI.
- [ ] Store `role` on the User row (source of truth), keep Supabase Auth for credentials only.
- [ ] Build `/login` page — single form, role-agnostic (role is resolved server-side after auth).
- [ ] Middleware: gate `/admin/*`, `/lecturer/*`, `/leader/*` by session presence (tech-stack.md
      §22) — but treat this as a UX redirect layer only, **not** the authorization boundary.

### 1.3 Authorization layer (`lib/permissions`)

- [ ] Central permission functions, unit-testable in isolation, e.g.:
  `canAccessGroup(user, groupId)`, `canAccessCoursework(user, courseworkId)`,
  `canMarkSubmission(user, submissionId)`, `canManageCourse(user, courseId)`.
- [ ] Every Server Action / Route Handler in later phases must call one of these before touching
      data. This is the single rule from business-logic.md §28 and tech-stack.md §10 that
      protects the whole app — treat it as non-negotiable, and write it once here so nothing
      later re-implements ownership checks ad hoc.

### 1.4 Audit logging primitive

- [ ] `lib/audit/log.ts` — one function `recordAudit(userId, action, resourceType, resourceId,
      metadata)` used everywhere mutations happen. Build it now so every later phase calls it
      from day one instead of bolting it on retroactively.

**Definition of done:** Can create one Admin/Lecturer/Group Leader manually (seed script), log
in as each, land on role-correct empty dashboards, and permission functions have passing unit
tests for allow/deny cases.

---

## Phase 2 — Administrator: System Structure

**Goal:** Admin can build the world that Lecturers and Group Leaders operate in.

- [ ] `/admin/dashboard` — stats cards (Lecturers, Group Leaders, Groups, Courses, Coursework,
      Submissions) per design.md §44. Can be static queries first, no charts.
- [ ] `/admin/lecturers` — table + create/edit/disable lecturer (business-logic.md §3.1). Disable
      ≠ delete: disabled lecturers keep historical data.
- [ ] `/admin/courses` — create course, assign lecturer.
- [ ] `/admin/groups` — create group, assign to course, assign group leader, view members
      (read-only here; editing members is the leader's job per business-logic.md §5).
- [ ] `/admin/users` — unified view across all account-holding users.
- [ ] `/admin/audit-logs` — read-only table of AuditLog, filterable by user/action/date.
- [ ] Every create/edit/disable action here calls `recordAudit`.
- [ ] Admin must NOT have a UI path to directly edit marks (business-logic.md §3.1) — if an
      override is ever needed later, it's a deliberately separate, heavily audited feature, not
      part of MVP.

**Definition of done:** Starting from an empty DB, an Admin can create a lecturer, a course, a
group, and assign a leader — entirely through the UI — with every step in the audit log.

---

## Phase 3 — Group Leader: Group Management

**Goal:** Group leader can log in and manage their own group's membership.

- [ ] `/leader/dashboard` — shell only for now (real content lands in Phase 5/7).
- [ ] `/leader/group` — view own group, leader info, members table (design.md §34).
- [ ] Edit member modal (design.md §35) — name, registration number, course; Zod-validated.
- [ ] Enforce business-logic.md §7: block member deletion once the group has active coursework
      submissions (don't just hide the button — check server-side).
- [ ] Enforce business-logic.md §5 restrictions: leader cannot create groups, cannot see other
      groups — verify via the Phase 1 permission functions, add negative tests.
- [ ] Every member add/edit/remove calls `recordAudit`.

**Definition of done:** A seeded group leader can view their group, edit a member, and is
provably blocked (403, not just hidden nav) from viewing another group's page by URL guessing.

---

## Phase 4 — Lecturer: Coursework Lifecycle (up to Published)

**Goal:** Lecturer can create, configure, and publish coursework to selected groups.

- [ ] `/lecturer/dashboard` — shell + course list for now.
- [ ] `/lecturer/coursework` — table (Coursework, Course, Deadline, Status), search/filter/sort
      (design.md §20).
- [ ] Create Coursework form (design.md §30): course select, title, instructions, max marks,
      deadline (date + time), assign-groups checklist, Save Draft vs Publish.
- [ ] Enforce: only groups belonging to the lecturer's own courses are selectable.
- [ ] Draft coursework invisible to all Group Leaders (business-logic.md §10).
- [ ] Publish action: irreversible-feeling, so require a confirm dialog (design.md §31); sets
      `publishedAt`, flips status, and from this point groups can see it.
- [ ] Edit allowed only while `status = DRAFT` (business-logic.md §4 lecturer restrictions).
- [ ] Coursework detail page shell (design.md §21) — instructions + metadata only; submission
      overview comes in Phase 6.
- [ ] `recordAudit` on create/edit/publish.

**Definition of done:** Lecturer creates a draft, it's invisible to leaders; publishes it to a
subset of groups; only those groups' leaders see it appear.

---

## Phase 5 — Group Leader: Submission Upload

**Goal:** Group leader can upload PDF/DOCX against published coursework; system computes
on-time/late status correctly.

- [ ] `/leader/coursework` — list of assigned coursework with status per group (design.md §32).
- [ ] Upload UI (design.md §36): shows deadline, supported types, max size, current status.
- [ ] Client-side validation (type/size) for fast feedback, but treat it as UX only.
- [ ] Server-side pipeline (tech-stack.md §18): validate file → authorize (is this leader's
      group, is this group assigned to this coursework) → upload to Supabase Storage → create
      Submission row → compute SUBMITTED vs LATE via deadline comparison in one fixed
      institutional timezone (tech-stack.md §17, business-logic.md §15) → only then confirm
      success. If storage upload succeeds but DB insert fails, do not leave an orphaned file
      referenced nowhere — handle as a transaction-like flow (upload, then insert; if insert
      fails, delete the uploaded object).
- [ ] Reject unsupported types (`.exe .zip .apk .js .html` etc.) by MIME type, not just
      extension (business-logic.md §31).
- [ ] Storage path convention: `submissions/course-{id}/coursework-{id}/group-{id}/submission-v{n}.{ext}`
      using generated identifiers, original filename preserved only as display metadata
      (tech-stack.md §12, business-logic.md §31).
- [ ] Resubmission: only when lecturer's `allowLateSubmission`/resubmission policy permits;
      creates a new version, previous versions remain queryable, "active" = latest
      (business-logic.md §13).
- [ ] Late-submission gate: if deadline passed and `allowLateSubmission = NO`, reject upload with
      a clear error (business-logic.md §16); if `YES`, accept and mark `LATE`.
- [ ] Success/error UI per design.md §37/§38 (toast + inline errors near the upload widget).
- [ ] `recordAudit` on every submission.

**Definition of done:** Uploading before deadline → SUBMITTED; after deadline with late allowed →
LATE; after deadline with late disallowed → rejected with clear message; wrong file type
rejected server-side even if client validation is bypassed via direct API call.

---

## Phase 6 — Lecturer: Submission Monitoring + Document Viewer

**Goal:** Lecturer sees submission state per group per coursework, and can open documents
in-browser.

- [ ] Coursework detail page: submission overview stat cards (Submitted/Awaiting/Late/Not
      Submitted), clickable to filter the groups table below (design.md §21–22).
- [ ] Groups submission table (design.md §23) — status-dependent action column (View/Mark/—).
- [ ] "Not submitted" list computed dynamically from assigned groups minus groups with a
      Submission row — never a manually maintained list (business-logic.md §24).
- [ ] `/lecturer/submissions` — cross-coursework view (design.md §19-style table).
- [ ] PDF viewer: in-browser rendering with page nav, zoom, fullscreen (design.md §28,
      tech-stack.md §14) — no forced download for normal review.
- [ ] DOCX viewer: render or convert to browser-viewable format; isolate this behind a single
      interface so the conversion method can be swapped later without touching the rest of the
      marking flow (tech-stack.md §14/§59 — this is explicitly called out as replaceable).
- [ ] File access must be authorization-gated per request (signed/short-lived URLs or a
      server-side proxy route) — never a public Supabase Storage bucket (business-logic.md
      §31, tech-stack.md §13).

**Definition of done:** Lecturer opens the coursework, sees accurate live counts, clicks
"Not Submitted" and gets the right group list, opens a PDF and a DOCX submission and can read
both without downloading.

---

## Phase 7 — Marking & Results

**Goal:** The single most important workflow (design.md §67 Priority 1) — mark, feedback,
publish — with minimal friction.

- [ ] `/lecturer/marking/[submissionId]` — dedicated split-screen layout, own chrome (not the
      standard sidebar page), document ~65–75% width, marking panel ~25–35% (design.md §24–26).
- [ ] Marking panel: mark input (`0 <= awarded <= maxMarks`, Zod + DB constraint), feedback
      textarea, Save Mark / Publish Result buttons, all without leaving the document view.
- [ ] Simple marking now; rubric marking (business-logic.md §19) can be added as an optional mode
      once simple marking is solid — don't build both simultaneously.
- [ ] Marking states (business-logic.md §20): `MARK NOT ENTERED → MARKED (saved, hidden from
      student) → RESULT_PUBLISHED (visible to leader)`. Saving a mark must never make it visible
      to the Group Leader until Publish is explicitly clicked.
- [ ] Publish Result: separate action from Save Mark, confirm-worthy, sets
      `publishedAt`/status, triggers visibility for the Group Leader.
- [ ] `/leader/results` — group's own results only, mark/max/percentage/feedback/submitted-date/
      marked-date (design.md §39, business-logic.md §22). Enforce group-scoping via permission
      layer, not just query filters.
- [ ] `recordAudit` on mark save, mark update, and result publish specifically — these are called
      out as high-importance audit events (business-logic.md §29).

**Definition of done:** Full loop works end-to-end: open submission → read → enter mark → add
feedback → save (student still sees nothing) → publish → group leader now sees mark + feedback.

---

## Phase 8 — Dashboards & Cross-Cutting Views

**Goal:** The "what needs my attention" views that tie everything together (design.md §2).

- [ ] Lecturer dashboard: 4 stat cards (Active Coursework, Submitted, Awaiting Marking, Not
      Submitted), active coursework progress cards, recent submissions table (design.md §15–19).
- [ ] Group leader dashboard: group summary, coursework-to-submit cards with deadline urgency
      styling, results-available count (design.md §26/§32, deadline styling per §42).
- [ ] Admin dashboard: finalize stats from Phase 2 shell into the full §44 layout.
- [ ] Deadline urgency styling shared component: normal / due-tomorrow / due-today / late tiers
      (design.md §42) — build once, reuse across leader dashboard and coursework lists.
- [ ] Historical views (business-logic.md §33): lecturer can see Past Coursework / Previous
      Submissions / Previous Results — filters on existing data, not new tables.

**Definition of done:** Each role's dashboard answers its role's core question (design.md §2) at
a glance, using live data, no dummy numbers.

---

## Phase 9 — Cross-Cutting Polish

**Goal:** Consistency and accessibility pass across everything built so far (design.md §54–63).

- [ ] Status badges: consistent color + text (never color alone) across all tables/cards
      (design.md §41, §56).
- [ ] Empty states for every major list (design.md §50).
- [ ] Skeleton loaders for dashboards/tables; button loading states for uploads/saves/publishes
      (design.md §51).
- [ ] Toast confirmations for publish/upload/save/publish-result actions (design.md §52).
- [ ] Error message pass: replace any raw Prisma/Supabase errors surfaced to the UI with the
      mapped human messages from tech-stack.md §26.
- [ ] Responsive pass: mobile drawer nav (design.md §14), leader flows fully usable on phone
      (design.md §54 — leader is mobile-first), coursework tables → cards on mobile (design.md
      §55), lecturer/admin remain desktop-first but not broken on tablet.
- [ ] Accessibility pass: form labels, keyboard nav, focus states, contrast, semantic HTML on
      tables/dialogs (design.md §56).

**Definition of done:** Click through every role's full workflow on both a desktop viewport and a
narrow mobile viewport; no broken layouts, no color-only status signals, no raw stack traces
visible.

---

## Phase 10 — Testing

- [ ] Unit tests for `lib/permissions/*`, deadline/late-submission logic, mark-range validation
      (business-logic.md §18 examples: 0/10/18/20 valid, -1/21/25 invalid) — mirror
      tech-stack.md §33 examples directly (`calculateMark`, `isSubmissionLate`,
      `canUserAccessGroup`, `canUserMarkSubmission`).
- [ ] Integration tests: submission upload → storage + DB consistency; mark save/publish state
      transitions.
- [ ] One full E2E test of the workflow in business-logic.md §35 / tech-stack.md §33: admin
      creates lecturer/course/group → leader adds members → lecturer publishes coursework →
      leader uploads → lecturer marks + publishes → leader sees result.
- [ ] Negative-path tests: cross-group access attempts, cross-lecturer coursework access,
      late-submission-disabled rejection, oversized/wrong-type file rejection.

**Definition of done:** CI runs unit + integration on every PR; the one E2E happy-path test is
green.

---

## Phase 11 — Deployment Hardening

- [ ] Confirm env vars set in Vercel project settings (not just `.env.local`); confirm
      `SUPABASE_SERVICE_ROLE_KEY` is server-only and never referenced in client bundles.
- [ ] Production Supabase project provisioned separately from dev; migrations applied via
      Prisma, never manual schema edits (tech-stack.md §31).
- [ ] Verify HTTPS, rate limiting on auth endpoints, and that storage buckets are private with
      access only through the app's authorization-checked routes.
- [ ] Smoke-test the full workflow against the production deployment before calling it live.

**Definition of done:** A production deployment on Vercel, backed by production Supabase, passes
the same happy-path walkthrough as Phase 10's E2E test.

---

## Explicitly Out of Scope for MVP

Per business-logic.md §37 — do not let any of these creep into earlier phases:
email/WhatsApp notifications, automatic reminders, lecturer announcements, rubric templates
(beyond optional simple rubric in Phase 7), Excel/PDF export, analytics, plagiarism checking,
multiple lecturers per course, multiple courses per group, semesters/archived years, individual
student accounts.

---

## Sequencing Summary

```
Phase 0  Foundation (scaffold, tokens, deploy pipeline)
Phase 1  Data model + auth + permissions + audit primitive
Phase 2  Admin: lecturers/courses/groups
Phase 3  Leader: group + members
Phase 4  Lecturer: coursework create → publish
Phase 5  Leader: submission upload (on-time/late logic)
Phase 6  Lecturer: submission monitoring + PDF/DOCX viewer
Phase 7  Lecturer: marking + publish results  ← core workflow
Phase 8  Dashboards (all roles)
Phase 9  Cross-cutting polish + accessibility
Phase 10 Testing
Phase 11 Deployment hardening
```

Phases 2–3 can run in parallel once Phase 1 is done (different roles, no shared new code).
Phases 4 and 6/7 cannot — coursework must exist before marking exists.
