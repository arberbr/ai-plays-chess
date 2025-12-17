@ Feature Brief: Matchmaking: pick two models, assign colors/roles

**Task ID:** task-003-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need matchmaking that lets users pick two models from the catalog and assigns them to White/Black with the necessary payloads for the play loop.

## Target Users

- You (developer) and users configuring AI-vs-AI matches.

## Core Requirements

### Must Have
- [ ] Selection flow for two models using catalog data.
- [ ] Assign colors/roles (White/Black) deterministically.
- [ ] Produce a matchup payload consumed by the turn loop.

### Nice to Have
- [ ] Random assignment option.
- [ ] Simple validation (no duplicate model unless allowed).

## Technical Approach

Build matchmaking utilities to accept model choices, validate, and emit a matchup config (models, colors, optional prompts). Keep UI-agnostic; expose types for future React form. Ensure compatibility with turn loop and OpenRouter client payloads.

**Patterns to Follow:**
- Pure data validation/config assembly.
- Clear types for MatchConfig/ModelChoice.

**Key Decisions:**
- Allow same model vs itself? default yes but highlight.
- Default color assignment: first selection = White unless randomized.

## Next Actions

1. [ ] Define types for ModelChoice and MatchConfig.
2. [ ] Implement validation (non-empty, handle duplicates).
3. [ ] Provide deterministic color assignment with optional random.
4. [ ] Output payload ready for turn loop consumption.

## Success Criteria

- [ ] Two models can be selected and assigned colors.
- [ ] Emits a valid matchup payload for play loop.
- [ ] Prevents invalid/empty selections.

## Open Questions

- Should we block same-model mirror matches? (likely allow)
- Include optional starting prompts/context? (future)

---

*Brief created with SDD 2.5 - Ready to code!*翽
