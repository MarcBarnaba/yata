# STORY-020: Navbar Polish & Bug Fixes

**Epic:** UI/UX Polish
**Priority:** Should Have
**Story Points:** 2
**Status:** Completed
**Assigned To:** Unassigned
**Created:** 2026-02-06
**Sprint:** 9 (Backlog)

---

## User Story

As a user
I want smooth navigation transitions and consistent behavior across devices
So that the interface feels polished and professional

---

## Description

### Background
STORY-018 introduced the collapsed navigation feature on desktop and mobile menu drawer. After implementation, three issues were identified that affect the user experience:

1. **Desktop transition**: The sidebar width transitions, but internal content changes abruptly
2. **Mobile menu state**: The mobile drawer inherits the desktop collapsed state, showing only icons
3. **Desktop spacing**: Unexplained padding/space on the right side of the navbar

### Scope

**In scope:**
- Smooth CSS transitions for collapse/expand on desktop
- Force expanded state for mobile menu drawer
- Investigate and fix right-side spacing in desktop nav

**Out of scope:**
- New navigation features
- Changes to navigation structure

---

## Issues Analysis

### Issue 1: Desktop Transition Not Smooth

**Current behavior:**
- `aside` element has `transition-[width] duration-200`
- `AppNav` content (labels, section headers) use `v-if="!isCollapsed"` — instant hide/show
- `NavLink.vue` has `<Transition name="fade">` but only on the label span

**Root cause:**
- Section headers (`<span class="text-xs font-semibold...">`) have no transition
- Width change is smooth, but content appears/disappears abruptly

**Location:**
- [layouts/default.vue:5-6](layouts/default.vue#L5-L6) — aside transition
- [components/AppNav.vue:27-55](components/AppNav.vue#L27-L55) — section headers with `v-if`
- [components/NavLink.vue:14-16](components/NavLink.vue#L14-L16) — label transition

### Issue 2: Mobile Menu Shows Collapsed State

**Current behavior:**
- Mobile menu drawer renders `<AppNav />` directly
- `AppNav` reads `isCollapsed` from settings store
- If user collapsed nav on desktop, mobile drawer shows icons only

**Root cause:**
- Same component, same state — no device-specific override

**Location:**
- [layouts/default.vue:42](layouts/default.vue#L42) — `<AppNav />` in mobile drawer

### Issue 3: Desktop Navbar Right-Side Spacing

**Possible causes to investigate:**
1. `AppNav` doesn't fill full height/width of parent `aside`
2. Scrollbar space reserved even when not scrolling
3. Padding in inner containers (`px-2`, `px-3`)
4. Border or margin on child elements

**Location:**
- [components/AppNav.vue](components/AppNav.vue) — entire component
- [layouts/default.vue:4-9](layouts/default.vue#L4-L9) — aside container

---

## Acceptance Criteria

- [x] Desktop: Section headers fade in/out smoothly when toggling collapse
- [x] Desktop: All content transitions feel cohesive with the width change
- [x] Mobile: Menu drawer always shows expanded state (icons + labels)
- [x] Mobile: Toggling desktop nav collapse doesn't affect mobile drawer
- [x] Desktop: No unexpected spacing/gap on right side of navbar
- [x] Transitions don't cause layout shift or visual jank
- [x] Collapse state still persists correctly for desktop

---

## Technical Notes

### Fix 1: Smooth Section Header Transitions

**Option A:** Wrap section headers in `<Transition>`
```vue
<Transition name="fade">
  <div v-if="!isCollapsed" class="mt-4 px-3">
    <span class="text-xs font-semibold...">Actions</span>
  </div>
</Transition>
```

**Option B:** Use opacity + visibility instead of v-if
```vue
<div
  class="mt-4 px-3 transition-opacity duration-200"
  :class="isCollapsed ? 'opacity-0 invisible h-0' : 'opacity-100'"
>
```

### Fix 2: Force Expanded State on Mobile

**Option A:** Pass prop to override
```vue
<!-- layouts/default.vue -->
<AppNav :force-expanded="true" />

<!-- AppNav.vue -->
const props = defineProps<{ forceExpanded?: boolean }>()
const isCollapsed = computed(() =>
  props.forceExpanded ? false : settingsStore.navCollapsed
)
```

**Option B:** Detect mobile in AppNav
```vue
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 768
})
const isCollapsed = computed(() =>
  isMobile.value ? false : settingsStore.navCollapsed
)
```

**Recommendation:** Option A (prop) — cleaner, explicit, testable

### Fix 3: Debug Right-Side Spacing

1. Inspect with DevTools — check computed box model
2. Look for:
   - `overflow-y: scroll` reserving scrollbar width
   - Hidden padding/margin
   - Flex container issues
3. Potential fix: ensure `AppNav` has `w-full` or parent has no extra padding

---

## Dependencies

**Prerequisite Stories:**
- STORY-018: Collapsed Navigation (completed)

**Blocked Stories:**
- None

**External Dependencies:**
- None

---

## Definition of Done

- [x] Code implemented and committed to feature branch
- [x] Section headers transition smoothly
- [x] Mobile drawer always shows full labels
- [x] Right-side spacing issue resolved
- [x] No TypeScript errors
- [x] Tested on Chrome desktop + mobile emulation
- [x] Acceptance criteria validated
- [ ] Code reviewed and merged

---

## Story Points Breakdown

- **Fix 1 (transitions):** 0.5 points
- **Fix 2 (mobile state):** 0.5 points
- **Fix 3 (spacing debug):** 1 point
- **Total:** 2 points

**Rationale:** Small refinements to existing code. Spacing issue may require investigation time.

---

## Progress Tracking

**Status History:**
- 2026-02-06: Created from user feedback
- 2026-02-06: Completed

**Actual Effort:** 2 points (matched estimate)

**Implementation Notes:**
- Added fade transitions to all section headers using `<Transition name="fade">`
- Added `forceExpanded` prop to AppNav component
- Mobile drawer passes `force-expanded` to always show expanded state
- Added `w-full` to nav element to ensure full width
- Hide collapse toggle button in mobile drawer (not needed)
- Transitions sync at 150ms for cohesive feel

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
