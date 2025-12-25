import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  date: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

const ActivitySchema: Schema = new Schema({
  date: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);