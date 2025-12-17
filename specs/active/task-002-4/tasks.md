# Implementation Tasks: Replay/export hooks (PGN/JSON)

**Task ID:** task-002-4  
**Created:** 2025-12-17  
**Status:** Ready for Implementation  
**Based on:** plan.md

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 10 |
| Estimated Effort | ~30 hours (3.5–4 days) |
| Phases | 4 |
| Critical Path | T1.1 → T1.2 → T2.1/T2.2 → T3.1/T3.3 → T4.2 |

---

## Phase 1: Serialization foundations (types & exports)

**Goal:** Define export schema and baseline exporters for JSON/PGN.  
**Estimated:** ~8 hours

### Task 1.1: Define export schemas and error codes
**Description:** Add `GameExportJson`/metadata types, versioning constant, and structured error codes/messages for serialization/import flows.

**Acceptance Criteria:**
- [ ] Types cover version, final FEN, SAN list, optional moves, optional metadata.
- [ ] Error codes enumerated (e.g., `INVALID_VERSION`, `SCHEMA_INVALID`, `ILLEGAL_MOVE`, `PARSE_ERROR`).
- [ ] Version constant referenced by exporters/importers.

**Effort:** 3h  
**Priority:** High  
**Dependencies:** None  
**Assignee:** Unassigned

### Task 1.2: Implement JSON export helper
**Description:** Implement `exportGameToJson(state, pgnMoves, metadata?)` producing versioned payload with final FEN + SAN list; include optional metadata/moves if provided.

**Acceptance Criteria:**
- [ ] Returns valid `GameExportJson`.
- [ ] Uses existing FEN helper for `finalFen`.
- [ ] Validates inputs and throws structured errors on invalid state/moves.

**Effort:** 3h  
**Priority:** High  
**Dependencies:** Task 1.1  
**Assignee:** Unassigned

### Task 1.3: Implement PGN export helper
**Description:** Implement `exportGameToPgn` using existing PGN builder and optional metadata tags.

**Acceptance Criteria:**
- [ ] Produces PGN string aligned with given SAN list.
- [ ] Optional metadata reflected in PGN tags when present.
- [ ] Throws on inconsistent move list.

**Effort:** 2h  
**Priority:** Medium  
**Dependencies:** Task 1.1  
**Assignee:** Unassigned

---

## Phase 2: Import + validation

**Goal:** Reconstruct state from JSON/PGN with deterministic validation.  
**Estimated:** ~10 hours

### Task 2.1: Implement JSON import with validation
**Description:** `importGameFromJson(payload)` validating version/schema, replaying moves from start (or provided initial FEN if added), cross-checking final FEN.

**Acceptance Criteria:**
- [ ] Rejects bad version/schema with specific error codes.
- [ ] Applies moves via existing move/validate utilities.
- [ ] Final state FEN matches payload.finalFen when present.

**Effort:** 4h  
**Priority:** High  
**Dependencies:** Tasks 1.1, 1.2  
**Assignee:** Unassigned

### Task 2.2: Implement PGN import
**Description:** `importGameFromPgn(pgn)` parsing PGN into SAN list, replaying moves, and returning state + metadata.

**Acceptance Criteria:**
- [ ] Parses PGN tags/moves using existing PGN parser.
- [ ] Replays moves deterministically to final state.
- [ ] Surfaces parse/illegal move errors with structured codes.

**Effort:** 3h  
**Priority:** High  
**Dependencies:** Tasks 1.1, 1.3  
**Assignee:** Unassigned

### Task 2.3: Round-trip tests (JSON/PGN)
**Description:** Add tests ensuring export→import round-trips for typical and edge cases.

**Acceptance Criteria:**
- [ ] JSON round-trip restores identical state and SAN list.
- [ ] PGN round-trip restores identical state and SAN list.
- [ ] Negative tests for invalid version/schema/illegal moves.

**Effort:** 3h  
**Priority:** High  
**Dependencies:** Tasks 2.1, 2.2  
**Assignee:** Unassigned

---

## Phase 3: Replay controller

**Goal:** Deterministic iterator with stepping/jumping and cached snapshots.  
**Estimated:** ~8 hours

### Task 3.1: Implement replay controller core
**Description:** `createReplayController(moves, initialFen?)` with `current/next/prev/jumpTo/reset/length`, maintaining cursor and state.

