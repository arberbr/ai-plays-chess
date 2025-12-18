import { describe, expect, it } from "vitest";
import { evaluateStatus, legalMoves } from "../status";
import { startingPosition } from "../fen";
import { createTurnLoop } from "../turn-loop";
import { Move, TurnContext } from "../types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("turn-loop", () => {
  it("plays moves until stopped", async () => {
    const startState = startingPosition();
    const status = evaluateStatus(startState);
    const baseCtx: TurnContext = {
      state: startState,
      status,
      clocks: { white: 0.1, black: 0.1, active: null },
      pgn: undefined
    };

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

    expect(movesMade).toBeGreaterThanOrEqual(2);
    expect(endReason).toBe("stopped");
  });

  it("times out when provider is too slow", async () => {
    const startState = startingPosition();
    const status = evaluateStatus(startState);
    const baseCtx: TurnContext = {
      state: startState,
      status,
      clocks: { white: 0.1, black: 0.1, active: null },
      pgn: undefined
    };

    const greedyProvider = async (ctx: TurnContext): Promise<Move> => {
      const moves = legalMoves(ctx.state, ctx.state.turn);
      return moves[0];
    };
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
    expect(timeoutReason).toBe("timeout");
  });
});
