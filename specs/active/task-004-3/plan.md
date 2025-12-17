# Technical Plan: LocalStorage save/load of games (state + PGN)

**Task ID:** task-004-3  
**Created:** 2025-12-18  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview

Client-only persistence layer around the existing chess engine I/O. The Play page produces a game export payload; a storage service serializes it to `localStorage` under a namespaced key, with a lightweight index for listing. Loads read the payload, validate version, and hydrate engine state/PGN using existing import utilities.

```
┌─────────────┐   save/load   ┌─────────────────────────────┐   read/write   ┌───────────────┐
│ Play Page   │◀────────────▶│ Game Persistence Adapter     │◀─────────────▶│ localStorage  │
│ (UI/state)  │               │ (uses chess io.ts)          │               │ (browser)     │
└─────────────┘               └─────────────────────────────┘               └───────────────┘
```

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage scope | Browser `localStorage` with namespaced keys (`ai-chess:saves`) | Simple, no backend dependency; aligns with brief |
| Serialization format | Reuse `exportGameToJson` / `importGameFromJson` (versioned) | Consistent schema + validation already implemented |
| Indexing | Maintain a small metadata index array to list saves | Avoid scanning storage keys; stable ordering and metadata |
| Versioning | Include `GAME_EXPORT_VERSION` and wrapper version in record | Enables migration/fallback without crashes |
| Error handling | Defensive parse with try/catch; surface typed errors to UI | Prevents crashes from corrupt entries |

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| UI | React/Next.js client components | existing | Integrate with Play page without SSR dependencies |
| Storage | `localStorage` wrapped in utility | Web standard | Available client-side; needs SSR guard |
| Chess I/O | `exportGameToJson` / `importGameFromJson` from `src/lib/chess/io.ts` | existing | Provides validated, versioned game payloads |

### Dependencies

No new external dependencies required; reuse existing chess library.

---

## 3. Component Design

### Component: Storage Utility (`storage/local-store`)

**Purpose:** Safe wrapper around `localStorage` with namespace, JSON parse/stringify, and quota/error handling.

**Responsibilities:**
- Guard for browser availability (no-op or error in SSR).
- `getItem`, `setItem`, `removeItem`, `listKeys` under namespace prefix.
- Return structured results with error enums for quota/parse/unsupported.

**Interfaces (conceptual):**
```typescript
interface StoredValue<T> { ok: boolean; value?: T; error?: "UNAVAILABLE" | "PARSE_ERROR" | "QUOTA_EXCEEDED"; }
function storageSet<T>(key: string, value: T): StoredValue<T>;
function storageGet<T>(key: string): StoredValue<T>;
function storageRemove(key: string): void;
function storageListKeys(): string[];
```

### Component: Game Persistence Service (`game-storage`)

**Purpose:** Bridge Play page state/PGN with storage utility using chess I/O.

**Responsibilities:**
- Build `SavedGameRecord` with id, title, createdAt, `GAME_EXPORT_VERSION`, payload (`GameExportJson`), optional PGN string.
- Maintain index key (`ai-chess:saves:index`) containing metadata list (id, title, createdAt, version).
- `saveGame` (create new record and update index), `listGames`, `loadGame`, `deleteGame`, optional `prune(limit)`.
- Migrate/validate: check record version matches; on mismatch, surface error for future migration hook.

**Interfaces (conceptual):**
```typescript
interface SavedGameMeta { id: string; title: string; createdAt: string; version: number; }
interface SavedGameRecord extends SavedGameMeta { payload: GameExportJson; pgn?: string; }

function saveGame(input: { title?: string; state: GameState; pgnMoves: string[]; metadata?: GameExportMetadata; pgnText?: string; }): SavedGameMeta;
function listGames(): SavedGameMeta[];
function loadGame(id: string): ImportResult & { meta: SavedGameMeta };
function deleteGame(id: string): void;
function prune(maxEntries: number): void; // optional, remove oldest beyond limit
```

### Component: Play Page Integration (UI hooks/actions)

**Purpose:** Provide UI actions to save current game, list saves, load selected save, and delete.

**Responsibilities:**
- Map current `gameState`, `pgnRecord`, and SAN list (from move list) into `saveGame` input.
- Handle load by hydrating `gameState`, `status`, `pgn`, `currentPly`, and resetting loop state.
- Surface errors to users (e.g., toast/message) and show success confirmation.
- Optional: render minimal list (title + timestamp) from `listGames` for selection.

