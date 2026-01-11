// Central theme configuration - single source of truth for all colors
export const colors = {
  light: {
    // Backgrounds
    bgPrimary: 'bg-gray-50',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-gray-50',
    bgCard: 'bg-white',
    bgInput: 'bg-white',
    bgHover: 'bg-gray-50',
    
    // Borders
    borderPrimary: 'border-gray-200',
    borderSecondary: 'border-gray-300',
    borderDashed: 'border-gray-300',
    
    // Text
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textTertiary: 'text-gray-600',
    textMuted: 'text-gray-500',
    textPlaceholder: 'placeholder:text-gray-400',
    
    // Interactive elements
    buttonPrimary: 'bg-gray-900 text-white hover:bg-black',
    buttonSecondary: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    buttonDisabled: 'bg-gray-200 text-gray-400',
    buttonDanger: 'bg-red-50 text-red-600 hover:bg-red-100',
    
    // Focus states
    focusRing: 'focus:ring-gray-400 focus:border-gray-400',
    
    // Special backgrounds
    bgInfo: 'bg-blue-50 border-blue-200',
    textInfo: 'text-blue-700',
    bgError: 'bg-red-50 border-red-200',
    textError: 'text-red-700',
    
    // Accents
    gradient: 'bg-gradient-to-r from-gray-900 to-gray-600',
    shadow: 'shadow-sm',
  },
  
  dark: {
    // Backgrounds
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    bgTertiary: 'bg-gray-900/50',
    bgCard: 'bg-gray-800',
    bgInput: 'bg-gray-900',
    bgHover: 'bg-gray-700/50',
    
    // Borders
    borderPrimary: 'border-gray-700',
    borderSecondary: 'border-gray-600',
    borderDashed: 'border-gray-600',
    
    // Text
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textTertiary: 'text-gray-400',
    textMuted: 'text-gray-500',
    textPlaceholder: 'placeholder:text-gray-500',
    
    // Interactive elements
    buttonPrimary: 'bg-gray-100 text-gray-900 hover:bg-white',
    buttonSecondary: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
    buttonDisabled: 'bg-gray-700 text-gray-500',
    buttonDanger: 'bg-red-900/30 text-red-400 hover:bg-red-900/50',
    
    // Focus states
    focusRing: 'focus:ring-gray-600 focus:border-gray-600',
    
    // Special backgrounds
    bgInfo: 'bg-blue-900/20 border-blue-800',
    textInfo: 'text-blue-300',
    bgError: 'bg-red-900/30 border-red-800',
    textError: 'text-red-300',
    
    // Accents
    gradient: 'bg-gradient-to-r from-gray-600 to-gray-800',
    shadow: 'shadow-sm',
  }
};

// Helper function to get theme colors based on dark mode state
export const getTheme = (isDarkMode: boolean) => {
  return isDarkMode ? colors.dark : colors.light;
};

// Alternative: If you prefer a function that returns specific color
export const themed = (isDarkMode: boolean, lightClass: string, darkClass: string) => {
  return isDarkMode ? darkClass : lightClass;
};