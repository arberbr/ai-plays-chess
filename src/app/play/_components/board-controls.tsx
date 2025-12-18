"use client";

import React, { memo } from "react";
import { PieceColor } from "@/lib/chess/types";

interface BoardControlsProps {
  orientation: PieceColor;
  lastMove?: { from: string; to: string };
  onFlip(): void;
  onReset(): void;
}

function BoardControlsComponent({ orientation, lastMove, onFlip, onReset }: BoardControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span className="text-[var(--text)] font-semibold">Orientation:</span>
        <span className="rounded-md bg-[var(--bg-muted)] px-2 py-1 text-xs uppercase tracking-wide">
          {orientation === PieceColor.White ? "White at bottom" : "Black at bottom"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span className="text-[var(--text)] font-semibold">Last move:</span>
        <span className="rounded-md bg-[var(--bg-muted)] px-2 py-1 text-xs">
          {lastMove ? `${lastMove.from} → ${lastMove.to}` : "—"}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onFlip}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)]"
          aria-label="Flip board orientation"
        >
          Flip board
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)]"
          aria-label="Reset board"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export const BoardControls = memo(BoardControlsComponent);
