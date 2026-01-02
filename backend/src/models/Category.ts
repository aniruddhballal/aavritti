import { Schema, model, Document } from 'mongoose';

export interface ISubcategory {
  name: string;
  displayName: string;
  usageCount: number;
}

export interface ICategory extends Document {
  name: string;          // normalized (lowercase)
  displayName: string;   // original user input
  usageCount: number;
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,  // ⚠️ Was __type__ - should be "type"
      required: true,
      unique: true,
      lowercase: true,  // 🆕 Auto-normalize
      trim: true,
      index: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    usageCount: {
      type: Number,
      default: 1,
      min: 0  // 🆕 Can't be negative
    },
    subcategories: [
      {
        name: { 
          type: String, 
          required: true,
          lowercase: true,  // 🆕 Auto-normalize
          trim: true
        },
        displayName: { 
          type: String, 
          required: true,
          trim: true
        },
        usageCount: { 
          type: Number, 
          default: 1,
          min: 0
        }
      }
    ]
  },
  { 
    timestamps: true  // 🆕 Adds createdAt/updatedAt
  }
);

// 🆕 Compound index for finding subcategories efficiently
CategorySchema.index({ 'subcategories.name': 1 });

export default model<ICategory>('Category', CategorySchema);