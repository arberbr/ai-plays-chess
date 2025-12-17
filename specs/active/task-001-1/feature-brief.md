@ Feature Brief: Project bootstrap & tooling

**Task ID:** task-001-1  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need a reliable Next.js + TypeScript foundation with linting, formatting, environment handling, and CI scaffolding to support AI-vs-AI chess without fighting setup issues later.

## Target Users

- You (solo developer) building and iterating on the chess app quickly.

## Core Requirements

### Must Have
- [ ] Next.js + TypeScript app initialized with sensible defaults.
- [ ] Lint/format (ESLint + Prettier) configured and runnable.
- [ ] Env handling for OpenRouter key with example file and docs.
- [ ] Basic CI placeholder (lint/test) to keep quality gates ready.

### Nice to Have
- [ ] Path aliases set up for cleaner imports.
- [ ] Commit hooks (lint-staged) for local hygiene.

## Technical Approach

Initialize Next.js (app router) with TypeScript, add ESLint/Prettier configs, and wire npm scripts for lint/format/test. Provide `.env.example` for OpenRouter key and a short README snippet. Add a minimal CI placeholder (GitHub Actions template) without enforcing until ready. Prefer pnpm if available, else npm.

**Patterns to Follow:**
- Standard Next.js app router structure.
- Conventional ESLint + Prettier configuration for TypeScript/React.

**Key Decisions:**
- Package manager: pnpm or npm depending on repo default (no lock yet).
- Keep CI minimal to avoid blocking early iteration.

## Next Actions

1. [ ] Bootstrap Next.js + TS project (app router).
2. [ ] Add ESLint/Prettier configs and scripts.
3. [ ] Add `.env.example` with OPENROUTER_API_KEY.
4. [ ] Add CI placeholder (lint/test workflow stub).

## Success Criteria

- [ ] Repo runs `npm run lint` successfully.
- [ ] Example env file documents OpenRouter key.
- [ ] CI placeholder committed or ready to enable.

## Open Questions

- Prefer pnpm vs npm? (default to npm if unspecified)
- Any hosting target (Vercel/Netlify) to preconfigure? (leave generic)

---

*Brief created with SDD 2.5 - Ready to code!*웠
