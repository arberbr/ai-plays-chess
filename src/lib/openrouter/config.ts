import { OpenRouterError } from './errors';
import { OpenRouterConfig } from './types';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_TIMEOUT_MS = 30_000;

const isMockEnabled = (): boolean => {
  const flag = process.env.OPENROUTER_MOCK ?? '';
  return flag === '1' || flag.toLowerCase() === 'true';
};

export const loadConfig = (overrides: Partial<OpenRouterConfig> = {}): OpenRouterConfig => {
  const mock = overrides.mock ?? isMockEnabled();
  const apiKey = overrides.apiKey ?? process.env.OPENROUTER_API_KEY;
  const timeoutMs = overrides.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const baseUrl = overrides.baseUrl ?? DEFAULT_BASE_URL;

  if (!mock && !apiKey) {
    throw OpenRouterError.authMissing();
  }

  return {
    apiKey,
    baseUrl,
    timeoutMs,
    mock,
  };
};

export const defaultTimeoutMs = DEFAULT_TIMEOUT_MS;
