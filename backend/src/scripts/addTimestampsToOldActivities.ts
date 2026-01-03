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

const addTimestamps = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Finding activities without createdAt/updatedAt...');
    
    // Find activities that have timestamp but not createdAt
    const oldActivities = await Activity.find({
      timestamp: { $exists: true },
      createdAt: { $exists: false }
    }).lean(); // ✅ Use .lean() to get plain objects

    console.log(`📦 Found ${oldActivities.length} old activities to update`);

    let updated = 0;
    for (const activity of oldActivities) {
      // ✅ Access timestamp from plain object
      const timestamp = (activity as any).timestamp;
      if (!timestamp) continue;
      
      const timestampDate = new Date(timestamp);
      
      await Activity.updateOne(
        { _id: activity._id },
        {
          $set: {
            createdAt: timestampDate,
            updatedAt: timestampDate
          }
        }
      );
      updated++;
      
      if (updated % 50 === 0) {
        console.log(`   ⏳ Updated ${updated}/${oldActivities.length}...`);
      }
    }

    console.log(`\n✅ Updated ${updated} activities with timestamps`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

addTimestamps();