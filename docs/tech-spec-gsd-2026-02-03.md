# Technical Specification: GSD (Get Stuff Done)

**Date:** 2026-02-03
**Author:** marcbarnaba
**Version:** 1.0
**Project Type:** Web Application
**Project Level:** Level 2
**Status:** Draft

---

## Document Overview

This Technical Specification provides focused technical planning for GSD, a GTD (Getting Things Done) web application. It complements the PRD with implementation-level decisions and a concrete story breakdown.

**Related Documents:**
- PRD: `docs/prd-gsd-2026-02-03.md`

---

## Problem & Solution

### Problem Statement

Knowledge workers face a constant stream of inputs (emails, meetings, ideas, tasks) with no clear boundaries. Keeping commitments in their heads generates cognitive overload and unreliable follow-through. The mind is a creative system, not an archiving system.

### Proposed Solution

A web application implementing the GTD methodology that provides: (1) reliable capture of all inputs, (2) a guided clarification process that forces decision-making at the point of entry, (3) organized lists of genuinely actionable items, and (4) a weekly review process that maintains system trust. Local-first, single user, no backend required for MVP.

---

## Requirements

### What Needs to Be Built

- **Quick Capture:** Always-accessible input to capture items to inbox in < 2 seconds (FR-001)
- **Inbox:** FIFO queue of unprocessed items with count display (FR-002)
- **Guided Clarify Process:** Step-by-step wizard: actionable? → single action or project? → context/delegate/schedule (FR-003)
- **Next Actions List:** Primary work list, filterable by context, duration, energy (FR-004)
- **Projects List & Detail:** Projects with outcome, next action tracking, and warning for stale projects (FR-005, FR-006)
- **Waiting For List:** Delegated items with person and date tracking (FR-007)
- **Someday/Maybe List:** Deferred items with promote/trash options (FR-008)
- **Reference Archive:** Non-actionable items stored for information, searchable (FR-009)
- **Calendar View:** Date-bound items (hard landscape only) in chronological order (FR-010)
- **Contexts Management:** CRUD for contexts (@phone, @computer, etc.), assignable to items (FR-011)
- **Weekly Review:** Guided 5-step checklist with checkpoint recording (FR-012)
- **Local Persistence:** Adapter-pattern data layer with localStorage/IndexedDB (FR-013)
- **Export/Import JSON:** Full data backup and restore with validation (FR-014, FR-015)
- **Dashboard:** System health overview with counts, warnings, and navigation (FR-016)
- **Item Completion & Trash:** Mark done, soft delete, restore, permanent delete (FR-017, FR-018)
- **Project Status Alerts:** System-wide flags for projects missing next actions (FR-019)

### What This Does NOT Include

- Multi-user support or collaboration
- Backend server or REST API
- Native mobile apps (iOS/Android)
- Email integration or automatic capture
- In-app GTD tutorial or onboarding
- Natural language processing
- Recurring tasks
- External calendar integration (Google Calendar, etc.)
- Push notifications or reminders
- Tags management (FR-020 - deferred to post-MVP)
- Duration estimates (FR-021 - deferred to post-MVP)
- Energy level filtering (FR-022 - deferred to post-MVP)

---

## Technical Approach

### Technology Stack

- **Framework:** Nuxt 3 (SSG/SPA mode)
- **UI Library:** Vue 3 (Composition API)
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Persistence:** localStorage (MVP), IndexedDB-ready adapter interface
- **Build Tool:** Vite (bundled with Nuxt)
- **Package Manager:** npm or pnpm

### Architecture Overview

Standard Nuxt 3 conventions with the adapter pattern for persistence:

