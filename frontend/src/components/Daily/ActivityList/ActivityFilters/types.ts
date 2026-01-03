import type { ExpandedFilter } from '../types';
import type { CategorySuggestion } from '../../../../types/activity';  // ✅ Add this import

export interface ActivityFiltersProps {
  categories: CategorySuggestion[];  // ✅ Changed from string[]
  subcategories: string[];
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