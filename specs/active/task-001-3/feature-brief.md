@ Feature Brief: Navigation & baseline pages

**Task ID:** task-001-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need routing and baseline pages (Home, Play stub, Matches list stub) so users can navigate the app and see the chess experience entry points.

## Target Users

- You (developer) and anyone exploring the app UI to start AI-vs-AI games or view saved matches.

## Core Requirements

### Must Have
- [ ] Home page with concise overview and CTA to start a match.
- [ ] Play page stub wired to future board/engine flow.
- [ ] Matches list stub to show saved games (localStorage later).
- [ ] Metadata per page (title/description).

### Nice to Have
- [ ] Simple empty states and placeholder copy.
- [ ] Breadcrumbs or nav highlighting for current page.

## Technical Approach

Use Next.js app router pages with static metadata. Keep stubs simple but structured for future data. Ensure navigation links route correctly. Add placeholder components/sections to be filled by later epics (board, matches data).

**Patterns to Follow:**
- Next.js app router page.tsx per route.
- Shared layout navigation from Epic 1 shell.

**Key Decisions:**
- Keep content minimal; avoid premature data fetching.
- Use consistent headings/buttons aligning with shell styles.

## Next Actions

1. [ ] Create `app/page.tsx` (home) with CTA to Play.
2. [ ] Create `app/play/page.tsx` stub with placeholder board section.
3. [ ] Create `app/matches/page.tsx` stub with list placeholder and empty state.
4. [ ] Set metadata for each route.

## Success Criteria

- [ ] Nav links route correctly to Home/Play/Matches.
- [ ] Pages render with clear headings and placeholders.
- [ ] Metadata set for each route.

## Open Questions

- Any preferred wording for CTAs/headers?
- Should matches list sort by most recent by default? (assume yes later)

---

*Brief created with SDD 2.5 - Ready to code!*륎
