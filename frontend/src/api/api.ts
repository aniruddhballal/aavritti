import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Activity {
  _id: string;
  date: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  category?: string;
  duration?: number;
  startTime?: string; // Add this
  endTime?: string; // Add this
}

export interface CreateActivityData {
  date: string;
  title: string;
  description: string;
  category?: string;
  duration?: number;
  startTime?: string; // Add this
  endTime?: string; // Add this
  completed?: boolean;
}

export interface DailyData {
  date: string;
  activities: Activity[];
  totalActivities: number;
  completedActivities: number;
}

// Get activities for a specific date
export const getActivities = async (date: string): Promise<DailyData> => {
  const response = await api.get<DailyData>(`/activities/${date}`);
  return response.data;
};

// Create a new activity
export const createActivity = async (data: CreateActivityData): Promise<Activity> => {
  const response = await api.post<Activity>('/activities', data);
  return response.data;
};

// Update an existing activity
export const updateActivity = async (id: string, data: Partial<CreateActivityData>): Promise<Activity> => {
  const response = await api.put<Activity>(`/activities/${id}`, data);
  return response.data;
};

// Get categories
export const getCategories = async () => {
  const response = await api.get('/activities/meta/categories');
  return response.data;
};

// Add this interface after the Activity interfaces
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

// Add these functions at the end, before export default api
// Create a new cache entry
export const createCacheEntry = async (data: CreateCacheEntryData = {}): Promise<CacheEntry> => {
  const response = await api.post<CacheEntry>('/cache-entries', data);
  return response.data;
};

// Get all cache entries
export const getCacheEntries = async (): Promise<CacheEntry[]> => {
  const response = await api.get<CacheEntry[]>('/cache-entries');
  return response.data;
};

// Update a cache entry
export const updateCacheEntry = async (id: string, data: Partial<CreateCacheEntryData>): Promise<CacheEntry> => {
  const response = await api.put<CacheEntry>(`/cache-entries/${id}`, data);
  return response.data;
};

// Delete a cache entry
export const deleteCacheEntry = async (id: string): Promise<void> => {
  await api.delete(`/cache-entries/${id}`);
};

export default api;