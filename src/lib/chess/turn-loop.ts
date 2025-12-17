import { createPgnHeaders } from "./pgn";
import {
  ClockSnapshot,
  EndReason,
  MoveProvider,
  TurnContext,
  TurnLoopCallbacks,
  TurnLoopConfig,
  TurnLoopState
} from "./types";
import { createTurnTimer } from "./turn-timer";
import { validateMove } from "./validate";

interface CreateLoopOptions {
  providers: { white: MoveProvider; black: MoveProvider };
  config?: Partial<TurnLoopConfig>;
  callbacks?: TurnLoopCallbacks;
  headers?: Parameters<typeof createPgnHeaders>[0];
}

const DEFAULTS: TurnLoopConfig = {
  perMoveSeconds: 30,
  tickMs: 500
};

export function createTurnLoop(opts: CreateLoopOptions) {
  let state: TurnLoopState = "idle";
  const config: TurnLoopConfig = { ...DEFAULTS, ...opts.config };
  const callbacks = opts.callbacks ?? {};

  let ctx: TurnContext | null = null;
  const timer = createTurnTimer(
    { perMoveSeconds: config.perMoveSeconds, tickMs: config.tickMs },
    {
      onTick: (clocks) => callbacks.onTick?.(clocks),
      onExpire: (color) => finish("timeout", color)
    }
  );

  function snapshot(): TurnContext | null {
    return ctx ? { ...ctx, clocks: { ...ctx.clocks }, pgn: ctx.pgn } : null;
  }

  function finish(reason: EndReason) {
    if (!ctx || state === "finished") return;
    state = "finished";
    timer.clearAll();
    callbacks.onEnd?.({ reason, ctx });
  }

  async function playTurn() {
    if (!ctx || state !== "running") return;
    const color = ctx.state.turn;
    const provider = color === PieceColor.White ? opts.providers.white : opts.providers.black;

    timer.resetPerMove(color);
    timer.startTurn(color);

    let providedMove;
    try {
      providedMove = await provider(ctx);
    } catch (err) {
      finish("illegal");
      return;
    }

    if (state !== "running" || !ctx) return;
    timer.pause();

    const result = validateMove(ctx.state, providedMove, { pgn: ctx.pgn, headers: opts.headers });
    if (!result.legal) {
      finish("illegal");
      return;
    }

    const nextStatus = result.status;
    const nextPgn = result.pgn;
    const san = result.san;
    const nextContext: TurnContext = {
      state: result.nextState,
      status: nextStatus,
      pgn: nextPgn,
      clocks: timer.snapshot()
    };

    ctx = nextContext;
    callbacks.onMove?.({ move: result.move, san, ctx: nextContext });
    callbacks.onStateChange?.(nextContext);

    if (nextStatus.gameOver) {
      const reason = (nextStatus.reason as EndReason) ?? "stopped";
      finish(reason);
      return;
    }

    setTimeout(() => void playTurn(), 0);
  }

  function start(initial: TurnContext) {
    if (state !== "idle") return;
    state = "running";
    ctx = {
      ...initial,
      pgn:
        initial.pgn ??
        {
          headers: createPgnHeaders(opts.headers),
          moves: [],
          result: "*"
        },
      clocks: initial.clocks
    };
    callbacks.onStateChange?.(ctx);
    void playTurn();
  }

  function pause() {
    if (state !== "running") return;
    state = "paused";
    timer.pause();
  }

  function resume() {
    if (state !== "paused" || !ctx) return;
    state = "running";
    timer.resume(ctx.state.turn);
    void playTurn();
  }

  function stop(reason: EndReason = "stopped") {
    finish(reason);
  }

  function getSnapshot(): { state: TurnLoopState; ctx: TurnContext | null } {
    return { state, ctx: snapshot() };
  }

  return {
    start,
    pause,
    resume,
    stop,
    getSnapshot
  };
}
