import { CatalogFilters, CatalogModel, SortOrder } from './catalog-normalize';

const includesCaseInsensitive = (haystack: string, needle: string): boolean =>
  haystack.toLowerCase().includes(needle.toLowerCase());

const pickPrice = (model: CatalogModel): number | undefined => {
  const price = model.pricing?.prompt ?? model.pricing?.completion;
  return typeof price === 'number' ? price : undefined;
};

export const filterByName = (models: CatalogModel[], name?: string): CatalogModel[] => {
  if (!name) return models;
  return models.filter((m) => includesCaseInsensitive(m.name, name));
};

export const filterByProvider = (models: CatalogModel[], provider?: string): CatalogModel[] => {
  if (!provider) return models;
  return models.filter((m) => m.provider === provider);
};

export const filterByModality = (models: CatalogModel[], modality?: string): CatalogModel[] => {
  if (!modality) return models;
  return models.filter((m) => m.modality === modality);
};

export const filterByMaxPrice = (models: CatalogModel[], maxPromptPrice?: number): CatalogModel[] => {
  if (maxPromptPrice === undefined) return models;
  return models.filter((m) => {
    const price = pickPrice(m);
    return price !== undefined ? price <= maxPromptPrice : true;
  });
};

export const applyFilters = (models: CatalogModel[], filters: CatalogFilters): CatalogModel[] => {
  const afterName = filterByName(models, filters.name);
  const afterProvider = filterByProvider(afterName, filters.provider);
  const afterModality = filterByModality(afterProvider, filters.modality);
  return filterByMaxPrice(afterModality, filters.maxPromptPrice);
};

export const sortByPrice = (models: CatalogModel[], order: SortOrder = 'asc'): CatalogModel[] => {
  const factor = order === 'desc' ? -1 : 1;
  return [...models].sort((a, b) => {
    const priceA = pickPrice(a);
    const priceB = pickPrice(b);

    if (priceA === undefined && priceB === undefined) return 0;
    if (priceA === undefined) return 1;
    if (priceB === undefined) return -1;

    return priceA === priceB ? 0 : priceA < priceB ? -1 * factor : 1 * factor;
  });
};

export const sortByName = (models: CatalogModel[], order: SortOrder = 'asc'): CatalogModel[] => {
  const factor = order === 'desc' ? -1 : 1;
  return [...models].sort((a, b) => a.name.localeCompare(b.name) * factor);
};
