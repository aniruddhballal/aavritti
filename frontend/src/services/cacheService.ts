import { api } from './api';
import type { CacheEntry, CreateCacheEntryData } from '../types/cache.ts';

export const cacheService = {
  create: async (data: CreateCacheEntryData = {}): Promise<CacheEntry> => {
    const response = await api.post<CacheEntry>('/cache-entries', data);
    return response.data;
  },

  getAll: async (): Promise<CacheEntry[]> => {
    const response = await api.get<CacheEntry[]>('/cache-entries');
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCacheEntryData>): Promise<CacheEntry> => {
    const response = await api.patch<CacheEntry>(`/cache-entries/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cache-entries/${id}`);
  },
};