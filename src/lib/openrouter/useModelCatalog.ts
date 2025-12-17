'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { OpenRouterError } from './errors';
import { applyFilters, sortByName, sortByPrice } from './catalog-filters';
import { CatalogFilters, CatalogModel, SortOrder } from './catalog-normalize';
import { fetchCatalog, FetchCatalogOptions } from './catalog-service';

type SortField = 'price' | 'name';

export interface SortOption {
  field: SortField;
  order?: SortOrder;
}

export interface UseModelCatalogOptions extends FetchCatalogOptions {
  filters?: CatalogFilters;
  sort?: SortOption;
}

export interface UseModelCatalogResult {
  models: CatalogModel[];
  loading: boolean;
  error: OpenRouterError | null;
  refresh: (opts?: { forceRefresh?: boolean }) => Promise<void>;
  setFilters: (filters: CatalogFilters) => void;
  setSort: (sort?: SortOption) => void;
}

export const useModelCatalog = (options: UseModelCatalogOptions = {}): UseModelCatalogResult => {
  const { filters: initialFilters = {}, sort: initialSort, ...rawFetchOptions } = options;

  const fetchOptions = useMemo(
    () => ({ ...rawFetchOptions }),
    [rawFetchOptions],
  );

  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<OpenRouterError | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption | undefined>(initialSort);

  const load = useCallback(
    async (forceRefresh?: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCatalog({
          ...fetchOptions,
          forceRefresh: forceRefresh ?? fetchOptions.forceRefresh,
        });
        setModels(data);
      } catch (err) {
        const normalized =
          err instanceof OpenRouterError
            ? err
            : OpenRouterError.network('Failed to load OpenRouter model catalog.', err);
        setError(normalized);
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions],
  );

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setSort(initialSort);
  }, [initialSort]);

  useEffect(() => {
    load(fetchOptions.forceRefresh);
  }, [load, fetchOptions.forceRefresh]);

  const filtered = useMemo(() => applyFilters(models, filters), [models, filters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    if (sort.field === 'price') return sortByPrice(filtered, sort.order);
    if (sort.field === 'name') return sortByName(filtered, sort.order);
    return filtered;
  }, [filtered, sort]);

  const refresh = useCallback(
    async (opts?: { forceRefresh?: boolean }) => {
      await load(opts?.forceRefresh ?? true);
    },
    [load],
  );

  return {
    models: sorted,
    loading,
    error,
    refresh,
    setFilters,
    setSort,
  };
};
