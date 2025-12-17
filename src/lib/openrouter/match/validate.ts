import { MatchmakingError, ModelChoice, MatchOptions } from './types';

const isSameModel = (a: ModelChoice, b: ModelChoice): boolean => a.model.id === b.model.id;

export const validateChoices = (
  choices: [ModelChoice | undefined, ModelChoice | undefined],
  options: MatchOptions = {},
): [ModelChoice, ModelChoice] => {
  const [first, second] = choices;

  if (!first || !second) {
    throw MatchmakingError.invalidSelection('Two model selections are required.');
  }

  const allowMirror = options.allowMirror ?? true;
  if (!allowMirror && isSameModel(first, second)) {
    throw MatchmakingError.invalidSelection('Mirror matches are disabled.');
  }

  return [first, second];
};
