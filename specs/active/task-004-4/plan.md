# Technical Plan: Minimal theming and accessibility pass

**Task ID:** task-004-4  
**Created:** 2025-12-18  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview

Apply token-driven styling and accessibility enhancements across the Play experience (board, controls, move list) using shared CSS variables and lightweight theme scaffolding. Introduce focus-visible styles, ARIA labels, and contrast-safe defaults. Provide a stub for light/dark toggling leveraging token indirection so future themes can be added without refactoring.

```
┌───────────┐     tokens/context     ┌───────────────────────┐
│ Theme/    │ ◀────────────────────▶ │ UI Components (Play)  │
│ Tokens    │                        │ Board / Controls / UI │
└───────────┘                        └───────────────────────┘
```

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token strategy | Centralize CSS variables for text, surfaces, borders, focus, accents | Ensures consistent contrast and easy theme swap |
| Theme plumbing | Provide minimal `ThemeProvider`/toggle stub using data-theme/class toggle | Keeps footprint small while enabling future dark mode |
| Accessibility | Add ARIA labels and `:focus-visible` outlines to buttons/links/interactive elements | Improves keyboard navigation and screen reader clarity |
| Reduced motion | Respect `prefers-reduced-motion` for any transitions/animations | Aligns with accessibility guidance |

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| UI Framework | Next.js / React | existing | Matches current app |
| Styling | CSS variables + existing globals (Tailwind-like tokens) | existing | Minimal, no new deps |
| Theme plumbing | Lightweight context/hook; optional `data-theme` | existing components compatible |
| Accessibility | ARIA attributes, `focus-visible`, reduced-motion media query | Standards-based |

### Dependencies

No new external dependencies required.

---

## 3. Component Design

### Component: Theme Tokens / Globals
**Purpose:** Define/adjust CSS variables for surfaces, text, borders, focus, success/error, muted backgrounds, spacing and typography tweaks.
**Responsibilities:**
- Ensure contrast-safe pairs (text vs surface, accent vs surface).
- Provide focus ring tokens (color, width, offset) and motion guard (reduced-motion).
- Expose light/dark token sets (dark can be stubbed) via `:root` and `[data-theme="dark"]`.

### Component: Theme Provider / Toggle Stub
**Purpose:** Minimal hook/provider to set `data-theme` on `body` or root, storing selection in memory/localStorage (optional) for future use.
**Responsibilities:**
- Expose `theme`, `setTheme`, `toggleTheme` (enum: "light" | "dark").
- No-op or default to light if dark assets are incomplete; allow UI toggle to exist.

### Component: Controls & Buttons (MatchControls, BoardControls, MoveList actions)
**Purpose:** Apply tokens, add ARIA labels, and focus-visible outlines.
**Responsibilities:**
- Ensure buttons/interactive elements have `aria-label` where text is not explicit.
- Add `focus-visible` ring using token.
- Respect reduced-motion for hover/transition (shorten/disable transitions).

### Component: Board UI (ChessBoard container)
**Purpose:** Ensure squares/labels/overlays use tokenized colors and accessible contrast; add ARIA labels for board container if needed.
**Responsibilities:**
- Use token-based backgrounds/borders/selection highlights.
- Provide focus outline if board is focusable (optional tab focus wrapper).

### Component: Move List
**Purpose:** Apply tokenized text/surface; ensure clickable plies are keyboard-focusable.
**Responsibilities:**
- Add `aria-label` to move list items and the list region.
- Provide `focus-visible` outline on clickable rows.

---

## 4. Data Model (Tokens / Theme State)

- `Theme`: union `"light" | "dark"` (stub). Stored in state; optional persistence.
- CSS variable groups: `--surface`, `--surface-strong`, `--border`, `--text`, `--text-muted`, `--accent`, `--focus-ring`, `--bg-muted`, `--shadow-soft`, `--square-light/dark`, `--highlight`, `--check`, `--selection`.

---

## 5. API Contracts (Component Props/Hooks)

| Item | Shape | Notes |
|------|-------|-------|
| `ThemeProvider` | `{ theme, setTheme(theme), toggleTheme() }` | Optional; defaults to light |
| `ThemeToggle` | Props: `{ onToggle?, label? }` | Uses provider; safe noop if only one theme |
| Accessibility props | Add `aria-label`/`title` to buttons where label not explicit | E.g., refresh, save, delete, flip board |

No network APIs are added.

---

## 6. Accessibility & Contrast

- Use WCAG-friendly pairs: text on surface ≥ 4.5:1 where feasible; accent on surface with sufficient contrast for buttons.
- Apply `:focus-visible` outlines using `--focus-ring` (color) and `--focus-ring-offset`.
- Ensure keyboard access for move list items and control buttons; verify tab order.
- Add `aria-live="polite"` to status messages where appropriate (e.g., save/load status).
- Provide `aria-label` for icon-only or ambiguous buttons (refresh, save, load, delete, flip board, start/pause/resume).

---

## 7. Performance & Motion

- Minimal impact: CSS variable updates only; no heavy re-renders.
- Respect `prefers-reduced-motion`: reduce/disable transitions on buttons/hover.
- Keep shadows subtle to avoid contrast/motion issues.

---

## 8. Implementation Phases

1) Tokens & globals
- Add/adjust CSS variables for text/surface/border/focus/accent; include dark stub.
- Add reduced-motion guard in global styles for transitions.

2) Theme plumbing
- Wire or stub `ThemeProvider` + `ThemeToggle` component/hook with `data-theme` support.

3) Component pass (accessibility + tokens)
- Update `MatchControls`, `BoardControls`, `MoveList`, and board container to use tokens, add `aria-label`s, and focus-visible styles.
- Add `aria-live` for status messages (e.g., save/load feedback) where appropriate.

4) QA
- Verify keyboard navigation and focus visibility across controls.
- Check contrast in light theme; spot-check dark stub.
- Validate reduced-motion behavior.

---

## 9. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Insufficient contrast after token change | Medium | Medium | Use contrast-safe pairs; spot-check key surfaces/buttons |
| Focus styles overridden by component styles | Medium | Medium | Centralize focus ring tokens and apply via utility class/global rule |
| Dark mode stub unused/confusing | Low | Medium | Default to light; label toggle as beta/coming soon if enabled |
| Reduced-motion not respected on hover/loop UI | Low | Medium | Add global reduced-motion guard for transitions |

---

## 10. Open Questions

- Any brand color preference beyond neutral palette?
- Should dark mode be exposed now or left hidden behind a toggle stub?

---

## Next Steps

1. Confirm brand/dark-mode expectations.
2. Implement phases 1–3, then run manual accessibility/contrast checks.
3. If dark stub is shown, mark it as beta/optional.
