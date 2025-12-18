import { describe, expect, it } from "vitest";
import { exportGameToJson, exportGameToPgn, importGameFromJson, importGameFromPgn } from "../io";
import { createReplayController } from "../replay";
import { startingPosition } from "../fen";
import { validateMove } from "../validate";
import { GameState } from "../types";
import { legalMoves } from "../status";

function applySans(state: GameState, sans: string[]): GameState {
  let current = state;
  for (const san of sans) {
    current = validateMoveWithSan(current, san);
  }
  return current;
}

function validateMoveWithSan(state: GameState, san: string): GameState {
  const moves = legalMoves(state, state.turn);
  for (const move of moves) {
    const res = validateMove(state, move);
    if (res.legal && res.san === san) return res.nextState;
  }
  throw new Error(`No matching SAN: ${san}`);
}

describe("io", () => {
  it("round-trips game state via JSON and PGN and replays moves", () => {
    const sans = ["e4", "e5", "Nf3", "Nc6"];
    const start = startingPosition();
    const finalState = applySans(start, sans);

    const payload = exportGameToJson(finalState, sans, { metadata: { modelWhite: "A", modelBlack: "B", result: "*" } });
    const imported = importGameFromJson(payload);
    expect(imported.pgnMoves.length).toBe(sans.length);
    expect(imported.metadata?.modelWhite).toBe("A");
    expect(imported.metadata?.modelBlack).toBe("B");

    const pgn = exportGameToPgn(finalState, sans, { metadata: { modelWhite: "A", modelBlack: "B", result: "*" } });
    const importedPgn = importGameFromPgn(pgn);
    expect(importedPgn.pgnMoves.length).toBe(sans.length);

    const replay = createReplayController(sans);
    expect(replay.length()).toBe(sans.length);
    const first = replay.current();
    const second = replay.next();
    expect(second.index).toBe(1);
    expect(first.fen).not.toBe(second.fen);
  });
});
