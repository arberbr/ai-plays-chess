import { ListModelsResponse } from './types';

export const mockListModels = (): ListModelsResponse => ({
  data: [
    {
      id: 'mock/model',
      name: 'Mock Model',
      context_length: 8192,
      pricing: { prompt: 0, completion: 0 },
    },
  ],
});

export const mockPing = (): { ok: true } => ({ ok: true });
