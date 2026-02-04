# Sprint Plan: GSD (Get Stuff Done)

**Date:** 2026-02-03
**Scrum Master:** marcbarnaba (Steve)
**Project Level:** Level 2
**Total Stories:** 13
**Total Points:** 70
**Planned Sprints:** 6
**Status:** Active

---

## Executive Summary

This sprint plan breaks the GSD GTD application into 13 stories across 6 one-week sprints. The plan follows the tech-spec's phased approach: foundation first, then the core capture-clarify-act loop, followed by supporting lists, and finishing with review/dashboard/data features. FR-020 (Tags), FR-021 (Duration Estimates), and FR-022 (Energy Level) are deferred to post-MVP per tech-spec.

**Key Metrics:**
- Total Stories: 13
- Total Points: 70
- Sprints: 6 (1-week each)
- Team Capacity: 15 points/sprint (ideal), ~12 points/sprint (adjusted)
- Deferred to post-MVP: 3 FRs (Could Have)

---

## Team Capacity

| Parameter | Value |
|-----------|-------|
| Team Size | 1 senior developer |
| Sprint Length | 1 week (5 workdays) |
| Productive Hours/Day | 6 |
| Hours per Point | 2 (senior) |
| Ideal Capacity | 15 points/sprint |
| Adjusted Capacity | ~12 points/sprint (significant time off + buffer) |
| Total Velocity Target | 70 points over 6 sprints |

---

## Story Inventory

### STORY-001: Project Scaffold & Persistence Layer

**Epic:** EPIC-005 (Data & Persistence)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a developer
I want a properly scaffolded Nuxt 3 project with persistence infrastructure
So that all subsequent features have a solid foundation to build on

**Acceptance Criteria:**
- [ ] Nuxt 3 project initialized with TypeScript
- [ ] Tailwind CSS configured and working
- [ ] Pinia installed and configured
- [ ] TypeScript type definitions created (Item, Project, Context, WeeklyReview)
- [ ] PersistenceAdapter interface defined with CRUD operations
- [ ] LocalStorageAdapter implements PersistenceAdapter interface
- [ ] Pinia stores created (items, projects, contexts, reviews, settings) with persistence integration
- [ ] Data loads from localStorage on app start
- [ ] Write-through persistence on every store mutation

**Technical Notes:**
- Follow the adapter pattern from tech-spec: `adapters/persistence.ts` (interface) + `adapters/localStorage.ts` (implementation)
- Stores in `stores/` depend only on adapter interface
- Use UUIDs for entity IDs
- SPA mode (no SSR needed for local-only app)

**Dependencies:** None (foundational)

---

### STORY-002: Navigation & Layout

**Epic:** EPIC-006 (Dashboard & Navigation)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want clear navigation between all GTD sections
So that I can quickly access any list or view

**Acceptance Criteria:**
- [ ] App shell with responsive sidebar (desktop) / bottom nav or hamburger (mobile)
- [ ] Navigation links to all pages: Dashboard, Inbox, Next Actions, Projects, Waiting For, Someday/Maybe, Reference, Calendar, Weekly Review, Settings
- [ ] Active route highlighted in navigation
- [ ] Responsive layout works from 320px to 2560px
- [ ] Touch-friendly targets (minimum 44px)
- [ ] Route structure matches tech-spec page layout

**Technical Notes:**
- Default layout in `layouts/default.vue` with `QuickCapture` slot (populated in STORY-003)
- `AppNav.vue` component for navigation
- All page files created as stubs

**Dependencies:** STORY-001

---

### STORY-003: Quick Capture & Inbox

**Epic:** EPIC-001 (Capture & Inbox)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to quickly capture thoughts and inputs from any screen
So that I never lose an idea and my inbox collects everything for later processing

