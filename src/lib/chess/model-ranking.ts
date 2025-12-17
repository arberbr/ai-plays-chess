export type GameOutcome = "win" | "loss" | "draw";

export interface GameRecord {
  modelId: string;
  opponentId: string;
  outcome: GameOutcome;
  strongMoves: number;
  blunders: number;
  totalMoves: number;
  gameId?: string;
}

export interface ModelMetrics {
  modelId: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  strongMoves: number;
  blunders: number;
  totalMoves: number;
  winRate: number;
  strongPerGame: number;
  blunderPerGame: number;
  qualityScore: number;
  compositeScore: number;
}

export interface RankingWeights {
  winRate: number;
  quality: number;
}

export interface RankedModel {
  modelId: string;
  rank: number;
  score: number;
  metrics: ModelMetrics;
}

export interface PersistedRanking {
  generatedAt: string;
  ranking: RankedModel[];
}

const DEFAULT_WEIGHTS: RankingWeights = { winRate: 0.5, quality: 0.5 };
const QUALITY_CLAMP = 3; // max magnitude of (strongPerGame - blunderPerGame) before normalization

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeQuality(qualityScore: number): number {
  const clamped = clamp(qualityScore, -QUALITY_CLAMP, QUALITY_CLAMP);
  return clamped / QUALITY_CLAMP;
}

function normalizeWeights(weights?: RankingWeights): RankingWeights {
  const base = weights ?? DEFAULT_WEIGHTS;
  const win = clamp(base.winRate, 0, 1);
  const quality = clamp(base.quality, 0, 1);
  const sum = win + quality;
  if (sum <= 0) {
    return DEFAULT_WEIGHTS;
  }
  return { winRate: win / sum, quality: quality / sum };
}

function emptyMetrics(modelId: string): ModelMetrics {
  return {
    modelId,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    strongMoves: 0,
    blunders: 0,
    totalMoves: 0,
    winRate: 0,
    strongPerGame: 0,
    blunderPerGame: 0,
    qualityScore: 0,
    compositeScore: 0
  };
}

function finalizeMetrics(metrics: ModelMetrics): ModelMetrics {
  const games = Math.max(metrics.games, 0);
  const divisor = games > 0 ? games : 1;
  const winRate = games > 0 ? metrics.wins / games : 0;
  const strongPerGame = metrics.strongMoves / divisor;
  const blunderPerGame = metrics.blunders / divisor;
  const qualityScore = strongPerGame - blunderPerGame;
  return {
    ...metrics,
    games,
    winRate,
    strongPerGame,
    blunderPerGame,
    qualityScore
  };
}

export function aggregateModelMetrics(records: GameRecord[]): Record<string, ModelMetrics> {
  const map = new Map<string, ModelMetrics>();
  for (const rec of records) {
    const metrics = map.get(rec.modelId) ?? emptyMetrics(rec.modelId);
    metrics.games += 1;
    metrics.strongMoves += Math.max(0, rec.strongMoves);
    metrics.blunders += Math.max(0, rec.blunders);
    metrics.totalMoves += Math.max(0, rec.totalMoves);
    if (rec.outcome === "win") metrics.wins += 1;
    else if (rec.outcome === "loss") metrics.losses += 1;
    else metrics.draws += 1;
    map.set(rec.modelId, metrics);
  }

  const result: Record<string, ModelMetrics> = {};
  for (const [modelId, metrics] of map) {
    result[modelId] = finalizeMetrics(metrics);
  }
  return result;
}

export function rankModels(
  metrics: Record<string, ModelMetrics>,
  weights?: RankingWeights
): RankedModel[] {
  const normalizedWeights = normalizeWeights(weights);
  const entries = Object.values(metrics).map((m) => {
    const qualityNormalized = normalizeQuality(m.qualityScore);
    const score = m.winRate * normalizedWeights.winRate + qualityNormalized * normalizedWeights.quality;
    const metricsWithComposite: ModelMetrics = { ...m, compositeScore: score };
    return { modelId: m.modelId, score, metrics: metricsWithComposite };
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.metrics.winRate !== a.metrics.winRate) return b.metrics.winRate - a.metrics.winRate;
    if (a.metrics.blunderPerGame !== b.metrics.blunderPerGame)
      return a.metrics.blunderPerGame - b.metrics.blunderPerGame;
    if (b.metrics.strongPerGame !== a.metrics.strongPerGame)
      return b.metrics.strongPerGame - a.metrics.strongPerGame;
    return a.modelId.localeCompare(b.modelId);
  });

  return entries.map((entry, idx) => ({
    modelId: entry.modelId,
    rank: idx + 1,
    score: entry.score,
    metrics: entry.metrics
  }));
}

export function serializeRanking(ranking: RankedModel[]): PersistedRanking {
  return {
    generatedAt: new Date().toISOString(),
    ranking
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isModelMetrics(value: unknown): value is ModelMetrics {
  if (!value || typeof value !== "object") return false;
  const m = value as ModelMetrics;
  return (
    typeof m.modelId === "string" &&
    isNumber(m.games) &&
    isNumber(m.wins) &&
    isNumber(m.losses) &&
    isNumber(m.draws) &&
    isNumber(m.strongMoves) &&
    isNumber(m.blunders) &&
    isNumber(m.totalMoves) &&
    isNumber(m.winRate) &&
    isNumber(m.strongPerGame) &&
    isNumber(m.blunderPerGame) &&
    isNumber(m.qualityScore) &&
    isNumber(m.compositeScore)
  );
}

export function deserializeRanking(payload: unknown): RankedModel[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as PersistedRanking;
  if (!Array.isArray((p as PersistedRanking).ranking)) return [];
  const ranking = [];
  for (const item of p.ranking) {
    if (!item || typeof item !== "object") continue;
    const r = item as RankedModel;
    if (typeof r.modelId !== "string" || !isNumber(r.score) || !isNumber(r.rank)) continue;
    if (!isModelMetrics(r.metrics)) continue;
    ranking.push(r);
  }
  return ranking;
}