**Acceptance Criteria:**
- [ ] Bounds-checked navigation; throws on invalid index.
- [ ] `current` returns snapshot with index/state/fen/san.
- [ ] Stateless API aside from internal cursor; no global mutations.

**Effort:** 4h  
**Priority:** High  
**Dependencies:** Task 2.1, Task 2.2  
**Assignee:** Unassigned

### Task 3.2: Snapshot memoization and performance guardrails
**Description:** Cache snapshots or FEN per step to avoid recompute; ensure memory bounds reasonable.

**Acceptance Criteria:**
- [ ] Memoization in place or documented rationale if skipped.
- [ ] Performance tests/benchmarks for moderate move lists.
- [ ] Safe fallbacks when cache invalidated (e.g., reset).

**Effort:** 2h  
**Priority:** Medium  
**Dependencies:** Task 3.1  
**Assignee:** Unassigned

### Task 3.3: Replay controller tests
**Description:** Tests for deterministic stepping, jumping, reset, and error cases.

**Acceptance Criteria:**
- [ ] Covers next/prev/jump/reset on sample games.
- [ ] Ensures snapshots match expected FEN/SAN at indices.
- [ ] Verifies bounds errors thrown.

**Effort:** 2h  
**Priority:** High  
**Dependencies:** Tasks 3.1, 3.2  
**Assignee:** Unassigned

---

## Phase 4: Polish, metadata, docs

**Goal:** Optional metadata/result support, UX niceties, documentation.  
**Estimated:** ~4 hours

### Task 4.1: Metadata/result handling polish
**Description:** Ensure optional metadata/result flow through export/import and PGN tags; clarify initial FEN handling if non-standard starts.

**Acceptance Criteria:**
- [ ] Metadata fields persisted in JSON/PGN when present.
- [ ] Initial FEN honored if provided; defaults documented.
- [ ] Result codes mapped consistently.

**Effort:** 2h  
**Priority:** Medium  
**Dependencies:** Tasks 2.1, 2.2  
**Assignee:** Unassigned

### Task 4.2: Docs and usage examples
**Description:** Add README/spec snippets showing export/import/replay usage and error codes.

**Acceptance Criteria:**
- [ ] Examples for JSON export/import and PGN export/import.
- [ ] Replay controller usage snippet with navigation.
- [ ] Error codes and expected behaviors documented.

**Effort:** 2h  
**Priority:** Medium  
**Dependencies:** Phase 1-3 complete  
**Assignee:** Unassigned

---

## Dependency Graph

```
Phase 1
├─ T1.1
├─ T1.2 (depends T1.1)
└─ T1.3 (depends T1.1)

Phase 2 (depends Phase 1)
├─ T2.1 (depends T1.1, T1.2)
├─ T2.2 (depends T1.1, T1.3)
└─ T2.3 (depends T2.1, T2.2)

Phase 3 (depends Phase 2)
├─ T3.1 (depends T2.1, T2.2)
├─ T3.2 (depends T3.1)
└─ T3.3 (depends T3.1, T3.2)

Phase 4 (depends Phase 2/3)
├─ T4.1 (depends T2.1, T2.2)
└─ T4.2 (depends Phase 1-3)
```

---

## Quick Reference Checklist

### Phase 1
- [ ] T1.1: Define export schemas and error codes
- [ ] T1.2: Implement JSON export helper
- [ ] T1.3: Implement PGN export helper

### Phase 2
- [ ] T2.1: Implement JSON import with validation
- [ ] T2.2: Implement PGN import
- [ ] T2.3: Round-trip tests (JSON/PGN)

### Phase 3
- [ ] T3.1: Implement replay controller core
- [ ] T3.2: Snapshot memoization and performance guardrails
- [ ] T3.3: Replay controller tests

### Phase 4
- [ ] T4.1: Metadata/result handling polish
- [ ] T4.2: Docs and usage examples

---

## Risk Areas

| Task | Risk | Mitigation |
|------|------|------------|
| T2.2 | PGN parse differences | Reuse existing parser; add fixtures |
| T3.2 | Memory growth from caching | Memoize lightweight snapshots; cap or lazy-evaluate |
| T1.x | Versioning drift | Centralize version constant; assert in import paths |

---

## Next Steps

1. Start with T1.1 to lock schema/error codes.  
2. Proceed through phases in order; keep round-trip tests (T2.3) green.  
3. After Phase 3, finalize metadata/doc polish in Phase 4.  
4. Run `/implement task-002-4` when ready to build.
