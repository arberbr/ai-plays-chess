export type Square = string; // algebraic, e.g., "e4"

export enum PieceColor {
  White = "w",
  Black = "b"
}

export enum PieceType {
  Pawn = "p",
  Knight = "n",
  Bishop = "b",
  Rook = "r",
  Queen = "q",
  King = "k"
}

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export type BoardState = Record<Square, Piece | undefined>;

export interface GameState {
  board: BoardState;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export type GameOverReason = "checkmate" | "stalemate" | "fifty-move" | "repetition";

export interface GameStatus {
  inCheck: boolean;
  gameOver: boolean;
  reason?: GameOverReason;
  winner?: PieceColor | null;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  isCapture?: boolean;
  isCastle?: boolean;
  isEnPassant?: boolean;
  isDoublePush?: boolean;
}

export interface MoveUndo {
  captured?: Piece;
  capturedSquare?: Square;
  previousEnPassantTarget: Square | null;
  previousCastling: CastlingRights;
  previousHalfmoveClock: number;
  previousFullmoveNumber: number;
  movedPieceBefore: Piece;
}

export interface MoveResult {
  move: Move;
  nextState: GameState;
  undo: MoveUndo;
}

export type IllegalReason =
  | "noPiece"
  | "wrongTurn"
  | "notPseudoLegal"
  | "leavesKingInCheck"
  | "badCastle"
  | "badEnPassant"
  | "promotionMissing"
  | "promotionInvalid";

export interface ValidationSuccess {
  legal: true;
  move: Move;
  nextState: GameState;
  undo: MoveUndo;
  san: string;
  status: GameStatus;
  pgn?: PgnRecord;
}

export interface ValidationFailure {
  legal: false;
  move: Move;
  reason: IllegalReason;
  message?: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface PgnHeaders {
  Event: string;
  Site: string;
  Date: string;
  Round: string;
  White: string;
  Black: string;
  Result: "*" | "1-0" | "0-1" | "1/2-1/2";
  WhiteModel?: string;
  BlackModel?: string;
}

export interface PgnMove {
  fullmove: number;
  white?: string;
  black?: string;
}

export interface PgnRecord {
  headers: PgnHeaders;
  moves: PgnMove[];
  result: "*" | "1-0" | "0-1" | "1/2-1/2";
}

export type TurnLoopState = "idle" | "running" | "paused" | "finished";

export interface ClockSnapshot {
  white: number;
  black: number;
  active: PieceColor | null;
}

export interface TurnLoopConfig {
  perMoveSeconds: number;
  tickMs: number;
}

export type EndReason = "checkmate" | "stalemate" | "draw" | "timeout" | "illegal" | "stopped";

export interface TurnContext {
  state: GameState;
  status: GameStatus;
  pgn?: PgnRecord;
  clocks: ClockSnapshot;
}

export interface MoveProvider {
  (ctx: TurnContext): Promise<Move>;
}

export interface TurnLoopCallbacks {
  onTick?(clocks: ClockSnapshot): void;
  onMove?(payload: { move: Move; san: string; ctx: TurnContext }): void;
  onStateChange?(ctx: TurnContext): void;
  onEnd?(payload: { reason: EndReason; ctx: TurnContext }): void;
}
