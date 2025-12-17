# Implementation Todo List: Minimal theming & accessibility

**Task ID:** task-004-4  
**Started:** 2025-12-18  
**Status:** In Progress

---

## Phase 1: Tokens & Globals

- [x] Update tokens/globals for colors, focus, reduced-motion, dark stub

## Phase 2: Theme Plumbing

- [x] Align theme provider/toggle with data-theme and tokens

## Phase 3: UI Accessibility Pass

- [x] Apply ARIA and focus-visible updates to play UI controls/board/move list

## Phase 4: QA & Notes

- [ ] Update QA checklist and progress notes

---

## Manual QA Checklist

- [ ] Verify focus-visible outline on nav, controls, move list, save/load buttons.
- [ ] Check contrast for text on surfaces and accents (light theme).
- [ ] Ensure move list rows/buttons are keyboard-focusable and announce moves.
- [ ] Confirm aria-live status messages for save/load and board messages.
- [ ] Toggle theme (light/dark) and confirm variables apply without layout issues.
- [ ] Verify reduced-motion preference minimizes transitions.

---

## Progress Log

| Date | Completed | Notes |
|------|-----------|-------|
| 2025-12-18 | Tokens, theme plumbing, ARIA/focus updates | Added focus ring vars, data-theme support, ARIA labels and status live regions |
