import { listModels, OpenRouterClientOptions } from './client';
import { clearCatalogCache, getCachedCatalog, setCachedCatalog } from './catalog-cache';
import { CatalogModel, normalizeCatalog } from './catalog-normalize';

export interface FetchCatalogOptions extends OpenRouterClientOptions {
  forceRefresh?: boolean;
  useCache?: boolean;
}

export const fetchCatalog = async (options: FetchCatalogOptions = {}): Promise<CatalogModel[]> => {
  const { forceRefresh = false, useCache = true, ...clientOptions } = options;

  if (useCache) {
    const cached = getCachedCatalog(forceRefresh);
    if (cached) {
      return cached;
    }
  }

  const response = await listModels(clientOptions);
  const normalized = normalizeCatalog(response.data ?? []);

  if (useCache) {
    setCachedCatalog(normalized);
  }

  return normalized;
};

export const resetCatalogCache = (): void => {
  clearCatalogCache();
};
