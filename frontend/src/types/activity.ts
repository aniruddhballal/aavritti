// ============================================================================
// Activity Types - Flexible Category System
// ============================================================================

/**
 * Activity record returned from the API
 */
export interface Activity {
  _id: string;
  date: string;
  category: string;        // User-defined, learned by system
  subcategory?: string;    // User-defined, optional
  title: string;
  description?: string;
  duration: number;        // Duration in minutes (required)
  startTime?: string;      // HH:MM format (optional)
  endTime?: string;        // HH:MM format (optional)
  createdAt: string;       // ISO timestamp from MongoDB
  updatedAt: string;       // ISO timestamp from MongoDB
  categoryColor?: string;  // ✅ Hex color from backend
}

/**
 * Data required to create a new activity
 */
export interface CreateActivityData {
  date: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  duration: number;
  startTime?: string;
  endTime?: string;
}

/**
 * Daily summary data returned from the API
 */
export interface DailyData {
  date: string;
  activities: Activity[];
  totalActivities: number;
  totalDuration: number;  // Total minutes for the day
}

/**
 * Subcategory suggestion with usage metadata
 */
export interface SubcategorySuggestion {
  name: string;           // Normalized name (lowercase)
  displayName: string;    // Original user input
  usageCount: number;     // How often it's been used
}

/**
 * Category suggestion with usage metadata and subcategories
 */
export interface CategorySuggestion {
  name: string;                          // Normalized name (lowercase)
  displayName: string;                   // Original user input
  color: string;                         // Hex color code
  usageCount: number;                    // How often it's been used
  subcategories: SubcategorySuggestion[]; // ✅ Add subcategories array
}