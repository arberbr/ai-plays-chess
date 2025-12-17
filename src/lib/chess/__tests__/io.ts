import assert from "node:assert";
import { exportGameToJson, exportGameToPgn, importGameFromJson, importGameFromPgn } from "../io";
import { createReplayController } from "../replay";
import { startingPosition } from "../fen";
import { validateMove } from "../validate";
import { GameState } from "../types";

function applySans(state: GameState, sans: string[]): GameState {
  let current = state;
  for (const san of sans) {
    const candidates = validateMoveWithSan(current, san);
    current = candidates;
  }
  return current;
}

function validateMoveWithSan(state: GameState, san: string): GameState {
  // brute force: try legal moves and match SAN from validateMove
  // (small helper to keep tests readable)
  const { legalMoves } = require("../status") as typeof import("../status");
  const moves = legalMoves(state, state.turn);
  for (const move of moves) {
    const res = validateMove(state, move);
    if (res.legal && res.san === san) return res.nextState;
  }
  throw new Error(`No matching SAN: ${san}`);
}

export function runIoTests() {
  const sans = ["e4", "e5", "Nf3", "Nc6"];
  const start = startingPosition();
  const finalState = applySans(start, sans);

  // JSON round-trip
  const payload = exportGameToJson(finalState, sans, { metadata: { modelWhite: "A", modelBlack: "B", result: "*" } });
  const imported = importGameFromJson(payload);
  assert.strictEqual(imported.pgnMoves.length, sans.length);
  assert.strictEqual(imported.metadata?.modelWhite, "A");
  assert.strictEqual(imported.metadata?.modelBlack, "B");

  // PGN round-trip
  const pgn = exportGameToPgn(finalState, sans, { metadata: { modelWhite: "A", modelBlack: "B", result: "*" } });
  const importedPgn = importGameFromPgn(pgn);
  assert.strictEqual(importedPgn.pgnMoves.length, sans.length);

  // Replay controller
  const replay = createReplayController(sans);
  assert.strictEqual(replay.length(), sans.length);
  const first = replay.current();
  const second = replay.next();
  assert.strictEqual(second.index, 1);
  assert.notStrictEqual(first.fen, second.fen);
}