**Acceptance Criteria:**
- [ ] QuickCapture component is accessible from every page (mounted in layout)
- [ ] Title is the only mandatory field
- [ ] Notes field is optional (expandable)
- [ ] Item saved to Inbox immediately on submit
- [ ] Input field clears after capture for rapid successive entries
- [ ] Capture completes in under 2 seconds
- [ ] Inbox page displays all inbox items in FIFO order (oldest first)
- [ ] Inbox shows item count
- [ ] User can select an item to begin processing (navigates to clarify)
- [ ] User can edit item title/notes before processing

**Technical Notes:**
- `QuickCapture.vue` in default layout
- `pages/inbox.vue` with item list
- Uses `items` Pinia store
- Items created with `status: 'inbox'`

**Dependencies:** STORY-001, STORY-002

---

### STORY-004: Guided Clarify Process

**Epic:** EPIC-002 (Clarify / Process Inbox)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a user
I want a guided step-by-step process for clarifying inbox items
So that every input is transformed into a clear, actionable (or properly filed) outcome

**Acceptance Criteria:**
- [ ] Step-by-step wizard UI presents one decision at a time
- [ ] Step 1: "Is it actionable?" with Yes/No
- [ ] If No: route to Reference, Someday/Maybe, or Trash (user chooses)
- [ ] If Yes: "Is it a single action?" with Yes/No
- [ ] If single action: create Next Action with context assignment
- [ ] If multiple actions: create Project + prompt for first Next Action
- [ ] Delegation option: creates Waiting For item with delegatedTo field and waitingForDate
- [ ] Calendar option: assigns dueDate (hard landscape only)
- [ ] Context selection available during action creation
- [ ] Item cannot skip the clarify process (no direct status change from inbox)
- [ ] After processing, user returns to inbox to process next item
- [ ] Wizard can be cancelled (item stays in inbox)

**Technical Notes:**
- `pages/process.vue` or `pages/inbox/process/[id].vue`
- `ClarifyWizard.vue` component with multi-step state machine
- Creates/updates items and optionally projects through stores
- Contexts available from contexts store

**Dependencies:** STORY-001, STORY-003, STORY-009

---

### STORY-005: Next Actions List

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to see all my next actions in one filterable list
So that I can choose what to work on based on my current context

**Acceptance Criteria:**
- [ ] All items with status "next" displayed
- [ ] Filter by context (single or multiple contexts)
- [ ] Mark action as done (status → done, completedAt set)
- [ ] Show associated project name (if any, linked to project detail)
- [ ] Empty state when no next actions exist

**Technical Notes:**
- `pages/next-actions.vue`
- Computed getters from items store filtered by `status: 'next'`
- Context filter uses contexts store
- Project name resolved via projects store

**Dependencies:** STORY-001, STORY-004 (clarify creates next actions)

---

### STORY-006: Projects List & Detail

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a user
I want to see all my projects with their outcomes and next actions
So that I can track multi-step commitments and ensure every project is moving forward

**Acceptance Criteria:**
- [ ] Projects list shows all active projects
- [ ] Each project displays title, outcome, and current next action
- [ ] Projects without a next action are visually flagged (warning state)
- [ ] User can navigate to project detail page
- [ ] Project detail shows title, outcome, and all linked items grouped by status
- [ ] Current next action clearly identified in detail view
- [ ] User can add a new item directly to a project
- [ ] User can edit project title and outcome
- [ ] User can complete/archive a project (status → completed)

**Technical Notes:**
- `pages/projects/index.vue` for list
- `pages/projects/[id].vue` for detail
- Project's "next action" is derived: first item with `status: 'next'` and matching `projectId`
- Items linked to project via `projectId` field

**Dependencies:** STORY-001, STORY-004 (clarify creates projects)

---

### STORY-007: Waiting For, Someday/Maybe, Reference Lists

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want organized lists for delegated items, deferred ideas, and reference material
So that nothing falls through the cracks and I can find non-actionable items when needed

