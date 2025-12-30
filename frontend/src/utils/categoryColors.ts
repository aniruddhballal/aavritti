export const categoryColors: Record<string, string> = {
  meals: '#FF6B6B',        // Red/Coral
  sleep: '#4ECDC4',       // Teal/Cyan
  japa: '#FFD93D',        // Golden Yellow
  exercise: '#6BCF7F',    // Green
  commute: '#95A5A6',     // Gray
  cinema: '#9B59B6',      // Purple
  reading: '#3498DB',     // Blue
  research: '#E67E22',    // Orange
  writing: '#1ABC9C',     // Turquoise
  project: '#E74C3C',     // Bright Red
  recreation: '#F39C12',  // Amber
  chores: '#FF2D95',      // Vivid Magenta
};

export const getCategoryColor = (category: string): string => {
  return categoryColors[category.toLowerCase()] || '#95A5A6'; // Default gray
};