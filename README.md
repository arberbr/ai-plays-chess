# AI Plays Chess

Next.js + TypeScript app (app router) bootstrapped with pnpm. Intended to pit OpenRouter-hosted AI models against each other, capture games, and surface insights.

## Setup

1. Install pnpm if missing: `npm install -g pnpm`
2. Install deps: `pnpm install`
3. Copy env template: `cp env.example .env.local` (then set `OPENROUTER_API_KEY`)
4. Run dev server: `pnpm dev`

## Scripts

- `pnpm dev` – start Next.js dev server
- `pnpm build` – production build
- `pnpm start` – run built app
- `pnpm lint` – Next.js lint
- `pnpm lint:fix` – lint with autofix
- `pnpm format` / `pnpm format:check` – Prettier formatting
- `pnpm test:unit` – Vitest unit/component tests (jsdom)
- `pnpm test:smoke` – Playwright smoke flows
- `pnpm test:a11y` – Playwright + axe scans on `/`, `/play`, `/matches`
- `pnpm test:ci` – lint + format:check + unit (coverage) + smoke + a11y

## Notes

- Path alias: `@/*` → `src/*`
- Keep public env vars prefixed with `NEXT_PUBLIC_`
- Vercel-friendly defaults (no custom server). Add a Vercel project, set env vars, and deploy. CI is intentionally omitted for now.
- Playwright defaults to starting the dev server; set `PLAYWRIGHT_NO_SERVER=1` to reuse an already running server or `PLAYWRIGHT_BASE_URL` to override the URL.
- Coverage (soft target): ~70% lines for chess engine modules; run `pnpm test:unit -- --coverage` for reports.

## Deployment & hosting

**Env vars**

- `OPENROUTER_API_KEY` (required) – server-side only
- `OPENROUTER_MOCK` (optional) – set `1` to bypass network calls locally
- Keep secrets out of git; set via host dashboard. Copy `.env.example` to `.env.local` for local use.

**Build & run (production)**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

**Vercel**

- Set `OPENROUTER_API_KEY` (and `OPENROUTER_MOCK` if desired) in Project Settings → Environment Variables.
- Build command: `pnpm build` (install via pnpm). Output: `.next` (handled automatically).
- No custom server required; App Router supported out of the box.

**Netlify (Next runtime)**

- Enable Next.js runtime; set env vars in Site Settings.
- Build command: `pnpm build`; publish directory: `.next`.
- If using Netlify CLI: `netlify init` then `netlify deploy --prod`.

**Generic Node host**

- Set env vars in the process or `.env` loaded before start.
- Run build then `pnpm start` with `NODE_ENV=production`; ensure `OPENROUTER_API_KEY` is present.

**Troubleshooting**

- 401 or missing responses: confirm `OPENROUTER_API_KEY` is set in the deployed environment and rebuild/redeploy.
- Env changes require rebuilding (`pnpm build`) before `pnpm start`.
- For offline/local mocks, set `OPENROUTER_MOCK=1` (only for non-production).

## Chess IO helpers (serialization & replay)

- `exportGameToJson(state, sanMoves, { metadata? })` → `{ version, finalFen, pgnMoves, metadata }`
- `importGameFromJson(payload)` → `{ state, pgnMoves, metadata, pgnRecord }` (validates version and final FEN)
- `exportGameToPgn(state, sanMoves, { metadata? })` → PGN string with optional model tags
- `importGameFromPgn(pgn)` → reconstructs state + SAN list from PGN tags/movetext
- `createReplayController(sanMoves, initialFen?)` → iterator with `current/next/prev/jumpTo/reset/length`

Metadata (optional): `{ modelWhite?, modelBlack?, startTime?: ISO, result?: "*"/"1-0"/"0-1"/"1/2-1/2" }`
