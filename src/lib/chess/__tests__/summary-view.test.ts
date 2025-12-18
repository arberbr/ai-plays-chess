import { describe, expect, it } from "vitest";
import { PieceColor } from "../types";
import { RankedModel } from "../model-ranking";
import {
  buildModelTable,
  buildTopBlunders,
  buildTopMoves,
  exportSummary,
  filterAnnotations,
  MoveAnnotation,
  SummaryFilters
} from "../summary-view";

describe("summary-view", () => {
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

  it("filters annotations by model and since date", () => {
    const filters: SummaryFilters = { modelIds: ["A"], since: "2024-01-15T00:00:00Z", topCount: 5 };
    const filtered = filterAnnotations(annotations, filters);
    expect(filtered.length).toBe(1);
  });

  it("returns top moves and blunders sorted", () => {
    const topMoves = buildTopMoves(annotations);
    expect(topMoves).toHaveLength(2);
    expect(topMoves[0].deltaCp).toBeGreaterThanOrEqual(topMoves[1].deltaCp);

    const topBlunders = buildTopBlunders(annotations);
    expect(topBlunders).toHaveLength(2);
    expect(topBlunders[0].deltaCp).toBeLessThanOrEqual(topBlunders[1].deltaCp);
  });

  it("builds model table with filters", () => {
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
    expect(table).toHaveLength(1);
    expect(table[0].modelId).toBe("B");
    expect(table[0].winRate).toBe(0.5);
  });

  it("exports summary consistently", () => {
    const filters: SummaryFilters = { modelIds: ["A"], since: "2024-01-15T00:00:00Z", topCount: 5 };
    const topMoves = buildTopMoves(annotations);
    const topBlunders = buildTopBlunders(annotations);
    const modelTable = buildModelTable(
      [
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
        }
      ],
      {}
    );

    const exported = exportSummary({
      filters,
      topMoves,
      topBlunders,
      modelTable
    });

    expect(exported.generatedAt).toBeTruthy();
    expect(exported.topMoves).toHaveLength(topMoves.length);
    expect(exported.topBlunders).toHaveLength(topBlunders.length);
    expect(exported.modelTable).toHaveLength(modelTable.length);
  });
});
