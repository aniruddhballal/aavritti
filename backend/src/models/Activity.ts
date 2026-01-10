import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  date: string;
  categoryId: Types.ObjectId;  // 🆕 Reference to Category
  subcategory?: string;
  title: string;
  description?: string;
  duration: number; // minutes
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    date: { type: String, required: true, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      lowercase: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true, min: 1 },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true }
  },
  { timestamps: true }
);

// Compound index for efficient queries by date + category
ActivitySchema.index({ date: 1, categoryId: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);