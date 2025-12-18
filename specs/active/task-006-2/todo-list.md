# Implementation Todo List: Perf polish (memoization, lazy load assets, bundle trims)

**Task ID:** task-006-2  
**Started:** 2025-12-18  
**Status:** In Progress

---

## Todos
- [x] Audit hotspots and candidates for memo/lazy load (estimated: 0.5h)
- [x] Apply memoization to hot components (play/board/move list/controls) (estimated: 1.5h)
- [x] Add dynamic imports/lazy load for non-critical panels/routes (estimated: 1h)
- [x] Trim obvious unused assets/deps; prefer tree-shaken imports (estimated: 0.5h)
- [ ] Verify functionality and note perf checks (optional analyze) (estimated: 0.5h)

---

## Progress Log
| Date | Completed | Notes |
|------|-----------|-------|
| 2025-12-18 | Created todo list | |
| 2025-12-18 | Memo/lazy load changes | Memoized board/move/match controls; MoveList dynamic import with skeleton fallback. |
| 2025-12-18 | Verification | Ran `pnpm test:unit` (pass). |
