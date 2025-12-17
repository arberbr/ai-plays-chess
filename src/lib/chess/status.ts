import { generatePseudoMoves, makeMove } from "./move";
import { GameState, GameStatus, Move, PieceColor, PieceType, Square } from "./types";
import { coordsToSquare, oppositeColor, squareToCoords } from "./utils";

export function inCheck(state: GameState, color: PieceColor): boolean {
  const kingSquare = findKingSquare(state, color);
  if (!kingSquare) return false;
  return isSquareAttacked(state, kingSquare, oppositeColor(color));
}

export function legalMoves(state: GameState, color: PieceColor): Move[] {
  const pseudo = generatePseudoMoves(state, color);
  const moves: Move[] = [];

  for (const move of pseudo) {
    if (move.isCastle && !castlePathSafe(state, move, color)) continue;
    const { nextState } = makeMove(state, move);
    if (!inCheck(nextState, color)) {
      moves.push(move);
    }
  }
  return moves;
}

export function evaluateStatus(state: GameState): GameStatus {
  const inCheckNow = inCheck(state, state.turn);
  const available = legalMoves(state, state.turn);

  if (state.halfmoveClock >= 100) {
    return { inCheck: inCheckNow, gameOver: true, reason: "fifty-move", winner: null };
  }

  if (available.length === 0 && inCheckNow) {
    return { inCheck: true, gameOver: true, reason: "checkmate", winner: oppositeColor(state.turn) };
  }

  if (available.length === 0) {
    return { inCheck: false, gameOver: true, reason: "stalemate", winner: null };
  }

  return { inCheck: inCheckNow, gameOver: false };
}

function findKingSquare(state: GameState, color: PieceColor): Square | null {
  for (const [square, piece] of Object.entries(state.board)) {
    if (piece?.type === PieceType.King && piece.color === color) {
      return square as Square;
    }
  }
  return null;
}

export function isSquareAttacked(state: GameState, target: Square, byColor: PieceColor): boolean {
  // Pawn attacks
  const { file, rank } = squareToCoords(target);
  const pawnDir = byColor === PieceColor.White ? 1 : -1;
  for (const df of [-1, 1]) {
    const sq = coordsToSquare(file + df, rank + pawnDir);
    if (sq) {
      const piece = state.board[sq];
      if (piece?.color === byColor && piece.type === PieceType.Pawn) return true;
    }
  }

  // Knight attacks
  const knightOffsets = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2]
  ];
  for (const [df, dr] of knightOffsets) {
    const sq = coordsToSquare(file + df, rank + dr);
    if (!sq) continue;
    const piece = state.board[sq];
    if (piece?.color === byColor && piece.type === PieceType.Knight) return true;
  }

  // Sliding pieces
  if (rayAttack(state, target, byColor, PieceType.Bishop, [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ])) {
    return true;
  }
  if (rayAttack(state, target, byColor, PieceType.Rook, [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ])) {
    return true;
  }
  if (rayAttack(state, target, byColor, PieceType.Queen, [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ])) {
    return true;
  }

  // King adjacency
  const kingOffsets = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1]
  ];
  for (const [df, dr] of kingOffsets) {
    const sq = coordsToSquare(file + df, rank + dr);
    if (!sq) continue;
    const piece = state.board[sq];
    if (piece?.color === byColor && piece.type === PieceType.King) return true;
  }

  return false;
}

function rayAttack(
  state: GameState,
  target: Square,
  byColor: PieceColor,
  requiredType: PieceType,
  directions: number[][]
): boolean {
  const { file, rank } = squareToCoords(target);

  for (const [df, dr] of directions) {
    let f = file + df;
    let r = rank + dr;
    while (true) {
      const sq = coordsToSquare(f, r);
      if (!sq) break;
      const piece = state.board[sq];
      if (!piece) {
        f += df;
        r += dr;
        continue;
      }
      if (piece.color === byColor && (piece.type === requiredType || piece.type === PieceType.Queen)) {
        return true;
      }
      break;
    }
  }

  return false;
}

export function castlePathSafe(state: GameState, move: Move, color: PieceColor): boolean {
  const kingSquare = move.from;
  const throughSquares =
    move.to === (color === PieceColor.White ? "g1" : "g8")
      ? [kingSquare, color === PieceColor.White ? "f1" : "f8", move.to]
      : [kingSquare, color === PieceColor.White ? "d1" : "d8", move.to];

  for (const sq of throughSquares) {
    if (isSquareAttacked(state, sq as Square, oppositeColor(color))) return false;
  }
  return true;
}
