import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  date: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  duration: number; // minutes
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  createdAt: Date;    // Added by timestamps
  updatedAt: Date;    // Added by timestamps
}

const ActivitySchema = new Schema<IActivity>(
  {
    date: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true  // 🆕 Ensures consistency: "Meals" → "meals"
    },
    subcategory: {
      type: String,
      trim: true,
      lowercase: true  // 🆕 Same consistency for subcategories
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true, min: 1 },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true }
  },
  { timestamps: true }
);

// 🆕 Compound index for efficient queries by date + category
ActivitySchema.index({ date: 1, category: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);