@ Feature Brief: OpenRouter client setup & auth plumbing

**Task ID:** task-003-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a reliable OpenRouter API client with key handling so we can fetch models and later send chess prompts securely.

## Target Users

- You (developer) integrating OpenRouter; eventual end-users choosing models.

## Core Requirements

### Must Have
- [ ] API client wrapper with base URL, headers, and error handling.
- [ ] Env-driven API key loading with `.env.example` guidance.
- [ ] Basic rate-limit/backoff hooks for later tasks.

### Nice to Have
- [ ] Simple health/test call helper.
- [ ] Centralized error types for the integration.

## Technical Approach

Create a small OpenRouter client module: configure base URL, auth header from env, standard timeouts, and error normalization. Keep it framework-agnostic (TS module). Provide helper to perform GET/POST with retries stubbed for later task (003-4). Document required env var.

**Patterns to Follow:**
- Centralized fetch wrapper with typed responses.
- Environment validation at startup for OPENROUTER_API_KEY.

**Key Decisions:**
- Fail fast if key missing in dev; allow stub/mock mode? default: require key.
- Keep retry/backoff minimal here; fuller logic in task-003-4.

## Next Actions

1. [ ] Implement client wrapper (fetch) with base headers.
2. [ ] Add env validation and `.env.example` note.
3. [ ] Add simple ping/list-models test helper.
4. [ ] Expose shared error type for downstream calls.

## Success Criteria

- [ ] Client can make authenticated call (e.g., list models).
- [ ] Missing key surfaces clear error.
- [ ] Wrapper reusable for later matchmaking calls.

## Open Questions

- Should we support mock mode without key? (default no)
- Any preferred timeout defaults? (consider 30s)

---

*Brief created with SDD 2.5 - Ready to code!*翹
