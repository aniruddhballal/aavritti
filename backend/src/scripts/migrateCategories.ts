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

const migrateCategories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Fetching all activities...');
    const activities = await Activity.find({});
    console.log(`📦 Found ${activities.length} activities`);

    const categoryMap = new Map<string, Map<string, number>>();

    // Build category and subcategory usage counts
    let processedCount = 0;
    activities.forEach(activity => {
      const catName = activity.category?.trim().toLowerCase();
      const subName = activity.subcategory?.trim().toLowerCase();

      if (!catName) {
        console.warn(`⚠️  Skipping activity without category: ${activity._id}`);
        return;
      }

      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, new Map());
      }

      const subMap = categoryMap.get(catName)!;
      
      // Increment category count
      const categoryCount = subMap.get('__CATEGORY_COUNT__') || 0;
      subMap.set('__CATEGORY_COUNT__', categoryCount + 1);

      // Increment subcategory count if exists
      if (subName) {
        const subCount = subMap.get(subName) || 0;
        subMap.set(subName, subCount + 1);
      }

      processedCount++;
    });

    console.log(`\n✅ Processed ${processedCount} activities`);
    console.log(`📋 Found ${categoryMap.size} unique categories\n`);

    // Upsert categories into Category collection
    for (const [catName, subMap] of categoryMap.entries()) {
      const categoryCount = subMap.get('__CATEGORY_COUNT__') || 0;
      
      // Find the original display name (with proper casing) from activities
      const sampleActivity = activities.find(a => 
        a.category?.trim().toLowerCase() === catName
      );
      const displayName = sampleActivity?.category?.trim() || catName;

      // Build subcategories array
      const subcategories = [];
      for (const [subName, subCount] of subMap.entries()) {
        if (subName === '__CATEGORY_COUNT__') continue;

        // Find original display name for subcategory
        const sampleSubActivity = activities.find(a => 
          a.category?.trim().toLowerCase() === catName &&
          a.subcategory?.trim().toLowerCase() === subName
        );
        const subDisplayName = sampleSubActivity?.subcategory?.trim() || subName;

        subcategories.push({
          name: subName,
          displayName: subDisplayName,
          usageCount: subCount
        });
      }

      // Upsert category
      await Category.findOneAndUpdate(
        { name: catName },
        {
          name: catName,
          displayName: displayName,
          usageCount: categoryCount,
          subcategories: subcategories
        },
        { upsert: true, new: true }
      );

      console.log(`✅ ${displayName.padEnd(15)} → ${categoryCount} activities, ${subcategories.length} subcategories`);
      if (subcategories.length > 0) {
        subcategories.forEach(sub => {
          console.log(`   ↳ ${sub.displayName} (${sub.usageCount})`);
        });
      }
    }

    console.log('\n🎉 Migration complete!');
    console.log('\n📊 Summary:');
    console.log(`   Total activities: ${activities.length}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Total categories: ${categoryMap.size}`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run migration
migrateCategories();