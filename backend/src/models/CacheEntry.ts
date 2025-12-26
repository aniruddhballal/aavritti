import mongoose, { Schema, Document } from 'mongoose';

export interface ICacheEntry extends Document {
  timestamp: Date;
  title: string;
  body: string;
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
  }
});

export default mongoose.model<ICacheEntry>('CacheEntry', CacheEntrySchema);