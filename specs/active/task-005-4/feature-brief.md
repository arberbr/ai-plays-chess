@ Feature Brief: Summary view: best moves, blunders, model win-rate table

**Task ID:** task-005-4  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a summary view that surfaces best moves, blunders, and a model win-rate/quality table so users can learn and compare models.

## Target Users

- You (developer) and users reviewing game insights.

## Core Requirements

### Must Have
- [ ] Present top strong moves and blunders from recent games.
- [ ] Show model win-rate/quality table using metrics from task-005-3.
- [ ] Link rows to underlying games/moves for context.

### Nice to Have
- [ ] Filters for recent games or specific models.
- [ ] Export/share summary (e.g., copy JSON/markdown).

## Technical Approach

Consume scoring annotations and model rankings to render a summary. Provide data hooks for best moves/blunders and a table of model metrics. Keep presentation minimal and ready for UI integration; logic should stay pure where possible.

**Patterns to Follow:**
- Derived data from metrics/annotations; no duplicate computation.
- Clear mapping back to game/move references.

**Key Decisions:**
- Sorting defaults for best moves/blunders (by eval gain/loss).
- Table columns: model, games, win%, avg blunders/strong moves.

## Next Actions

1. [ ] Derive best moves/blunders list with references.
2. [ ] Build model summary dataset from rankings.
3. [ ] Expose structures suitable for table/list rendering.
4. [ ] Provide minimal filters (model, recency) if feasible.

## Success Criteria

- [ ] Summary shows best/blunder moves with context.
- [ ] Model table reflects aggregated metrics accurately.
- [ ] Data structures are ready for UI rendering/export.

## Open Questions

- Preferred number of top moves to display? (e.g., top 5)
- Should export include both moves and model table? (likely yes)

---

*Brief created with SDD 2.5 - Ready to code!*翿
