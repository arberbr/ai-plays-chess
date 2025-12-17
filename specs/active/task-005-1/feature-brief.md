@ Feature Brief: Move scoring hook: detect strong/blunder moves

**Task ID:** task-005-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to score moves using engine eval deltas to flag strong moves and blunders for later highlighting and model ranking.

## Target Users

- You (developer) and users wanting insight into move quality during/after games.

## Core Requirements

### Must Have
- [ ] Compute eval delta per move using before/after evaluations.
- [ ] Classify moves into buckets (e.g., strong/accurate/mistake/blunder) via thresholds.
- [ ] Return annotations attachable to PGN/move list.

### Nice to Have
- [ ] Configurable thresholds.
- [ ] Carry per-move score for later aggregation.

## Technical Approach

Given engine evals pre/post move, compute delta and map to categories. Expose a scoring helper that returns classification and metadata. Keep pure and testable. Thresholds configurable with sensible defaults.

**Patterns to Follow:**
- Pure functions; no UI dependencies.
- Reuse types from engine/PGN structures.

**Key Decisions:**
- Default thresholds (e.g., >150 centipawns strong, < -150 blunder) adjustable.
- Support mate scores as special cases.

## Next Actions

1. [ ] Define thresholds/config.
2. [ ] Implement scoring helper (inputs: before eval, after eval, move metadata).
3. [ ] Emit annotation payload usable by move list/board highlights.
4. [ ] Add minimal tests/fixtures (if testing later).

## Success Criteria

- [ ] Moves receive consistent classification based on eval deltas.
- [ ] Output can be attached to move list/board highlights.
- [ ] Thresholds are configurable.

## Open Questions

- Preferred default thresholds? (start simple)
- Should we store raw centipawn delta and mate indicators? (likely yes)

---

*Brief created with SDD 2.5 - Ready to code!*翿
