import mongoose, { Schema, Document } from 'mongoose';

export enum ActivityCategory {
  PHYSICAL = 'physical',
  SPIRITUAL = 'spiritual',
  ACADEMIC = 'academic',
  PROJECT = 'project',
  ENTERTAINMENT = 'entertainment'
}

export interface IActivity extends Document {
  date: string;
  category: ActivityCategory;
  title: string;
  description?: string;
  duration: number; // in minutes
  timestamp: string;
}

const ActivitySchema: Schema = new Schema({
  date: { type: String, required: true, index: true },
  category: { 
    type: String, 
    required: true, 
    enum: Object.values(ActivityCategory)
  },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true, min: 1 },
  timestamp: { type: String, required: true }
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);