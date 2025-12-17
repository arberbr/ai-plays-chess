"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BoardControls } from "./_components/board-controls";
import { ChessBoard } from "./_components/chess-board";
import { MatchControls } from "./_components/match-controls";
import { MoveList } from "./_components/move-list";
import { startingPosition } from "@/lib/chess/fen";
import { loadGame, saveGame, listGames, deleteGame, SavedGameMeta } from "@/lib/game-storage";
import { generatePseudoMoves } from "@/lib/chess/move";
import { createTurnLoop } from "@/lib/chess/turn-loop";
import { evaluateStatus, legalMoves } from "@/lib/chess/status";
import { validateMove } from "@/lib/chess/validate";
import {
  GameState,
  GameStatus,
  Move,
  PieceColor,
  PieceType,
  PgnRecord,
  Square,
  TurnContext,
  TurnLoopState
} from "@/lib/chess/types";
import { squareToCoords } from "@/lib/chess/utils";

interface PromotionRequest {
  from: Square;
  to: Square;
  color: PieceColor;
}

const promotionLabels: Partial<Record<PieceType, string>> = {
  [PieceType.Queen]: "Queen (Q)",
  [PieceType.Rook]: "Rook (R)",
  [PieceType.Bishop]: "Bishop (B)",
  [PieceType.Knight]: "Knight (N)"
};

const PER_MOVE_SECONDS = 30;

function pgnToSanList(pgn?: PgnRecord): string[] {
  if (!pgn) return [];
  const sans: string[] = [];
  for (const move of pgn.moves) {
    if (move.white) sans.push(move.white);
    if (move.black) sans.push(move.black);
  }
  return sans;
}

function describeStorageError(code: string): string {
  switch (code) {
    case "UNAVAILABLE":
      return "Local storage is unavailable in this environment.";
    case "PARSE_ERROR":
      return "Stored data is corrupted and could not be parsed.";
    case "QUOTA_EXCEEDED":
      return "Storage quota exceeded. Please delete old saves.";
    case "INVALID_VERSION":
      return "This save was created with an incompatible version.";
    case "NOT_FOUND":
      return "Save not found.";
    default:
      return "Unexpected storage error.";
  }
}

function findKingSquare(state: GameState, color: PieceColor): Square | undefined {
  const entry = Object.entries(state.board).find(
    ([, piece]) => piece?.type === PieceType.King && piece.color === color
  );
  return entry?.[0] as Square | undefined;
}

function needsPromotion(color: PieceColor, to: Square): boolean {
  const { rank } = squareToCoords(to);
  return (color === PieceColor.White && rank === 7) || (color === PieceColor.Black && rank === 0);
}

function computeLastPly(pgn?: PgnRecord): number | undefined {
  if (!pgn) return undefined;
  let plyCount = 0;
  for (const move of pgn.moves) {
    if (move.white) plyCount += 1;
    if (move.black) plyCount += 1;
  }
  return plyCount > 0 ? plyCount - 1 : undefined;
}

