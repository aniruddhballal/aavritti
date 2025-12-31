import { Sparkles } from 'lucide-react';

interface FloatingHintsProps {
  isDarkMode: boolean;
}

export const FloatingHints = ({ isDarkMode }: FloatingHintsProps) => (
  <div className={`fixed bottom-6 right-6 backdrop-blur-sm rounded-xl shadow-xl border p-4 max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-500 z-20 ${
    isDarkMode
      ? 'bg-gray-800/95 border-gray-700/50'
      : 'bg-white/95 border-gray-200/50'
  }`}>
    <div className="flex items-start gap-3">
      <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
        isDarkMode ? 'text-blue-400' : 'text-blue-500'
      }`} />
      <div>
        <h4 className={`text-sm font-bold mb-1 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          💡 Pro Tips
        </h4>
        <p className={`text-xs leading-relaxed ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          • Drag icons to organize spatially<br />
          • Click/double-click to open entries<br />
          • Hover for quick preview
        </p>
      </div>
    </div>
  </div>
);