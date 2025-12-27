import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Activity from '../models/Activity';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function splitCommuteActivity() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the specific activity by ID
    const activityId = '694e22c95fd86b071c351201';
    const originalActivity = await Activity.findById(activityId);

    if (!originalActivity) {
      console.log('❌ Activity not found with ID:', activityId);
      return;
    }

    console.log('📌 Found original activity:');
    console.log(`   Title: ${originalActivity.title}`);
    console.log(`   Category: ${originalActivity.category}`);
    console.log(`   Duration: ${originalActivity.duration} minutes`);
    console.log(`   Time: ${originalActivity.startTime} - ${originalActivity.endTime}\n`);

    // Update the existing activity to be the first commute (bike)
    originalActivity.category = 'commute' as any;
    originalActivity.subcategory = 'bike' as any;
    originalActivity.title = 'to sandal soap';
    originalActivity.description = 'rapido 82 rupees';
    originalActivity.duration = 16; // 9:58 to 10:14
    originalActivity.startTime = '09:58';
    originalActivity.endTime = '10:14';
    
    await originalActivity.save({ validateBeforeSave: false });
    console.log('✅ Updated first activity (Bike commute):');
    console.log(`   Title: ${originalActivity.title}`);
    console.log(`   Subcategory: ${originalActivity.subcategory}`);
    console.log(`   Duration: ${originalActivity.duration} minutes`);
    console.log(`   Time: ${originalActivity.startTime} - ${originalActivity.endTime}\n`);

    // Create the second activity (metro)
    const newActivity = new Activity({
      date: '2025-12-26',
      category: 'commute',
      subcategory: 'metro',
      title: 'to central silk board',
      description: '70 rupees; waited 18 minutes at rv road stop for yellow line - frequency was NOT reduced to 13 mins as publicised',
      duration: 53, // 10:18 to 11:11
      startTime: '10:18',
      endTime: '11:11',
      timestamp: '2025-12-26T05:53:14.349Z' // 1 second after the first activity
    });

    await newActivity.save({ validateBeforeSave: false });
    console.log('✅ Created second activity (Metro commute):');
    console.log(`   Title: ${newActivity.title}`);
    console.log(`   Subcategory: ${newActivity.subcategory}`);
    console.log(`   Duration: ${newActivity.duration} minutes`);
    console.log(`   Time: ${newActivity.startTime} - ${newActivity.endTime}\n`);

    console.log('🎉 Successfully split the commute activity into two!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the script
console.log('🚀 Starting commute activity split...');
console.log('='.repeat(60));
splitCommuteActivity();