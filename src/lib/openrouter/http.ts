import { loadConfig } from './config';
import { OpenRouterError } from './errors';
import { HttpRequestOptions, OpenRouterConfig } from './types';

const buildHeaders = (apiKey?: string, extra?: Record<string, string>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra ?? {}),
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
};

const withTimeout = (timeoutMs: number, upstreamSignal?: AbortSignal): AbortSignal => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (upstreamSignal) {
    upstreamSignal.addEventListener(
      'abort',
      () => {
        controller.abort(upstreamSignal.reason);
      },
      { once: true },
    );
  }

  controller.signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timer);
    },
    { once: true },
  );

  return controller.signal;
};

export const request = async <T>(
  path: string,
  options: HttpRequestOptions = {},
  configOverrides?: Partial<OpenRouterConfig>,
): Promise<T> => {
  const config = loadConfig(configOverrides);
  const url = new URL(path, config.baseUrl).toString();
  const timeoutMs = options.timeoutMs ?? config.timeoutMs;
  const signal = withTimeout(timeoutMs, options.signal);

  const headers = buildHeaders(config.apiKey, options.headers);

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    });

    const raw = await response.text();
    const parsed = raw ? safeParse(raw) : undefined;

    if (!response.ok) {
      const parsedObj = parsed as
        | {
            error?: { message?: unknown };
            message?: unknown;
          }
        | undefined;
      const messageCandidate =
        (typeof parsedObj?.error?.message === 'string' && parsedObj.error.message) ||
        (typeof parsedObj?.message === 'string' && parsedObj.message) ||
        `OpenRouter HTTP ${response.status}`;
      throw OpenRouterError.httpError(response.status, String(messageCandidate), parsed);
    }

    return parsed as T;
  } catch (error: unknown) {
    if (error instanceof OpenRouterError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw OpenRouterError.timeout(timeoutMs);
    }

    throw OpenRouterError.network('Failed to reach OpenRouter.', error);
  }
};

const safeParse = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw OpenRouterError.parse('Failed to parse OpenRouter response.', error);
  }
};

const isAbortError = (error: unknown): error is Error => {
  return error instanceof Error && error.name === 'AbortError';
};
