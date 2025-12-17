import { PieceColor } from "./types";

export type CpEvaluation = {
  type: "cp";
  value: number; // centipawns, positive favors side to move at time of eval
};

export type MateEvaluation = {
  type: "mate";
  moves: number; // mate in N from side to move
  sign: 1 | -1; // +1 winning for side to move, -1 losing for side to move
};

export type Evaluation = CpEvaluation | MateEvaluation;

export type MoveClassification =
  | "mateWin"
  | "mateLoss"
  | "strong"
  | "accurate"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "neutral";

export interface MoveScoreThresholds {
  strong: number; // delta >= strong => strong
  accurate: number; // delta >= accurate => accurate
  inaccuracy: number; // |delta| <= inaccuracy => inaccuracy/neutral band
  mistake: number; // delta <= -mistake => mistake (before blunder cutoff)
  blunder: number; // delta <= -blunder => blunder
}

export const DEFAULT_MOVE_SCORE_THRESHOLDS: MoveScoreThresholds = {
  strong: 150,
  accurate: 50,
  inaccuracy: 50,
  mistake: 50,
  blunder: 150
};

export interface MoveScoreMeta {
  ply?: number;
  fullmove?: number;
  san?: string;
}

export interface MoveScoreConfig {
  thresholds?: Partial<MoveScoreThresholds>;
}

export interface MoveScoreInput {
  before: Evaluation;
  after: Evaluation;
  color: PieceColor;
  moveMeta?: MoveScoreMeta;
  config?: MoveScoreConfig;
}

export interface MoveScoreResult {
  classification: MoveClassification;
  deltaCp: number;
  mate?: {
    isWin: boolean;
    moves: number;
  };
  before: Evaluation;
  after: Evaluation;
  color: PieceColor;
  meta?: MoveScoreMeta;
}

const MATE_MAGNITUDE = 1_000_000;

type RelativeEval =
  | { kind: "cp"; value: number }
  | { kind: "mate"; value: number; moves: number; isWin: boolean };

function normalizeThresholds(config?: MoveScoreConfig): MoveScoreThresholds {
  return {
    ...DEFAULT_MOVE_SCORE_THRESHOLDS,
    ...config?.thresholds
  };
}

function toRelativeEval(evaluation: Evaluation, isMoverTurn: boolean): RelativeEval {
  if (evaluation.type === "mate") {
    const value = evaluation.sign * (isMoverTurn ? 1 : -1);
    return {
      kind: "mate",
      value: value * MATE_MAGNITUDE,
      moves: evaluation.moves,
      isWin: value > 0
    };
  }
  return { kind: "cp", value: evaluation.value * (isMoverTurn ? 1 : -1) };
}

export function computeDeltaCp(before: Evaluation, after: Evaluation, _color: PieceColor): number {
  const beforeRelative = toRelativeEval(before, true);
  const afterRelative = toRelativeEval(after, false);
  return afterRelative.value - beforeRelative.value;
}

function classifyDelta(
  deltaCp: number,
  afterRelative: RelativeEval,
  thresholds: MoveScoreThresholds
): MoveClassification {
  if (afterRelative.kind === "mate") {
    return afterRelative.isWin ? "mateWin" : "mateLoss";
  }
  if (deltaCp === 0) return "neutral";
  if (deltaCp >= thresholds.strong) return "strong";
  if (deltaCp >= thresholds.accurate) return "accurate";
  if (Math.abs(deltaCp) <= thresholds.inaccuracy) return "inaccuracy";
  if (deltaCp <= -thresholds.blunder) return "blunder";
  if (deltaCp <= -thresholds.mistake) return "mistake";
  return "inaccuracy";
}

export function scoreMove(input: MoveScoreInput): MoveScoreResult {
  const { before, after, color, moveMeta, config } = input;
  const thresholds = normalizeThresholds(config);
  const beforeRelative = toRelativeEval(before, true);
  const afterRelative = toRelativeEval(after, false);
  const deltaCp = afterRelative.value - beforeRelative.value;

  const classification = classifyDelta(deltaCp, afterRelative, thresholds);
  const mate =
    afterRelative.kind === "mate"
      ? { isWin: afterRelative.isWin, moves: afterRelative.moves }
      : undefined;

  return {
    classification,
    deltaCp,
    mate,
    before,
    after,
    color,
    meta: moveMeta
  };
}
