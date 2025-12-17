import { GameState, GameStatus, PgnHeaders, PgnMove, PgnRecord, PieceColor } from "./types";

type HeaderInput = Partial<PgnHeaders> & { whiteModel?: string; blackModel?: string };

function pad(num: number) {
  return num.toString().padStart(2, "0");
}

function todayAsPgnDate(): string {
  const now = new Date();
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
}

export function createPgnHeaders(input: HeaderInput = {}): PgnHeaders {
  const headers: PgnHeaders = {
    Event: input.Event ?? "AI Match",
    Site: input.Site ?? "?",
    Date: input.Date ?? todayAsPgnDate(),
    Round: input.Round ?? "-",
    White: input.White ?? "White",
    Black: input.Black ?? "Black",
    Result: input.Result ?? "*"
  };

  if (input.whiteModel) headers.WhiteModel = input.whiteModel;
  if (input.blackModel) headers.BlackModel = input.blackModel;
  return headers;
}

export function appendPgnMove(record: PgnRecord, san: string, stateBefore: GameState, statusAfter: GameStatus): PgnRecord {
  const color = stateBefore.turn;
  const fullmove = stateBefore.fullmoveNumber;
  const moves: PgnMove[] = [...record.moves];

  if (color === PieceColor.White) {
    moves.push({ fullmove, white: san });
  } else {
    const last = moves[moves.length - 1];
    if (last && last.fullmove === fullmove) {
      moves[moves.length - 1] = { ...last, black: san };
    } else {
      moves.push({ fullmove, black: san });
    }
  }

  let result = record.result;
  if (statusAfter.gameOver) {
    if (statusAfter.reason === "checkmate") {
      if (statusAfter.winner === PieceColor.White) result = "1-0";
      else if (statusAfter.winner === PieceColor.Black) result = "0-1";
      else result = "1/2-1/2";
    } else {
      result = "1/2-1/2";
    }
  }

  return { ...record, moves, result };
}

export function pgnToString(record: PgnRecord): string {
  const headerOrder: (keyof PgnHeaders)[] = ["Event", "Site", "Date", "Round", "White", "Black", "Result", "WhiteModel", "BlackModel"];
  const headerLines = headerOrder
    .map((key) => {
      const value = record.headers[key];
      if (!value) return null;
      return `[${key} "${value}"]`;
    })
    .filter(Boolean) as string[];

  const moveParts: string[] = [];
  for (const move of record.moves) {
    if (move.white) {
      const pair = move.black ? `${move.fullmove}. ${move.white} ${move.black}` : `${move.fullmove}. ${move.white}`;
      moveParts.push(pair);
    } else if (move.black) {
      moveParts.push(`${move.fullmove}... ${move.black}`);
    }
  }

  const movesLine = moveParts.join(" ");
  const body = movesLine ? `${movesLine} ${record.result}`.trim() : record.result;
  return [...headerLines, "", body].join("\n");
}
