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

export default api;