---

## 4. Data Model

### Entities

**SavedGameMeta**
```typescript
interface SavedGameMeta {
  id: string;        // uuid or timestamp-based
  title: string;     // default "Game <YYYY-MM-DD HH:mm>"
  createdAt: string; // ISO
  version: number;   // wrapper/schema version
}
```

**SavedGameRecord**
```typescript
interface SavedGameRecord extends SavedGameMeta {
  payload: GameExportJson; // includes GAME_EXPORT_VERSION
  pgn?: string;            // optional rendered PGN string
}
```

### Storage Layout (localStorage)
- Index key: `ai-chess:saves:index` → JSON array of `SavedGameMeta` sorted newest-first.
- Record key per save: `ai-chess:saves:<id>` → `SavedGameRecord` JSON.

---

## 5. API Contracts

### Functions

| Function | Input | Output | Errors |
|----------|-------|--------|--------|
| `saveGame` | `{ title?, state, pgnMoves, metadata?, pgnText? }` | `SavedGameMeta` | `UNAVAILABLE`, `SCHEMA_INVALID`, `QUOTA_EXCEEDED` |
| `listGames` | none | `SavedGameMeta[]` (newest-first) | `UNAVAILABLE`, `PARSE_ERROR` |
| `loadGame` | `id: string` | `{ state, pgnMoves, metadata?, pgnRecord, meta }` | `NOT_FOUND`, `INVALID_VERSION`, `SCHEMA_INVALID`, `PARSE_ERROR` |
| `deleteGame` | `id: string` | `void` | `UNAVAILABLE` |
| `prune` (optional) | `maxEntries: number` | `void` | `UNAVAILABLE` |

### Error/Result Handling
- Use structured result objects or throw `GameIoError` + custom storage error codes; UI should catch and render messages.
- On corrupted entries: skip/remove and log to console; avoid crashing UI.

---

## 6. Security & Reliability

- Run only client-side (`typeof window !== "undefined"` guard); no SSR usage.
- Namespaced keys to avoid collisions.
- Defensive JSON parsing with try/catch and schema checks (`version`, required fields).
- Do not store secrets; data is user-local and non-sensitive.
- Handle quota exceeded: return specific error and avoid repeated retries.

---

## 7. Performance & Limits

- Keep payload small: use existing JSON export (state + SAN) only; optional PGN string.
- Index uses metadata only; avoid full payload duplication.
- Listing O(n) over index array; small expected cardinality.
- Optional prune strategy: cap entries (e.g., 50) and delete oldest when saving new.

---

## 8. Implementation Phases

1) Storage foundation
- [ ] Add storage utility with namespace, safe JSON get/set/list/remove.
- [ ] Define error/result types for unavailable/parse/quota cases.

2) Game persistence service
- [ ] Implement `SavedGameMeta/Record` types and constants (keys, version).
- [ ] Implement `saveGame`, `listGames`, `loadGame`, `deleteGame`, optional `prune` using chess I/O.
- [ ] Add version checks and minimal migration hook (currently reject mismatches with clear error).

3) Play page integration
- [ ] Wire save action using current `gameState`, SAN list, metadata (startTime/result) and optional PGN string.
- [ ] Wire load action to hydrate state/pgn/status/currentPly; reset loop appropriately.
- [ ] Surface errors/success messages; ensure UI remains responsive when storage unavailable.

4) QA and polish
- [ ] Add minimal unit tests for storage/service logic (pure functions).
- [ ] Manual test: save/load happy path; corrupted entry handling; quota/unavailable fallback.
- [ ] Optional: add prune limit toggle/default.

---

## 9. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SSR access to storage | Medium | Medium | Guard with `typeof window`; no calls during SSR |
| Corrupted localStorage entry | Medium | Medium | Defensive parse; skip and delete bad records |
| Version mismatch on future schema | Medium | Medium | Explicit version field; fail with clear error; add migration hook later |
| Storage quota exceeded | Low | Low | Catch quota errors; notify user; optional prune |

---

## 10. Open Questions

- Default title format? (proposal: `Game YYYY-MM-DD HH:mm`).
- Maximum saves before prune? (proposal: cap at 50, drop oldest on save).
- Should we allow overwrite/update existing id or always create new saves?

---

## Next Steps

1. Confirm open questions (title format, prune cap, overwrite behavior).
2. Implement phases 1–3 in order.
3. Add minimal tests and manual verification per QA checklist.
