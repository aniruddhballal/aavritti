import { Sparkles } from 'lucide-react';

interface ChartInstructionsProps {
  isDarkMode: boolean;
}

export const ChartInstructions = ({ isDarkMode }: ChartInstructionsProps) => {
  return (
    <div className={`mt-6 pt-4 border-t rounded-xl p-4 relative animate-in slide-in-from-bottom duration-500 border ${
      isDarkMode
        ? 'border-gray-700 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border-blue-800/50'
        : 'border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-100'
    }`}>
      <div className="flex items-start gap-3">
        <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-500'
        }`} />
        <div>
          <h4 className={`text-sm font-bold mb-2 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-900'
          }`}>
            Interactive Chart
          </h4>
          <div className={`text-sm space-y-1.5 leading-relaxed ${
            isDarkMode ? 'text-blue-200/90' : 'text-blue-800/90'
          }`}>
            <p>
              <strong className="font-semibold">Desktop:</strong> Click any slice to see options for zooming in or hiding
            </p>
            <p>
              <strong className="font-semibold">Touch devices:</strong> Tap to zoom in, long-press to hide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};