```
/
├── pages/                    # Route-based pages
│   ├── index.vue             # Dashboard
│   ├── inbox.vue             # Inbox list
│   ├── process.vue           # Clarify/process inbox wizard
│   ├── next-actions.vue      # Next actions list
│   ├── projects/
│   │   ├── index.vue         # Projects list
│   │   └── [id].vue          # Project detail
│   ├── waiting-for.vue       # Waiting for list
│   ├── someday.vue           # Someday/maybe list
│   ├── reference.vue         # Reference archive
│   ├── calendar.vue          # Calendar view
│   ├── review.vue            # Weekly review
│   └── settings.vue          # Settings, export/import
├── components/
│   ├── QuickCapture.vue      # Global capture input
│   ├── ItemCard.vue          # Reusable item display
│   ├── ClarifyWizard.vue     # Step-by-step clarify flow
│   ├── ReviewStep.vue        # Weekly review step component
│   ├── AppNav.vue            # Navigation sidebar/header
│   └── ...
├── composables/
│   ├── useItems.ts           # Item operations composable
│   ├── useProjects.ts        # Project operations composable
│   └── useReview.ts          # Review operations composable
├── stores/
│   ├── items.ts              # Items Pinia store
│   ├── projects.ts           # Projects Pinia store
│   ├── contexts.ts           # Contexts Pinia store
│   ├── reviews.ts            # Reviews Pinia store
│   └── settings.ts           # Settings Pinia store
├── adapters/
│   ├── persistence.ts        # Adapter interface (abstract)
│   └── localStorage.ts       # localStorage implementation
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   └── ...                   # Utility functions
├── nuxt.config.ts
└── tailwind.config.ts
```

**Key architectural decisions:**

1. **Persistence adapter pattern:** Stores interact with an abstract `PersistenceAdapter` interface. The MVP provides a `LocalStorageAdapter`. This allows swapping in IndexedDB or a REST adapter later without touching store logic.

2. **Pinia stores as single source of truth:** All state lives in Pinia stores. Stores load from persistence on app init and write-through on every mutation.

3. **SPA mode:** Since there's no backend and all data is local, the app runs as a client-side SPA (or SSG for static hosting).

4. **Global capture:** `QuickCapture` component is mounted in the default layout, always available.

### Data Model

**Item**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique identifier |
| title | string | yes | Item title |
| notes | string | no | Additional notes |
| createdAt | ISO datetime | yes | Creation timestamp |
| updatedAt | ISO datetime | yes | Last modification |
| status | enum | yes | inbox, next, waiting, someday, reference, calendar, done, trashed |
| contexts | string[] | no | Assigned context IDs |
| projectId | string | no | Parent project ID |
| dueDate | ISO date | no | Calendar date (hard landscape) |
| delegatedTo | string | no | Person name (for waiting) |
| waitingForDate | ISO date | no | When delegated |
| completedAt | ISO datetime | no | When marked done |

**Project**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique identifier |
| title | string | yes | Project name |
| outcome | string | yes | Desired outcome description |
| status | enum | yes | active, completed, trashed |
| createdAt | ISO datetime | yes | Creation timestamp |
| updatedAt | ISO datetime | yes | Last modification |

**Context**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique identifier |
| name | string | yes | Context label (e.g., @phone) |

**WeeklyReview**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique identifier |
| completedAt | ISO datetime | yes | Review completion time |
| stats | object | yes | Snapshot: inbox count, projects count, etc. |

**Relationships:**
- Item → Project: many-to-one (via `projectId`)
- Item → Context: many-to-many (via `contexts[]` array of context IDs)
- Project → Items: one-to-many (derived by filtering items with matching `projectId`)
- Project "next action": derived by finding the first item with `status: next` and matching `projectId`

### API Design (if applicable)

No API for MVP. All operations are local store mutations persisted through the adapter. Future API endpoints are documented in the PRD for reference.

---

## Implementation Plan

### Stories

1. **Project Scaffold & Persistence Layer** - Set up Nuxt 3 project, TypeScript config, Tailwind, Pinia, persistence adapter interface + localStorage implementation, type definitions
2. **Navigation & Layout** - App shell with sidebar/header navigation, responsive layout, route structure for all pages
3. **Quick Capture & Inbox** - Global capture component, inbox page with FIFO list, item count, edit capability
4. **Guided Clarify Process** - Step-by-step wizard: actionable check → single/multi action → context/delegate/schedule routing
5. **Next Actions List** - Display next actions, filter by context, mark as done
6. **Projects List & Detail** - Projects overview with outcome + next action display, detail page with linked items, add items to project
7. **Waiting For, Someday/Maybe, Reference** - Three list views with status-appropriate actions (promote, trash, convert)
8. **Calendar View** - Date-sorted items, today highlight, overdue flagging
9. **Weekly Review** - Guided 5-step review flow, checkpoint saving, review history
10. **Dashboard** - System health metrics, inbox count, stale project warnings, last review date, quick navigation
11. **Export/Import & Settings** - JSON export/import with validation, settings page
12. **Contexts Management** - CRUD for contexts, assignment UI in clarify and item editing
13. **Item Completion, Trash & Project Alerts** - Done/trash workflows, restore, project status warnings

