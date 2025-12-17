@ Feature Brief: App shell & layout

**Task ID:** task-001-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a consistent, responsive app shell (layout, header/footer, container, theme-ready styling) to host the chess experience and future screens without UI drift.

## Target Users

- You (developer) and anyone viewing the chess matches through the web UI.

## Core Requirements

### Must Have
- [ ] Global layout (app router) with header/footer and main container.
- [ ] Responsive widths and sensible spacing/typography defaults.
- [ ] Theme-ready tokens (light/dark) without full theming implementation yet.
- [ ] Metadata/title setup for base pages.

### Nice to Have
- [ ] Simple nav links with active state.
- [ ] Basic favicon and social preview placeholders.

## Technical Approach

Use Next.js app router layout with global CSS variables for spacing/typography and theme tokens. Keep design minimal but consistent. Place header with app title and minimal nav, footer with small note. Ensure responsive container width and base font styles. Keep theming hooks ready (CSS variables or Tailwind tokens if used later).

**Patterns to Follow:**
- Next.js app router layout.tsx pattern.
- Global styles via CSS variables or Tailwind config (choose once package installed).

**Key Decisions:**
- Theming primitives only; full theme later in UX epic.
- Keep navigation minimal to avoid churn.

## Next Actions

1. [ ] Create layout.tsx with header/footer and main container.
2. [ ] Add global styles (spacing, typography, theme tokens).
3. [ ] Wire metadata defaults (title/description).
4. [ ] Add minimal nav stubs (Home, Play, Matches).

## Success Criteria

- [ ] Layout renders with consistent spacing and responsive container.
- [ ] Header/footer visible; nav stubs present.
- [ ] Theme tokens defined for future light/dark use.

## Open Questions

- Prefer Tailwind vs vanilla CSS modules? (choose and stick)
- Any specific branding text for header/footer?

---

*Brief created with SDD 2.5 - Ready to code!*륁
