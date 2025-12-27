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