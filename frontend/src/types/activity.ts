export const ActivityCategory = {
  MEALS: 'meals',
  SLEEP: 'sleep',
  JAPA: 'japa',
  EXERCISE: 'exercise',
  COMMUTE: 'commute',
  CINEMA: 'cinema',
  READING: 'reading',
  RESEARCH: 'research',
  WRITING: 'writing',
  PROJECT: 'project',
  RECREATION: 'recreation',
  CHORES: 'chores',
  ART: 'art',
  WORK: 'work'
} as const;

export const MealsSubcategory = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  SNACKS: 'snacks',
  DINNER: 'dinner'
} as const;

export const ExerciseSubcategory = {
  CALISTHENICS: 'calisthenics',
  WALK: 'walk',
  CYCLE: 'cycle',
  RUN: 'run',
  SWIM: 'swim'
} as const;

export const CommuteSubcategory = {
  METRO: 'metro',
  BUS: 'bus',
  AUTO: 'auto',
  BIKE: 'bike',
  CAR: 'car'
} as const;

export const CinemaSubcategory = {
  WATCHING: 'watching',
  REVIEWING: 'reviewing',
  ANALYSING: 'analysing'
} as const;

export type ActivitySubcategory = 
  | typeof MealsSubcategory[keyof typeof MealsSubcategory]
  | typeof ExerciseSubcategory[keyof typeof ExerciseSubcategory]
  | typeof CommuteSubcategory[keyof typeof CommuteSubcategory]
  | typeof CinemaSubcategory[keyof typeof CinemaSubcategory];

export interface Activity {
  _id: string;
  date: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  duration: number; // REQUIRED - in minutes
  startTime?: string; // Optional - HH:MM format
  endTime?: string; // Optional - HH:MM format
  timestamp: string;
}

export interface CreateActivityData {
  date: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  duration: number; // REQUIRED
  startTime?: string;
  endTime?: string;
}

export interface DailyData {
  date: string;
  activities: Activity[];
  totalActivities: number;
  totalDuration: number;
}