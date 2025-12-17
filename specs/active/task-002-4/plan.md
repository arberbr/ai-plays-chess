# Technical Plan: Replay/export hooks (PGN/JSON)

**Task ID:** task-002-4  
**Created:** 2025-12-17  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview

Pure TypeScript utilities in `src/lib/chess` to export/import game state and provide replay controls. Serialization leverages existing FEN/PGN/move validation helpers; replay iterator exposes deterministic stepping without UI coupling.

```
┌─────────────┐    ┌──────────────────────────┐    ┌────────────────┐
│   UI layer  │ -> │  Replay / Serialization  │ -> │ Chess core libs │
└─────────────┘    └──────────────────────────┘    └────────────────┘
                      ↑ FEN/PGN/move/validate
```

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Export payload | JSON with version, metadata?, final FEN, PGN moves | Deterministic rebuild, future-safe via versioning |
| PGN handling | Reuse existing PGN builder/parser; no new deps | Consistency with current chess engine and tests |
| Replay model | Pure iterator/controller returning state + index | UI-agnostic, testable, deterministic |
| Error surface | Throw `Error` with structured message; consider Result type later | Simple integration with current codebase |

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Language | TypeScript | project default | Matches codebase |
| Data formats | PGN, JSON | n/a | Domain standards |
| State helpers | Existing `fen`, `move`, `validate`, `pgn` modules | n/a | Reuse battle-tested logic |

No new dependencies anticipated.

---

## 3. Component Design

### Component: Export helpers
**Purpose:** Convert in-memory game state and PGN log to JSON/PGN strings.

**Responsibilities:**
- Gather current `GameState`, PGN move list, optional metadata/result.
- Produce stable JSON payload with versioning and FEN snapshot.
- Serialize to PGN string via existing PGN builder.

**Interfaces (sketch):**
```typescript
type GameExportJson = {
  version: 1;
  finalFen: string;
  pgnMoves: string[]; // SAN list
  moves?: Move[]; // optional algebraic/coords history
  metadata?: {
    modelWhite?: string;
    modelBlack?: string;
    startTime?: string; // ISO
    result?: string; // "1-0" | "0-1" | "1/2-1/2" | "*"
  };
};

function exportGameToJson(state: GameState, pgnMoves: string[], metadata?: GameExportJson["metadata"]): GameExportJson;
function exportGameToPgn(state: GameState, pgnMoves: string[], metadata?: GameExportJson["metadata"]): string;
```

### Component: Import helpers
**Purpose:** Validate and reconstruct game state + PGN log from JSON/PGN.

**Responsibilities:**
- Parse and validate payload version/schema.
- Rebuild initial state (from optional start FEN or default).
- Apply moves using existing `move`/`validate` to reach final state; cross-check final FEN if present.
- Return `GameState`, PGN list, and derived metadata.

**Interfaces (sketch):**
```typescript
type ImportResult = {
  state: GameState;
  pgnMoves: string[];
  metadata?: GameExportJson["metadata"];
};

function importGameFromJson(payload: GameExportJson): ImportResult;
function importGameFromPgn(pgn: string): ImportResult;
```

### Component: Replay iterator/controller
**Purpose:** Provide deterministic stepping/jumping through move list for UI replay.

**Responsibilities:**
- Maintain cursor index and current `GameState`.
- Support `next()`, `prev()`, `jumpTo(index)`, `reset()`; expose current snapshot (state, fen, san, index).
- Optionally expose derived replay speed hints (nice-to-have).

**Interfaces (sketch):**
```typescript
type ReplaySnapshot = {
  index: number;      // move index at cursor (0 = pre-move)
  state: GameState;
  fen: string;
  san?: string;       // move SAN at index (if index > 0)
};

type ReplayController = {
  current(): ReplaySnapshot;
  next(): ReplaySnapshot;
  prev(): ReplaySnapshot;
  jumpTo(index: number): ReplaySnapshot;
  reset(): ReplaySnapshot;
  length(): number;
};

function createReplayController(moves: string[], initialFen?: string): ReplayController;
```