**Acceptance Criteria:**
- [ ] **Waiting For:** All items with status "waiting" listed
- [ ] Waiting For shows delegatedTo and waitingForDate
- [ ] Waiting For: convert back to Next Action
- [ ] Waiting For: mark as done
- [ ] **Someday/Maybe:** All items with status "someday" listed
- [ ] Someday: promote to Next Action or create Project
- [ ] Someday: trash items
- [ ] Someday: edit items
- [ ] **Reference:** All items with status "reference" listed
- [ ] Reference: search/filter capability
- [ ] Reference: edit or trash items

**Technical Notes:**
- `pages/waiting-for.vue`, `pages/someday.vue`, `pages/reference.vue`
- Each page filters items store by respective status
- Promote/convert actions update item status through store

**Dependencies:** STORY-001, STORY-004 (clarify routes to these lists)

---

### STORY-008: Calendar View

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to see my date-bound commitments in chronological order
So that I know what's on my hard landscape and never miss a fixed commitment

**Acceptance Criteria:**
- [ ] Items with dueDate displayed in chronological order
- [ ] Today's items highlighted
- [ ] Overdue items flagged visually
- [ ] User can navigate between dates/weeks
- [ ] Mark calendar items as done
- [ ] Empty state when no calendar items exist

**Technical Notes:**
- `pages/calendar.vue`
- Filters items with `status: 'calendar'` or items that have a `dueDate` set
- Simple date-sorted list view (not a full calendar grid for MVP)
- Group by date for readability

**Dependencies:** STORY-001, STORY-004 (clarify routes items to calendar)

---

### STORY-009: Contexts Management

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want to create and manage contexts like @phone, @computer, @errands
So that I can filter my next actions by what's available to me right now

**Acceptance Criteria:**
- [ ] Create new contexts with name (e.g., @phone, @computer, @errands, @office)
- [ ] Edit context name
- [ ] Delete context (with confirmation, removes from items)
- [ ] Contexts available for selection during clarify process (STORY-004)
- [ ] Contexts available as filter in Next Actions (STORY-005)
- [ ] Default contexts seeded on first launch (@phone, @computer, @errands, @office, @home)

**Technical Notes:**
- Contexts store with CRUD operations
- Context selector component reusable across clarify and item editing
- Managed in Settings page or dedicated section

**Dependencies:** STORY-001

---

### STORY-010: Item Completion, Trash & Project Alerts

**Epic:** EPIC-003 (Organize - Lists & Views)
**Priority:** Should Have / Must Have (mixed)
**Points:** 5

**User Story:**
As a user
I want to mark items as done, trash items I don't need, and be alerted when projects lack next actions
So that I maintain a clean, trustworthy system

**Acceptance Criteria:**
- [ ] Mark any actionable item as done (status → done, completedAt recorded)
- [ ] Done items hidden from active lists
- [ ] Done items viewable in a completed items view
- [ ] Trash action available on any item (status → trashed)
- [ ] Trashed items removed from all active lists
- [ ] Trash view available showing trashed items
- [ ] Permanent delete option for trashed items
- [ ] Undo trash (restore to previous status)
- [ ] Projects without a next action are visually flagged on projects list (already in STORY-006)
- [ ] Stale project count shown on dashboard (feeds into STORY-012)
- [ ] Prompt to add next action when viewing a flagged project

**Technical Notes:**
- Completion and trash are cross-cutting concerns applied to item actions across all list views
- May need a "completed items" page or section in settings
- FR-017, FR-018, FR-019 combined into one story since they're closely related

**Dependencies:** STORY-005, STORY-006, STORY-007

---

### STORY-011: Weekly Review

**Epic:** EPIC-004 (Reflect)
**Priority:** Must Have
**Points:** 8

**User Story:**
As a user
I want a guided weekly review process
So that I maintain trust in my GTD system and ensure nothing is stale or forgotten

