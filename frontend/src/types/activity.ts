export interface Activity {
  _id: string;
  date: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  category?: string;
  subcategory?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateActivityData {
  date: string;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  completed?: boolean;
}

export interface DailyData {
  date: string;
  activities: Activity[];
  totalActivities: number;
  completedActivities: number;
}