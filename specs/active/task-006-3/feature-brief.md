@ Feature Brief: Packaging/deploy docs (envs, OpenRouter key, hosting)

**Task ID:** task-006-3  
**Created:** 2025-12-17  
**Status:** Ready for Development  

---

## Problem Statement

We need concise packaging/deployment documentation covering env variables (OpenRouter key) and hosting guidance (Vercel/Netlify).

## Target Users

- You (developer) and anyone deploying the app.

## Core Requirements

### Must Have
- [ ] Document required env vars (OPENROUTER_API_KEY, etc.) with `.env.example`.
- [ ] Steps to build/run in production mode.
- [ ] Hosting notes for Vercel/Netlify (or generic Node host).

### Nice to Have
- [ ] Notes on secrets handling and rate limits.
- [ ] Minimal troubleshooting tips (common errors).

## Technical Approach

Create a deployment doc or README section describing env setup, build commands, and hosting steps. Include OpenRouter key guidance and any runtime config. Keep concise and actionable.

**Patterns to Follow:**
- Clear env table + sample `.env.example`.
- Stepwise deploy instructions per host.

**Key Decisions:**
- Provide generic Node/Vercel/Netlify paths; keep it short.
- Highlight how to set the API key securely.

## Next Actions

1. [ ] List env vars and sample `.env.example`.
2. [ ] Add build/run steps.
3. [ ] Add Vercel/Netlify notes (env, build command, output dir).
4. [ ] Add quick troubleshooting tips.

## Success Criteria

- [ ] Env requirements are clear and actionable.
- [ ] Deploy steps documented for at least one host.
- [ ] Guidance includes API key handling.

## Open Questions

- Any preferred host? (assume Vercel or Netlify)
- Should we include Docker? (skip unless requested)

---

*Brief created with SDD 2.5 - Ready to code!*翿
