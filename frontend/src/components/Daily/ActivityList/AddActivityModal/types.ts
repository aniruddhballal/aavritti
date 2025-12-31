export interface Category {
  value: string;
  label: string;
  subcategories?: string[];
}

export interface ActivityFormData {
  category: string;
  subcategory: string;
  title: string;
  duration: string;
  startTime: string;
  endTime: string;
  description: string;
}

export type DurationMode = 'manual' | 'calculated';