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
// 14 distinctive vivid colors
const PREDEFINED_COLORS = [
  '#FF6B6B', // Red/Coral
  '#4ECDC4', // Teal/Cyan
  '#FFD93D', // Golden Yellow
  '#6BCF7F', // Green
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#1ABC9C', // Turquoise
  '#E74C3C', // Bright Red
  '#F39C12', // Amber
  '#FF2D95', // Vivid Magenta
  '#2ECC71', // Emerald Green
  '#FF1493', // Deep Pink
  '#20B2AA'  // Light Sea Green
];

const assignColors = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Finding categories without colors...');
    
    const categoriesWithoutColor = await Category.find({
      $or: [
        { color: { $exists: false } },
        { color: null },
        { color: '' }
      ]
    }).sort({ usageCount: -1 });  // Sort by usage, most used first

    console.log(`📦 Found ${categoriesWithoutColor.length} categories without colors\n`);

    if (categoriesWithoutColor.length === 0) {
      console.log('✅ All categories already have colors!');
      await mongoose.disconnect();
      return;
    }

    let updated = 0;
    for (const [index, category] of categoriesWithoutColor.entries()) {
      const color = PREDEFINED_COLORS[index % PREDEFINED_COLORS.length];
      
      category.color = color;
      await category.save();
      
      console.log(`✅ ${category.displayName.padEnd(20)} → ${color}`);
      updated++;
    }

    console.log(`\n🎉 Successfully assigned colors to ${updated} categories!`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Script failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

assignColors();