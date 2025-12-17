# Implementation Todo List: Replay/export hooks (PGN/JSON)

**Task ID:** task-002-4  
**Started:** 2025-12-17  
**Status:** In Progress

---

## Phase 1: Serialization foundations

- [x] T1.1 Define export schemas and error codes (est: 3h)
- [x] T1.2 Implement JSON export helper (est: 3h)
- [x] T1.3 Implement PGN export helper (est: 2h)

## Phase 2: Import + validation

- [x] T2.1 Implement JSON import with validation (est: 4h)
- [x] T2.2 Implement PGN import (est: 3h)
- [x] T2.3 Add JSON/PGN round-trip tests (est: 3h)

## Phase 3: Replay controller

- [x] T3.1 Implement replay controller core (est: 4h)
- [x] T3.2 Add replay memoization/perf guardrails (est: 2h)
- [x] T3.3 Add replay controller tests (est: 2h)

## Phase 4: Polish & docs

- [x] T4.1 Polish metadata/result handling (est: 2h)
- [x] T4.2 Add docs/examples for export/import/replay (est: 2h)

---

## Progress Log

| Date | Completed | Notes |
|------|-----------|-------|
| 2025-12-17 | T1.1, T1.2, T1.3, T2.1, T2.2, T2.3, T3.1, T3.2, T3.3, T4.1, T4.2 | Exports/imports, replay, tests, and docs implemented |
