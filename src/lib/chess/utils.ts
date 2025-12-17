import { PieceColor, PieceType, Square } from "./types";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export function isValidSquare(square: Square): boolean {
  if (square.length !== 2) return false;
  const [file, rank] = square.split("");
  return files.includes(file as (typeof files)[number]) && ranks.includes(rank as (typeof ranks)[number]);
}

export function squareToCoords(square: Square): { file: number; rank: number } {
  const [fileChar, rankChar] = square.split("");
  return { file: files.indexOf(fileChar as (typeof files)[number]), rank: parseInt(rankChar, 10) - 1 };
}

export function coordsToSquare(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${files[file]}${rank + 1}`;
}

export function oppositeColor(color: PieceColor): PieceColor {
  return color === PieceColor.White ? PieceColor.Black : PieceColor.White;
}

export function cloneCastling(c: {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}) {
  return { ...c };
}

export function pieceFromSymbol(symbol: string) {
  const lower = symbol.toLowerCase();
  const typeMap: Record<string, PieceType | undefined> = {
    p: PieceType.Pawn,
    n: PieceType.Knight,
    b: PieceType.Bishop,
    r: PieceType.Rook,
    q: PieceType.Queen,
    k: PieceType.King
  };
  const type = typeMap[lower];
  if (!type) return null;
  const color = symbol === lower ? PieceColor.Black : PieceColor.White;
  return { color, type };
}

export function pieceToSymbol(type: PieceType, color: PieceColor) {
  const map: Record<PieceType, string> = {
    [PieceType.Pawn]: "p",
    [PieceType.Knight]: "n",
    [PieceType.Bishop]: "b",
    [PieceType.Rook]: "r",
    [PieceType.Queen]: "q",
    [PieceType.King]: "k"
  };
  const sym = map[type];
  return color === PieceColor.White ? sym.toUpperCase() : sym;
}

export function cloneBoard<T>(board: Record<Square, T | undefined>): Record<Square, T | undefined> {
  return { ...board };
}

