@ Project Roadmap: AI Plays Chess

**Project ID:** ai-plays-chess  
**Created:** 2025-12-17  
**Status:** Planning  
**Complexity:** Medium  

---

## Overview

Next.js + TypeScript app where the user selects OpenRouter-hosted AI models to play chess against each other, storing games locally and surfacing strong moves plus model quality signals.

**Timeline:** ~4 weeks  
**Effort:** ~68 hours (Epics 1-6 scope)  
**Team:** 1 (you + agent)  

---

## Kanban Board

### 📋 To Do (0)

(Empty)

### 🔄 In Progress (0)

(Empty)

### 👀 Review (0)

(Empty)

### ✅ Done (22)

#### Epic 1: Foundation & App Shell
- [x] Epic 1: Foundation & App Shell (11h) - `/execute-task epic-001`
- [x] Task 1-1: Project bootstrap & tooling (4h) - `/execute-task task-001-1`
- [x] Task 1-2: App shell & layout (4h) - `/execute-task task-001-2`
- [x] Task 1-3: Navigation & baseline pages (3h) - `/execute-task task-001-3`

#### Epic 2: Chess Engine, Game Flow & PGN
- [x] Epic 2: Chess Engine, Game Flow & PGN (12h) - `/execute-task epic-002`
- [x] Task 2-1: Game state + rules scaffold (3h) - `/execute-task task-002-1`
- [x] Task 2-2: Move validation & PGN recorder (3h) - `/execute-task task-002-2`
- [x] Task 2-3: Turn loop & timers (3h) - `/execute-task task-002-3`
- [x] Task 2-4: Replay/export hooks (PGN/JSON) (3h) - `/execute-task task-002-4`

#### Epic 3: OpenRouter Model Integration & Matchmaking
- [x] Epic 3: OpenRouter Model Integration & Matchmaking (12h) - `/execute-task epic-003`
- [x] Task 3-1: OpenRouter client setup & auth plumbing (3h) - `/execute-task task-003-1`
- [x] Task 3-2: Model catalog fetch + filtering UI hooks (3h) - `/execute-task task-003-2`
- [x] Task 3-3: Matchmaking: pick two models, assign colors/roles (3h) - `/execute-task task-003-3`
- [x] Task 3-4: Error handling, retries, and rate-limit backoff (3h) - `/execute-task task-003-4`

#### Epic 4: UX: Board, Controls, LocalStorage Save/Load
- [x] Epic 4: UX: Board, Controls, LocalStorage Save/Load (12h) - `/execute-task epic-004`
- [x] Task 4-1: Chessboard UI + drag/click moves (3h) - `/execute-task task-004-1`
- [x] Task 4-2: Controls: start/pause/reset, move list display (3h) - `/execute-task task-004-2`
- [x] Task 4-3: LocalStorage save/load of games (state + PGN) (3h) - `/execute-task task-004-3`
- [x] Task 4-4: Minimal theming and accessibility pass (3h) - `/execute-task task-004-4`

#### Epic 5: Insights: Strong Move Highlights & Model Ranking
- [x] Epic 5: Insights: Strong Move Highlights & Model Ranking (12h) - `/execute-task epic-005`
- [x] Task 5-1: Move scoring hook: detect strong/blunder moves (3h) - `/execute-task task-005-1`
- [x] Task 5-2: Inline highlights on board/move list with thresholds (3h) - `/execute-task task-005-2`
- [x] Task 5-3: Model performance scoring & ranking across games (3h) - `/execute-task task-005-3`
- [x] Task 5-4: Summary view: best moves, blunders, model win-rate table (3h) - `/execute-task task-005-4`

#### Epic 6: Quality, Perf & Delivery
- [x] Epic 6: Quality, Perf & Delivery (9h) - `/execute-task epic-006`
- [x] Task 6-1: Testing & linting sweep (unit + a11y + smoke) (3h) - `/execute-task task-006-1`
- [x] Task 6-2: Perf polish (memoization, lazy load assets, bundle trims) (3h) - `/execute-task task-006-2`
- [x] Task 6-3: Packaging/deploy docs (envs, OpenRouter key, hosting) (3h) - `/execute-task task-006-3`

---

## Epic Details

### Epic 1: Foundation & App Shell

**Goal:** Set up Next.js/TypeScript scaffolding, app shell, navigation, and baseline pages.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 11 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 1-1 | Project bootstrap & tooling | 4h | `/execute-task task-001-1` |
| 1-2 | App shell & layout | 4h | `/execute-task task-001-2` |
| 1-3 | Navigation & baseline pages | 3h | `/execute-task task-001-3` |

