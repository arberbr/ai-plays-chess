"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { GameState, PieceColor, PieceType, Square } from "@/lib/chess/types";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

interface ChessBoardProps {
  state: GameState;
  orientation: PieceColor;
  selected?: Square;
  lastMove?: { from: Square; to: Square };
  targets?: Set<Square>;
  checkSquare?: Square;
  onSelect(square: Square): void;
  onDrop(payload: { from: Square; to: Square; promotion?: PieceType }): void;
  onHover?(square: Square | null): void;
}

interface DragState {
  from: Square;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

function pieceGlyph(type: PieceType, color: PieceColor) {
  const map: Record<PieceType, { w: string; b: string }> = {
    [PieceType.Pawn]: { w: "♙", b: "♟" },
    [PieceType.Knight]: { w: "♘", b: "♞" },
    [PieceType.Bishop]: { w: "♗", b: "♝" },
    [PieceType.Rook]: { w: "♖", b: "♜" },
    [PieceType.Queen]: { w: "♕", b: "♛" },
    [PieceType.King]: { w: "♔", b: "♚" }
  };
  return color === PieceColor.White ? map[type].w : map[type].b;
}

function buildSquares(orientation: PieceColor): Square[] {
  const fileOrder = orientation === PieceColor.White ? files : [...files].reverse();
  const rankOrder = orientation === PieceColor.White ? [...ranks].reverse() : ranks;
  const squares: Square[] = [];
  for (const rank of rankOrder) {
    for (const file of fileOrder) {
      squares.push(`${file}${rank}` as Square);
    }
  }
  return squares;
}

function getSquareFromTarget(target: EventTarget | null): Square | null {
  let node = target as HTMLElement | null;
  while (node) {
    const sq = node.dataset?.square;
    if (sq) return sq as Square;
    node = node.parentElement;
  }
  return null;
}

function ChessBoardComponent({
  state,
  orientation,
  selected,
  lastMove,
  targets,
  checkSquare,
  onSelect,
  onDrop,
  onHover
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const squares = useMemo(() => buildSquares(orientation), [orientation]);

  const squareFromPoint = (clientX: number, clientY: number): Square | null => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return null;
    const col = Math.floor((relX / rect.width) * 8);
    const row = Math.floor((relY / rect.height) * 8);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;

    const fileIndex = orientation === PieceColor.White ? col : 7 - col;
    const rankIndex = orientation === PieceColor.White ? 7 - row : row;
    const file = files[fileIndex];
    const rank = ranks[rankIndex];
    return `${file}${rank}` as Square;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const square = getSquareFromTarget(event.target);
    if (!square) return;
    const piece = state.board[square];
    if (!piece) return;
    if (piece.color !== state.turn) {
      onSelect(square);
      return;
    }
    const offsetParent = (event.target as HTMLElement).getBoundingClientRect();
    setDrag({
      from: square,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - offsetParent.left,
      offsetY: event.clientY - offsetParent.top
    });
    onSelect(square);
  };

  const handleSquareClick = (square: Square) => {
    if (drag) return;
    if (selected && square !== selected) {
      onDrop({ from: selected, to: square });
      return;
    }
    onSelect(square);
  };

  const handleHoverEnter = (square: Square) => {
    onHover?.(square);
  };

  const handleHoverLeave = () => {
    onHover?.(null);
  };

  useEffect(() => {
    if (!drag) return;

    const handleWindowMove = (event: globalThis.PointerEvent) => {
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              x: event.clientX,
              y: event.clientY
            }
          : null
      );
    };

    const handleWindowUp = (event: globalThis.PointerEvent) => {
      const dropSquare = squareFromPoint(event.clientX, event.clientY);
      if (dropSquare) {
        onDrop({ from: drag.from, to: dropSquare });
      }
      setDrag(null);
    };

    window.addEventListener("pointermove", handleWindowMove);
    window.addEventListener("pointerup", handleWindowUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowMove);
      window.removeEventListener("pointerup", handleWindowUp);
    };
  }, [drag, onDrop]);

  const renderPiece = (square: Square) => {
    const piece = state.board[square];
    if (!piece) return null;
    if (drag?.from === square) return null;
    return (
      <div className="pointer-events-none select-none text-2xl sm:text-3xl">
        {pieceGlyph(piece.type, piece.color)}
      </div>
    );
  };

  const renderDragGhost = () => {
    if (!drag) return null;
    const piece = state.board[drag.from];
    if (!piece) return null;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = drag.x - rect.left - drag.offsetX + rect.width / 8 / 2;
    const y = drag.y - rect.top - drag.offsetY + rect.height / 8 / 2;
    return (
      <div
        className="pointer-events-none absolute top-0 left-0 z-20 select-none text-2xl sm:text-3xl"
        style={{ transform: `translate(${x}px, ${y}px)` }}
      >
        {pieceGlyph(piece.type, piece.color)}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={boardRef}
        className="relative aspect-square w-full max-w-2xl select-none overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]"
        onPointerDown={handlePointerDown}
      >
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">
          {squares.map((square) => {
            const isLight = (files.indexOf(square[0] as (typeof files)[number]) + parseInt(square[1], 10)) % 2 === 0;
            const isSelected = selected === square;
            const isTarget = targets?.has(square);
            const isLastFrom = lastMove?.from === square;
            const isLastTo = lastMove?.to === square;
            const isCheck = checkSquare === square;
            const bgColor = isLight ? "var(--surface)" : "var(--bg-muted)";
            const highlightColor = isTarget
              ? "rgba(37, 99, 235, 0.2)"
              : isLastTo
              ? "var(--accent)"
              : undefined;

            return (
              <button
                key={square}
                type="button"
                data-square={square}
                className="relative flex items-center justify-center transition-colors"
                style={{ backgroundColor: highlightColor ?? bgColor }}
                onClick={() => handleSquareClick(square)}
                onMouseEnter={() => handleHoverEnter(square)}
                onMouseLeave={handleHoverLeave}
              >
                <div
                  className={`absolute inset-0 ${
                    isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent" : ""
                  } ${isLastFrom || isLastTo ? "after:absolute after:inset-0 after:bg-[var(--border)]/30" : ""} ${
                    isCheck ? "outline outline-2 outline-[var(--accent-strong)]" : ""
                  }`}
                />
                {renderPiece(square)}
              </button>
            );
          })}
        </div>
        {renderDragGhost()}
      </div>
    </div>
  );
}

export const ChessBoard = memo(ChessBoardComponent);
