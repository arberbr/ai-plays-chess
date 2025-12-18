# Technical Plan: Packaging/deploy docs (envs, OpenRouter key, hosting)

**Task ID:** task-006-3  
**Created:** 2025-12-18  
**Status:** Ready for Implementation  
**Based on:** feature-brief.md

---

## 1. System Architecture

### Overview
Documentation-only task to capture deployment requirements: env vars (OpenRouter key), build/run steps, and hosting notes (Vercel/Netlify/generic Node). No code changes to runtime, but ensure `.env.example` reflects required vars.

### Architecture Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting targets | Vercel + Netlify + generic Node | Covers common hosting options; keep concise. |
| Env documentation | README section + `.env.example` | Single source of truth; easy onboarding. |
| Secrets handling | Recommend dashboard-set env vars, avoid committing secrets | Security best practice. |

---

## 2. Technology Stack
- Next.js app (App Router) already present.
- No new runtime dependencies; documentation only.

---

## 3. Documentation Components
1. **Env table**: Required vars (OPENROUTER_API_KEY, optional NEXT_PUBLIC_* if any), reference `.env.example`.
2. **Build/run**: Commands for production (`pnpm install`, `pnpm build`, `pnpm start`), mention `pnpm dev` for local.
3. **Hosting guides**: Brief steps for Vercel and Netlify (build command, output dir `.next`, env configuration), plus generic Node host steps.
4. **Secrets and limits**: Note to keep API key in env; mention rate limits if applicable; link to OpenRouter docs (if URL already known) or describe API key placement.
5. **Troubleshooting**: Common errors (missing key, 401s, env not loaded), and tips (re-run build after env change, check dashboards).

---

## 4. Data/Config
- `.env.example` should include `OPENROUTER_API_KEY=` (no value) and any other required vars already used. Avoid adding unnecessary keys.

---

## 5. Implementation Phases
- Phase 1: Gather existing env usage; update `.env.example` if missing key.
- Phase 2: Add README deploy section with env table, build/run steps, hosting guidance, troubleshooting.
- Phase 3: Quick verification (no code changes; ensure docs consistent with scripts).

---

## 6. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Missing env variables in docs | Medium | Low | Audit current code/env usage before documenting. |
| Overlong docs | Low | Low | Keep concise bullets and tables. |

---

## 7. Open Questions
- Any preferred host priority (default to Vercel/Netlify)?
- Include Docker? (default: no)

---

## Next Steps
1. Audit env usage and `.env.example`.
2. Add deployment/env section to README (or dedicated doc) with hosting steps.
3. Note troubleshooting and secret handling.

---

*Plan created with SDD 2.0*
