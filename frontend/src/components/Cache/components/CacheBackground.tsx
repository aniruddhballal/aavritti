
interface CacheBackgroundProps {
  isDarkMode: boolean;
}

export const CacheBackground = ({ isDarkMode }: CacheBackgroundProps) => (
  <div 
    className="absolute inset-0 pointer-events-none" 
    style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'gray'} 1px, transparent 0)`,
      backgroundSize: '40px 40px',
      opacity: isDarkMode ? 1 : 0.03
    }} 
  />
);