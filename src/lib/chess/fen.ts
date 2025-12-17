import { CastlingRights, GameState, Piece, PieceColor, PieceType, Square } from "./types";
import { cloneCastling, isValidSquare, pieceFromSymbol, pieceToSymbol } from "./utils";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function startingPosition(): GameState {
  return parseFen(STARTING_FEN);
}

export function parseFen(fen: string): GameState {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 6) {
    throw new Error("Invalid FEN: expected 6 fields");
  }
  const [placement, active, castlingStr, enPassantStr, halfmoveStr, fullmoveStr] = parts;

  const board = parsePlacement(placement);
  const turn = active === "w" ? PieceColor.White : PieceColor.Black;
  const castling = parseCastling(castlingStr);
  const enPassantTarget = enPassantStr === "-" ? null : enPassantStr;
  if (enPassantTarget && !isValidSquare(enPassantTarget)) {
    throw new Error(`Invalid en passant square: ${enPassantTarget}`);
  }
  const halfmoveClock = Number(halfmoveStr);
  const fullmoveNumber = Number(fullmoveStr);

  if (Number.isNaN(halfmoveClock) || Number.isNaN(fullmoveNumber)) {
    throw new Error("Invalid halfmove/fullmove counters in FEN");
  }

  return { board, turn, castling, enPassantTarget, halfmoveClock, fullmoveNumber };
}

export function gameStateToFen(state: GameState): string {
  const placement = stringifyPlacement(state.board);
  const active = state.turn === PieceColor.White ? "w" : "b";
  const castling = stringifyCastling(state.castling);
  const enPassant = state.enPassantTarget ?? "-";
  const halfmove = state.halfmoveClock.toString();
  const fullmove = state.fullmoveNumber.toString();
  return [placement, active, castling, enPassant, halfmove, fullmove].join(" ");
}

function parsePlacement(placement: string): Record<Square, Piece | undefined> {
  const ranks = placement.split("/");
  if (ranks.length !== 8) {
    throw new Error("Invalid FEN: expected 8 ranks");
  }

  const board: Record<Square, Piece | undefined> = {};

  for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
    const rankStr = ranks[rankIndex];
    let fileIndex = 0;

    for (const char of rankStr) {
      if (/\d/.test(char)) {
        fileIndex += parseInt(char, 10);
        continue;
      }
      const piece = pieceFromSymbol(char);
      if (!piece) throw new Error(`Invalid piece symbol '${char}' in FEN`);
      const square = `${"abcdefgh"[fileIndex]}${8 - rankIndex}` as Square;
      board[square] = piece;
      fileIndex += 1;
    }

    if (fileIndex !== 8) {
      throw new Error(`Invalid rank '${rankStr}' in FEN; expected 8 files`);
    }
  }

  return board;
}

function stringifyPlacement(board: Record<Square, Piece | undefined>): string {
  const ranks: string[] = [];

  for (let rank = 7; rank >= 0; rank--) {
    let line = "";
    let emptyCount = 0;
    for (let file = 0; file < 8; file++) {
      const square = `${"abcdefgh"[file]}${rank + 1}` as Square;
      const piece = board[square];
      if (!piece) {
        emptyCount += 1;
      } else {
        if (emptyCount > 0) {
          line += emptyCount.toString();
          emptyCount = 0;
        }
        line += pieceToSymbol(piece.type, piece.color);
      }
    }
    if (emptyCount > 0) {
      line += emptyCount.toString();
    }
    ranks.push(line);
  }

  return ranks.join("/");
}

function parseCastling(castlingStr: string): CastlingRights {
  const rights: CastlingRights = {
    whiteKingSide: false,
    whiteQueenSide: false,
    blackKingSide: false,
    blackQueenSide: false
  };

  if (castlingStr === "-") return rights;

  for (const ch of castlingStr) {
    if (ch === "K") rights.whiteKingSide = true;
    else if (ch === "Q") rights.whiteQueenSide = true;
    else if (ch === "k") rights.blackKingSide = true;
    else if (ch === "q") rights.blackQueenSide = true;
  }
  return rights;
}

function stringifyCastling(c: CastlingRights): string {
  let str = "";
  if (c.whiteKingSide) str += "K";
  if (c.whiteQueenSide) str += "Q";
  if (c.blackKingSide) str += "k";
  if (c.blackQueenSide) str += "q";
  return str || "-";
}

export function copyState(state: GameState): GameState {
  return {
    board: { ...state.board },
    turn: state.turn,
    castling: cloneCastling(state.castling),
    enPassantTarget: state.enPassantTarget,
    halfmoveClock: state.halfmoveClock,
    fullmoveNumber: state.fullmoveNumber
  };
}
