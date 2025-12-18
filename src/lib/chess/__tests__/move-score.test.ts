import { describe, expect, it } from "vitest";
import { PieceColor } from "../types";
import { DEFAULT_MOVE_SCORE_THRESHOLDS, scoreMove } from "../move-score";

describe("scoreMove", () => {
  it("classifies strong vs blunder by color", () => {
    const strongForWhite = scoreMove({
      before: { type: "cp", value: 0 },
      after: { type: "cp", value: -200 },
      color: PieceColor.White
    });
    expect(strongForWhite.classification).toBe("strong");
    expect(strongForWhite.deltaCp).toBe(200);

    const blunderForBlack = scoreMove({
      before: { type: "cp", value: 0 },
      after: { type: "cp", value: 200 },
      color: PieceColor.Black
    });
    expect(blunderForBlack.classification).toBe("blunder");
    expect(blunderForBlack.deltaCp).toBeLessThan(0);
  });

  it("handles small swings", () => {
    const smallShift = scoreMove({
      before: { type: "cp", value: 30 },
      after: { type: "cp", value: 20 },
      color: PieceColor.White
    });
    expect(smallShift.classification).toBe("inaccuracy");
    expect(smallShift.deltaCp).toBe(-50);
  });

  it("detects mate swings", () => {
    const mateWin = scoreMove({
      before: { type: "cp", value: 10 },
      after: { type: "mate", moves: 3, sign: -1 },
      color: PieceColor.White
    });
    expect(mateWin.classification).toBe("mateWin");
    expect(mateWin.mate).toEqual({ isWin: true, moves: 3 });

    const mateLoss = scoreMove({
      before: { type: "cp", value: 0 },
      after: { type: "mate", moves: 2, sign: 1 },
      color: PieceColor.White
    });
    expect(mateLoss.classification).toBe("mateLoss");
    expect(mateLoss.mate).toEqual({ isWin: false, moves: 2 });
  });

  it("respects custom thresholds", () => {
    const customThresholds = scoreMove({
      before: { type: "cp", value: 0 },
      after: { type: "cp", value: -200 },
      color: PieceColor.White,
      config: { thresholds: { strong: 250 } }
    });
    expect(customThresholds.classification).toBe<"accurate">("accurate");
    expect(customThresholds.deltaCp).toBe(200);
  });

  it("handles escaping mate without crashing", () => {
    const escapeMate = scoreMove({
      before: { type: "mate", moves: 2, sign: 1 },
      after: { type: "cp", value: -20 },
      color: PieceColor.White
    });
    expect(Number.isFinite(escapeMate.deltaCp)).toBe(true);
    expect(escapeMate.classification).toBeDefined();
  });
});
