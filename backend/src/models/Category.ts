import { Schema, model, Document, Types } from 'mongoose';

export interface ISubcategory {
  _id: Types.ObjectId;  // ✅ Add this for references
  name: string;
  displayName: string;
  usageCount: number;
}

export interface ICategory extends Document {
  name: string;
  displayName: string;
  usageCount: number;
  color: string;
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    lowercase: true,
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
}, { _id: true });  // ✅ Enable _id for subdocuments

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
      min: 0
    },
    color: {
      type: String,
      required: true,
      default: '#95A5A6'
    },
    subcategories: [SubcategorySchema]
  },
  { 
    timestamps: true
  }
);

CategorySchema.index({ 'subcategories.name': 1 });

export default model<ICategory>('Category', CategorySchema);