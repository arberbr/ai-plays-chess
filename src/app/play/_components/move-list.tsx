"use client";

import React, { memo, useMemo } from "react";
import { PgnRecord } from "@/lib/chess/types";

interface MoveListProps {
  pgn?: PgnRecord;
  currentPly?: number;
  onSelectPly?(ply: number): void;
}

function MoveListComponent({ pgn, currentPly, onSelectPly }: MoveListProps) {
  if (!pgn || pgn.moves.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]/60 px-4 py-3 text-sm text-[var(--text-muted)]">
        No moves yet.
      </div>
    );
  }

  const rows = useMemo(
    () =>
      pgn.moves.map((m, idx) => {
        const whitePly = idx * 2;
        const blackPly = idx * 2 + 1;
        const isWhiteActive = currentPly === whitePly;
        const isBlackActive = currentPly === blackPly;
        const isLastWhite = pgn.moves.length * 2 - (m.black ? 2 : 1) === whitePly;
        const isLastBlack = m.black ? pgn.moves.length * 2 - 1 === blackPly : false;
        return { ...m, whitePly, blackPly, isWhiteActive, isBlackActive, isLastWhite, isLastBlack };
      }),
    [currentPly, pgn.moves]
  );

  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]"
      role="region"
      aria-label="Move list"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text)]">Move list</h3>
        <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{pgn.moves.length} moves</span>
      </div>
      <div className="max-h-72 overflow-y-auto pr-1">
        <table className="w-full text-sm" role="grid" aria-label="Moves by turn">
          <thead className="sticky top-0 bg-[var(--surface)] text-[var(--text-muted)]">
            <tr>
              <th className="w-14 text-left">#</th>
              <th className="text-left">White</th>
              <th className="text-left">Black</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.fullmove} className="border-t border-[var(--border)]">
                <td className="py-1 pr-3 text-[var(--text-muted)]">{row.fullmove}.</td>
                <td>
                  <MoveButton
                    label={row.white ?? ""}
                    active={row.isWhiteActive}
                    muted={!row.white}
                    isLast={row.isLastWhite}
                    onClick={() => row.white && onSelectPly?.(row.whitePly)}
                  />
                </td>
                <td>
                  <MoveButton
                    label={row.black ?? ""}
                    active={row.isBlackActive}
                    muted={!row.black}
                    isLast={row.isLastBlack}
                    onClick={() => row.black && onSelectPly?.(row.blackPly)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MoveButtonProps {
  label: string;
  active: boolean;
  muted: boolean;
  isLast: boolean;
  onClick?(): void;
}

const MoveButton = memo(function MoveButton({ label, active, muted, isLast, onClick }: MoveButtonProps) {
  const base =
    "inline-flex min-w-[64px] items-center gap-1 rounded-md px-2 py-1 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)]";
  const states = active
    ? "bg-[var(--accent)] text-white"
    : isLast
    ? "bg-[var(--accent)]/10 text-[var(--text)]"
    : "text-[var(--text)] hover:bg-[var(--bg-muted)]";
  const opacity = muted ? "opacity-40 cursor-not-allowed" : "cursor-pointer";
  return (
    <button
      type="button"
      className={`${base} ${states} ${opacity}`}
      onClick={muted ? undefined : onClick}
      aria-label={label ? `Move ${label}` : "No move"}
      aria-pressed={active}
      disabled={muted}
    >
      {label || "—"}
    </button>
  );
});

export const MoveList = memo(MoveListComponent);
