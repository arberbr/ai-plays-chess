import { GameState, Move, MoveResult, MoveUndo, Piece, PieceColor, PieceType, Square } from "./types";
import { cloneBoard, cloneCastling, coordsToSquare, oppositeColor, squareToCoords } from "./utils";

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

const bishopDirs = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];

const rookDirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1]
];

export function makeMove(state: GameState, move: Move): MoveResult {
  const board = cloneBoard(state.board);
  const piece = board[move.from];
  if (!piece) {
    throw new Error(`No piece at ${move.from}`);
  }

  const undo: MoveUndo = {
    previousCastling: cloneCastling(state.castling),
    previousEnPassantTarget: state.enPassantTarget,
    previousHalfmoveClock: state.halfmoveClock,
    previousFullmoveNumber: state.fullmoveNumber,
    movedPieceBefore: { ...piece }
  };

  // Handle castling rook move
  if (move.isCastle && piece.type === PieceType.King) {
    const isKingSide = move.to === (piece.color === PieceColor.White ? "g1" : "g8");
    const rookFrom = piece.color === PieceColor.White ? (isKingSide ? "h1" : "a1") : isKingSide ? "h8" : "a8";
    const rookTo = piece.color === PieceColor.White ? (isKingSide ? "f1" : "d1") : isKingSide ? "f8" : "d8";
    const rook = board[rookFrom];
    if (rook && rook.type === PieceType.Rook) {
      board[rookFrom] = undefined;
      board[rookTo] = rook;
    }
  }

  // Capture (regular or en-passant)
  if (move.isEnPassant && state.enPassantTarget) {
    const toCoords = squareToCoords(move.to);
    const dir = piece.color === PieceColor.White ? -1 : 1;
    const capturedSquare = coordsToSquare(toCoords.file, toCoords.rank + dir);
    if (capturedSquare) {
      undo.capturedSquare = capturedSquare;
      undo.captured = board[capturedSquare];
      board[capturedSquare] = undefined;
    }
  } else {
    undo.capturedSquare = move.to;
    undo.captured = board[move.to];
  }

  // Move piece
  board[move.from] = undefined;
  const movedPiece: Piece = { ...piece };
  if (move.promotion) {
    movedPiece.type = move.promotion;
  }
  board[move.to] = movedPiece;

  // Update castling rights when king or rook moves/captured
  const castling = cloneCastling(state.castling);
  if (piece.type === PieceType.King) {
    if (piece.color === PieceColor.White) {
      castling.whiteKingSide = false;
      castling.whiteQueenSide = false;
    } else {
      castling.blackKingSide = false;
      castling.blackQueenSide = false;
    }
  }
  if (piece.type === PieceType.Rook) {
    if (move.from === "a1") castling.whiteQueenSide = false;
    if (move.from === "h1") castling.whiteKingSide = false;
    if (move.from === "a8") castling.blackQueenSide = false;
    if (move.from === "h8") castling.blackKingSide = false;
  }
  if (undo.captured?.type === PieceType.Rook) {
    if (move.to === "a1") castling.whiteQueenSide = false;
    if (move.to === "h1") castling.whiteKingSide = false;
    if (move.to === "a8") castling.blackQueenSide = false;
    if (move.to === "h8") castling.blackKingSide = false;
  }

  // En-passant target
  let enPassantTarget: Square | null = null;
  if (piece.type === PieceType.Pawn && move.isDoublePush) {
    const fromCoords = squareToCoords(move.from);
    const dir = piece.color === PieceColor.White ? 1 : -1;
    enPassantTarget = coordsToSquare(fromCoords.file, fromCoords.rank + dir);
  }

  // Halfmove/fullmove counters
  let halfmoveClock = state.halfmoveClock + 1;
  if (piece.type === PieceType.Pawn || move.isCapture || move.isEnPassant) {
    halfmoveClock = 0;
  }
  const fullmoveNumber = piece.color === PieceColor.Black ? state.fullmoveNumber + 1 : state.fullmoveNumber;

  const nextState: GameState = {
    board,
    turn: oppositeColor(state.turn),
    castling,
    enPassantTarget,
    halfmoveClock,
    fullmoveNumber
  };

  return { move, nextState, undo };
}

export function unmakeMove(state: GameState, move: Move, undo: MoveUndo): GameState {
  const board = cloneBoard(state.board);

  // Move piece back
  const piece = board[move.to];
  if (!piece) throw new Error("Cannot unmake move: piece missing at destination");
  board[move.to] = undefined;
  board[move.from] = undo.movedPieceBefore;

  // Restore captured piece
  if (move.isEnPassant && undo.capturedSquare) {
    board[undo.capturedSquare] = undo.captured;
  } else if (undo.captured && undo.capturedSquare) {
    board[undo.capturedSquare] = undo.captured;
  }

  // Undo castling rook move
  if (move.isCastle && undo.movedPieceBefore.type === PieceType.King) {
    const isKingSide = move.to === (undo.movedPieceBefore.color === PieceColor.White ? "g1" : "g8");
    const rookFrom = undo.movedPieceBefore.color === PieceColor.White ? (isKingSide ? "h1" : "a1") : isKingSide ? "h8" : "a8";
    const rookTo = undo.movedPieceBefore.color === PieceColor.White ? (isKingSide ? "f1" : "d1") : isKingSide ? "f8" : "d8";
    const rook = board[rookTo];
    board[rookTo] = undefined;
    board[rookFrom] = rook;
  }

  return {
    board,
    turn: oppositeColor(state.turn),
    castling: undo.previousCastling,
    enPassantTarget: undo.previousEnPassantTarget,
    halfmoveClock: undo.previousHalfmoveClock,
    fullmoveNumber: undo.previousFullmoveNumber
  };
}

