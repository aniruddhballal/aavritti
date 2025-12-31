import { ZoomIn, EyeOff as HideIcon } from 'lucide-react';
import type { ChartData } from './interactivePieChart.utils';

interface ChartPopoverProps {
  position: { x: number; y: number };
  entry: ChartData;
  canHide: boolean;
  isDarkMode: boolean;
  onZoomIn: () => void;
  onHide: () => void;
  onClose: () => void;
}

export const ChartPopover = ({
  position,
  canHide,
  isDarkMode,
  onZoomIn,
  onHide,
  onClose,
}: ChartPopoverProps) => {
  return (
    <>
      <div 
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      
      <div 
        className={`absolute z-20 backdrop-blur-sm rounded-xl shadow-2xl border py-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/95 border-gray-200/80'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-12px)'
        }}
      >
        <button
          onClick={onZoomIn}
          className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 transition-all duration-150 rounded-lg mx-1 hover:scale-[1.02] ${
            isDarkMode
              ? 'text-gray-200 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ZoomIn size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          <span>Zoom in</span>
        </button>
        {canHide && (
          <button
            onClick={onHide}
            className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 transition-all duration-150 rounded-lg mx-1 hover:scale-[1.02] ${
              isDarkMode
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <HideIcon size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            <span>Hide</span>
          </button>
        )}
      </div>
    </>
  );
};