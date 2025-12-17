@ Feature Brief: Testing & linting sweep (unit + a11y + smoke)

**Task ID:** task-006-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a testing and linting sweep to ensure the chess app’s foundation is stable: unit coverage for engine/utilities, basic accessibility checks, and smoke flow confidence.

## Target Users

- You (developer) and users relying on a stable app experience.

## Core Requirements

### Must Have
- [ ] Lint/format passes (ESLint/Prettier).
- [ ] Unit tests for engine/core helpers (state, validation, PGN).
- [ ] Smoke tests for main flows (start game, make moves).
- [ ] Basic accessibility check for interactive controls.

### Nice to Have
- [ ] Minimal CI-ready script to run tests/lint.
- [ ] Coverage targets noted (even if soft).

## Technical Approach

Add/update lint/test scripts; write unit tests around engine/state, move validation, and PGN utilities; add smoke tests for core UI flows once UI exists. Include a basic a11y check (e.g., axe) on key pages/components. Keep scope lean but meaningful.

**Patterns to Follow:**
- Deterministic, isolated unit tests.
- Reuse existing scripts/patterns; avoid brittle selectors.

**Key Decisions:**
- Test runner likely Jest/Vitest; align with stack when set.
- Scope smoke to core flows (start/pause/reset, save/load) as feasible.

## Next Actions

1. [ ] Ensure lint/test scripts wired in package.json.
2. [ ] Write unit tests for engine/state + validation/PGN helpers.
3. [ ] Add smoke/a11y checks for key UI interactions.
4. [ ] Document commands in README/notes.

## Success Criteria

- [ ] Lint/test commands pass locally.
- [ ] Core engine helpers covered by unit tests.
- [ ] Basic smoke/a11y check in place.

## Open Questions

- Preferred test runner? (default to Jest/Vitest when installing)
- Depth of a11y scope? (basic axe run is fine)

---

*Brief created with SDD 2.5 - Ready to code!*翿
