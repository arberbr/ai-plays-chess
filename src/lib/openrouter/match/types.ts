import { CatalogModel } from '../catalog-normalize';
import { OpenRouterError } from '../errors';

export interface ModelChoice {
  model: CatalogModel;
  displayName?: string;
}

export interface MatchOptions {
  randomizeColors?: boolean;
  allowMirror?: boolean;
  seed?: number;
}

export interface MatchAssignment {
  white: ModelChoice;
  black: ModelChoice;
}

export interface MatchPayload {
  white: {
    id: string;
    provider: string;
    name: string;
  };
  black: {
    id: string;
    provider: string;
    name: string;
  };
  models: MatchAssignment;
  options: MatchOptions;
}

const ERROR_NAME = 'MatchmakingError';

export const MatchmakingError = {
  invalidSelection(message: string): OpenRouterError {
    const err = OpenRouterError.parse(message);
    err.name = ERROR_NAME;
    return err;
  },
};
