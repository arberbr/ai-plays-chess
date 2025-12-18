# Technical Plan: Testing & linting sweep (unit + a11y + smoke)

**Task ID:** task-006-1  
**Created:** 2025-12-18  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview
Testing and linting sit as a quality layer around the existing Next.js + TypeScript app. We will introduce:
- Fast unit tests on chess engine/utilities via Vitest (jsdom for any DOM helpers).
- UI/component tests with Testing Library where meaningful (controls on key pages).
- Smoke/e2e coverage with Playwright for core flows (start game, make moves, pause/reset, save/load if available).
- Basic a11y pass inside Playwright using `@axe-core/playwright` on key routes.
- Scripted entrypoints in `package.json` to run lint, format, unit, smoke, a11y, and CI bundles.

```
┌──────────┐     ┌──────────────┐     ┌───────────────────┐
│  Lint    │────▶│  Unit (Vitest)│────▶│ Smoke/A11y (PW)  │
└──────────┘     └──────────────┘     └───────────────────┘
       ▲                    │                    │
       │                    ▼                    ▼
   Source code        Chess engine tests    UI flows & a11y
```

### Architecture Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | Vitest | Fast, TypeScript-friendly, easy jsdom setup; aligns with modern tooling.
| UI testing | @testing-library/react | Encourages behavior-driven selectors and resilience to markup changes.
| Smoke/E2E | Playwright | Reliable cross-browser automation; integrates with axe for a11y.
| A11y checks | @axe-core/playwright | Lightweight automated a11y scan on key pages.
| Scripts | pnpm scripts for lint/format/test | Single source of truth for CI-ready commands.

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Unit tests | Vitest | latest 1.x | Fast runner, snapshots, good DX.
| UI helpers | @testing-library/react, @testing-library/user-event | latest | Aligns with React 18; user-centric queries.
| Smoke/E2E | Playwright | latest | Robust browser automation; trace support.
| A11y | @axe-core/playwright | latest | Quick a11y signal without full audit.
| Lint/Format | ESLint, Prettier, next lint | existing | Already configured; keep consistent.

### Dependencies (to add)
```json
{
  "vitest": "^1.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^25.x",
  "playwright": "^1.x",
  "@axe-core/playwright": "^4.x"
}
```

---

## 3. Component Design

### Component 1: Vitest setup
**Purpose:** Establish unit test runner for engine/utilities.  
**Responsibilities:** Configure jsdom test environment; expose jest-dom matchers; enable TypeScript path aliases.  
**Interfaces:** `vitest.config.ts`, `setupTests.ts` exporting global setup.  
**Dependencies:** Vitest, jsdom, @testing-library/jest-dom.

### Component 2: Chess engine/unit suites
**Purpose:** Cover core helpers (move scoring, summary/model ranking, validation/FEN/PGN).  
**Responsibilities:** Deterministic fixtures; ensure classification logic, filtering, rankings behave.  
**Interfaces:** `src/lib/chess/__tests__/*.test.ts` using describe/it; shared fixtures util.  
**Dependencies:** Vitest, TypeScript types from chess modules.

### Component 3: UI/component checks (optional minimal)
**Purpose:** Validate critical controls render and respond (play controls, theme toggle).  
**Responsibilities:** Render components with Testing Library; assert accessible labels/role-based queries; simulate clicks.  
**Interfaces:** Tests under `src/app/**/__tests__` or `src/components/__tests__`.  
**Dependencies:** @testing-library/react, user-event, jsdom.

### Component 4: Smoke/e2e flows
**Purpose:** Validate main user journeys in browser context.  
**Responsibilities:** Playwright tests to start a game, make a move sequence, pause/reset; optionally save/load if implemented. Capture trace on failure.  
**Interfaces:** `playwright.config.ts`, tests under `e2e/`.  
**Dependencies:** Playwright.

### Component 5: A11y sweep
**Purpose:** Automated a11y scan on key pages (home, play, matches).  
**Responsibilities:** Run axe against loaded pages; fail on critical violations; whitelist known acceptable issues if needed.  
**Interfaces:** Reuse Playwright tests or dedicated a11y spec.  
**Dependencies:** @axe-core/playwright.

### Component 6: Scripts/CI wiring
**Purpose:** Single commands for lint, format, unit, smoke, a11y, coverage, CI bundle.  
**Responsibilities:** Update `package.json` scripts; document in README; optional `test:ci` aggregator.  
**Interfaces:** pnpm scripts; CI can call `pnpm test:ci`.  
**Dependencies:** pnpm, existing tooling.

---

