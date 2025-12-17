import { copyState, gameStateToFen, parseFen, startingPosition } from "./fen";
import { createPgnHeaders, pgnToString } from "./pgn";
import { legalMoves } from "./status";
import { formatSan } from "./san";
import { validateMove } from "./validate";
import { GameState, Move, PgnMove, PgnRecord } from "./types";

// Versioning for exported payloads (increment when schema changes).
export const GAME_EXPORT_VERSION = 1 as const;

// Canonical result codes for serialization/import/replay flows.
export type GameIoErrorCode =
  | "INVALID_VERSION"
  | "SCHEMA_INVALID"
  | "PARSE_ERROR"
  | "ILLEGAL_MOVE"
  | "FINAL_FEN_MISMATCH"
  | "OUT_OF_BOUNDS"
  | "UNKNOWN";

export class GameIoError extends Error {
  readonly code: GameIoErrorCode;
  readonly details?: unknown;

  constructor(code: GameIoErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "GameIoError";
  }
}

export type GameResultCode = "*" | "1-0" | "0-1" | "1/2-1/2";

export interface GameExportMetadata {
  modelWhite?: string;
  modelBlack?: string;
  startTime?: string; // ISO string
  result?: GameResultCode;
}

export interface GameExportJson {
  version: typeof GAME_EXPORT_VERSION;
  finalFen: string;
  pgnMoves: string[]; // SAN list (authoritative move order)
  moves?: Move[]; // optional raw move data if available
  metadata?: GameExportMetadata;
}

export interface ImportResult {
  state: GameState;
  pgnMoves: string[];
  metadata?: GameExportMetadata;
  pgnRecord?: PgnRecord;
}

export interface ExportOptions {
  metadata?: GameExportMetadata;
  moves?: Move[];
}

export interface ImportOptions {
  initialFen?: string;
  expectFinalFen?: string;
}

export function gameIoError(code: GameIoErrorCode, message: string, details?: unknown): GameIoError {
  return new GameIoError(code, message, details);
}

function assertMetadata(meta?: GameExportMetadata) {
  if (!meta) return;
  if (meta.startTime && Number.isNaN(Date.parse(meta.startTime))) {
    throw gameIoError("SCHEMA_INVALID", "metadata.startTime must be ISO datetime", meta.startTime);
  }
  if (meta.result && !["*", "1-0", "0-1", "1/2-1/2"].includes(meta.result)) {
    throw gameIoError("SCHEMA_INVALID", "metadata.result must be *, 1-0, 0-1, or 1/2-1/2", meta.result);
  }
}

function assertPgnMoves(moves: string[]) {
  if (!Array.isArray(moves)) {
    throw gameIoError("SCHEMA_INVALID", "pgnMoves must be an array of SAN strings");
  }
  for (const san of moves) {
    if (typeof san !== "string" || san.trim() === "") {
      throw gameIoError("SCHEMA_INVALID", "pgnMoves must contain non-empty SAN strings", san);
    }
  }
}

/**
 * Export a game to a versioned JSON payload.
 */
export function exportGameToJson(state: GameState, pgnMoves: string[], opts: ExportOptions = {}): GameExportJson {
  if (!state) throw gameIoError("SCHEMA_INVALID", "state is required");
  assertPgnMoves(pgnMoves);
  assertMetadata(opts.metadata);

  const finalFen = gameStateToFen(state);

  return {
    version: GAME_EXPORT_VERSION,
    finalFen,
    pgnMoves: [...pgnMoves],
    moves: opts.moves ? [...opts.moves] : undefined,
    metadata: opts.metadata ? { ...opts.metadata } : undefined
  };
}

