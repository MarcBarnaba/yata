# Sprint Plan: GSD (Sprints 7-8)

**Date:** 2026-02-05
**Scrum Master:** BMad Method
**Project Level:** 2
**Total Stories:** 6
**Total Points:** 21
**Planned Sprints:** 2

---

## Executive Summary

Post-MVP enhancement sprints focusing on visual polish, improved UX patterns, and expanded functionality. Sprint 7 upgrades the icon system, processing flow, dashboard, and adds keyboard shortcuts. Sprint 8 tackles layout improvements (collapsed nav, mobile capture FAB) and the monthly calendar view.

**Key Metrics:**
- Total Stories: 6
- Total Points: 21
- Sprints: 2
- Team Capacity: ~12 points per sprint
- Target Completion: 2 sprint cycles

---

## Story Inventory

### STORY-014: Material Icons Integration

**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want consistent, professional icons throughout the app
So that the interface feels polished and modern

**Acceptance Criteria:**
- [ ] Install `@material-symbols/font-400` package
- [ ] Replace all Unicode/emoji icons with Material Symbols equivalents
- [ ] Update `AppNav.vue`, `MobileNav.vue`, `NavLink.vue`, `MobileNavLink.vue`
- [ ] Update Dashboard quick links (before removal) and stat cards
- [ ] Update all page headers and action buttons
- [ ] Icons render correctly at all sizes (nav, buttons, inline)

**Technical Notes:**
- Import font in `nuxt.config.ts` or `app.vue`
- Create a reusable `<Icon name="..." />` component or use spans directly
- Icon names: `inbox`, `arrow_forward`, `hourglass_empty`, `calendar_month`, `folder`, `lightbulb`, `check_circle`, `delete`, `settings`, `add`, `edit`, etc.

**Dependencies:** None (do first to establish pattern)

---

### STORY-015: Improve Processing UX

**Priority:** Must Have
**Points:** 2

**User Story:**
As a user processing my inbox
I want larger, more accessible action buttons
So that I can quickly clarify items without precision clicking

**Acceptance Criteria:**
- [ ] Increase button sizes in `ClarifyWizard.vue` (min-height 48-56px)
- [ ] Add clear visual hierarchy: primary actions prominent, secondary actions subtle
- [ ] Improve touch targets for mobile (min 44px)
- [ ] Ensure keyboard navigation works (Tab, Enter)
- [ ] "Process" button on inbox items more prominent (not just hover-visible)

**Technical Notes:**
- Focus on `ClarifyWizard.vue` button styling
- Update `inbox.vue` process button visibility
- Use Tailwind: `py-4 px-6 text-lg` for primary buttons
- Consider icon + text for clarity (e.g., `→ Next Action`)

**Dependencies:** STORY-014 (for icons in buttons)

---

### STORY-016: Dashboard Redesign

**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want a focused dashboard showing what needs my attention
So that I can quickly decide what to work on

**Acceptance Criteria:**
- [ ] Remove Quick Links section entirely
- [ ] Prominent "Items to Process" section (inbox count, link to inbox)
- [ ] "Next Actions" section with count and top 3-5 items preview
- [ ] "Active Projects" section with count and stale project warnings
- [ ] Small "Someday/Maybe" section (count only, subtle)
- [ ] Keep System Health indicator (simplified if needed)
- [ ] Clean, scannable layout with clear visual hierarchy

**Technical Notes:**
- Refactor `pages/index.vue`
- Use card-based layout with Material icons
- Show actual item previews, not just counts
- Consider "What to do next?" as primary CTA

**Dependencies:** STORY-014 (for icons)

---

### STORY-017: Keyboard Shortcuts Layer

**Priority:** Should Have
**Points:** 3

**User Story:**
As a power user
I want keyboard shortcuts for common actions
So that I can navigate and capture quickly without using the mouse

**Acceptance Criteria:**
- [ ] Global shortcut to focus capture input (e.g., `Cmd+K` or `Cmd+N`)
- [ ] Shortcut to navigate to Inbox (`Cmd+1` or `G then I`)
- [ ] Shortcut to navigate to Next Actions (`Cmd+2` or `G then N`)
- [ ] Shortcuts visible in input placeholders (e.g., "Capture something... ⌘K")
- [ ] Shortcuts summary in Settings page
- [ ] Mac-optimized (Cmd key), with Ctrl fallback for other platforms

**Technical Notes:**
- Use VueUse `useMagicKeys` or `onKeyStroke` composables
- Create `composables/useKeyboardShortcuts.ts`
- Register globally in `app.vue` or layout
- Prevent conflicts with browser defaults
- Consider: `Cmd+K` (capture), `Cmd+Enter` (save), `Escape` (close/cancel)

**Dependencies:** None (can parallel with others)

---

### STORY-018: Collapsed Navigation + Mobile Capture FAB

**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want a compact navigation that doesn't take too much space
So that I have more room for content on desktop and easy capture on mobile

**Acceptance Criteria:**

