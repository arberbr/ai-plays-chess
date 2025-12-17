@ Feature Brief: Error handling, retries, and rate-limit backoff

**Task ID:** task-003-4  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need resilient error handling for OpenRouter requests, with retries and rate-limit backoff to keep matches stable.

## Target Users

- You (developer) and users running AI-vs-AI games without frequent failures.

## Core Requirements

### Must Have
- [ ] Retry logic with exponential backoff for transient errors.
- [ ] Rate-limit awareness (429) with wait-and-retry.
- [ ] Consistent error surface for UI/logging.

### Nice to Have
- [ ] Jitter in backoff to avoid thundering herd.
- [ ] Simple telemetry hooks (counters).

## Technical Approach

Extend the OpenRouter client with retry/backoff handling for transient/network/429 responses. Normalize errors, and expose metadata (attempts, wait time). Keep configuration minimal and injectable (max retries, base delay). Ensure compatibility with catalog fetch and future move calls.

**Patterns to Follow:**
- Centralized retry wrapper.
- Typed error results with cause/status.

**Key Decisions:**
- Default retry count/backoff (e.g., max 3, base 500ms).
- Apply retries to idempotent reads; caution for write-equivalent calls.

## Next Actions

1. [ ] Add retry/backoff utility with jitter.
2. [ ] Integrate into client fetch wrapper.
3. [ ] Expose error metadata to callers.
4. [ ] Add minimal counters/hooks for observability (optional).

## Success Criteria

- [ ] 429s and transient errors are retried then surfaced clearly.
- [ ] Callers receive consistent error objects.
- [ ] Retry behavior configurable via options.

## Open Questions

- Preferred default retries/backoff caps?
- Should we persist counters for later surfacing? (optional)

---

*Brief created with SDD 2.5 - Ready to code!*翿
