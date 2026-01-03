import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

import mongoose from 'mongoose';
import Activity from '../models/Activity';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI;

const removeTimestampField = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Removing old timestamp field...');
    
    const result = await Activity.updateMany(
      { timestamp: { $exists: true } },
      { $unset: { timestamp: "" } }
    );

    console.log(`✅ Removed timestamp field from ${result.modifiedCount} activities`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

removeTimestampField();