**Acceptance Criteria:**
- [ ] Step-by-step guided flow with 5 steps
- [ ] Step 1: Is Inbox empty? (if not, link to inbox for processing)
- [ ] Step 2: Do all projects have a next action? (show flagged projects)
- [ ] Step 3: Review Waiting For items (still valid? follow up?)
- [ ] Step 4: Review Calendar (upcoming commitments)
- [ ] Step 5: Review Someday/Maybe (promote or trash?)
- [ ] Each step shows relevant data and inline actions
- [ ] Cannot complete review if inbox is not empty
- [ ] Cannot complete review if projects lack next actions
- [ ] Checkpoint saved on completion with completedAt and stats snapshot
- [ ] Review history viewable (past checkpoints)

**Technical Notes:**
- `pages/review.vue`
- `ReviewStep.vue` component for each step
- Reviews store saves checkpoints
- Stats snapshot: { inboxCount, nextActionsCount, projectsCount, projectsWithoutNextAction, waitingForCount, somedayCount }

**Dependencies:** STORY-003 (inbox), STORY-005 (next actions), STORY-006 (projects), STORY-007 (waiting/someday), STORY-008 (calendar)

---

### STORY-012: Dashboard

**Epic:** EPIC-006 (Dashboard & Navigation)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want an overview of my GTD system health
So that I can see at a glance what needs attention

**Acceptance Criteria:**
- [ ] Inbox item count displayed
- [ ] Next actions count displayed
- [ ] Projects without next action count (with warning indicator)
- [ ] Last weekly review date (with warning if > 7 days ago)
- [ ] Quick navigation links to all sections
- [ ] Visual indicators for system health (green/yellow/red)

**Technical Notes:**
- `pages/index.vue` (home/dashboard)
- Computed values from items, projects, and reviews stores
- Warning thresholds: inbox > 0, projects without next action > 0, review > 7 days ago

**Dependencies:** STORY-010 (completion data), STORY-011 (review data)

---

### STORY-013: Export/Import & Settings

**Epic:** EPIC-005 (Data & Persistence)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to export and import my data as JSON
So that I have backups and can restore my system if needed

**Acceptance Criteria:**
- [ ] One-click export from Settings page
- [ ] JSON file contains all entities (items, projects, contexts, reviews)
- [ ] File downloads to user's device
- [ ] Export includes metadata (version, export date)
- [ ] File picker for JSON import
- [ ] Validation of JSON structure before import
- [ ] Option to replace all data or merge
- [ ] Confirmation dialog before destructive replace
- [ ] Error handling for invalid files
- [ ] Settings page with contexts management link and export/import

**Technical Notes:**
- `pages/settings.vue`
- Export creates a Blob and triggers download
- Import validates schema before applying
- Version field in export for forward compatibility (NFR-005)

**Dependencies:** STORY-001 (persistence layer)

---

## Sprint Allocation

### Sprint 1 (Week 1) — 11/15 points

**Goal:** Establish project foundation with scaffold, navigation, and contexts

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-001 | Project Scaffold & Persistence Layer | 5 | Must Have |
| STORY-002 | Navigation & Layout | 3 | Must Have |
| STORY-009 | Contexts Management | 3 | Must Have |

**Total:** 11 points / 15 capacity (73% utilization)

**Rationale:** Foundation must come first. Contexts are included here because the Clarify wizard (Sprint 2) depends on them being available.

**Risks:**
- Nuxt 3 configuration complexity
- Persistence adapter design decisions

---

### Sprint 2 (Week 2) — 13/15 points

**Goal:** Complete the capture-to-clarify loop — items can be captured and processed

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-003 | Quick Capture & Inbox | 5 | Must Have |
| STORY-004 | Guided Clarify Process | 8 | Must Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Rationale:** These two stories are tightly coupled — capture feeds into clarify. The clarify wizard is the most complex single story (8 pts) and benefits from full sprint focus.

