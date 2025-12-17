import { CatalogModel } from './catalog-normalize';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

type CatalogCacheEntry = {
  data: CatalogModel[];
  fetchedAt: number;
};

let cache: CatalogCacheEntry | null = null;

const isStale = (entry: CatalogCacheEntry): boolean => Date.now() - entry.fetchedAt > TTL_MS;

export const getCachedCatalog = (forceRefresh = false): CatalogModel[] | null => {
  if (forceRefresh || !cache) {
    return null;
  }

  if (isStale(cache)) {
    cache = null;
    return null;
  }

  return cache.data;
};

export const setCachedCatalog = (data: CatalogModel[]): void => {
  cache = { data, fetchedAt: Date.now() };
};

export const clearCatalogCache = (): void => {
  cache = null;
};

export const catalogCacheTtlMs = TTL_MS;
