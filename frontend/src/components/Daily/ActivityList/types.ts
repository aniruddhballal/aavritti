export interface Category {
  value: string;
  label: string;
  subcategories?: string[];
}

export type ExpandedFilter = 'search' | 'category' | 'subcategory' | 'time' | null;