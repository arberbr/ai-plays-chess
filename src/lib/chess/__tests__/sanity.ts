/* Sanity helpers for manual verification; run with ts-node if desired. */
import assert from "node:assert";
import { gameStateToFen, parseFen, startingPosition } from "../fen";
import { makeMove, unmakeMove } from "../move";
import { evaluateStatus, legalMoves } from "../status";
import { Move, PieceColor } from "../types";

export function runSanityChecks() {
  const start = startingPosition();
  const fen = gameStateToFen(start);
  assert.strictEqual(fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  const parsed = parseFen(fen);
  assert.deepStrictEqual(parsed.castling.whiteKingSide, true);
  assert.deepStrictEqual(parsed.turn, PieceColor.White);

  const moves = legalMoves(start, PieceColor.White);
  assert.ok(moves.length > 0, "expected legal moves from start");

  const firstMove: Move = moves.find((m) => m.from === "e2" && m.to === "e4") ?? moves[0];
  const result = makeMove(start, firstMove);
  const reverted = unmakeMove(result.nextState, firstMove, result.undo);
  assert.deepStrictEqual(reverted.board[firstMove.from]?.type, result.undo.movedPieceBefore.type);

  const status = evaluateStatus(start);
  assert.strictEqual(status.gameOver, false);
}