**Risks:**
- Clarify wizard UX complexity (multiple branching paths)
- State management for multi-step wizard

**Dependencies:**
- STORY-001 (persistence), STORY-009 (contexts for clarify)

---

### Sprint 3 (Week 3) — 13/15 points

**Goal:** Deliver the core GTD operational lists — next actions and projects

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-005 | Next Actions List | 5 | Must Have |
| STORY-006 | Projects List & Detail | 8 | Must Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Rationale:** After Sprint 2, clarify creates next actions and projects — these stories make them visible and manageable. The full capture→clarify→act loop is functional after this sprint.

**Risks:**
- Project detail page complexity (multiple item groups, inline actions)

**Dependencies:**
- STORY-004 (clarify creates next actions and projects)

---

### Sprint 4 (Week 4) — 10/15 points

**Goal:** Complete all supporting GTD lists — waiting for, someday/maybe, reference, calendar

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-007 | Waiting For, Someday/Maybe, Reference | 5 | Must Have |
| STORY-008 | Calendar View | 5 | Must Have |

**Total:** 10 points / 15 capacity (67% utilization)

**Rationale:** Lower utilization provides buffer for any time off and allows catching up on any Sprint 3 overflow. Completes the "Organize" layer of GTD.

**Risks:**
- Calendar view date navigation UX
- Significant time off may impact this sprint

**Dependencies:**
- STORY-004 (clarify routes to these lists)

---

### Sprint 5 (Week 5) — 13/15 points

**Goal:** Add completion workflows and the weekly review — system becomes self-maintaining

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-010 | Item Completion, Trash & Project Alerts | 5 | Should/Must Have |
| STORY-011 | Weekly Review | 8 | Must Have |

**Total:** 13 points / 15 capacity (87% utilization)

**Rationale:** Completion and trash are needed before weekly review (review checks system cleanliness). Together they make the system self-sustaining.

**Risks:**
- Weekly review has dependencies on all list views being functional
- Cross-cutting nature of completion/trash (touches all views)

**Dependencies:**
- STORY-005 through STORY-008 (review checks all lists)

---

### Sprint 6 (Week 6) — 10/15 points

**Goal:** Deliver dashboard and data portability — MVP complete

**Stories:**
| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-012 | Dashboard | 5 | Must Have |
| STORY-013 | Export/Import & Settings | 5 | Must Have |

**Total:** 10 points / 15 capacity (67% utilization)

**Rationale:** Dashboard requires completion and review data. Export/import rounds out data safety. Lower utilization gives room for bug fixes and polish. MVP is complete after this sprint.

**Risks:**
- JSON import validation edge cases
- Dashboard metrics accuracy depends on all stores being correct

**Dependencies:**
- STORY-010 (completion stats for dashboard)
- STORY-011 (review date for dashboard)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprint(s) |
|---------|-----------|---------|--------------|-----------|
| EPIC-001 | Capture & Inbox | STORY-003 | 5 | 2 |
| EPIC-002 | Clarify (Process Inbox) | STORY-004 | 8 | 2 |
| EPIC-003 | Organize (Lists & Views) | STORY-005, 006, 007, 008, 009, 010 | 31 | 1, 3, 4, 5 |
| EPIC-004 | Reflect (Weekly Review) | STORY-011 | 8 | 5 |
| EPIC-005 | Data & Persistence | STORY-001, 013 | 10 | 1, 6 |
| EPIC-006 | Dashboard & Navigation | STORY-002, 012 | 8 | 1, 6 |

---

## Requirements Coverage