## 4. Data Model & Fixtures
- **Move annotations:** gameId, ply, color, deltaCp, classification, modelId, timestamp (used in summary/ranking tests).  
- **Model ranking metrics:** wins/losses/draws, strong/blunder counts, composite scores.  
- **Move scoring inputs:** evaluations (cp, mate sign/moves), thresholds.  
- **FEN/PGN fixtures:** valid/invalid strings for validation tests; simple games for smoke tests.  
- **Local storage/persistence mocks:** seed structures for save/load smoke if present.  
- **Routes:** `/`, `/play`, `/matches` used by Playwright.

---

## 5. Test & Script Contracts
- **Lint:** `pnpm lint` (existing).  
- **Format check:** `pnpm format:check`; fix via `pnpm format`.  
- **Unit:** `pnpm test:unit` → Vitest (jsdom).  
- **Coverage:** `pnpm test:unit -- --coverage` with threshold targets noted in README (soft targets, e.g., 70% lines for chess engine).  
- **Smoke:** `pnpm test:smoke` → Playwright headed=false, trace on failure.  
- **A11y:** `pnpm test:a11y` → Playwright + axe, focused on key pages.  
- **CI bundle:** `pnpm test:ci` → runs lint, format:check, test:unit --coverage, test:smoke (optionally gated by env flag), test:a11y.  
- **Artifacts:** Playwright traces in `./playwright-report` or `./test-results` for debugging.

---

## 6. Security & A11y Considerations
- **Auth:** None currently; ensure tests do not stub insecurely.  
- **Data handling:** Avoid storing real tokens; clear storage between tests.  
- **A11y:** Use role/name-based queries; axe scan for critical issues; ensure controls have labels; keyboard focusable controls validated in smoke if feasible.  
- **Secrets:** Keep Playwright config free of secrets; rely on env vars if later added.

---

## 7. Performance & Reliability Strategy
- Keep unit tests deterministic and isolated (no network/filesystem).  
- Use parallel test runs; shard Playwright if needed.  
- Limit smoke scope to core flows to keep runtime low; reuse fixtures.  
- Use stable selectors (roles, labels) to reduce flake; enable retries for smoke in CI only.  
- Cache Next.js build not required for unit tests (pure TS).  
- Optionally record coverage for engine modules only to keep reports clean.

---

## 8. Implementation Phases

### Phase 1: Test infra setup
- Add Vitest config + setup file with jsdom + jest-dom matchers.
- Add Playwright config and basic hello-world test to validate wiring.
- Add scripts: test:unit, test:smoke, test:a11y, test:ci, coverage notes.

### Phase 2: Engine/unit coverage
- Port existing chess tests into Vitest suites (move-score, summary-view, model-ranking, validation/PGN/FEN). 
- Add fixtures for edge cases (mate scoring, invalid FEN/PGN). 
- Establish soft coverage targets in README.

### Phase 3: UI/component + a11y
- Add minimal component tests for critical controls (play page controls, theme toggle, match list). 
- Integrate axe via Playwright; scan `/`, `/play`, `/matches`.

### Phase 4: Smoke flows
- Author Playwright flows: start game, make a sequence of moves, pause/reset; include save/load if feature exists. 
- Capture trace/video on failure; document troubleshooting.

### Phase 5: Docs & CI readiness
- Update README with commands and coverage expectations. 
- Ensure scripts run clean locally; note CI entrypoint (`pnpm test:ci`).

---

## 9. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| UI still evolving → flaky smoke tests | Medium | Medium | Use role-based selectors; keep flows short; enable retries in CI only. |
| Headless browser deps in CI | Medium | Medium | Use Playwright install step; document required packages; allow skip via env flag. |
| Coverage noise from non-engine files | Low | Medium | Scope coverage include patterns to chess engine files first. |
| A11y violations block pipeline | Medium | Low | Start with warn-level or limited rules; allow baseline file if necessary. |
| Test runtime creep | Medium | Medium | Keep smoke limited; parallelize; cache traces only on failure. |

---

## 10. Open Questions
- Preferred test runner is assumed Vitest—OK to proceed? (fallback: Jest). 
- Which flows are mandatory for smoke: start/move/pause/reset only, or also save/load? 
- Acceptable coverage threshold for engine modules (proposed soft target: ~70% lines)? 
- Should a11y violations fail the pipeline immediately or report-only for first pass?

---

## Next Steps
1. Confirm runner choice (Vitest vs Jest) and smoke scope.  
2. Add test dependencies and configs.  
3. Port and extend engine/unit tests; add fixtures.  
4. Add Playwright smoke/a11y scripts and document commands.  
5. Run `pnpm test:ci` locally to validate.

---

*Plan created with SDD 2.0*
