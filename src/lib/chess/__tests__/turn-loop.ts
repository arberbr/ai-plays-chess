import assert from "node:assert";
import { evaluateStatus, legalMoves } from "../status";
import { startingPosition } from "../fen";
import { createTurnLoop } from "../turn-loop";
import { Move, TurnContext } from "../types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTurnLoopTests() {
  const startState = startingPosition();
  const status = evaluateStatus(startState);
  const baseCtx: TurnContext = {
    state: startState,
    status,
    clocks: { white: 0.1, black: 0.1, active: null },
    pgn: undefined
  };

  // Provider that plays first legal move for side to move
  const greedyProvider = async (ctx: TurnContext): Promise<Move> => {
    const moves = legalMoves(ctx.state, ctx.state.turn);
    return moves[0];
  };

  let movesMade = 0;
  let endReason: string | undefined;

  const loop = createTurnLoop({
    providers: { white: greedyProvider, black: greedyProvider },
    config: { perMoveSeconds: 0.1, tickMs: 10 },
    callbacks: {
      onMove: () => {
        movesMade += 1;
      },
      onEnd: ({ reason }) => {
        endReason = reason;
      }
    }
  });

  loop.start(baseCtx);
  await sleep(50);
  loop.stop("stopped");
  await sleep(20);

  assert.ok(movesMade >= 2, "expected at least two plies before stop");
  assert.strictEqual(endReason, "stopped");

  // Timeout scenario: provider stalls past per-move limit
  const slowProvider = async () => {
    await sleep(120);
    return { from: "a2", to: "a3" } as Move;
  };
  let timeoutReason: string | undefined;
  const timeoutLoop = createTurnLoop({
    providers: { white: slowProvider, black: greedyProvider },
    config: { perMoveSeconds: 0.05, tickMs: 10 },
    callbacks: {
      onEnd: ({ reason }) => {
        timeoutReason = reason;
      }
    }
  });
  timeoutLoop.start(baseCtx);
  await sleep(120);
  assert.strictEqual(timeoutReason, "timeout", "expect timeout when provider stalls");
}
