import assert from "node:assert";
import { PieceColor } from "../types";
import { RankedModel } from "../model-ranking";
import {
  buildModelTable,
  buildTopBlunders,
  buildTopMoves,
  ExportedSummary,
  exportSummary,
  filterAnnotations,
  MoveAnnotation,
  SummaryFilters
} from "../summary-view";

export function runSummaryViewTests() {
  const annotations: MoveAnnotation[] = [
    {
      gameId: "g1",
      ply: 10,
      color: PieceColor.White,
      deltaCp: 250,
      classification: "strong",
      modelId: "A",
      timestamp: "2024-01-01T00:00:00Z"
    },
    {
      gameId: "g1",
      ply: 15,
      color: PieceColor.Black,
      deltaCp: -300,
      classification: "blunder",
      modelId: "B",
      timestamp: "2024-02-01T00:00:00Z"
    },
    {
      gameId: "g2",
      ply: 8,
      color: PieceColor.White,
      deltaCp: 180,
      classification: "strong",
      modelId: "B",
      timestamp: "2024-03-01T00:00:00Z"
    },
    {
      gameId: "g3",
      ply: 20,
      color: PieceColor.Black,
      deltaCp: -500,
      classification: "blunder",
      modelId: "A",
      timestamp: "2024-04-01T00:00:00Z"
    }
  ];

  const filters: SummaryFilters = { modelIds: ["A"], since: "2024-01-15T00:00:00Z", topCount: 5 };
  const filtered = filterAnnotations(annotations, filters);
  assert.strictEqual(filtered.length, 1, "Only annotations matching model A and since date should remain");

  const topMoves = buildTopMoves(annotations);
  assert.strictEqual(topMoves.length, 2);
  assert.ok(topMoves[0].deltaCp >= topMoves[1].deltaCp, "Top moves sorted desc by delta");

  const topBlunders = buildTopBlunders(annotations);
  assert.strictEqual(topBlunders.length, 2);
  assert.ok(topBlunders[0].deltaCp <= topBlunders[1].deltaCp, "Top blunders sorted asc by delta");

  const ranked: RankedModel[] = [
    {
      modelId: "A",
      rank: 1,
      score: 0.9,
      metrics: {
        modelId: "A",
        games: 10,
        wins: 7,
        losses: 2,
        draws: 1,
        strongMoves: 30,
        blunders: 5,
        totalMoves: 400,
        winRate: 0.7,
        strongPerGame: 3,
        blunderPerGame: 0.5,
        qualityScore: 2.5,
        compositeScore: 0.9
      }
    },
    {
      modelId: "B",
      rank: 2,
      score: 0.6,
      metrics: {
        modelId: "B",
        games: 8,
        wins: 4,
        losses: 3,
        draws: 1,
        strongMoves: 12,
        blunders: 8,
        totalMoves: 320,
        winRate: 0.5,
        strongPerGame: 1.5,
        blunderPerGame: 1,
        qualityScore: 0.5,
        compositeScore: 0.6
      }
    }
  ];

  const table = buildModelTable(ranked, { modelIds: ["B"] });
  assert.strictEqual(table.length, 1);
  assert.strictEqual(table[0].modelId, "B");
  assert.strictEqual(table[0].winRate, 0.5);

  const exported: ExportedSummary = exportSummary({
    filters,
    topMoves,
    topBlunders,
    modelTable: table
  });

  assert.ok(exported.generatedAt);
  assert.strictEqual(exported.topMoves.length, topMoves.length);
  assert.strictEqual(exported.topBlunders.length, topBlunders.length);
  assert.strictEqual(exported.modelTable.length, table.length);
}
