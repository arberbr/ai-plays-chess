@ Feature Brief: LocalStorage save/load of games (state + PGN)

**Task ID:** task-004-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to persist games to localStorage (state + PGN) and load them later so users can review or resume matches.

## Target Users

- You (developer) and users wanting to save/replay games locally.

## Core Requirements

### Must Have
- [ ] Serialize current game (state + PGN) to localStorage.
- [ ] Load a saved game into engine state and PGN log.
- [ ] Handle basic migration/versioning to avoid crashes on schema changes.

### Nice to Have
- [ ] List of saved games with timestamps/names.
- [ ] Simple storage limits/cleanup handling.

## Technical Approach

Use JSON export/import from task-002-4 to store in localStorage. Provide functions to save current game, list saved entries, and load into engine/PGN structures. Add a minimal version tag to handle future schema tweaks. Guard against parse errors.

**Patterns to Follow:**
- Pure serialization helpers; side effects limited to storage API wrapper.
- Defensive parsing with fallbacks.

**Key Decisions:**
- Key namespace for saved games; include timestamp and optional title.
- Version field to allow future migrations.

## Next Actions

1. [ ] Implement storage wrapper (get/set/list/delete) with namespacing.
2. [ ] Wire save from current game export (JSON + metadata).
3. [ ] Wire load to recreate state + PGN log safely.
4. [ ] Add minimal list representation for UI consumption.

## Success Criteria

- [ ] Game can be saved and restored without corruption.
- [ ] Errors handled gracefully on missing/invalid data.
- [ ] Saved items are enumerable for UI listing.

## Open Questions

- Default naming convention? (timestamp-based)
- Should we auto-prune oldest entries? (optional)

---

*Brief created with SDD 2.5 - Ready to code!*翼
