import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI;
const forceRemoveTimestamp = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const activitiesCollection = db?.collection('activities');

    if (!activitiesCollection) {
      throw new Error('Could not access activities collection');
    }

    console.log('🧹 Removing timestamp field from all activities...');
    
    const result = await activitiesCollection.updateMany(
      { timestamp: { $exists: true } },
      { $unset: { timestamp: 1 } }  // Use 1 instead of ""
    );

    console.log(`✅ Modified ${result.modifiedCount} documents`);
    console.log(`📊 Matched ${result.matchedCount} documents`);

    // Verify removal
    const remaining = await activitiesCollection.countDocuments({
      timestamp: { $exists: true }
    });

    if (remaining === 0) {
      console.log('\n🎉 All timestamp fields successfully removed!');
    } else {
      console.log(`\n⚠️  Warning: ${remaining} documents still have timestamp field`);
    }
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

forceRemoveTimestamp();