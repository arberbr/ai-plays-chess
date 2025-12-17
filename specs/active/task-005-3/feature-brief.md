@ Feature Brief: Model performance scoring & ranking across games

**Task ID:** task-005-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to aggregate model performance metrics across games (win rate, strong/blunder counts) to rank models.

## Target Users

- You (developer) and users comparing AI models.

## Core Requirements

### Must Have
- [ ] Compute per-model metrics: wins/losses/draws, blunders/strong moves avg.
- [ ] Rank models based on chosen metrics.
- [ ] Data structure consumable by summary UI.

### Nice to Have
- [ ] Configurable weighting (win rate vs quality).
- [ ] Persist summary per model over multiple sessions.

## Technical Approach

Consume move annotations and results to aggregate per model. Produce a ranking with metrics and scores. Keep pure and storage-agnostic; allow caller to persist if desired. Provide defaults for weighting.

**Patterns to Follow:**
- Pure reducers over game results/annotations.
- Stable data shape for UI tables.

**Key Decisions:**
- Default ranking weight: win rate primary, quality secondary.
- Handle mirror matches and ties gracefully.

## Next Actions

1. [ ] Define metrics schema and ranking function.
2. [ ] Aggregate from games list (results + annotations).
3. [ ] Compute ranking with configurable weights.
4. [ ] Output stable data for summary view.

## Success Criteria

- [ ] Models receive ranked scores with clear metrics.
- [ ] Handles multiple games and ties consistently.
- [ ] Output ready for summary display.

## Open Questions

- Default weighting preferences?
- Persist rankings across sessions or per run only? (start per run)

---

*Brief created with SDD 2.5 - Ready to code!*翿
