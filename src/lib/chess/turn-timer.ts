import { ClockSnapshot, PieceColor, TurnLoopConfig } from "./types";

interface TimerCallbacks {
  onTick?(clocks: ClockSnapshot): void;
  onExpire?(color: PieceColor): void;
}

export function createTurnTimer(config: Pick<TurnLoopConfig, "tickMs" | "perMoveSeconds">, callbacks: TimerCallbacks = {}) {
  let interval: NodeJS.Timeout | null = null;
  let remainingWhite = config.perMoveSeconds;
  let remainingBlack = config.perMoveSeconds;
  let active: PieceColor | null = null;
  let lastTickMs = 0;

  function snapshot(): ClockSnapshot {
    return { white: Math.max(0, remainingWhite), black: Math.max(0, remainingBlack), active };
  }

  function clearIntervalIfAny() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function now(): number {
    return globalThis.performance ? globalThis.performance.now() : Date.now();
  }

  function tick(current: number) {
    if (!active) return;
    const elapsed = (current - lastTickMs) / 1000;
    lastTickMs = current;

    if (active === PieceColor.White) {
      remainingWhite = Math.max(0, remainingWhite - elapsed);
      if (remainingWhite === 0) {
        clearIntervalIfAny();
        callbacks.onExpire?.(PieceColor.White);
      }
    } else {
      remainingBlack = Math.max(0, remainingBlack - elapsed);
      if (remainingBlack === 0) {
        clearIntervalIfAny();
        callbacks.onExpire?.(PieceColor.Black);
      }
    }
    callbacks.onTick?.(snapshot());
  }

  function startTurn(color: PieceColor) {
    clearIntervalIfAny();
    active = color;
    lastTickMs = now();
    interval = setInterval(() => tick(now()), config.tickMs);
  }

  function pause() {
    clearIntervalIfAny();
    active = null;
  }

  function resume(color: PieceColor) {
    if (active) return;
    startTurn(color);
  }

  function resetPerMove(color: PieceColor) {
    if (color === PieceColor.White) remainingWhite = config.perMoveSeconds;
    else remainingBlack = config.perMoveSeconds;
  }

  function clearAll() {
    clearIntervalIfAny();
    active = null;
    remainingWhite = config.perMoveSeconds;
    remainingBlack = config.perMoveSeconds;
  }

  return {
    startTurn,
    pause,
    resume,
    clearAll,
    resetPerMove,
    snapshot
  };
}
