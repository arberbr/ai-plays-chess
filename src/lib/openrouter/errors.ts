import { NormalizedError, NormalizedErrorCode } from './types';

const ERROR_NAME = 'OpenRouterError';

export class OpenRouterError extends Error implements NormalizedError {
  code: NormalizedErrorCode;
  status?: number;
  declare cause?: unknown;

  private constructor(code: NormalizedErrorCode, message: string, status?: number, cause?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.cause = cause;
    this.name = ERROR_NAME;
  }

  static authMissing(): OpenRouterError {
    return new OpenRouterError('auth_missing', 'Missing OPENROUTER_API_KEY environment variable.');
  }

  static timeout(timeoutMs?: number): OpenRouterError {
    const suffix = timeoutMs ? ` after ${timeoutMs}ms` : '';
    return new OpenRouterError('timeout', `OpenRouter request timed out${suffix}.`);
  }

  static httpError(status: number, message: string, cause?: unknown): OpenRouterError {
    return new OpenRouterError('http_error', message, status, cause);
  }

  static network(message: string, cause?: unknown): OpenRouterError {
    return new OpenRouterError('network', message, undefined, cause);
  }

  static parse(message: string, cause?: unknown): OpenRouterError {
    return new OpenRouterError('parse', message, undefined, cause);
  }

  static mockMode(message = 'OpenRouter client running in mock mode.'): OpenRouterError {
    return new OpenRouterError('mock_mode', message);
  }
}