### Development Phases

**Phase 1: Foundation (Stories 1-3)**
Scaffold, navigation, capture, inbox. After this phase, you can capture items and see them in the inbox.

**Phase 2: Core GTD Engine (Stories 4-6)**
Clarify process, next actions, projects. After this phase, the full capture→clarify→act loop works.

**Phase 3: Supporting Lists (Stories 7-8)**
Waiting for, someday, reference, calendar. Completes the "organize" layer of GTD.

**Phase 4: Review & Polish (Stories 9-13)**
Weekly review, dashboard, export/import, contexts, completion workflows. System is fully functional.

---

## Acceptance Criteria

How we'll know it's done:

- [ ] User can capture an item from any page in under 2 seconds
- [ ] Every inbox item goes through the guided clarify process (no bypass)
- [ ] Clarify routes items correctly to all 6 destinations (next, project, waiting, someday, reference, calendar)
- [ ] Creating a project forces defining a first next action
- [ ] Next actions list filters by context
- [ ] Projects without a next action are visually flagged
- [ ] Weekly review guides through all 5 steps and saves checkpoint
- [ ] All data persists across page refresh and browser close
- [ ] Export produces valid JSON; import restores from it
- [ ] Dashboard shows inbox count, stale projects, last review date
- [ ] App works fully offline
- [ ] Responsive on mobile (320px) through desktop (2560px)

---

## Non-Functional Requirements

### Performance

- Capture to save: < 2 seconds
- Page transitions: < 300ms perceived
- Lists of 500+ items render without perceptible lag
- Local persistence means no network latency

### Security

- No authentication needed (single user, local data)
- No sensitive data transmitted (local-only)
- JSON import validates structure before processing (prevent malformed data injection)
- No eval() or dynamic code execution from imported data

### Other

- Modern browsers only: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Touch-friendly targets (44px minimum)
- No horizontal scrolling on any viewport
- Fully offline-capable (no external API calls)

---

## Dependencies

- **Nuxt 3** - Application framework
- **Vue 3** - UI library (bundled with Nuxt)
- **Pinia** - State management
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety
- No external services or APIs required
- No third-party accounts needed

---

## Risks & Mitigation

- **Risk:** localStorage has a ~5MB limit, which may be hit with large datasets
  - **Mitigation:** Monitor storage usage; adapter pattern allows switching to IndexedDB if needed

- **Risk:** Data loss if user clears browser data
  - **Mitigation:** Export/import feature provides manual backup; prominent reminder in settings

- **Risk:** Clarify wizard UX could feel cumbersome, discouraging use
  - **Mitigation:** Keep wizard steps minimal and fast; allow keyboard navigation

- **Risk:** Scope creep from "Could Have" features delaying MVP
  - **Mitigation:** Tags, duration, energy explicitly deferred to post-MVP

---

## Timeline

**Target Completion:** ASAP - implement iteratively, running after each phase

**Milestones:**
- Phase 1 complete: App runs with capture + inbox
- Phase 2 complete: Full capture → clarify → act loop functional
- Phase 3 complete: All GTD lists operational
- Phase 4 complete: Full MVP with review, dashboard, export/import

---

## Approval

**Reviewed By:**
- [ ] marcbarnaba (Author)

---

## Next Steps

### Phase 3: Architecture

For a Level 2 project, run `/architecture` to create a detailed architecture document, or proceed directly to implementation if this tech spec provides sufficient detail.

### Phase 4: Implementation

- Run `/sprint-planning` to plan your sprint
- Then create and implement stories with `/create-story` and `/dev-story`

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
