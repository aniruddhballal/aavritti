import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});
import mongoose from 'mongoose';
import Activity from '../models/Activity';
import Category from '../models/Category';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI;

const migrateCategoryToId = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Finding all categories...');
    const categories = await Category.find({}).lean();
    console.log(`📦 Found ${categories.length} categories`);

    // Create a map of category name -> category ID
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat._id.toString());
    });

    console.log('📊 Finding activities with category as string...');
    
    // Find activities where category is a string (not an ObjectId)
    const activities = await Activity.find({
      category: { $type: 'string' }
    }).lean();
    
    console.log(`📦 Found ${activities.length} activities to migrate`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const activity of activities) {
      try {
        const categoryName = (activity as any).category?.toLowerCase();
        
        if (!categoryName) {
          console.log(`   ⚠️  Skipping activity ${activity._id} - no category name`);
          skipped++;
          continue;
        }

        const categoryId = categoryMap.get(categoryName);
        
        if (!categoryId) {
          console.log(`   ⚠️  Category "${categoryName}" not found for activity ${activity._id}`);
          skipped++;
          continue;
        }

        // Update the activity to use categoryId
        await Activity.updateOne(
          { _id: activity._id },
          {
            $set: {
              categoryId: new mongoose.Types.ObjectId(categoryId)
            },
            $unset: {
              category: ''  // Remove the old category field
            }
          }
        );
        
        updated++;
        
        if (updated % 50 === 0) {
          console.log(`   ⏳ Updated ${updated}/${activities.length}...`);
        }
      } catch (err) {
        console.error(`   ❌ Error updating activity ${activity._id}:`, err);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${activities.length}`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrateCategoryToId();