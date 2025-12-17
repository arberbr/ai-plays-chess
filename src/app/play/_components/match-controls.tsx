"use client";

import { PieceColor, TurnLoopState } from "@/lib/chess/types";

interface MatchControlsProps {
  loopState: TurnLoopState;
  turn?: PieceColor;
  gameOver?: { reason?: string; winner?: PieceColor | null };
  onStart(): void;
  onPause(): void;
  onResume(): void;
  onReset(): void;
}

export function MatchControls({ loopState, turn, gameOver, onStart, onPause, onResume, onReset }: MatchControlsProps) {
  const isRunning = loopState === "running";
  const isPaused = loopState === "paused";
  const isIdle = loopState === "idle";
  const isFinished = loopState === "finished";

  const statusLabel = isRunning ? "Running" : isPaused ? "Paused" : isFinished ? "Finished" : "Idle";
  const turnLabel = gameOver
    ? `Game over${gameOver.reason ? ` (${gameOver.reason})` : ""}${
        gameOver.winner ? ` · Winner: ${gameOver.winner === PieceColor.White ? "White" : "Black"}` : ""
      }`
    : turn
    ? `${turn === PieceColor.White ? "White" : "Black"} to move`
    : "Not started";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span className="rounded-full bg-[var(--bg-muted)] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text)]">
          {statusLabel}
        </span>
        <span className="text-[var(--text)] font-semibold">{turnLabel}</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!isIdle}
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Start match"
        >
          Start
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={!isRunning}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Pause match"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onResume}
          disabled={!isPaused}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Resume match"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="rounded-lg bg-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Reset match"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