export default function PlayPage() {
  const initialState = useMemo(() => startingPosition(), []);
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [status, setStatus] = useState<GameStatus>(() => evaluateStatus(initialState));
  const [pgn, setPgn] = useState<PgnRecord | undefined>();
  const [selected, setSelected] = useState<Square | undefined>();
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [orientation, setOrientation] = useState<PieceColor>(PieceColor.White);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loopState, setLoopState] = useState<TurnLoopState>("idle");
  const [ctx, setCtx] = useState<TurnContext | null>(null);
  const [currentPly, setCurrentPly] = useState<number | undefined>();
  const [saves, setSaves] = useState<SavedGameMeta[]>([]);
  const [storageStatus, setStorageStatus] = useState<string | null>(null);
  const [loadingSaveId, setLoadingSaveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeState = ctx?.state ?? gameState;
  const activeStatus = ctx?.status ?? status;
  const activePgn = ctx?.pgn ?? pgn;

  const randomProvider = useCallback(async (turnCtx: TurnContext) => {
    const moves = legalMoves(turnCtx.state, turnCtx.state.turn);
    if (moves.length === 0) throw new Error("No legal moves available");
    const choice = moves[Math.floor(Math.random() * moves.length)];
    return choice;
  }, []);

  const handleLoopMove = useCallback(({ move, ctx: nextCtx }: { move: Move; ctx: TurnContext }) => {
    setCtx(nextCtx);
    setGameState(nextCtx.state);
    setStatus(nextCtx.status);
    setPgn(nextCtx.pgn);
    setLastMove({ from: move.from, to: move.to });
    setSelected(undefined);
    setPendingPromotion(null);
    setMessage(null);
    setLoopState("running");
    setCurrentPly(computeLastPly(nextCtx.pgn));
  }, []);

  const handleLoopStateChange = useCallback((nextCtx: TurnContext) => {
    setCtx(nextCtx);
    setGameState(nextCtx.state);
    setStatus(nextCtx.status);
    setPgn(nextCtx.pgn);
    setCurrentPly(computeLastPly(nextCtx.pgn));
  }, []);

  const handleLoopEnd = useCallback(
    ({ ctx: endCtx }: { ctx: TurnContext }) => {
      setCtx(endCtx);
      setGameState(endCtx.state);
      setStatus(endCtx.status);
      setPgn(endCtx.pgn);
      setLoopState("finished");
      setCurrentPly(computeLastPly(endCtx.pgn));
    },
    []
  );

  const loopRef = useRef(
    createTurnLoop({
      providers: { white: randomProvider, black: randomProvider },
      callbacks: {
        onMove: handleLoopMove,
        onStateChange: handleLoopStateChange,
        onEnd: handleLoopEnd
      }
    })
  );

  useEffect(() => {
    return () => {
      loopRef.current.stop("stopped");
    };
  }, []);

  const refreshSaves = useCallback(() => {
    const res = listGames();
    if (res.ok) {
      setSaves(res.value);
      setStorageStatus(null);
    } else {
      setStorageStatus(describeStorageError(res.error));
    }
  }, []);

  useEffect(() => {
    refreshSaves();
  }, [refreshSaves]);

  const targets = useMemo(() => {
    if (!selected) return new Set<Square>();
    const piece = activeState.board[selected];
    if (!piece || piece.color !== activeState.turn) return new Set<Square>();
    const pseudo = generatePseudoMoves(activeState, piece.color).filter((move) => move.from === selected);
    const legalTargets = pseudo
      .map((move) => validateMove(activeState, move))
      .filter((res) => res.legal)
      .map((res) => res.move.to);
    return new Set<Square>(legalTargets);
  }, [activeState, selected]);

  const checkSquare = useMemo(() => {
    if (!activeStatus.inCheck) return undefined;
    return findKingSquare(activeState, activeState.turn);
  }, [activeState, activeStatus.inCheck]);

  const resetBoard = () => {
    loopRef.current.stop("stopped");
    const resetState = startingPosition();
    const resetStatus = evaluateStatus(resetState);
    setGameState(resetState);
    setStatus(resetStatus);
    setPgn(undefined);
    setCtx(null);
    setSelected(undefined);
    setLastMove(undefined);
    setPendingPromotion(null);
    setMessage(null);
    setLoopState("idle");
    setCurrentPly(undefined);
  };

  const handleDrop = (payload: { from: Square; to: Square; promotion?: PieceType }) => {
    if (loopState !== "idle") {
      setMessage("Pause or reset the loop to make manual moves.");
      return;
    }
    if (activeStatus.gameOver) {
      setMessage("Game is over. Reset to play again.");
      return;
    }
    setMessage(null);
    const piece = activeState.board[payload.from];
    if (!piece) {
      setMessage("No piece on that square.");
      setSelected(undefined);
      return;
    }

    if (piece.type === PieceType.Pawn && needsPromotion(piece.color, payload.to) && !payload.promotion) {
      setPendingPromotion({ from: payload.from, to: payload.to, color: piece.color });
      setSelected(payload.from);
      return;
    }

    const result = validateMove(activeState, payload, { pgn: activePgn });
    if (!result.legal) {
      setMessage(result.message ?? "Illegal move");
      setPendingPromotion(null);
      return;
    }

    setGameState(result.nextState);
    setStatus(result.status);
    setPgn(result.pgn);
    setLastMove({ from: payload.from, to: payload.to });
    setSelected(undefined);
    setPendingPromotion(null);
    setCurrentPly(computeLastPly(result.pgn));
  };

  const handleSelect = (square: Square) => {
    const piece = activeState.board[square];
    if (selected && square === selected) {
      setSelected(undefined);
      return;
    }

    if (selected && square !== selected) {
      handleDrop({ from: selected, to: square });
      return;
    }

    if (piece && piece.color === activeState.turn) {
      setSelected(square);
      setMessage(null);
    } else if (piece) {
      setMessage("Select a piece of the side to move.");
    } else {
      setSelected(undefined);
    }
  };

  const handlePromotionChoice = (promotion: PieceType) => {
    if (!pendingPromotion) return;
    handleDrop({ ...pendingPromotion, promotion });
  };

  const flipBoard = () => {
    setOrientation((prev) => (prev === PieceColor.White ? PieceColor.Black : PieceColor.White));
  };

  const handleStartLoop = () => {
    if (loopState !== "idle") return;
    const snapshot: TurnContext = {
      state: activeState,
      status: activeStatus,
      pgn: activePgn,
      clocks: { white: PER_MOVE_SECONDS, black: PER_MOVE_SECONDS, active: null }
    };
    setCtx(snapshot);
    loopRef.current.start(snapshot);
    setLoopState("running");
    setMessage(null);
  };

  const handlePauseLoop = () => {
    if (loopState !== "running") return;
    loopRef.current.pause();
    setLoopState("paused");
  };

  const handleResumeLoop = () => {
    if (loopState !== "paused") return;
    loopRef.current.resume();
    setLoopState("running");
  };

  const handleSelectPly = (ply: number) => {
    if (loopState === "running") {
      loopRef.current.pause();
      setLoopState("paused");
    }
    setCurrentPly(ply);
  };

  const handleSaveGame = () => {
    setSaving(true);
    const pgnMoves = pgnToSanList(activePgn);
    const metadata = activePgn
      ? {
          result: activePgn.result,
          modelWhite: activePgn.headers.WhiteModel,
          modelBlack: activePgn.headers.BlackModel
        }
      : undefined;
    const res = saveGame({
      state: activeState,
      pgnMoves,
      metadata
    });
    setSaving(false);
    if (res.ok) {
      setStorageStatus(`Saved "${res.value.title}"`);
      refreshSaves();
    } else {
      setStorageStatus(describeStorageError(res.error));
    }
  };

  const handleLoadGame = (id: string) => {
    setLoadingSaveId(id);
    const res = loadGame(id);
    setLoadingSaveId(null);
    if (res.ok) {
      loopRef.current.stop("stopped");
      setCtx(null);
      setLoopState("idle");
      setSelected(undefined);
      setPendingPromotion(null);
      setLastMove(undefined);
      setMessage(null);
      setGameState(res.value.state);
      setStatus(evaluateStatus(res.value.state));
      setPgn(res.value.pgnRecord);
      setCurrentPly(computeLastPly(res.value.pgnRecord));
      setStorageStatus(`Loaded "${res.value.meta.title}"`);
    } else {
      setStorageStatus(describeStorageError(res.error));
    }
  };

  const handleDeleteGame = (id: string) => {
    const res = deleteGame(id);
    if (res.ok) {
      refreshSaves();
      setStorageStatus("Deleted saved game.");
    } else {
      setStorageStatus(describeStorageError(res.error));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Play
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Start a match</h1>
        <p className="max-w-2xl text-[var(--text-muted)]">
          Control the turn loop, view the move list, and watch the board update live. Drag or click for manual moves
          when the loop is idle.
        </p>
      </header>

      <div className="grid gap-6">
        <MatchControls
          loopState={loopState}
          turn={activeState.turn}
          gameOver={activeStatus.gameOver ? { reason: activeStatus.reason, winner: activeStatus.winner } : undefined}
          onStart={handleStartLoop}
          onPause={handlePauseLoop}
          onResume={handleResumeLoop}
          onReset={resetBoard}
        />

        <BoardControls orientation={orientation} lastMove={lastMove} onFlip={flipBoard} onReset={resetBoard} />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-[var(--text)]">Chessboard</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Drag or click to move when idle. Highlights show selection, targets, and last move.
                </p>
              </div>
              <div className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {activeState.turn === PieceColor.White ? "White to move" : "Black to move"}
              </div>
            </div>

            <ChessBoard
              state={activeState}
              orientation={orientation}
              selected={selected}
              lastMove={lastMove}
              targets={targets}
              checkSquare={checkSquare}
              onSelect={handleSelect}
              onDrop={handleDrop}
            />

            {pendingPromotion && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--text)]">
                <span className="font-semibold">Choose promotion:</span>
                {[PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight].map((piece) => (
                  <button
                    key={piece}
                    type="button"
                    onClick={() => handlePromotionChoice(piece)}
                    className="rounded-md bg-[var(--surface)] px-3 py-1 text-sm font-semibold shadow-[var(--shadow-soft)] transition hover:bg-[var(--border)]"
                  >
                    {promotionLabels[piece] ?? piece}
                  </button>
                ))}
              </div>
            )}

            {message && (
              <div
                className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-sm text-[var(--text)]"
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            {activeStatus.gameOver && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--text)]">
                Game over {activeStatus.reason ? `(${activeStatus.reason})` : ""}{" "}
                {activeStatus.winner ? (activeStatus.winner === PieceColor.White ? "White" : "Black") : "Draw"}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <MoveList pgn={activePgn} currentPly={currentPly} onSelectPly={handleSelectPly} />
            <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-[var(--text)]">Saved games</h2>
                  <p className="text-sm text-[var(--text-muted)]">Save locally and reload to resume or review.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshSaves}
                    className="rounded-md bg-[var(--bg-muted)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--border)]"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGame}
                    disabled={saving}
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save current"}
                  </button>
                </div>
              </div>

              {storageStatus && (
                <div
                  className="rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs text-[var(--text)]"
                  role="status"
                  aria-live="polite"
                >
                  {storageStatus}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {saves.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No saved games yet.</p>
                ) : (
                  saves.map((save) => (
                    <div
                      key={save.id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text)]">{save.title}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(save.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                        v{save.version}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadGame(save.id)}
                          disabled={loadingSaveId === save.id}
                          className="rounded-md bg-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loadingSaveId === save.id ? "Loading..." : "Load"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGame(save.id)}
                          className="rounded-md bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--border)]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
