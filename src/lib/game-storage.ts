import {
  GAME_EXPORT_VERSION,
  ExportOptions,
  GameExportJson,
  GameExportMetadata,
  ImportResult,
  exportGameToJson,
  exportGameToPgn,
  importGameFromJson
} from "./chess/io";
import { GameState } from "./chess/types";
import { StorageErrorCode, StorageResult, storageGet, storageListKeys, storageRemove, storageSet } from "./storage/local-store";

export type GameStorageErrorCode = StorageErrorCode | "NOT_FOUND" | "INVALID_VERSION" | "SCHEMA_INVALID";

export type GameStorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: GameStorageErrorCode; details?: unknown };

export interface SavedGameMeta {
  id: string;
  title: string;
  createdAt: string;
  version: number;
}

export interface SavedGameRecord extends SavedGameMeta {
  payload: GameExportJson;
  pgn?: string;
}

export interface SaveGameInput {
  title?: string;
  state: GameState;
  pgnMoves: string[];
  metadata?: GameExportMetadata;
  pgnText?: string;
  exportOptions?: ExportOptions;
}

export const GAME_RECORD_VERSION = 1 as const;
const INDEX_KEY = "index";
const RECORD_PREFIX = "record";

function fail<T>(error: GameStorageErrorCode, details?: unknown): GameStorageResult<T> {
  return { ok: false, error, details };
}

function formatTitle(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `Game ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function recordKey(id: string): string {
  return `${RECORD_PREFIX}:${id}`;
}

function ensureIndexShape(value: unknown): SavedGameMeta[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return undefined;
      const { id, title, createdAt, version } = entry as Partial<SavedGameMeta>;
      if (!id || !title || !createdAt || typeof version !== "number") return undefined;
      return { id, title, createdAt, version };
    })
    .filter((v): v is SavedGameMeta => Boolean(v));
}

function readIndex(): GameStorageResult<SavedGameMeta[]> {
  const res = storageGet<SavedGameMeta[]>(INDEX_KEY);
  if (!res.ok) {
    if (res.error === "PARSE_ERROR") {
      // Corrupted index; reset to empty.
      storageRemove(INDEX_KEY);
      return { ok: true, value: [] };
    }
    return res;
  }
  const parsed = ensureIndexShape(res.value ?? []);
  return { ok: true, value: parsed };
}

function writeIndex(metas: SavedGameMeta[]): GameStorageResult<void> {
  return storageSet(INDEX_KEY, metas);
}

function safeExport(input: SaveGameInput): GameStorageResult<{ payload: GameExportJson; pgnText?: string }> {
  try {
    const payload = exportGameToJson(input.state, input.pgnMoves, {
      metadata: input.metadata,
      ...input.exportOptions
    });
    const pgnText = input.pgnText ?? exportGameToPgn(input.state, input.pgnMoves, { metadata: input.metadata });
    return { ok: true, value: { payload, pgnText } };
  } catch (error) {
    return fail("SCHEMA_INVALID", error);
  }
}

function validateRecord(record?: SavedGameRecord): GameStorageResult<SavedGameRecord> {
  if (!record) return fail("NOT_FOUND");
  if (record.version !== GAME_RECORD_VERSION) return fail("INVALID_VERSION", { expected: GAME_RECORD_VERSION, got: record.version });
  if (record.payload.version !== GAME_EXPORT_VERSION) {
    return fail("INVALID_VERSION", { expected: GAME_EXPORT_VERSION, got: record.payload.version });
  }
  return { ok: true, value: record };
}

function readRecord(id: string): GameStorageResult<SavedGameRecord | undefined> {
  const res = storageGet<SavedGameRecord>(recordKey(id));
  if (!res.ok) return res;
  return { ok: true, value: res.value };
}

export function listGames(): GameStorageResult<SavedGameMeta[]> {
  const indexRes = readIndex();
  if (!indexRes.ok) return indexRes;
  return { ok: true, value: indexRes.value.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

export function saveGame(input: SaveGameInput): GameStorageResult<SavedGameMeta> {
  const indexRes = readIndex();
  if (!indexRes.ok) return indexRes;

  const exported = safeExport(input);
  if (!exported.ok) return exported;

  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `game-${Date.now()}`;
  const meta: SavedGameMeta = {
    id,
    title: input.title?.trim() || formatTitle(),
    createdAt: new Date().toISOString(),
    version: GAME_RECORD_VERSION
  };

  const record: SavedGameRecord = { ...meta, payload: exported.value.payload, pgn: exported.value.pgnText };

  const writeRecordRes = storageSet(recordKey(id), record);
  if (!writeRecordRes.ok) return writeRecordRes;

  const nextIndex = [meta, ...indexRes.value.filter((m) => m.id !== id)];
  const writeIndexRes = writeIndex(nextIndex);
  if (!writeIndexRes.ok) return writeIndexRes;

  return { ok: true, value: meta };
}

export function loadGame(id: string): GameStorageResult<ImportResult & { meta: SavedGameMeta; pgn?: string }> {
  const recRes = readRecord(id);
  if (!recRes.ok) return recRes;
  const validated = validateRecord(recRes.value);
  if (!validated.ok) return validated;

  try {
    const imported = importGameFromJson(validated.value.payload);
    return { ok: true, value: { ...imported, meta: validated.value, pgn: validated.value.pgn } };
  } catch (error) {
    return fail("SCHEMA_INVALID", error);
  }
}

export function deleteGame(id: string): GameStorageResult<void> {
  const indexRes = readIndex();
  if (!indexRes.ok) return indexRes;

  const removeRes = storageRemove(recordKey(id));
  if (!removeRes.ok) return removeRes;

  const nextIndex = indexRes.value.filter((m) => m.id !== id);
  return writeIndex(nextIndex);
}

export function pruneGames(maxEntries: number): GameStorageResult<void> {
  if (maxEntries <= 0) return { ok: true, value: undefined };
  const indexRes = readIndex();
  if (!indexRes.ok) return indexRes;
  if (indexRes.value.length <= maxEntries) return { ok: true, value: undefined };

  const keep = indexRes.value.slice(0, maxEntries);
  const drop = indexRes.value.slice(maxEntries);
  for (const meta of drop) {
    storageRemove(recordKey(meta.id));
  }
  return writeIndex(keep);
}

export function clearGameStorage(): StorageResult<void> {
  // Utility for tests/manual reset: remove all namespaced keys.
  const keysRes = storageListKeys();
  if (!keysRes.ok) return keysRes;
  for (const key of keysRes.value) {
    storageRemove(key);
  }
  return { ok: true, value: undefined };
}
