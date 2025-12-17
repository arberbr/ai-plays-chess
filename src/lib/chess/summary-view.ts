import { PieceColor } from "./types";
import type { RankedModel } from "./model-ranking";

export type SummaryClassification =
  | "strong"
  | "accurate"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "mateWin"
  | "mateLoss";

export interface MoveAnnotation {
  gameId: string;
  ply: number;
  san?: string;
  color: PieceColor;
  deltaCp: number;
  classification: SummaryClassification;
  evalBefore?: number;
  evalAfter?: number;
  timestamp?: string; // ISO
  modelId?: string;
}

export interface SummaryFilters {
  modelIds?: string[];
  since?: string; // ISO
  until?: string; // ISO
  topCount?: number;
}

export interface TopMoveItem {
  gameId: string;
  ply: number;
  san?: string;
  color: PieceColor;
  deltaCp: number;
  classification: SummaryClassification;
  modelId?: string;
  timestamp?: string;
}

export interface ModelTableRow {
  modelId: string;
  rank: number;
  score: number;
  games: number;
  winRate: number;
  strongPerGame: number;
  blunderPerGame: number;
  qualityScore: number;
}

export interface ExportedSummary {
  generatedAt: string;
  filtersApplied?: SummaryFilters;
  topMoves: TopMoveItem[];
  topBlunders: TopMoveItem[];
  modelTable: ModelTableRow[];
}

const DEFAULT_TOP_COUNT = 10;
const MIN_TOP_COUNT = 1;
const MAX_TOP_COUNT = 100;

function clampTopCount(topCount?: number): number {
  if (typeof topCount !== "number" || Number.isNaN(topCount)) {
    return DEFAULT_TOP_COUNT;
  }
  return Math.min(MAX_TOP_COUNT, Math.max(MIN_TOP_COUNT, Math.floor(topCount)));
}

function isWithinRange(timestamp: string | undefined, since?: string, until?: string): boolean {
  if (!timestamp) return true;
  const ts = Date.parse(timestamp);
  if (Number.isNaN(ts)) return true;
  if (since) {
    const sinceTs = Date.parse(since);
    if (!Number.isNaN(sinceTs) && ts < sinceTs) return false;
  }
  if (until) {
    const untilTs = Date.parse(until);
    if (!Number.isNaN(untilTs) && ts > untilTs) return false;
  }
  return true;
}

function matchesModel(modelId: string | undefined, modelIds?: string[]): boolean {
  if (!modelIds || modelIds.length === 0) return true;
  if (!modelId) return false;
  return modelIds.includes(modelId);
}

export function filterAnnotations(annos: MoveAnnotation[], filters?: SummaryFilters): MoveAnnotation[] {
  if (!filters) return annos;
  const { modelIds, since, until } = filters;
  return annos.filter((anno) => matchesModel(anno.modelId, modelIds) && isWithinRange(anno.timestamp, since, until));
}

function byStrongDeltaDesc(a: MoveAnnotation, b: MoveAnnotation): number {
  return b.deltaCp - a.deltaCp;
}

function byBlunderDeltaAsc(a: MoveAnnotation, b: MoveAnnotation): number {
  return a.deltaCp - b.deltaCp;
}

function mapToTopItem(anno: MoveAnnotation): TopMoveItem {
  return {
    gameId: anno.gameId,
    ply: anno.ply,
    san: anno.san,
    color: anno.color,
    deltaCp: anno.deltaCp,
    classification: anno.classification,
    modelId: anno.modelId,
    timestamp: anno.timestamp
  };
}

export function buildTopMoves(annos: MoveAnnotation[], filters?: SummaryFilters): TopMoveItem[] {
  const filtered = filterAnnotations(
    annos.filter((a) => a.classification === "strong" || a.classification === "mateWin"),
    filters
  );
  const topCount = clampTopCount(filters?.topCount);
  return [...filtered].sort(byStrongDeltaDesc).slice(0, topCount).map(mapToTopItem);
}

export function buildTopBlunders(annos: MoveAnnotation[], filters?: SummaryFilters): TopMoveItem[] {
  const filtered = filterAnnotations(
    annos.filter((a) => a.classification === "blunder" || a.classification === "mateLoss"),
    filters
  );
  const topCount = clampTopCount(filters?.topCount);
  return [...filtered].sort(byBlunderDeltaAsc).slice(0, topCount).map(mapToTopItem);
}

export function buildModelTable(ranked: RankedModel[], filters?: SummaryFilters): ModelTableRow[] {
  const modelIds = filters?.modelIds;
  const filtered = modelIds && modelIds.length > 0 ? ranked.filter((r) => modelIds.includes(r.modelId)) : ranked;
  return filtered.map((r) => ({
    modelId: r.modelId,
    rank: r.rank,
    score: r.score,
    games: r.metrics.games,
    winRate: r.metrics.winRate,
    strongPerGame: r.metrics.strongPerGame,
    blunderPerGame: r.metrics.blunderPerGame,
    qualityScore: r.metrics.qualityScore
  }));
}

export function exportSummary(payload: {
  filters?: SummaryFilters;
  topMoves: TopMoveItem[];
  topBlunders: TopMoveItem[];
  modelTable: ModelTableRow[];
}): ExportedSummary {
  return {
    generatedAt: new Date().toISOString(),
    filtersApplied: payload.filters,
    topMoves: payload.topMoves,
    topBlunders: payload.topBlunders,
    modelTable: payload.modelTable
  };
}
