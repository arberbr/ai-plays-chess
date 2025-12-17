import assert from "node:assert";
import { PieceColor } from "../types";
import {
  DEFAULT_MOVE_SCORE_THRESHOLDS,
  MoveClassification,
  scoreMove
} from "../move-score";

export function runMoveScoreTests() {
  const strongForWhite = scoreMove({
    before: { type: "cp", value: 0 },
    after: { type: "cp", value: -200 },
    color: PieceColor.White
  });
  assert.strictEqual(strongForWhite.classification, "strong");
  assert.strictEqual(strongForWhite.deltaCp, 200);

  const blunderForBlack = scoreMove({
    before: { type: "cp", value: 0 },
    after: { type: "cp", value: 200 },
    color: PieceColor.Black
  });
  assert.strictEqual(blunderForBlack.classification, "blunder");
  assert.ok(blunderForBlack.deltaCp < 0);

  const smallShift = scoreMove({
    before: { type: "cp", value: 30 },
    after: { type: "cp", value: 20 },
    color: PieceColor.White
  });
  assert.strictEqual(smallShift.classification, "inaccuracy");
  assert.strictEqual(smallShift.deltaCp, -50);

  const mateWin = scoreMove({
    before: { type: "cp", value: 10 },
    after: { type: "mate", moves: 3, sign: -1 },
    color: PieceColor.White
  });
  assert.strictEqual(mateWin.classification, "mateWin");
  assert.deepStrictEqual(mateWin.mate, { isWin: true, moves: 3 });

  const mateLoss = scoreMove({
    before: { type: "cp", value: 0 },
    after: { type: "mate", moves: 2, sign: 1 },
    color: PieceColor.White
  });
  assert.strictEqual(mateLoss.classification, "mateLoss");
  assert.deepStrictEqual(mateLoss.mate, { isWin: false, moves: 2 });

  const customThresholds = scoreMove({
    before: { type: "cp", value: 0 },
    after: { type: "cp", value: -200 },
    color: PieceColor.White,
    config: { thresholds: { strong: 250 } }
  });
  const expectedAccurate: MoveClassification = "accurate";
  assert.strictEqual(customThresholds.classification, expectedAccurate);
  assert.strictEqual(customThresholds.deltaCp, 200);

  // Escaping mate should register as a big positive swing for mover
  const escapeMate = scoreMove({
    before: { type: "mate", moves: 2, sign: 1 },
    after: { type: "cp", value: -20 },
    color: PieceColor.White
  });
  assert.ok(escapeMate.deltaCp > DEFAULT_MOVE_SCORE_THRESHOLDS.strong);
}
