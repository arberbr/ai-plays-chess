# Implementation Todo List: Testing & linting sweep (unit + a11y + smoke)

**Task ID:** task-006-1  
**Started:** 2025-12-18  
**Status:** In Progress

---

## Phase 1: Foundation
- [ ] Add Vitest setup + scripts (estimated: 2h)
  - Files: `vitest.config.ts`, `setupTests.ts`, `package.json`
  - Dependencies: none
- [ ] Add Playwright config + smoke/a11y scripts (estimated: 2h)
  - Files: `playwright.config.ts`, `e2e/**/*.spec.ts`, `package.json`
  - Dependencies: Vitest setup scripts

## Phase 2: Engine & UI Coverage
- [ ] Port/extend chess engine tests (move-score, summary/model ranking, validation) (estimated: 2h)
  - Files: `src/lib/chess/__tests__/*.test.ts`, fixtures
  - Dependencies: Vitest setup
- [ ] Add minimal UI/component tests (play controls/theme toggle) (estimated: 1h)
  - Files: `src/app/**/__tests__/*.test.tsx`
  - Dependencies: Vitest setup

## Phase 3: Smoke & A11y
- [ ] Add Playwright smoke flows (start/move/pause/reset, save/load if available) (estimated: 2h)
  - Files: `e2e/smoke/*.spec.ts`
  - Dependencies: Playwright config
- [ ] Add axe a11y scans for key pages (estimated: 1h)
  - Files: `e2e/a11y/*.spec.ts`
  - Dependencies: Playwright config

## Phase 4: Docs & Verification
- [ ] Update README with commands and coverage notes (estimated: 0.5h)
  - Files: `README.md`
  - Dependencies: scripts defined
- [ ] Run and verify scripts (lint, test:unit, test:smoke, test:a11y, test:ci) (estimated: 1h)
  - Files: n/a
  - Dependencies: all prior tasks

---

## Progress Log
| Date | Completed | Notes |
|------|-----------|-------|
| 2025-12-18 | Created todo list | |
| 2025-12-18 | Finished all tasks | Ran `pnpm test:unit`, `pnpm test:smoke`, `pnpm test:a11y`; `pnpm test:ci` failed at `format:check` because repo has existing template placeholders. |
