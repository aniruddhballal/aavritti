import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});
import mongoose from 'mongoose';
import Category from '../models/Category';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI;

const extractCategoriesAndSubcategories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean();

    console.log(`📦 Found ${categories.length} categories\n`);
    console.log('='.repeat(80));

    categories.forEach((cat, index) => {
      console.log(`\n${index + 1}. ${cat.displayName} (${cat.name})`);
      console.log(`   Color: ${cat.color}`);
      console.log(`   Usage Count: ${cat.usageCount}`);
      console.log(`   ID: ${cat._id}`);
      
      if (cat.subcategories && cat.subcategories.length > 0) {
        console.log(`   Subcategories (${cat.subcategories.length}):`);
        cat.subcategories.forEach((sub, subIndex) => {
          console.log(`      ${subIndex + 1}. ${sub.displayName} (${sub.name})`);
          console.log(`         Usage Count: ${sub.usageCount}`);
          console.log(`         ID: ${sub._id}`);
        });
      } else {
        console.log(`   Subcategories: None`);
      }
      console.log('   ' + '-'.repeat(76));
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Total Categories: ${categories.length}`);
    
    const totalSubcategories = categories.reduce(
      (sum, cat) => sum + (cat.subcategories?.length || 0), 
      0
    );
    console.log(`   Total Subcategories: ${totalSubcategories}`);
    
    const categoriesWithSubs = categories.filter(
      cat => cat.subcategories && cat.subcategories.length > 0
    );
    console.log(`   Categories with Subcategories: ${categoriesWithSubs.length}`);
    console.log(`   Categories without Subcategories: ${categories.length - categoriesWithSubs.length}`);

    // Export as JSON for future use
    console.log('\n📋 JSON Export:');
    const exportData = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      displayName: cat.displayName,
      color: cat.color,
      usageCount: cat.usageCount,
      subcategories: (cat.subcategories || []).map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        displayName: sub.displayName,
        usageCount: sub.usageCount
      }))
    }));
    
    console.log(JSON.stringify(exportData, null, 2));

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Script failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

extractCategoriesAndSubcategories();