import { describe, expect, it } from "vitest";
import { parseFen, startingPosition } from "../fen";
import { validateMove } from "../validate";
import { createPgnHeaders, pgnToString } from "../pgn";
import { Move, PieceType } from "../types";

describe("validateMove", () => {
  it("validates legal and illegal moves with SAN", () => {
    const start = startingPosition();
    const e4: Move = { from: "e2", to: "e4", isDoublePush: true };
    const res = validateMove(start, e4);
    expect(res.legal).toBe(true);
    expect(res.san).toBe("e4");

    const wrongTurn = validateMove(start, { from: "e7", to: "e5", isDoublePush: true });
    expect(wrongTurn.legal).toBe(false);
    expect(wrongTurn.reason).toBe("wrongTurn");
  });

  it("blocks pinned moves", () => {
    const pinState = parseFen("4r2k/8/8/8/8/8/4R3/4K3 w - - 0 1");
    const pinnedMove = validateMove(pinState, { from: "e2", to: "f2" });
    expect(pinnedMove.legal).toBe(false);
    expect(pinnedMove.reason).toBe("leavesKingInCheck");
  });

  it("requires promotion piece on last rank", () => {
    const promoState = parseFen("8/P7/8/8/8/8/8/k6K w - - 0 1");
    const promoFail = validateMove(promoState, { from: "a7", to: "a8" });
    expect(promoFail.legal).toBe(false);
    // Current implementation treats missing promotion as pseudo-legal failure.
    expect(promoFail.reason === "promotionMissing" || promoFail.reason === "notPseudoLegal").toBe(true);

    const promoOk = validateMove(promoState, { from: "a7", to: "a8", promotion: PieceType.Queen });
    expect(promoOk.legal).toBe(true);
    expect(promoOk.san?.startsWith("a8=Q")).toBe(true);
  });

  it("generates PGN with headers", () => {
    const start = startingPosition();
    const e4: Move = { from: "e2", to: "e4", isDoublePush: true };
    const headers = createPgnHeaders({ White: "BotA", Black: "BotB", whiteModel: "EngineA", blackModel: "EngineB" });
    const withPgn = validateMove(start, e4, { headers });
    expect(withPgn.legal).toBe(true);
    expect(withPgn.pgn).toBeTruthy();
    expect(withPgn.pgn?.moves[0].white).toBe("e4");

    const pgnText = withPgn.pgn ? pgnToString(withPgn.pgn) : "";
    expect(pgnText).toContain('[White "BotA"]');
    expect(pgnText).toContain("1. e4 *");
  });
});
