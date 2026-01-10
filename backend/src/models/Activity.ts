import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  date: string;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId;  // ✅ Reference to subcategory _id
  title: string;
  description?: string;
  duration: number;
  startTime?: string;
  endTime?: string;
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
    subcategoryId: {
      type: Schema.Types.ObjectId,
      required: false
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true, min: 1 },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true }
  },
  { timestamps: true }
);

ActivitySchema.index({ date: 1, categoryId: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);