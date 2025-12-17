@ Feature Brief: Turn loop & timers

**Task ID:** task-002-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a deterministic turn loop that alternates model moves and enforces per-move timing so games proceed correctly and can pause/resume.

## Target Users

- You (developer) and users observing AI-vs-AI games with predictable pacing.

## Core Requirements

### Must Have
- [ ] Turn orchestration that calls model A/B alternately, respecting side to move.
- [ ] Per-move timers (countdown) with simple time control placeholder.
- [ ] Pause/resume hooks; graceful stop on game end.

### Nice to Have
- [ ] Basic time control config (e.g., per-move allotment).
- [ ] Hooks/events for UI to show ticking clocks.

## Technical Approach

Build a turn-loop controller consuming validated move generator (task-002-2). Sequence: check game status, request move from current model, validate/apply, update timers, emit events. Keep side effects minimal; expose callbacks for UI. Handle termination conditions (mate/draw/resign placeholder).

**Patterns to Follow:**
- Deterministic loop with clear state machine.
- Non-blocking timing (setInterval/raf-friendly) with cancellation.

**Key Decisions:**
- Keep time control simple (per-move limit) before complex clocks.
- Pause/resume via clear API surface for UI controls.

## Next Actions

1. [ ] Define turn loop state machine (idle, running, paused, finished).
2. [ ] Implement per-move timer handling with callbacks.
3. [ ] Integrate with validation/apply move pipeline.
4. [ ] Expose events/hooks for UI (tick, move, end).

## Success Criteria

- [ ] Alternating turns without desync.
- [ ] Timers decrement and stop on pause/end.
- [ ] Loop stops on checkmate/stalemate/draw.

## Open Questions

- Preferred time control defaults? (e.g., 30s per move)
- Should we allow early stop/resign? (likely yes later)

---

*Brief created with SDD 2.5 - Ready to code!*翱
