import type { Activity } from '../../../types/activity';
import { getCategoryColor } from '../../../utils/categoryColors';

export interface ChartData {
  name: string;
  value: number;
  hours: string;
  color: string;
  category?: string;
  subcategory?: string;
  activityId?: string;
  [key: string]: any;
}

export type DrillLevel = 'category' | 'subcategory' | 'activity';

/**
 * Check if a category has any activities with subcategories
 */
export const hasSubcategories = (activities: Activity[], category: string): boolean => {
  return activities.some(
    activity => activity.category === category && activity.subcategory
  );
};

/**
 * Get category-level data aggregated from activities
 */
export const getCategoryData = (
  activities: Activity[],
  categories: string[],
  hiddenCategories: Set<string>
): ChartData[] => {
  if (!activities || activities.length === 0) return [];

  const categoryTotals: Record<string, number> = {};
  
  activities.forEach(activity => {
    const category = activity.category || categories[0];
    if (!hiddenCategories.has(category)) {
      const duration = activity.duration || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + duration;
    }
  });

  return Object.entries(categoryTotals).map(([category, minutes]) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: minutes,
      hours: `${hours}h ${mins}m`,
      color: getCategoryColor(category),
      category: category
    };
  });
};

/**
 * Get subcategory-level data for a specific category
 */
export const getSubcategoryData = (
  activities: Activity[],
  category: string,
  hiddenSubcategories: Set<string>
): ChartData[] => {
  if (!activities || activities.length === 0) return [];

  const subcategoryTotals: Record<string, number> = {};
  
  activities
    .filter(activity => activity.category === category && activity.subcategory)
    .forEach(activity => {
      const subcategory = activity.subcategory!;
      if (!hiddenSubcategories.has(subcategory)) {
        const duration = activity.duration || 0;
        subcategoryTotals[subcategory] = (subcategoryTotals[subcategory] || 0) + duration;
      }
    });

  const baseColor = getCategoryColor(category);
  const entries = Object.entries(subcategoryTotals);
  
  return entries.map(([subcategory, minutes], index) => {
    const hue = parseInt(baseColor.slice(1, 3), 16);
    const sat = parseInt(baseColor.slice(3, 5), 16);
    const light = parseInt(baseColor.slice(5, 7), 16);
    
    const variation = Math.floor((index * 40) % 80) - 40;
    const newLight = Math.max(50, Math.min(200, light + variation));
    const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return {
      name: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
      value: minutes,
      hours: `${hours}h ${mins}m`,
      color: variedColor,
      subcategory: subcategory
    };
  });
};

/**
 * Get activity-level data (individual activities)
 */
export const getActivityData = (
  activities: Activity[],
  category: string,
  subcategory?: string
): ChartData[] => {
  if (!activities || activities.length === 0) return [];

  const filteredActivities = activities.filter(activity => {
    if (activity.category !== category) return false;
    if (subcategory && activity.subcategory !== subcategory) return false;
    return true;
  });

  const baseColor = getCategoryColor(category);
  
  return filteredActivities.map((activity, index) => {
    const hue = parseInt(baseColor.slice(1, 3), 16);
    const sat = parseInt(baseColor.slice(3, 5), 16);
    const light = parseInt(baseColor.slice(5, 7), 16);
    
    const variation = Math.floor((index * 30) % 100) - 30;
    const newLight = Math.max(50, Math.min(200, light + variation));
    const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

    const minutes = activity.duration || 0;
    const hours = Math.floor(minutes / 60);

    return {
      name: activity.title,
      value: minutes,
      hours: `${hours}h ${minutes}m`,
      color: variedColor,
      activityId: activity._id
    };
  });
};

/**
 * Determine what data to display based on drill level
 */
export const getDisplayData = (
  activities: Activity[],
  categories: string[],
  drillLevel: DrillLevel,
  drilldownCategory: string | null,
  drilldownSubcategory: string | null,
  hiddenCategories: Set<string>,
  hiddenSubcategories: Set<string>
): ChartData[] => {
  if (drillLevel === 'category') {
    const categoryData = getCategoryData(activities, categories, hiddenCategories);
    return categoryData.filter(cat => !hiddenCategories.has(cat.category || ''));
  } else if (drillLevel === 'subcategory' && drilldownCategory) {
    return getSubcategoryData(activities, drilldownCategory, hiddenSubcategories);
  } else if (drillLevel === 'activity' && drilldownCategory) {
    return getActivityData(activities, drilldownCategory, drilldownSubcategory || undefined);
  }
  return [];
};

/**
 * Get breadcrumb path for current drill state
 */
export const getBreadcrumb = (
  drillLevel: DrillLevel,
  drilldownCategory: string | null,
  drilldownSubcategory: string | null
): string => {
  const parts = [];
  if (drillLevel !== 'category' && drilldownCategory) {
    parts.push(drilldownCategory.charAt(0).toUpperCase() + drilldownCategory.slice(1));
  }
  if (drillLevel === 'activity' && drilldownSubcategory) {
    parts.push(drilldownSubcategory.charAt(0).toUpperCase() + drilldownSubcategory.slice(1));
  }
  return parts.join(' → ');
};