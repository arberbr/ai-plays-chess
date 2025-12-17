@ Feature Brief: Inline highlights on board/move list with thresholds

**Task ID:** task-005-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to render inline highlights on the board and move list based on scoring thresholds to show strong moves and blunders.

## Target Users

- You (developer) and users who want visual cues about move quality.

## Core Requirements

### Must Have
- [ ] Consume scoring annotations and render board highlights for strong/blunder moves.
- [ ] Highlight move list entries with the same categories.
- [ ] Configurable thresholds/styles to align with scoring config.

### Nice to Have
- [ ] Legend/key for colors.
- [ ] Toggle to show/hide highlights.

## Technical Approach

Use scoring output to mark squares (from-to) and move list entries with classes/styles. Provide simple theming tokens. Keep logic UI-focused; scoring stays in task-005-1. Ensure consistency between board and list.

**Patterns to Follow:**
- Stateless rendering driven by annotations.
- Shared color tokens from theming.

**Key Decisions:**
- Choose minimal color palette for strong vs blunder.
- Allow turning highlights off if distracting.

## Next Actions

1. [ ] Map scoring categories to style tokens.
2. [ ] Render board highlights for last move/selected move with quality cue.
3. [ ] Render move list entries with category markers.
4. [ ] Add legend/toggle controls (optional).

## Success Criteria

- [ ] Board and move list show consistent highlights based on scoring.
- [ ] Styles configurable/tunable via thresholds and tokens.
- [ ] Highlights can be toggled off.

## Open Questions

- Preferred colors for strong vs blunder? (keep subtle but distinct)
- Should highlights persist for all moves or just recent? (start with all)

---

*Brief created with SDD 2.5 - Ready to code!*翿
