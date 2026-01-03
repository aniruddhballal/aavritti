import { api } from './api';
import type { Activity, CreateActivityData, DailyData, CategorySuggestion } from '../types/activity';

export const activityService = {
  getActivities: async (date: string): Promise<DailyData> => {
    const response = await api.get<DailyData>(`/activities/${date}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityData): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },

  updateActivity: async (
    id: string,
    data: Partial<CreateActivityData>
  ): Promise<Activity> => {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (
    id: string
  ): Promise<{ message: string; activity: Activity }> => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  // Get category suggestions based on query
  getCategorySuggestions: async (query: string): Promise<CategorySuggestion[]> => {
    const response = await api.get('/suggestions/categories', {
      params: { q: query }
    });
    return response.data;
  },

  // Get subcategory suggestions for a given category
  getSubcategorySuggestions: async (
    category: string,
    query: string
  ): Promise<string[]> => {
    const response = await api.get('/suggestions/subcategories', {
      params: { category, q: query }
    });
    return response.data;
  }
};