import { appendPgnMove, createPgnHeaders } from "./pgn";
import { evaluateStatus, inCheck, castlePathSafe } from "./status";
import {
  GameState,
  IllegalReason,
  Move,
  PgnHeaders,
  PgnRecord,
  PieceColor,
  PieceType,
  ValidationFailure,
  ValidationResult
} from "./types";
import { squareToCoords } from "./utils";
import { generatePseudoMoves, makeMove } from "./move";
import { formatSan } from "./san";

export interface ValidateOptions {
  pgn?: PgnRecord;
  headers?: PgnHeaders;
}

function failure(move: Move, reason: IllegalReason, message?: string): ValidationFailure {
  return { legal: false, move, reason, message };
}

function movesEqual(a: Move, b: Move): boolean {
  return (
    a.from === b.from &&
    a.to === b.to &&
    a.promotion === b.promotion &&
    Boolean(a.isCastle) === Boolean(b.isCastle) &&
    Boolean(a.isEnPassant) === Boolean(b.isEnPassant) &&
    Boolean(a.isCapture) === Boolean(b.isCapture)
  );
}

function isPromotionRank(color: PieceColor, to: Move["to"]): boolean {
  const { rank } = squareToCoords(to);
  return (color === PieceColor.White && rank === 7) || (color === PieceColor.Black && rank === 0);
}

function isValidPromotionPiece(piece?: PieceType): boolean {
  return (
    piece === PieceType.Queen || piece === PieceType.Rook || piece === PieceType.Bishop || piece === PieceType.Knight
  );
}

export function validateMove(state: GameState, move: Move, opts: ValidateOptions = {}): ValidationResult {
  const piece = state.board[move.from];
  if (!piece) return failure(move, "noPiece", `No piece at ${move.from}`);
  if (piece.color !== state.turn) return failure(move, "wrongTurn", "Not this color's turn");

  const pseudo = generatePseudoMoves(state, piece.color);
  const normalized = pseudo.find((m) => movesEqual(m, move));
  if (!normalized) return failure(move, "notPseudoLegal", "Move is not pseudo-legal for this piece");

  if (piece.type === PieceType.Pawn) {
    const needsPromotion = isPromotionRank(piece.color, normalized.to);
    if (needsPromotion && !normalized.promotion) {
      return failure(move, "promotionMissing", "Promotion piece required");
    }
    if (normalized.promotion && !isValidPromotionPiece(normalized.promotion)) {
      return failure(move, "promotionInvalid", "Invalid promotion piece");
    }
  }

  if (normalized.isEnPassant && state.enPassantTarget !== normalized.to) {
    return failure(move, "badEnPassant", "En passant target not available");
  }

  if (normalized.isCastle) {
    const isKingSide = normalized.to === (piece.color === PieceColor.White ? "g1" : "g8");
    const hasRights =
      (piece.color === PieceColor.White && (isKingSide ? state.castling.whiteKingSide : state.castling.whiteQueenSide)) ||
      (piece.color === PieceColor.Black && (isKingSide ? state.castling.blackKingSide : state.castling.blackQueenSide));
    if (!hasRights) return failure(move, "badCastle", "Castling rights missing");
    if (inCheck(state, piece.color)) return failure(move, "badCastle", "Cannot castle out of check");
    if (!castlePathSafe(state, normalized, piece.color)) return failure(move, "badCastle", "Castling path is not safe");
  }

  const { nextState, undo } = makeMove(state, normalized);
  if (inCheck(nextState, piece.color)) return failure(move, "leavesKingInCheck", "King would remain in check");

  const status = evaluateStatus(nextState);
  const san = formatSan(state, normalized, nextState, status);

  let pgn: PgnRecord | undefined = opts.pgn;
  if (opts.pgn || opts.headers) {
    const headers = opts.pgn?.headers ?? createPgnHeaders(opts.headers);
    const baseRecord: PgnRecord = opts.pgn ?? { headers, moves: [], result: headers.Result };
    pgn = appendPgnMove(baseRecord, san, state, status);
  }

  return {
    legal: true,
    move: normalized,
    nextState,
    undo,
    san,
    status,
    pgn
  };
}
