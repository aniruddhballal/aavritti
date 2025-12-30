import mongoose, { Schema, Document } from 'mongoose';

export enum ActivityCategory {
  MEAL = 'meal',
  SLEEP = 'sleep',
  JAPA = 'japa',
  EXERCISE = 'exercise',
  COMMUTE = 'commute',
  CINEMA = 'cinema',
  READING = 'reading',
  RESEARCH = 'research',
  WRITING = 'writing',
  PROJECT = 'project',
  RECREATION = 'recreation',
  CHORES = 'chores'
}

export enum MealSubcategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  SNACKS = 'snacks',
  DINNER = 'dinner'
}

export enum ExerciseSubcategory {
  CALISTHENICS = 'calisthenics',
  WALK = 'walk',
  CYCLE = 'cycle',
  RUN = 'run',
  SWIM = 'swim'
}

export enum CommuteSubcategory {
  METRO = 'metro',
  BUS = 'bus',
  AUTO = 'auto',
  BIKE = 'bike',
  CAR = 'car'
}

export enum CinemaSubcategory {
  WATCHING = 'watching',
  REVIEWING = 'reviewing',
  ANALYSING = 'analysing'
}

export type ActivitySubcategory = 
  | MealSubcategory 
  | ExerciseSubcategory 
  | CommuteSubcategory 
  | CinemaSubcategory;

export interface IActivity extends Document {
  date: string;
  category: ActivityCategory;
  subcategory?: ActivitySubcategory;
  title: string;
  description?: string;
  duration: number; // in minutes
  startTime?: string; // HH:MM format (optional)
  endTime?: string; // HH:MM format (optional)
  timestamp: string;
}

const ActivitySchema: Schema = new Schema({
  date: { type: String, required: true, index: true },
  category: { 
    type: String, 
    required: true, 
    enum: Object.values(ActivityCategory)
  },
  subcategory: { 
    type: String, 
    required: false,
    enum: [
      ...Object.values(MealSubcategory),
      ...Object.values(ExerciseSubcategory),
      ...Object.values(CommuteSubcategory),
      ...Object.values(CinemaSubcategory)
    ],
    validate: {
      validator: function(this: any, value: string) {
        // If no subcategory provided, check if it's required
        if (!value) {
          const requiresSubcategory = [
            ActivityCategory.MEAL,
            ActivityCategory.EXERCISE,
            ActivityCategory.COMMUTE,
            ActivityCategory.CINEMA
          ];
          return !requiresSubcategory.includes(this.category);
        }
        
        // If subcategory provided, validate it matches the category
        const validSubcategories: Record<string, string[]> = {
          [ActivityCategory.MEAL]: Object.values(MealSubcategory),
          [ActivityCategory.EXERCISE]: Object.values(ExerciseSubcategory),
          [ActivityCategory.COMMUTE]: Object.values(CommuteSubcategory),
          [ActivityCategory.CINEMA]: Object.values(CinemaSubcategory)
        };
        
        const allowedSubs = validSubcategories[this.category];
        return allowedSubs && allowedSubs.includes(value);
      },
      message: function(this: any, props: any) {
        if (!props.value) {
          return `Subcategory is required for category '${this.category}'`;
        }
        return `Invalid subcategory '${props.value}' for category '${this.category}'`;
      }
    }
  },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true, min: 1 },
  startTime: { type: String },
  endTime: { type: String },
  timestamp: { type: String, required: true }
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);