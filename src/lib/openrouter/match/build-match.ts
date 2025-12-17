import { assignColors } from './assign-colors';
import { validateChoices } from './validate';
import { MatchAssignment, MatchOptions, MatchPayload, ModelChoice } from './types';

const toSide = (choice: ModelChoice) => ({
  id: choice.model.id,
  provider: choice.model.provider,
  name: choice.displayName ?? choice.model.name,
});

export const buildMatch = (
  choices: [ModelChoice | undefined, ModelChoice | undefined],
  options: MatchOptions = {},
): { assignment: MatchAssignment; payload: MatchPayload } => {
  const [first, second] = validateChoices(choices, options);
  const assignment = assignColors(first, second, options);

  const payload: MatchPayload = {
    white: toSide(assignment.white),
    black: toSide(assignment.black),
    models: assignment,
    options,
  };

  return { assignment, payload };
};