**Desktop:**
- [ ] Navigation collapsed by default (icons only, ~64px wide)
- [ ] Toggle button to expand/collapse (arrow or hamburger icon)
- [ ] Expanded state shows icons + labels (~240px wide)
- [ ] Collapse state persisted (localStorage or settings store)
- [ ] Smooth transition animation (width + label fade)
- [ ] Tooltips on icons when collapsed

**Mobile:**
- [ ] Remove QuickCapture from top of content area
- [ ] Add prominent "+" FAB button in center of bottom nav (larger than other icons)
- [ ] Tapping FAB opens capture overlay/modal
- [ ] Overlay has: title input, optional notes toggle, Add button, close/cancel
- [ ] Notes remain optional (toggle to show textarea)
- [ ] Overlay dismissible via backdrop tap or X button

**Technical Notes:**
- Desktop: Add `isCollapsed` state to settings store or local ref
- Desktop: Conditional classes on `AppNav.vue` for width
- Desktop: Use `<Transition>` for label fade
- Mobile: New `CaptureModal.vue` component
- Mobile: Adjust `MobileNav.vue` layout for centered FAB
- Mobile: Use Teleport for modal overlay

**Dependencies:** STORY-014 (for icons)

---

### STORY-019: Calendar Monthly View

**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to see my scheduled items in a monthly calendar view
So that I can visualize my commitments over a longer time horizon

**Acceptance Criteria:**
- [ ] Add view toggle: Week / Month (default: Week for continuity)
- [ ] Monthly grid showing all days of the month
- [ ] Current day highlighted
- [ ] Days with scheduled items show indicator (dot or count)
- [ ] Clicking a day shows items for that day (inline expand or side panel)
- [ ] Navigation: prev/next month, "Today" button
- [ ] Overdue items section still visible (above calendar)
- [ ] Responsive: works on mobile (may need horizontal scroll or list fallback)

**Technical Notes:**
- Extend `pages/calendar.vue` with view toggle
- Create month grid using CSS Grid (7 columns)
- Calculate first day of month, padding days from prev/next month
- Group items by date for dot indicators
- Consider `date-fns` for date calculations (already available or add)
- Mobile: Consider showing month as list grouped by week if grid too cramped

**Dependencies:** STORY-014 (for icons in toggle/nav)

---

## Sprint Allocation

### Sprint 7 (11 points) — Visual Polish & UX

**Goal:** Upgrade the visual system and interaction quality

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-014 | Material Icons Integration | 3 | Must Have |
| STORY-015 | Improve Processing UX | 2 | Must Have |
| STORY-016 | Dashboard Redesign | 3 | Must Have |
| STORY-017 | Keyboard Shortcuts Layer | 3 | Should Have |

**Total:** 11 points
**Utilization:** 92% of ~12 capacity

**Risks:**
- Icon migration touches many files — methodical approach needed

**Sprint 7 delivers:**
- Professional icon system throughout
- Better processing flow with larger buttons
- Focused, actionable dashboard
- Keyboard shortcuts for power users

---

### Sprint 8 (10 points) — Layout & Calendar

**Goal:** Improve navigation ergonomics and add monthly calendar view

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-018 | Collapsed Navigation + Mobile Capture FAB | 5 | Must Have |
| STORY-019 | Calendar Monthly View | 5 | Must Have |

**Total:** 10 points
**Utilization:** 83% of ~12 capacity

**Risks:**
- Layout changes affect multiple components
- Monthly calendar is new UI pattern — may need iteration

**Sprint 8 delivers:**
- Compact desktop nav with expand toggle
- Mobile capture as central FAB with modal
- Full monthly calendar view with day details

---

## Requirements Traceability

| Requirement | Story | Sprint |
|-------------|-------|--------|
| Use Material icons everywhere | STORY-014 | 7 |
| Make processing actions easier (bigger buttons) | STORY-015 | 7 |
| Dashboard: remove quick links, focus on processing/actions/projects | STORY-016 | 7 |
| Keyboard shortcuts (Mac-based, VueUse) | STORY-017 | 7 |
| Nav collapsed by default on desktop (icons only, toggle) | STORY-018 | 8 |
| Mobile: capture input as FAB in bottom nav with overlay | STORY-018 | 8 |
| Calendar: add monthly view | STORY-019 | 8 |

---

## Definition of Done

For a story to be considered complete:
- [ ] Code implemented and committed
- [ ] No TypeScript errors
- [ ] Responsive design works on mobile and desktop
- [ ] Tested manually on Chrome (desktop + mobile emulation)
- [ ] Acceptance criteria validated

---

## Next Steps

**Immediate:** Begin Sprint 7

Run `/bmad:dev-story STORY-014` to start with Material Icons integration (establishes pattern for other stories).

**Recommended order for Sprint 7:**
1. STORY-014 (icons) — do first, others depend on it
2. STORY-017 (keyboard) — can parallel with 015/016
3. STORY-015 (processing UX)
4. STORY-016 (dashboard)

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
