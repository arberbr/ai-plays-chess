export type NormalizedErrorCode =
  | 'auth_missing'
  | 'timeout'
  | 'http_error'
  | 'network'
  | 'parse'
  | 'mock_mode';

export interface NormalizedError extends Error {
  code: NormalizedErrorCode;
  status?: number;
  cause?: unknown;
}

export interface OpenRouterConfig {
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
  mock: boolean;
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  onRetry?: (attempt: number, error: NormalizedError) => void;
}

export interface ModelInfo {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: Record<string, unknown>;
  created?: string;
  [key: string]: unknown;
}

export interface ListModelsResponse {
  data: ModelInfo[];
}
