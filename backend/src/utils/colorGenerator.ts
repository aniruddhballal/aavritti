// Predefined vivid colors pool
const VIVID_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#95A5A6',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C', '#E74C3C',
  '#F39C12', '#FF2D95', '#FF1493', '#2ECC71', '#FF6347',
  '#20B2AA', '#FF69B4', '#BA55D3', '#FF8C00', '#32CD32',
  '#DC143C', '#00CED1', '#FFD700', '#8A2BE2', '#FF4500',
  '#00FA9A', '#FF1493', '#7B68EE', '#FF6347', '#40E0D0'
];

/**
 * Get a color that's not already used by existing categories
 */
export const getUniqueColor = (usedColors: string[]): string => {
  // Find unused colors from the pool
  const availableColors = VIVID_COLORS.filter(color => !usedColors.includes(color));
  
  if (availableColors.length > 0) {
    // Return random unused color
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  
  // If all colors are used, generate a random vivid color
  return generateRandomVividColor();
};

/**
 * Generate a random vivid color
 */
const generateRandomVividColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
  const lightness = 50 + Math.floor(Math.random() * 20);  // 50-70%
  
  return hslToHex(hue, saturation, lightness);
};

/**
 * Convert HSL to Hex
 */
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};