function isoToPgnDate(iso: string): string | undefined {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return undefined;
  const d = new Date(parsed);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function metadataToHeaderInput(meta?: GameExportMetadata) {
  if (!meta) return {};
  return {
    Date: meta.startTime ? isoToPgnDate(meta.startTime) : undefined,
    Result: meta.result,
    whiteModel: meta.modelWhite,
    blackModel: meta.modelBlack
  };
}

function sanListToPgnMoves(sans: string[]): PgnMove[] {
  const moves: PgnMove[] = [];
  for (let i = 0; i < sans.length; i += 1) {
    const san = sans[i];
    const fullmove = Math.floor(i / 2) + 1;
    const isWhite = i % 2 === 0;
    if (isWhite) {
      moves.push({ fullmove, white: san });
    } else {
      const last = moves[moves.length - 1];
      if (last && last.fullmove === fullmove) {
        moves[moves.length - 1] = { ...last, black: san };
      } else {
        moves.push({ fullmove, black: san });
      }
    }
  }
  return moves;
}

/**
 * Export a PGN string from SAN move list plus optional metadata.
 */
export function exportGameToPgn(state: GameState, pgnMoves: string[], opts: ExportOptions = {}): string {
  if (!state) throw gameIoError("SCHEMA_INVALID", "state is required");
  assertPgnMoves(pgnMoves);
  assertMetadata(opts.metadata);

  const headers = createPgnHeaders(metadataToHeaderInput(opts.metadata));
  const moves = sanListToPgnMoves(pgnMoves);
  const record: PgnRecord = { headers, moves, result: headers.Result };
  return pgnToString(record);
}

function sanitizeToken(tok: string): string {
  return tok.trim();
}

function isResultToken(tok: string): boolean {
  return tok === "*" || tok === "1-0" || tok === "0-1" || tok === "1/2-1/2";
}

function parsePgnDateToIso(date?: string): string | undefined {
  if (!date) return undefined;
  const parts = date.split(".");
  if (parts.length !== 3) return undefined;
  const [y, m, d] = parts;
  const yr = Number(y);
  const mo = Number(m);
  const dy = Number(d);
  if ([yr, mo, dy].some((n) => Number.isNaN(n))) return undefined;
  const iso = new Date(Date.UTC(yr, mo - 1, dy)).toISOString();
  return iso;
}

function parsePgn(pgn: string): { sans: string[]; metadata: GameExportMetadata; initialFen?: string } {
  if (typeof pgn !== "string") throw gameIoError("PARSE_ERROR", "PGN must be a string");
  const cleaned = pgn.replace(/\{[^}]*\}/g, "").replace(/;[^\n]*/g, "");
  const lines = cleaned.split(/\r?\n/);
  const tags: Record<string, string> = {};
  const movetextLines: string[] = [];
  let inMoves = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inMoves && trimmed.startsWith("[")) {
      const match = trimmed.match(/^\[(\w+)\s+"(.*)"\]$/);
      if (match) {
        tags[match[1]] = match[2];
      }
      continue;
    }
    if (trimmed === "" && !inMoves) {
      inMoves = true;
      continue;
    }
    if (inMoves) movetextLines.push(trimmed);
  }

  const movetext = movetextLines.join(" ").trim();
  if (!movetext) throw gameIoError("PARSE_ERROR", "No moves found in PGN");

  const tokens = movetext.split(/\s+/).map(sanitizeToken);
  const sans: string[] = [];
  for (const tok of tokens) {
    if (!tok) continue;
    if (/^\d+\.+/.test(tok)) continue; // move numbers
    if (isResultToken(tok)) break;
    sans.push(tok);
  }

  const metadata: GameExportMetadata = {
    modelWhite: tags.WhiteModel,
    modelBlack: tags.BlackModel,
    result: (tags.Result as GameResultCode) || undefined,
    startTime: parsePgnDateToIso(tags.Date)
  };

  const initialFen = tags.FEN;
  return { sans, metadata, initialFen };
}

function sanToMove(state: GameState, san: string, pgn?: PgnRecord): ReturnType<typeof validateMove> {
  const candidates = legalMoves(state, state.turn);
  for (const move of candidates) {
    const result = validateMove(state, move, { pgn });
    if (result.legal && result.san === san) {
      return result;
    }
  }
  throw gameIoError("ILLEGAL_MOVE", `Illegal or unrecognized SAN: ${san}`);
}

function applySans(
  sans: string[],
  initialState: GameState,
  metadata?: GameExportMetadata
): { state: GameState; pgnRecord?: PgnRecord } {
  const state = copyState(initialState);
  const headers = createPgnHeaders(metadataToHeaderInput(metadata));
  let pgn: PgnRecord | undefined = { headers, moves: [], result: headers.Result };

  for (const san of sans) {
    const res = sanToMove(state, san, pgn);
    pgn = res.pgn ?? pgn;
    Object.assign(state, res.nextState);
  }
  return { state, pgnRecord: pgn };
}

/**
 * Import from JSON payload (SAN list + final FEN) back into GameState.
 */
export function importGameFromJson(payload: GameExportJson, opts: ImportOptions = {}): ImportResult {
  if (!payload || typeof payload !== "object") throw gameIoError("SCHEMA_INVALID", "payload required");
  if (payload.version !== GAME_EXPORT_VERSION) throw gameIoError("INVALID_VERSION", "Unsupported export version");
  assertPgnMoves(payload.pgnMoves);
  assertMetadata(payload.metadata);

  const initialState = opts.initialFen ? parseFen(opts.initialFen) : startingPosition();
  const { state, pgnRecord } = applySans(payload.pgnMoves, initialState, payload.metadata);

  const expectedFen = opts.expectFinalFen ?? payload.finalFen;
  const actualFen = gameStateToFen(state);
  if (expectedFen && actualFen !== expectedFen) {
    throw gameIoError("FINAL_FEN_MISMATCH", "Final FEN does not match payload", { expectedFen, actualFen });
  }

  return {
    state,
    pgnMoves: [...payload.pgnMoves],
    metadata: payload.metadata ? { ...payload.metadata } : undefined,
    pgnRecord
  };
}

/**
 * Import from PGN string back into GameState and SAN list.
 */
export function importGameFromPgn(pgn: string): ImportResult {
  const { sans, metadata, initialFen } = parsePgn(pgn);
  const initialState = initialFen ? parseFen(initialFen) : startingPosition();
  const { state, pgnRecord } = applySans(sans, initialState, metadata);

  return { state, pgnMoves: sans, metadata, pgnRecord };
}
