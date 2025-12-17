import { MatchAssignment, MatchOptions, ModelChoice } from './types';

const maybeShuffle = (a: ModelChoice, b: ModelChoice, options: MatchOptions): [ModelChoice, ModelChoice] => {
  const randomize = options.randomizeColors ?? false;
  if (!randomize) {
    return [a, b];
  }

  const seed = options.seed;
  const random = seed !== undefined ? seededRandom(seed) : Math.random();
  return random < 0.5 ? [a, b] : [b, a];
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const assignColors = (
  first: ModelChoice,
  second: ModelChoice,
  options: MatchOptions = {},
): MatchAssignment => {
  const [white, black] = maybeShuffle(first, second, options);
  return { white, black };
};
