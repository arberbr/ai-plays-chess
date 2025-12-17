import assert from "node:assert";
import {
  aggregateModelMetrics,
  deserializeRanking,
  rankModels,
  RankingWeights,
  serializeRanking
} from "../model-ranking";
import type { GameRecord } from "../model-ranking";

export function runModelRankingTests() {
  const records: GameRecord[] = [
    { modelId: "A", opponentId: "B", outcome: "win", strongMoves: 6, blunders: 1, totalMoves: 40 },
    { modelId: "A", opponentId: "C", outcome: "draw", strongMoves: 4, blunders: 0, totalMoves: 38 },
    { modelId: "B", opponentId: "A", outcome: "loss", strongMoves: 2, blunders: 3, totalMoves: 40 },
    { modelId: "B", opponentId: "C", outcome: "win", strongMoves: 5, blunders: 2, totalMoves: 42 },
    { modelId: "C", opponentId: "A", outcome: "draw", strongMoves: 3, blunders: 1, totalMoves: 38 },
    { modelId: "C", opponentId: "B", outcome: "loss", strongMoves: 2, blunders: 4, totalMoves: 42 }
  ];

  const metrics = aggregateModelMetrics(records);

  assert.strictEqual(metrics.A.games, 2);
  assert.strictEqual(metrics.A.wins, 1);
  assert.strictEqual(metrics.A.draws, 1);
  assert.ok(metrics.A.winRate > metrics.B.winRate, "A should outrank B on win rate alone");

  const defaultRanking = rankModels(metrics);
  assert.strictEqual(defaultRanking[0].modelId, "A");
  assert.strictEqual(defaultRanking[defaultRanking.length - 1].modelId, "C");

  const qualityHeavy: RankingWeights = { winRate: 0.2, quality: 0.8 };
  const qualityRanking = rankModels(metrics, qualityHeavy);
  assert.strictEqual(qualityRanking[0].modelId, "A");

  // Tie-breakers: craft identical scores but different blunders/strong
  const tieMetrics = {
    X: {
      ...metrics.A,
      modelId: "X",
      winRate: 0.5,
      strongPerGame: 2,
      blunderPerGame: 1,
      qualityScore: 1,
      compositeScore: 0
    },
    Y: {
      ...metrics.A,
      modelId: "Y",
      winRate: 0.5,
      strongPerGame: 1.5,
      blunderPerGame: 0.5,
      qualityScore: 1,
      compositeScore: 0
    }
  };
  const tieRank = rankModels(tieMetrics, { winRate: 0.5, quality: 0.5 });
  assert.strictEqual(tieRank[0].modelId, "Y", "Lower blunders should win tie-break");

  // Serialization / deserialization round trip
  const serialized = serializeRanking(defaultRanking);
  const restored = deserializeRanking(serialized);
  assert.strictEqual(restored.length, defaultRanking.length);
  assert.strictEqual(restored[0].modelId, defaultRanking[0].modelId);

  // Malformed payload yields empty
  const empty = deserializeRanking({ ranking: [{ modelId: 1 }] });
  assert.deepStrictEqual(empty, []);
}