// --- Move generation helpers (pseudo-legal) ---
export function generatePseudoMoves(state: GameState, color: PieceColor): Move[] {
  const moves: Move[] = [];

  for (const [square, piece] of Object.entries(state.board)) {
    if (!piece || piece.color !== color) continue;
    switch (piece.type) {
      case PieceType.Pawn:
        addPawnMoves(state, square as Square, piece, moves);
        break;
      case PieceType.Knight:
        addJumpMoves(state, square as Square, piece, moves, knightOffsets);
        break;
      case PieceType.Bishop:
        addSlidingMoves(state, square as Square, piece, moves, bishopDirs);
        break;
      case PieceType.Rook:
        addSlidingMoves(state, square as Square, piece, moves, rookDirs);
        break;
      case PieceType.Queen:
        addSlidingMoves(state, square as Square, piece, moves, [...bishopDirs, ...rookDirs]);
        break;
      case PieceType.King:
        addKingMoves(state, square as Square, piece, moves);
        break;
    }
  }

  return moves;
}

function addPawnMoves(state: GameState, from: Square, piece: Piece, moves: Move[]) {
  const dir = piece.color === PieceColor.White ? 1 : -1;
  const { file, rank } = squareToCoords(from);
  const forwardOne = coordsToSquare(file, rank + dir);
  const forwardTwo = coordsToSquare(file, rank + 2 * dir);

  const isStartRank = (piece.color === PieceColor.White && rank === 1) || (piece.color === PieceColor.Black && rank === 6);
  const lastRank = piece.color === PieceColor.White ? 7 : 0;

  // Forward moves
  if (forwardOne && !state.board[forwardOne]) {
    const promos = applyPromotionFlag({ from, to: forwardOne, isDoublePush: false, isCapture: false }, rank + dir === lastRank);
    moves.push(...promos);
    if (isStartRank && forwardTwo && !state.board[forwardTwo]) {
      moves.push({ from, to: forwardTwo, isDoublePush: true });
    }
  }

  // Captures
  for (const df of [-1, 1]) {
    const target = coordsToSquare(file + df, rank + dir);
    if (!target) continue;
    const targetPiece = state.board[target];
    const isEnPassant = state.enPassantTarget === target && !targetPiece;
    if (targetPiece?.color === oppositeColor(piece.color) || isEnPassant) {
      const promos = applyPromotionFlag(
        {
          from,
          to: target,
          isCapture: true,
          isEnPassant
        },
        rank + dir === lastRank
      );
      moves.push(...promos);
    }
  }
}

function applyPromotionFlag(move: Move, isLastRank: boolean): Move[] {
  if (!isLastRank) return [move];
  return [PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight].map((promotion) => ({
    ...move,
    promotion
  }));
}

function addJumpMoves(
  state: GameState,
  from: Square,
  piece: Piece,
  moves: Move[],
  offsets: number[][]
) {
  for (const [df, dr] of offsets) {
    const { file, rank } = squareToCoords(from);
    const target = coordsToSquare(file + df, rank + dr);
    if (!target) continue;
    const targetPiece = state.board[target];
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push({ from, to: target, isCapture: Boolean(targetPiece) });
    }
  }
}

function addSlidingMoves(
  state: GameState,
  from: Square,
  piece: Piece,
  moves: Move[],
  directions: number[][]
) {
  const { file, rank } = squareToCoords(from);
  for (const [df, dr] of directions) {
    let f = file + df;
    let r = rank + dr;
    while (true) {
      const target = coordsToSquare(f, r);
      if (!target) break;
      const targetPiece = state.board[target];
      if (!targetPiece) {
        moves.push({ from, to: target });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ from, to: target, isCapture: true });
        }
        break;
      }
      f += df;
      r += dr;
    }
  }
}

function addKingMoves(state: GameState, from: Square, piece: Piece, moves: Move[]) {
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
  addJumpMoves(state, from, piece, moves, kingOffsets);

  // Castling pseudo (safety checked later)
  const rank = piece.color === PieceColor.White ? 1 : 8;
  const kingSideEmpty = !state.board[`f${rank}` as Square] && !state.board[`g${rank}` as Square];
  const queenSideEmpty =
    !state.board[`b${rank}` as Square] && !state.board[`c${rank}` as Square] && !state.board[`d${rank}` as Square];

  if (piece.color === PieceColor.White) {
    if (state.castling.whiteKingSide && kingSideEmpty) {
      moves.push({ from, to: "g1", isCastle: true });
    }
    if (state.castling.whiteQueenSide && queenSideEmpty) {
      moves.push({ from, to: "c1", isCastle: true });
    }
  } else {
    if (state.castling.blackKingSide && kingSideEmpty) {
      moves.push({ from, to: "g8", isCastle: true });
    }
    if (state.castling.blackQueenSide && queenSideEmpty) {
      moves.push({ from, to: "c8", isCastle: true });
    }
  }
}

// Utility to create a clean board clone (used by status filtering)
export function applyMoves(state: GameState, move: Move): GameState {
  return makeMove(state, move).nextState;
}