---

## 4. Data Model

- **GameExportJson**
  - `version: 1`
  - `finalFen: string`
  - `pgnMoves: string[]` (SAN list; authoritative move order)
  - `moves?: Move[]` (optional raw move data if available)
  - `metadata?: { modelWhite?, modelBlack?, startTime?, result? }`

- **Import assumptions**
  - Default start position if no start FEN; honor provided initial FEN if added later.
  - Validate SAN list against chess rules; ensure replay leads to `finalFen` if provided.

- **Replay snapshot**
  - Cursor-indexed snapshot containing state + fen + SAN at index.

---

## 5. API Contracts

### Export
| Function | Input | Output | Errors |
|----------|-------|--------|--------|
| `exportGameToJson(state, pgnMoves, metadata?)` | `GameState`, `string[]`, optional metadata | `GameExportJson` | Invalid state or move list |
| `exportGameToPgn(state, pgnMoves, metadata?)` | Same | PGN string | Invalid move list |

### Import
| Function | Input | Output | Errors |
|----------|-------|--------|--------|
| `importGameFromJson(payload)` | `GameExportJson` | `ImportResult` | Version mismatch, schema invalid, illegal move |
| `importGameFromPgn(pgn)` | PGN string | `ImportResult` | Parse failure, illegal move |

### Replay
| Function | Input | Output | Errors |
|----------|-------|--------|--------|
| `createReplayController(moves, initialFen?)` | SAN list, optional FEN | `ReplayController` | Invalid SAN/move application |

Error contract: throw `Error` with message and code (e.g., `INVALID_VERSION`, `ILLEGAL_MOVE`, `PARSE_ERROR`).

---

## 6. Security Considerations

- Treat imports as untrusted: validate schema, limit move count/length to prevent abuse.
- Avoid executing arbitrary PGN tags; only whitelist known metadata fields.
- Ensure no global state mutation; pure functions reduce side effects.
- Future: rate-limit or debounce if exposed via API (currently library-only).

---

## 7. Performance Strategy

- Apply moves once during import; cache replay snapshots in controller lazily to avoid repeated recomputation (optional memoization).
- Keep payloads small: metadata optional, moves optional; rely on SAN list + final FEN.
- Avoid deep cloning `GameState` per step if costly—prefer structural sharing or minimal snapshot containing FEN + turn info.

---

## 8. Implementation Phases

1) Serialization foundations
- Define `GameExportJson` types and error codes.
- Implement `exportGameToJson` and `exportGameToPgn` using existing helpers.
- Add schema validation and versioning.

2) Import + validation
- Implement `importGameFromJson` and `importGameFromPgn`.
- Reconstruct state via move application; cross-check final FEN.
- Add tests for round-trip JSON/PGN -> state.

3) Replay controller
- Implement `createReplayController` with `next/prev/jumpTo/reset`.
- Add memoization of snapshots and bounds checking.
- Tests: deterministic stepping, start/reset behavior.

4) Polish & optional metadata
- Support optional metadata/result fields in export/import.
- Add replay speed hint hooks if trivial (nice-to-have).
- Final docs in README/specs and examples.

---

## 9. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PGN parsing discrepancies | Medium | Medium | Reuse existing PGN utilities; add test fixtures |
| Performance of replay snapshots | Low | Medium | Lazy memoize snapshots; store FEN per step |
| Versioning drift | Medium | Low | Enforce `version:1` check; centralize schema |
| Metadata schema creep | Low | Low | Keep metadata optional; validate known fields |

---

## 10. Open Questions

- Should we store per-move timestamps? (optional)
- Should export include initial FEN when starting from non-standard positions?
- Preferred error surface: exceptions only or Result type for future API?

---

## Next Steps

1. Align on open questions and metadata fields.  
2. Proceed with `/tasks task-002-4` to generate implementation tasks.  
3. Implement and add tests per phases above.  
4. Document usage samples in relevant README after implementation.
