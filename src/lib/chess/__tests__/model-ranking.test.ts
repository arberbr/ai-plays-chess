import { describe, expect, it } from "vitest";
import {
  aggregateModelMetrics,
  deserializeRanking,
  rankModels,
  RankingWeights,
  serializeRanking
} from "../model-ranking";
import type { GameRecord } from "../model-ranking";

describe("model-ranking", () => {
  it("aggregates metrics and ranks models", () => {
    const records: GameRecord[] = [
      { modelId: "A", opponentId: "B", outcome: "win", strongMoves: 6, blunders: 1, totalMoves: 40 },
      { modelId: "A", opponentId: "C", outcome: "draw", strongMoves: 4, blunders: 0, totalMoves: 38 },
      { modelId: "B", opponentId: "A", outcome: "loss", strongMoves: 2, blunders: 3, totalMoves: 40 },
      { modelId: "B", opponentId: "C", outcome: "win", strongMoves: 5, blunders: 2, totalMoves: 42 },
      { modelId: "C", opponentId: "A", outcome: "draw", strongMoves: 3, blunders: 1, totalMoves: 38 },
      { modelId: "C", opponentId: "B", outcome: "loss", strongMoves: 2, blunders: 4, totalMoves: 42 }
    ];

    const metrics = aggregateModelMetrics(records);

    expect(metrics.A.games).toBe(2);
    expect(metrics.A.wins).toBe(1);
    expect(metrics.A.draws).toBe(1);
    expect(metrics.A.winRate).toBeGreaterThanOrEqual(metrics.B.winRate);

    const defaultRanking = rankModels(metrics);
    expect(defaultRanking[0].modelId).toBe("A");
    expect(defaultRanking.at(-1)?.modelId).toBe("C");

    const qualityHeavy: RankingWeights = { winRate: 0.2, quality: 0.8 };
    const qualityRanking = rankModels(metrics, qualityHeavy);
    expect(qualityRanking[0].modelId).toBe("A");
  });

  it("applies tie-breakers for equal composite scores", () => {
    const baseMetrics = aggregateModelMetrics([
      { modelId: "A", opponentId: "B", outcome: "win", strongMoves: 6, blunders: 1, totalMoves: 40 },
      { modelId: "B", opponentId: "A", outcome: "loss", strongMoves: 5, blunders: 2, totalMoves: 40 }
    ]);

    const tieMetrics = {
      X: {
        ...baseMetrics.A,
        modelId: "X",
        winRate: 0.5,
        strongPerGame: 2,
        blunderPerGame: 1,
        qualityScore: 1,
        compositeScore: 0
      },
      Y: {
        ...baseMetrics.A,
        modelId: "Y",
        winRate: 0.5,
        strongPerGame: 1.5,
        blunderPerGame: 0.5,
        qualityScore: 1,
        compositeScore: 0
      }
    };
    const tieRank = rankModels(tieMetrics, { winRate: 0.5, quality: 0.5 });
    expect(tieRank[0].modelId).toBe("Y");
  });

  it("serializes and deserializes rankings safely", () => {
    const metrics = aggregateModelMetrics([
      { modelId: "A", opponentId: "B", outcome: "win", strongMoves: 3, blunders: 1, totalMoves: 30 }
    ]);
    const ranking = rankModels(metrics);
    const serialized = serializeRanking(ranking);
    const restored = deserializeRanking(serialized);
    expect(restored).toHaveLength(ranking.length);
    expect(restored[0].modelId).toBe(ranking[0].modelId);

    const malformed = deserializeRanking({ ranking: [{ modelId: 1 }] });
    expect(malformed).toEqual([]);
  });
});
