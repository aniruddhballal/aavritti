import { BookOpen } from 'lucide-react';
import { formatTimestamp } from '../utils/cache.utils';
import type { CacheEntryWithPosition } from '../hooks/useCacheEntries';

interface CollapsedEntryIconProps {
  entry: CacheEntryWithPosition;
  isDarkMode: boolean;
  isDragged: boolean;
  isHovered: boolean;
  onMouseDown: (id: string, e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (id: string, e: React.TouchEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onDoubleClick: () => void;
}

export const CollapsedEntryIcon = ({
  entry,
  isDarkMode,
  isDragged,
  isHovered,
  onMouseDown,
  onTouchStart,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDoubleClick
}: CollapsedEntryIconProps) => (
  <div
    className="absolute group"
    style={{
      left: `${entry.x}px`,
      top: `${entry.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: isDragged ? 50 : isHovered ? 30 : 10,
    }}
    onMouseDown={(e) => onMouseDown(entry._id, e)}
    onTouchStart={(e) => onTouchStart(entry._id, e)}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
  >
    <div
      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 ${
        isDragged 
          ? 'scale-110 shadow-2xl rotate-6' 
          : isHovered
          ? 'scale-105 shadow-xl'
          : 'hover:scale-105'
      }`}
      style={{
        cursor: isDragged ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      <BookOpen className="w-6 h-6 text-white" />
    </div>

    {isHovered && !isDragged && (
      <div className={`absolute left-16 top-0 text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-left-2 duration-200 z-50 ${
        isDarkMode
          ? 'bg-gray-800 text-white border border-gray-700'
          : 'bg-gray-900 text-white'
      }`}>
        <div className="font-semibold max-w-[200px] truncate">
          {entry.title || 'Untitled'}
        </div>
        <div className={`text-xs mt-0.5 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-300'
        }`}>
          {formatTimestamp(entry.timestamp)}
        </div>
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${
          isDarkMode ? 'bg-gray-800 border-l border-b border-gray-700' : 'bg-gray-900'
        }`} />
      </div>
    )}
  </div>
);