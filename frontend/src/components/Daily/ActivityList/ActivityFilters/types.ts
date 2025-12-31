import type { Category, ExpandedFilter } from '../types';

export interface ActivityFiltersProps {
  categories: Category[];
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
