import { loadConfig } from './config';
import { OpenRouterError } from './errors';
import { request } from './http';
import { mockListModels, mockPing } from './mock';
import { ListModelsResponse, OpenRouterConfig } from './types';

export interface OpenRouterClientOptions extends Partial<OpenRouterConfig> {}

export const listModels = async (
  options?: OpenRouterClientOptions,
): Promise<ListModelsResponse> => {
  const config = loadConfig(options);

  if (config.mock) {
    return mockListModels();
  }

  return request<ListModelsResponse>('/models', {}, config);
};

export const ping = async (options?: OpenRouterClientOptions): Promise<{ ok: true }> => {
  const config = loadConfig(options);

  if (config.mock) {
    return mockPing();
  }

  await request('/models', {}, config);
  return { ok: true };
};

export const ensureAuth = (options?: OpenRouterClientOptions): void => {
  const config = loadConfig(options);
  if (config.mock) {
    throw OpenRouterError.mockMode();
  }
};