### Epic 2: Chess Engine, Game Flow & PGN

**Goal:** Implement chess rules, move validation, PGN recording, turn loop, timers, and replay/export hooks.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 12 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 2-1 | Game state + rules scaffold | 3h | `/execute-task task-002-1` |
| 2-2 | Move validation & PGN recorder | 3h | `/execute-task task-002-2` |
| 2-3 | Turn loop & timers | 3h | `/execute-task task-002-3` |
| 2-4 | Replay/export hooks (PGN/JSON) | 3h | `/execute-task task-002-4` |

### Epic 3: OpenRouter Model Integration & Matchmaking

**Goal:** Integrate OpenRouter client, fetch model catalog, enable selection of two models, and add robustness for retries/rate limits.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 12 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 3-1 | OpenRouter client setup & auth plumbing | 3h | `/execute-task task-003-1` |
| 3-2 | Model catalog fetch + filtering UI hooks | 3h | `/execute-task task-003-2` |
| 3-3 | Matchmaking: pick two models, assign colors/roles | 3h | `/execute-task task-003-3` |
| 3-4 | Error handling, retries, and rate-limit backoff | 3h | `/execute-task task-003-4` |

### Epic 4: UX: Board, Controls, LocalStorage Save/Load

**Goal:** Build chessboard UI, controls, move list, and localStorage save/load of games with lightweight theming and accessibility.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 12 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 4-1 | Chessboard UI + drag/click moves | 3h | `/execute-task task-004-1` |
| 4-2 | Controls: start/pause/reset, move list display | 3h | `/execute-task task-004-2` |
| 4-3 | LocalStorage save/load of games (state + PGN) | 3h | `/execute-task task-004-3` |
| 4-4 | Minimal theming and accessibility pass | 3h | `/execute-task task-004-4` |

### Epic 5: Insights: Strong Move Highlights & Model Ranking

**Goal:** Analyze moves for strength/blunders, highlight them, rank models by performance, and present summaries.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 12 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 5-1 | Move scoring hook: detect strong/blunder moves | 3h | `/execute-task task-005-1` |
| 5-2 | Inline highlights on board/move list with thresholds | 3h | `/execute-task task-005-2` |
| 5-3 | Model performance scoring & ranking across games | 3h | `/execute-task task-005-3` |
| 5-4 | Summary view: best moves, blunders, model win-rate table | 3h | `/execute-task task-005-4` |

### Epic 6: Quality, Perf & Delivery

**Goal:** Testing, performance polish, and delivery/deployment guidance.  
**SDD Phase:** Brief (lightweight planning)  
**Estimated:** 9 hours  

| Task | Description | Effort | Command |
|------|-------------|--------|---------|
| 6-1 | Testing & linting sweep (unit + a11y + smoke) | 3h | `/execute-task task-006-1` |
| 6-2 | Perf polish (memoization, lazy load assets, bundle trims) | 3h | `/execute-task task-006-2` |
| 6-3 | Packaging/deploy docs (envs, OpenRouter key, hosting) | 3h | `/execute-task task-006-3` |

---

## Execution Commands

```bash
# Start epic 1
/execute-task epic-001

# Execute specific tasks
/execute-task task-001-1
/execute-task task-001-2
/execute-task task-001-3
/execute-task task-002-1
/execute-task task-002-2
/execute-task task-002-3
/execute-task task-002-4
/execute-task task-003-1
/execute-task task-003-2
/execute-task task-003-3
/execute-task task-003-4
/execute-task task-004-1
/execute-task task-004-2
/execute-task task-004-3
/execute-task task-004-4
/execute-task task-005-1
/execute-task task-005-2
/execute-task task-005-3
/execute-task task-005-4
/execute-task task-006-1
/execute-task task-006-2
/execute-task task-006-3

# Run epic automatically
/execute-task epic-001 --until-finish
/execute-task epic-002 --until-finish
/execute-task epic-003 --until-finish
/execute-task epic-004 --until-finish
/execute-task epic-005 --until-finish
/execute-task epic-006 --until-finish
```

---

## Progress Summary

| Metric | Value |
|--------|-------|
| Total Epics | 6 |
| Total Tasks | 22 |
| Completed | 22 |
| Completion | 100% |

---

*Roadmap created with SDD 3.0 (Option A: per-epic approval)*人片在线观看
