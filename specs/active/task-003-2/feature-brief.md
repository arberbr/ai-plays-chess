@ Feature Brief: Model catalog fetch + filtering UI hooks

**Task ID:** task-003-2  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need to fetch the OpenRouter model catalog and expose filtering hooks so users can pick models to play.

## Target Users

- You (developer) and users selecting models for AI-vs-AI play.

## Core Requirements

### Must Have
- [ ] Fetch model list via OpenRouter client.
- [ ] Filter/search hooks (provider, modality, cost, capability tags if available).
- [ ] Surface minimal model metadata for selection.

### Nice to Have
- [ ] Cache results in-memory to reduce calls.
- [ ] Sort helpers (e.g., cost, latency if provided).

## Technical Approach

Use the OpenRouter client to retrieve models, normalize fields, and provide hooks/utilities for filtering and sorting. Keep it UI-agnostic but ready for React hooks later. Consider basic caching and minimal retry/backoff from task-003-1.

**Patterns to Follow:**
- Pure data normalization and filter predicates.
- Optional caching layer for model list.

**Key Decisions:**
- Minimal fields needed: name/id, context window/cost if available.
- Keep filters simple; defer advanced ranking to insights later.

## Next Actions

1. [ ] Add catalog fetch function using client.
2. [ ] Normalize model metadata and expose filter/sort helpers.
3. [ ] Add optional in-memory cache for list.
4. [ ] Provide thin hook/adapter signature for UI consumption.

## Success Criteria

- [ ] Models can be fetched and filtered by basic criteria.
- [ ] Normalized shape stable for UI selection.
- [ ] Avoids excessive API calls via simple cache.

## Open Questions

- Which filters matter most? (start with name search, provider, modality)
- Include pricing/context window if available? (yes, when provided)

---

*Brief created with SDD 2.5 - Ready to code!*翺
