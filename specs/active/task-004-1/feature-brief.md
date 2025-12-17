@ Feature Brief: Chessboard UI + drag/click moves

**Task ID:** task-004-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a usable chessboard UI that supports drag/click moves wired to the engine state, forming the core of the play experience.

## Target Users

- You (developer) and users watching/controlling AI-vs-AI games on the board UI.

## Core Requirements

### Must Have
- [ ] Chessboard rendering with pieces in correct positions.
- [ ] Drag-and-drop and click-to-move interactions.
- [ ] Hooks into engine state (apply/validate moves) from prior tasks.

### Nice to Have
- [ ] Move highlights (selected/last move) and check indicator.
- [ ] Simple flip board control.

## Technical Approach

Use a React-friendly board component or custom board; bind to engine state and move validation. Support both drag-and-drop and click (select source/target). On valid move, update state via engine helpers. Keep UI responsive and minimal styling hooks.

**Patterns to Follow:**
- Stateless board props driven by GameState.
- Event callbacks for move attempts → validation.

**Key Decisions:**
- Prefer lightweight board lib or custom squares (choose one).
- Ensure accessibility: keyboard focus path later if feasible.

## Next Actions

1. [ ] Render board and pieces from GameState.
2. [ ] Implement click + drag move initiation and drop handling.
3. [ ] Wire to validation/apply; show basic move highlights.
4. [ ] Add optional board flip toggle.

## Success Criteria

- [ ] Board displays current state accurately.
- [ ] Moves via drag or click are applied when legal.
- [ ] Highlights indicate selection/last move.

## Open Questions

- Use existing board lib (e.g., chessboardjsx-like) vs custom? (lean custom/lightweight)
- Prefer algebraic coordinates overlay? (optional)

---

*Brief created with SDD 2.5 - Ready to code!*翿
