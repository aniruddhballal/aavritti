import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Activity {
  id: string;
  date: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface DailyData {
  date: string;
  activities: Activity[];
  totalActivities: number;
  completedActivities: number;
}

export interface CreateActivityData {
  date: string;
  title: string;
  description: string;
  completed?: boolean;
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

export default api;