import mongoose, { Schema, Document } from 'mongoose';

export interface ICacheEntry extends Document {
  timestamp: Date;
  title: string;
  body: string;
  position: {
    x: number;
    y: number;
  };
}

const CacheEntrySchema: Schema = new Schema({
  timestamp: { 
    type: Date, 
    required: true, 
    default: Date.now,
    index: true 
  },
  title: { 
    type: String, 
    default: '',
    trim: true 
  },
  body: { 
    type: String, 
    default: '',
    trim: true 
  },
  position: {
    type: {
      x: { type: Number, default: 300 },
      y: { type: Number, default: 300 }
    },
    default: { x: 300, y: 300 }
  }
});

export default mongoose.model<ICacheEntry>('CacheEntry', CacheEntrySchema);