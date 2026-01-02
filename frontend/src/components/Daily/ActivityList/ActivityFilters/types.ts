import type { ExpandedFilter } from '../types';  // ✅ Remove Category import

export interface ActivityFiltersProps {
  categories: string[];           // ✅ Changed from Category[]
  subcategories: string[];        // ✅ Added this line
  searchTerm: string;
  selectedCategory: string;
  selectedSubcategory: string;
  filterStartTime: string;
  filterEndTime: string;
  expandedFilter: ExpandedFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onTimeChange: (type: 'start' | 'end', value: string) => void;
  onExpandedFilterChange: (filter: ExpandedFilter) => void;
  onClearFilters: () => void;
}