| FR ID | FR Name | Story | Sprint | Priority |
|-------|---------|-------|--------|----------|
| FR-001 | Quick Capture | STORY-003 | 2 | Must Have |
| FR-002 | Inbox List | STORY-003 | 2 | Must Have |
| FR-003 | Guided Clarify Process | STORY-004 | 2 | Must Have |
| FR-004 | Next Actions List | STORY-005 | 3 | Must Have |
| FR-005 | Projects List | STORY-006 | 3 | Must Have |
| FR-006 | Project Detail | STORY-006 | 3 | Must Have |
| FR-007 | Waiting For List | STORY-007 | 4 | Must Have |
| FR-008 | Someday/Maybe List | STORY-007 | 4 | Must Have |
| FR-009 | Reference Archive | STORY-007 | 4 | Must Have |
| FR-010 | Calendar View | STORY-008 | 4 | Must Have |
| FR-011 | Contexts Management | STORY-009 | 1 | Must Have |
| FR-012 | Weekly Review | STORY-011 | 5 | Must Have |
| FR-013 | Local Persistence | STORY-001 | 1 | Must Have |
| FR-014 | Export to JSON | STORY-013 | 6 | Must Have |
| FR-015 | Import from JSON | STORY-013 | 6 | Must Have |
| FR-016 | Dashboard | STORY-012 | 6 | Must Have |
| FR-017 | Item Completion | STORY-010 | 5 | Should Have |
| FR-018 | Item Trash | STORY-010 | 5 | Should Have |
| FR-019 | Project Status Alerts | STORY-010 | 5 | Should Have |
| FR-020 | Tags Management | *Deferred* | — | Could Have |
| FR-021 | Duration Estimates | *Deferred* | — | Could Have |
| FR-022 | Energy Level | *Deferred* | — | Could Have |

**Coverage:** 19/19 in-scope FRs covered. 3 FRs deferred to post-MVP.

---

## Risks and Mitigation

**High:**
- **Clarify wizard UX complexity** — The multi-branch decision flow is the most complex feature. Mitigation: dedicated focus in Sprint 2 (8 points); keep wizard steps minimal and fast; allow keyboard navigation.
- **localStorage 5MB limit** — Large datasets could hit the cap. Mitigation: adapter pattern allows switching to IndexedDB; monitor storage usage in settings.

**Medium:**
- **Data loss from browser data clearing** — Users may lose data accidentally. Mitigation: export/import feature (Sprint 6); prominent backup reminder in settings.
- **Significant time off disrupting sprints** — With 1-week sprints, even a few days off can block a sprint. Mitigation: sprints 4 and 6 have lower utilization (67%) as buffer; stories are independent enough to resume.

**Low:**
- **Scope creep from Could Have features** — Tags, duration, energy could creep in. Mitigation: explicitly deferred in tech-spec and this plan.
- **Browser compatibility** — Modern browsers only (Chrome, Firefox, Safari, Edge). Mitigation: no IE, no polyfills needed.

---

## Dependencies

**Internal (story-to-story):**
- STORY-001 → all other stories (foundation)
- STORY-002 → STORY-003 (layout needed for capture)
- STORY-009 → STORY-004 (contexts needed for clarify)
- STORY-003 → STORY-004 (inbox items feed clarify)
- STORY-004 → STORY-005, 006, 007, 008 (clarify creates items in these lists)
- STORY-005-008 → STORY-010, 011 (completion and review operate on these lists)
- STORY-010, 011 → STORY-012 (dashboard shows completion and review data)

**External:**
- Nuxt 3 framework
- Vue 3 / Pinia / Tailwind CSS / TypeScript
- No external services or APIs required

---

## Definition of Done

For a story to be considered complete:
- [ ] Code implemented and committed
- [ ] TypeScript types properly used (no `any`)
- [ ] Component renders correctly on mobile (320px) and desktop (2560px)
- [ ] Core functionality manually tested
- [ ] Data persists across page refresh
- [ ] No console errors
- [ ] Acceptance criteria validated

---

## Next Steps

**Immediate:** Begin Sprint 1

Run `/dev-story STORY-001` to start implementing the project scaffold and persistence layer.

**Sprint cadence:**
- Sprint length: 1 week
- Sprint planning: Monday
- Sprint review: Friday

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
