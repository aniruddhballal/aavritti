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

const cleanupCategoryFields = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Finding all activities...');
    const activities = await Activity.find({}).lean();
    console.log(`📦 Found ${activities.length} activities to process`);

    let removedCategory = 0;
    let convertedSubcategory = 0;
    let skippedSubcategory = 0;
    let errors = 0;

    for (const activity of activities) {
      try {
        const updateFields: any = {};
        const unsetFields: any = {};

        // 1. Remove old 'category' string field if it exists
        if ((activity as any).category !== undefined) {
          unsetFields.category = '';
          removedCategory++;
        }

        // 2. Convert subcategory string to subcategoryId
        if ((activity as any).subcategory && typeof (activity as any).subcategory === 'string') {
          const subcategoryName = (activity as any).subcategory.toLowerCase().trim();
          
          // Find the category to get subcategory ID
          const category = await Category.findById(activity.categoryId);
          
          if (category) {
            const subcategory = category.subcategories.find(
              sub => sub.name.toLowerCase() === subcategoryName
            );
            
            if (subcategory && subcategory._id) {
              updateFields.subcategoryId = subcategory._id;
              unsetFields.subcategory = '';
              convertedSubcategory++;
            } else {
              console.log(`   ⚠️  Subcategory "${subcategoryName}" not found in category "${category.name}" for activity ${activity._id}`);
              skippedSubcategory++;
            }
          } else {
            console.log(`   ⚠️  Category not found for activity ${activity._id}`);
            skippedSubcategory++;
          }
        }

        // Apply updates if there are any
        if (Object.keys(updateFields).length > 0 || Object.keys(unsetFields).length > 0) {
          const update: any = {};
          if (Object.keys(updateFields).length > 0) {
            update.$set = updateFields;
          }
          if (Object.keys(unsetFields).length > 0) {
            update.$unset = unsetFields;
          }

          await Activity.updateOne({ _id: activity._id }, update);
        }

        if ((removedCategory + convertedSubcategory + skippedSubcategory) % 50 === 0) {
          console.log(`   ⏳ Processed ${removedCategory + convertedSubcategory + skippedSubcategory}/${activities.length}...`);
        }
      } catch (err) {
        console.error(`   ❌ Error processing activity ${activity._id}:`, err);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Removed category field: ${removedCategory}`);
    console.log(`   ✅ Converted subcategory to subcategoryId: ${convertedSubcategory}`);
    console.log(`   ⚠️  Skipped subcategories: ${skippedSubcategory}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total activities: ${activities.length}`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

cleanupCategoryFields();