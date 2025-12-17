@ Feature Brief: Replay/export hooks (PGN/JSON)

**Task ID:** task-002-4  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need replay/export hooks so completed (or in-progress) games can be persisted and shared via PGN/JSON, enabling later analysis and localStorage integration.

## Target Users

- You (developer) and users who want to review or continue games.

## Core Requirements

### Must Have
- [ ] Export current game (state + PGN) to JSON and PGN strings.
- [ ] Import from saved JSON/PGN back into GameState + PGN log.
- [ ] Hooks to drive replay (step-through moves).

### Nice to Have
- [ ] Basic metadata in exports (models, start time, result).
- [ ] Replay speed control hooks for UI.

## Technical Approach

Provide serialization helpers that package GameState plus PGN moves. Implement import that reconstructs state and PGN list (leveraging FEN and move application). Add replay iterator to step forward/back through moves. Keep pure functions; UI can consume events.

**Patterns to Follow:**
- Deterministic state reconstruction from PGN/JSON.
- Pure iterators for replay with current index.

**Key Decisions:**
- JSON export includes PGN moves and final state FEN for reliability.
- Metadata optional to keep schema small; extend later.

## Next Actions

1. [ ] Implement JSON export/import of state + PGN.
2. [ ] Implement PGN export/import using existing PGN structures.
3. [ ] Add replay iterator (next/prev, jump) over move list.
4. [ ] Surface metadata fields for models/result (optional).

## Success Criteria

- [ ] A saved game can be exported and reloaded to identical state.
- [ ] Replay can step through moves deterministically.
- [ ] PGN export aligns with recorded moves.

## Open Questions

- Should we include per-move timestamps in export? (optional)
- Minimal metadata: model names, result, start time acceptable?

---

*Brief created with SDD 2.5 - Ready to code!*翵
