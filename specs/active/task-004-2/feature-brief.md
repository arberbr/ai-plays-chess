@ Feature Brief: Controls: start/pause/reset, move list display

**Task ID:** task-004-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need match controls (start/pause/reset) and a move list display to operate and observe games.

## Target Users

- You (developer) and users managing AI-vs-AI games.

## Core Requirements

### Must Have
- [ ] Start/pause/reset controls that drive the turn loop.
- [ ] Move list display synced with PGN/state.
- [ ] Disable/enable states to prevent invalid actions (e.g., pause when already paused).

### Nice to Have
- [ ] Jump-to-move in the list (for replay).
- [ ] Minimal status indicators (whose turn, game state).

## Technical Approach

Implement control bar wired to turn loop APIs (start/pause/reset). Render move list from PGN log with highlighting for current/last move. Ensure controls respect loop state and game over conditions. Keep UI minimal and composable.

**Patterns to Follow:**
- State lifted from engine; controls emit intents.
- Move list derived from PGN entries.

**Key Decisions:**
- Disable start when running; show simple status text.
- Keep jump-to-move optional; baseline list first.

## Next Actions

1. [ ] Implement control handlers for start/pause/reset hooking the loop.
2. [ ] Render move list from PGN log with current move highlight.
3. [ ] Add basic status display (turn, game over).
4. [ ] Guard controls against invalid states.

## Success Criteria

- [ ] Start/pause/reset work against the loop.
- [ ] Move list updates as moves are made.
- [ ] Controls clearly indicate state and prevent invalid actions.

## Open Questions

- Should jump-to-move also pause the loop? (likely yes)
- Minimal status copy preferences?

---

*Brief created with SDD 2.5 - Ready to code!*翻
