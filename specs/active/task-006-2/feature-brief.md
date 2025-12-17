@ Feature Brief: Perf polish (memoization, lazy load assets, bundle trims)

**Task ID:** task-006-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to reduce unnecessary renders and bundle weight by adding memoization, lazy loading, and trimming assets.

## Target Users

- You (developer) and users who benefit from smoother UI performance.

## Core Requirements

### Must Have
- [ ] Identify and memoize hot components/selectors.
- [ ] Lazy load non-critical assets/pages (e.g., matches list, heavy panels).
- [ ] Trim unused dependencies/assets where obvious.

### Nice to Have
- [ ] Basic perf budget notes (bundle target).
- [ ] Lighthouse/Next telemetry spot check (if available).

## Technical Approach

Profile render paths (lightweight) to memoize props/selectors. Add dynamic imports/lazy loading for non-critical views. Remove obvious unused deps/assets. Keep changes minimal and reversible; document adjustments.

**Patterns to Follow:**
- React memo/useMemo/useCallback where prop churn occurs.
- Dynamic imports for secondary pages/panels.

**Key Decisions:**
- Prioritize play screen responsiveness; defer heavy lists.
- Avoid premature micro-opts; target biggest wins first.

## Next Actions

1. [ ] Add memoization/hooks where prop churn exists (board, move list).
2. [ ] Introduce dynamic imports for secondary views/assets.
3. [ ] Trim unused deps/assets and note any removals.
4. [ ] Optional: capture quick perf notes (bundle/Lighthouse).

## Success Criteria

- [ ] Reduced unnecessary renders on core screens.
- [ ] Non-critical chunks lazy-loaded.
- [ ] Obvious bloat removed or documented.

## Open Questions

- Any target devices/perf budgets? (none given; keep lightweight)
- Should we skip dynamic imports if routing is already minimal? (apply judiciously)

---

*Brief created with SDD 2.5 - Ready to code!*翿
