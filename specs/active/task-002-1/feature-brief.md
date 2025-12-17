@ Feature Brief: Game state + rules scaffold

**Task ID:** task-002-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a solid chess game state representation and rule scaffolding to process moves for AI-vs-AI play without illegal moves or inconsistent board state.

## Target Users

- You (developer) and future users watching AI models play correctly enforced chess games.

## Core Requirements

### Must Have
- [ ] Board/state model that captures pieces, turn, castling rights, en passant, halfmove/fullmove.
- [ ] Move application helpers (make/unmake) to support validation and PGN recording later.
- [ ] Detection hooks for check/checkmate/stalemate and draw conditions (50-move, repetition placeholder).

### Nice to Have
- [ ] Forsyth–Edwards Notation (FEN) import/export helpers.
- [ ] Simple per-move evaluation placeholder field to attach later.

## Technical Approach

Implement a chess state model (FEN-compatible) with core rule flags. Provide pure helpers to apply/unapply moves, emitting updated state and basic status (in check, game over flags). Keep it framework-agnostic and testable. Use TypeScript types for clarity. Avoid UI concerns here.

**Patterns to Follow:**
- Pure functional state transforms; no global mutation.
- Clear type definitions for Piece, Square, Move, GameState.

**Key Decisions:**
- Keep evaluation optional/placeholder for now; plug engines later.
- Provide make/unmake to ease future validation and PGN integration.

## Next Actions

1. [ ] Define types/interfaces for GameState, Move, Piece, Castling rights.
2. [ ] Implement FEN parsing/generation (minimal, accurate).
3. [ ] Implement make/unmake move helpers updating state.
4. [ ] Expose basic status checks (in-check, game over flags).

## Success Criteria

- [ ] GameState type supports full chess rules flags.
- [ ] Moves can be applied/reverted cleanly.
- [ ] Check/checkmate/stalemate detected for downstream logic.

## Open Questions

- Any preference for algebraic vs 0..63 square indices? (default algebraic, map to indices internally)
- Should we track repetition counts now or later? (placeholder ok)

---

*Brief created with SDD 2.5 - Ready to code!*翧
