@ Feature Brief: Move validation & PGN recorder

**Task ID:** task-002-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need reliable move validation and PGN recording so AI-vs-AI games enforce legality and produce portable game logs.

## Target Users

- You (developer) and anyone reviewing recorded games from AI matches.

## Core Requirements

### Must Have
- [ ] Validate moves against chess rules (legal moves only).
- [ ] PGN recording of moves with metadata placeholders (players/models, result).
- [ ] Integration with state helpers from task-002-1.

### Nice to Have
- [ ] SAN/PGN notation helpers (basic).
- [ ] Simple validation errors for UI/debugging.

## Technical Approach

Build validation on top of the state model: generate legal moves for side to move, reject illegal ones (checks). Record accepted moves into PGN structure (header + move list). Keep logic pure/testable; no UI concerns. Ensure compatibility with make/unmake helpers.

**Patterns to Follow:**
- Pure functions returning validation result + updated state.
- PGN list stored alongside state for later export.

**Key Decisions:**
- Basic SAN support sufficient; full disambiguation to follow standard rules.
- Keep headers minimal; allow future enrichment (model names, time controls).

## Next Actions

1. [ ] Implement legal move generation/validation using state model.
2. [ ] Add PGN move recording structure and append per validated move.
3. [ ] Provide SAN/notation helper for moves.
4. [ ] Return clear validation errors for rejected moves.

## Success Criteria

- [ ] Illegal moves are rejected with reason.
- [ ] Valid moves update state and PGN log.
- [ ] SAN/PGN output is consistent for simple games.

## Open Questions

- Is full SAN disambiguation required now? (start minimal)
- Include model names in PGN headers? (likely yes, later)

---

*Brief created with SDD 2.5 - Ready to code!*翯
