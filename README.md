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

## Notes

- Path alias: `@/*` → `src/*`
- Keep public env vars prefixed with `NEXT_PUBLIC_`
- Vercel-friendly defaults (no custom server). Add a Vercel project, set env vars, and deploy. CI is intentionally omitted for now.

## Chess IO helpers (serialization & replay)

- `exportGameToJson(state, sanMoves, { metadata? })` → `{ version, finalFen, pgnMoves, metadata }`
- `importGameFromJson(payload)` → `{ state, pgnMoves, metadata, pgnRecord }` (validates version and final FEN)
- `exportGameToPgn(state, sanMoves, { metadata? })` → PGN string with optional model tags
- `importGameFromPgn(pgn)` → reconstructs state + SAN list from PGN tags/movetext
- `createReplayController(sanMoves, initialFen?)` → iterator with `current/next/prev/jumpTo/reset/length`

Metadata (optional): `{ modelWhite?, modelBlack?, startTime?: ISO, result?: "*"/"1-0"/"0-1"/"1/2-1/2" }`
