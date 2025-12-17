import { ModelInfo } from './types';

export interface CatalogPricing {
  prompt?: number;
  completion?: number;
}

export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  modality?: string;
  contextLength?: number;
  pricing?: CatalogPricing;
  raw: ModelInfo;
}

export interface CatalogFilters {
  name?: string;
  provider?: string;
  modality?: string;
  maxPromptPrice?: number;
}

export type SortOrder = 'asc' | 'desc';

const coerceNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const parsePricing = (pricing: Record<string, unknown> | undefined): CatalogPricing | undefined => {
  if (!pricing) return undefined;

  const prompt = coerceNumber(pricing['prompt']);
  const completion = coerceNumber(pricing['completion']);

  if (prompt === undefined && completion === undefined) {
    return undefined;
  }

  return { prompt, completion };
};

const parseProvider = (id: string): string => {
  const [provider] = id.split('/');
  return provider || 'unknown';
};

export const normalizeModel = (model: ModelInfo): CatalogModel => {
  const pricing = parsePricing(model.pricing as Record<string, unknown> | undefined);

  return {
    id: model.id,
    name: model.name ?? model.id,
    provider: parseProvider(model.id),
    modality: (model as Record<string, unknown>)['modality'] as string | undefined,
    contextLength: model.context_length,
    pricing,
    raw: model,
  };
};

export const normalizeCatalog = (models: ModelInfo[]): CatalogModel[] => models.map(normalizeModel);
