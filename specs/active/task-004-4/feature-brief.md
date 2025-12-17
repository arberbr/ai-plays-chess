@ Feature Brief: Minimal theming and accessibility pass

**Task ID:** task-004-4  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a minimal theming and accessibility pass to ensure the board, controls, and move list are usable and readable.

## Target Users

- You (developer) and users interacting with the app UI.

## Core Requirements

### Must Have
- [ ] Basic theme tokens (colors/spacing/typography) applied to board and controls.
- [ ] Accessible labels and focus styles for interactive elements.
- [ ] Contrast-respectful defaults.

### Nice to Have
- [ ] Light/dark toggle stub using existing tokens.
- [ ] Reduced-motion consideration for animations (if any).

## Technical Approach

Apply shared tokens to board, controls, and move list. Add ARIA labels and focus outlines for controls. Ensure contrast passes basic checks. Keep implementation light; avoid over-theming. Provide hook/stub for light/dark toggle leveraging previously defined tokens.

**Patterns to Follow:**
- Token-driven styles; avoid hardcoded colors.
- Use semantic HTML with ARIA where needed.

**Key Decisions:**
- Keep toggle optional; wire tokens so future theme swap is easy.
- Minimal animation; respect reduced-motion.

## Next Actions

1. [ ] Add/update theme tokens and global styles to cover board/controls.
2. [ ] Add ARIA labels + focus rings to interactive elements.
3. [ ] Validate contrast for primary surfaces/text.
4. [ ] Stub light/dark toggle if feasible.

## Success Criteria

- [ ] Board/controls use consistent tokens with acceptable contrast.
- [ ] Interactive elements are focusable with visible focus.
- [ ] Optional theme toggle stub exists or is straightforward to wire.

## Open Questions

- Any brand color preferences? (default neutral)
- Should dark mode ship now or stay stubbed? (stub acceptable)

---

*Brief created with SDD 2.5 - Ready to code!*翾
