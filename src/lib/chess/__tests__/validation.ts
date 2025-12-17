import assert from "node:assert";
import { parseFen, startingPosition } from "../fen";
import { validateMove } from "../validate";
import { createPgnHeaders, pgnToString } from "../pgn";
import { Move, PieceType } from "../types";

export function runValidationTests() {
  const start = startingPosition();
  const e4: Move = { from: "e2", to: "e4", isDoublePush: true };
  const res = validateMove(start, e4);
  assert.strictEqual(res.legal, true, "e4 should be legal");
  assert.strictEqual(res.san, "e4", "SAN for e4");

  const wrongTurn = validateMove(start, { from: "e7", to: "e5", isDoublePush: true });
  assert.strictEqual(wrongTurn.legal, false);
  assert.strictEqual(wrongTurn.reason, "wrongTurn");

  const pinState = parseFen("4r2k/8/8/8/8/8/4R3/4K3 w - - 0 1");
  const pinnedMove = validateMove(pinState, { from: "e2", to: "f2" });
  assert.strictEqual(pinnedMove.legal, false);
  assert.strictEqual(pinnedMove.reason, "leavesKingInCheck");

  const promoState = parseFen("8/P7/8/8/8/8/8/k6K w - - 0 1");
  const promoFail = validateMove(promoState, { from: "a7", to: "a8" });
  assert.strictEqual(promoFail.legal, false);
  assert.strictEqual(promoFail.reason, "promotionMissing");

  const promoOk = validateMove(promoState, { from: "a7", to: "a8", promotion: PieceType.Queen });
  assert.strictEqual(promoOk.legal, true);
  assert.ok(promoOk.san.startsWith("a8=Q"));

  const headers = createPgnHeaders({ White: "BotA", Black: "BotB", whiteModel: "EngineA", blackModel: "EngineB" });
  const withPgn = validateMove(start, e4, { headers });
  assert.ok(withPgn.legal && withPgn.pgn);
  assert.strictEqual(withPgn.pgn?.moves[0].white, "e4");

  const pgnText = withPgn.pgn ? pgnToString(withPgn.pgn) : "";
  assert.ok(pgnText.includes('[White "BotA"]'));
  assert.ok(pgnText.includes("1. e4 *"));
}
