export interface CacheEntry {
  _id: string;
  timestamp: Date;
  title: string;
  body: string;
}

export interface CreateCacheEntryData {
  title?: string;
  body?: string;
}