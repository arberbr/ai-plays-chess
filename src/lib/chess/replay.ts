import { copyState, gameStateToFen, parseFen, startingPosition } from "./fen";
import { gameIoError, GameIoError, GameExportMetadata } from "./io";
import { legalMoves } from "./status";
import { validateMove } from "./validate";
import { GameState, PgnRecord } from "./types";

export interface ReplaySnapshot {
  index: number; // 0 = before any move
  state: GameState;
  fen: string;
  san?: string;
  pgn?: PgnRecord;
}

export interface ReplayController {
  current(): ReplaySnapshot;
  next(): ReplaySnapshot;
  prev(): ReplaySnapshot;
  jumpTo(index: number): ReplaySnapshot;
  reset(): ReplaySnapshot;
  length(): number;
}

function applySan(state: GameState, san: string, pgn?: PgnRecord): { next: GameState; san: string; pgn?: PgnRecord } {
  const candidates = legalMoves(state, state.turn);
  for (const move of candidates) {
    const res = validateMove(state, move, { pgn });
    if (res.legal && res.san === san) {
      return { next: res.nextState, san: res.san, pgn: res.pgn ?? pgn };
    }
  }
  throw gameIoError("ILLEGAL_MOVE", `Illegal or unrecognized SAN: ${san}`);
}

export function createReplayController(moves: string[], initialFen?: string, metadata?: GameExportMetadata): ReplayController {
  if (!Array.isArray(moves)) throw gameIoError("SCHEMA_INVALID", "moves must be an array of SAN strings");
  const baseState = initialFen ? parseFen(initialFen) : startingPosition();
  const initialSnapshot: ReplaySnapshot = {
    index: 0,
    state: copyState(baseState),
    fen: gameStateToFen(baseState),
    san: undefined,
    pgn: undefined
  };

  const snapshots: ReplaySnapshot[] = [initialSnapshot];
  let cursor = 0;
  let pgn: PgnRecord | undefined = metadata ? undefined : undefined; // placeholder; PGN building optional

  function ensureSnapshot(target: number) {
    if (target < 0 || target > moves.length) throw gameIoError("OUT_OF_BOUNDS", "Replay index out of bounds", target);
    while (snapshots.length <= target) {
      const prev = snapshots[snapshots.length - 1];
      const san = moves[prev.index];
      const res = applySan(prev.state, san, pgn);
      const nextState = copyState(res.next);
      pgn = res.pgn;
      snapshots.push({
        index: prev.index + 1,
        state: nextState,
        fen: gameStateToFen(nextState),
        san,
        pgn
      });
    }
  }

  function current(): ReplaySnapshot {
    return snapshots[cursor];
  }

  function next(): ReplaySnapshot {
    ensureSnapshot(cursor + 1);
    cursor += 1;
    return current();
  }

  function prev(): ReplaySnapshot {
    if (cursor === 0) throw gameIoError("OUT_OF_BOUNDS", "Already at beginning of replay");
    cursor -= 1;
    return current();
  }

  function jumpTo(index: number): ReplaySnapshot {
    ensureSnapshot(index);
    cursor = index;
    return current();
  }

  function reset(): ReplaySnapshot {
    cursor = 0;
    return current();
  }

  return {
    current,
    next,
    prev,
    jumpTo,
    reset,
    length: () => moves.length
  };
}
