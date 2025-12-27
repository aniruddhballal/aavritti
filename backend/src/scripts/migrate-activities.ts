import mongoose from 'mongoose';
import * as readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import Activity, { 
  ActivityCategory, 
  MealSubcategory, 
  ExerciseSubcategory, 
  CommuteSubcategory, 
  CinemaSubcategory 
} from '../models/Activity'; // Adjust path as needed

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Get subcategories for a category
function getSubcategoriesForCategory(category: string): string[] | null {
  switch (category) {
    case ActivityCategory.MEAL:
      return Object.values(MealSubcategory);
    case ActivityCategory.EXERCISE:
      return Object.values(ExerciseSubcategory);
    case ActivityCategory.COMMUTE:
      return Object.values(CommuteSubcategory);
    case ActivityCategory.CINEMA:
      return Object.values(CinemaSubcategory);
    default:
      return null;
  }
}

// Display categories with numbers
function displayCategories() {
  const categories = Object.values(ActivityCategory);
  console.log('\n📋 Available Categories:');
  categories.forEach((cat, index) => {
    console.log(`  ${index + 1}. ${cat}`);
  });
}

// Display subcategories with numbers
function displaySubcategories(subcategories: string[]) {
  console.log('\n📋 Available Subcategories:');
  subcategories.forEach((sub, index) => {
    console.log(`  ${index + 1}. ${sub}`);
  });
}

async function migrateActivities() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set. Please set it in your .env file.');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all activities
    const activities = await Activity.find({}).sort({ date: 1, timestamp: 1 });
    console.log(`Found ${activities.length} activities to migrate\n`);
    console.log('='.repeat(60));

    let processedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const activity of activities) {
      processedCount++;
      
      console.log(`\n📌 Activity ${processedCount}/${activities.length}`);
      console.log(`   Date: ${activity.date}`);
      console.log(`   Current Category: ${activity.category}`);
      console.log(`   Title: ${activity.title}`);
      if (activity.description) {
        console.log(`   Description: ${activity.description}`);
      }
      console.log(`   Duration: ${activity.duration} minutes`);
      
      // Ask if user wants to update this activity
      const shouldUpdate = await question('\nUpdate this activity? (y/n/quit): ');
      
      if (shouldUpdate.toLowerCase() === 'quit' || shouldUpdate.toLowerCase() === 'q') {
        console.log('\n🛑 Migration stopped by user');
        break;
      }
      
      if (shouldUpdate.toLowerCase() !== 'y') {
        console.log('⏭️  Skipped');
        skippedCount++;
        continue;
      }

      // Display categories and get user choice
      displayCategories();
      const categoryChoice = await question('\nEnter category number or name: ');
      
      // Parse category choice
      let newCategory: string;
      const categoryNum = parseInt(categoryChoice);
      if (!isNaN(categoryNum)) {
        const categories = Object.values(ActivityCategory);
        if (categoryNum < 1 || categoryNum > categories.length) {
          console.log('❌ Invalid category number. Skipping...');
          skippedCount++;
          continue;
        }
        newCategory = categories[categoryNum - 1];
      } else {
        // Check if entered category is valid
        const categories = Object.values(ActivityCategory);
        const foundCategory = categories.find(cat => cat.toLowerCase() === categoryChoice.toLowerCase());
        if (!foundCategory) {
          console.log('❌ Invalid category name. Skipping...');
          skippedCount++;
          continue;
        }
        newCategory = foundCategory;
      }

      console.log(`✓ Selected category: ${newCategory}`);

      // Check if this category needs a subcategory
      const subcategories = getSubcategoriesForCategory(newCategory);
      let newSubcategory: string | undefined = undefined;

      if (subcategories) {
        displaySubcategories(subcategories);
        const subcategoryChoice = await question('\nEnter subcategory number or name: ');
        
        // Parse subcategory choice
        const subcategoryNum = parseInt(subcategoryChoice);
        if (!isNaN(subcategoryNum)) {
          if (subcategoryNum < 1 || subcategoryNum > subcategories.length) {
            console.log('❌ Invalid subcategory number. Skipping...');
            skippedCount++;
            continue;
          }
          newSubcategory = subcategories[subcategoryNum - 1];
        } else {
          const foundSubcategory = subcategories.find(sub => sub.toLowerCase() === subcategoryChoice.toLowerCase());
          if (!foundSubcategory) {
            console.log('❌ Invalid subcategory name. Skipping...');
            skippedCount++;
            continue;
          }
          newSubcategory = foundSubcategory;
        }

        console.log(`✓ Selected subcategory: ${newSubcategory}`);
      }

      // Update the activity
      try {
        activity.category = newCategory as any;
        activity.subcategory = newSubcategory as any;
        
        // Save with validation disabled temporarily to allow the update
        await activity.save({ validateBeforeSave: false });
        
        console.log('✅ Activity updated successfully!');
        updatedCount++;
      } catch (error) {
        console.log(`❌ Error updating activity: ${error}`);
        skippedCount++;
      }

      console.log('-'.repeat(60));
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migration Complete!');
    console.log(`   Total activities: ${activities.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run migration
console.log('🚀 Starting Activity Migration...');
console.log('='.repeat(60));
migrateActivities();