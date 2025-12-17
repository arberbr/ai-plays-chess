import { evaluateStatus, legalMoves } from "./status";
import { GameState, GameStatus, Move, PieceColor, PieceType } from "./types";

function pieceLetter(type: PieceType) {
  const map: Record<PieceType, string> = {
    [PieceType.Pawn]: "",
    [PieceType.Knight]: "N",
    [PieceType.Bishop]: "B",
    [PieceType.Rook]: "R",
    [PieceType.Queen]: "Q",
    [PieceType.King]: "K"
  };
  return map[type];
}

function needsDisambiguation(state: GameState, move: Move, type: PieceType, color: PieceColor): string {
  if (type === PieceType.Pawn || type === PieceType.King) return "";
  const candidates = legalMoves(state, color).filter((m) => {
    if (m.to !== move.to) return false;
    if (m.from === move.from) return false;
    const piece = state.board[m.from];
    return piece?.type === type && piece.color === color;
  });
  if (candidates.length === 0) return "";
  const fromFile = move.from[0];
  const fromRank = move.from[1];
  const fileConflict = candidates.some((m) => m.from[0] === fromFile);
  const rankConflict = candidates.some((m) => m.from[1] === fromRank);
  if (fileConflict && rankConflict) return `${fromFile}${fromRank}`;
  if (fileConflict) return fromRank;
  return fromFile;
}

function suffixFromStatus(status: GameStatus): string {
  if (status.gameOver && status.reason === "checkmate") return "#";
  if (status.inCheck) return "+";
  return "";
}

export function formatSan(stateBefore: GameState, move: Move, stateAfter: GameState, statusAfter?: GameStatus): string {
  const piece = stateBefore.board[move.from];
  if (!piece) {
    return "??";
  }

  const status = statusAfter ?? evaluateStatus(stateAfter);
  if (move.isCastle) {
    const castle = move.to === (piece.color === PieceColor.White ? "g1" : "g8") ? "O-O" : "O-O-O";
    return `${castle}${suffixFromStatus(status)}`;
  }

  const capture = Boolean(move.isCapture || move.isEnPassant || stateBefore.board[move.to]);
  const base = pieceLetter(piece.type);
  const disambig = needsDisambiguation(stateBefore, move, piece.type, piece.color);
  const target = move.to;

  let san = "";
  if (piece.type === PieceType.Pawn) {
    san += capture ? move.from[0] : "";
  } else {
    san += base + disambig;
  }

  san += capture ? "x" : "";
  san += target;

  if (move.promotion) {
    san += `=${pieceLetter(move.promotion)}`;
  }

  san += suffixFromStatus(status);
  return san;
}
