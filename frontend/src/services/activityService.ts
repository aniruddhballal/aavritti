import { api } from './api';
import type { Activity, CreateActivityData, DailyData } from '../types/activity';

export const activityService = {
  getActivities: async (date: string): Promise<DailyData> => {
    const response = await api.get<DailyData>(`/activities/${date}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityData): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },

  updateActivity: async (id: string, data: Partial<CreateActivityData>): Promise<Activity> => {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/activities/meta/categories');
    return response.data;
  },
};