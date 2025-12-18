# Technical Plan: Perf polish (memoization, lazy load assets, bundle trims)

**Task ID:** task-006-2  
**Created:** 2025-12-18  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview
Target render and bundle performance in the existing Next.js + React app. Focus on reducing unnecessary renders (memoization), lazy loading non-critical UI and assets, and trimming obvious unused dependencies/assets. Prioritize the play screen responsiveness while deferring heavier views (e.g., matches list) via code-splitting. Optional lightweight measurements (Lighthouse/Next analyze) guide changes.

```
┌───────────────┐   memoize   ┌───────────────┐   lazy load   ┌───────────────┐
│  Stateful UI  │────────────▶│  Memoized UI  │──────────────▶│ Split Chunks  │
└───────────────┘             └───────────────┘               └───────────────┘
          ▲                             │                               │
          │                             ▼                               ▼
      render inputs              stable props/keys               deferred assets
```

### Architecture Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Memoization | Use React.memo/useMemo/useCallback on hot paths | Reduce re-renders from prop churn in play/board/move list. |
| Lazy loading | Dynamic `import()` + Suspense for secondary routes/panels | Keep initial bundle lean; load matches/heavy panels on demand. |
| Asset/dep trim | Remove obvious unused assets/deps | Immediate bundle/size wins with minimal risk. |
| Measurement | Optional: `next build --analyze`/Lighthouse spot checks | Validate improvements without heavy perf infra. |

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Framework | Next.js (App Router) | existing | Built-in code splitting/dynamic import support. |
| UI | React 18 | existing | Hooks + Suspense for memoization/lazy loading. |
| Analysis (optional) | `next build --analyze` or Lighthouse | n/a | Quick insight into bundle and TTI. |

Dependencies: no new runtime deps expected; optional dev-only `@next/bundle-analyzer` if needed (not required unless we choose to visualize).

---

## 3. Component/Perf Tactics
- **Memoize hot components**: Board, move list, match controls; memoize derived props and stable callbacks; avoid inline objects/arrays in render when avoidable.
- **State colocations**: Keep localized state near usage to limit re-render fan-out.
- **Selector stability**: If selectors or computed props are used repeatedly, wrap with useMemo.
- **Keys & identity**: Ensure stable keys for lists to prevent remounts.

---

## 4. Lazy Loading & Bundling
- **Dynamic imports**: Use `next/dynamic` for secondary screens (e.g., matches page panels or ancillary charts/widgets) if heavy.
- **Route-level splitting**: Verify non-critical routes are dynamically loaded; avoid preloading heavy routes unnecessarily.
- **Asset defer**: Defer non-critical assets (e.g., large images, optional icons) and ensure images use Next Image where appropriate.

---

## 5. Asset/Dependency Trims
- Identify obvious unused deps/assets (e.g., stray icons, unused mock data). Remove or document removal.
- Prefer tree-shaking-friendly imports (named imports over wildcard) where modules are large.
- Avoid broad re-exports that pull in unused chunks.

---

## 6. Performance Verification
- Smoke check after changes: ensure play flow still works.
- Optional: `next build --analyze` for bundle diff; Lighthouse (local) for TTI/CLS/INP spot check.
- Log quick notes (bundle size or qualitative) if analysis is run.

---

## 7. Implementation Phases

### Phase 1: Audit & hotspots
- Identify hot components/props in play and matches views; note candidates for memoization/dynamic import.

### Phase 2: Memoization
- Apply React.memo/useMemo/useCallback to board, move list, controls; stabilize props and callbacks.

### Phase 3: Lazy loading
- Add dynamic imports for non-critical panels/routes (matches list or heavy panels); ensure loading fallbacks.

### Phase 4: Trim & verify
- Remove obvious unused assets/deps; ensure imports are tree-shake-friendly; run smoke/perf checks; optionally capture bundle/Lighthouse notes.

---

## 8. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Over-memoization causing stale props | Medium | Low | Keep memo boundaries simple; avoid memo on rapidly changing props. |
| Lazy loading regressions (SEO/flash) | Medium | Low | Use sensible fallbacks; avoid lazying critical content. |
| Minimal perf gain if hotspots misidentified | Medium | Medium | Start with play screen and known heavy lists; measure if possible. |

---

## 9. Open Questions
- Any target bundle budget (e.g., <200kb per route)?
- Is matches page considered non-critical for initial load (OK to lazy load)?
- Should we integrate bundle analyzer now or defer? 

---

## Next Steps
1. Confirm bundle budget/priority screens (assume play screen highest priority).  
2. Proceed with memoization and lazy loading as outlined.  
3. Trim unused assets/deps; optionally run `next build --analyze` and record notes.  

---

*Plan created with SDD 2.0*
