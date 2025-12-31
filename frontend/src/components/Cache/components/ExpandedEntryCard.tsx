

// ===== components/cache/ExpandedEntryCard.tsx =====
import { GripVertical, Save, X, Trash2 } from 'lucide-react';
import { formatTimestamp } from '../utils/cache.utils';
import type { CacheEntryWithPosition } from '../hooks/useCacheEntries';

interface ExpandedEntryCardProps {
  entry: CacheEntryWithPosition;
  isDarkMode: boolean;
  isDragged: boolean;
  isSaving: boolean;
  onMouseDown: (id: string, e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (id: string, e: React.TouchEvent<HTMLDivElement>) => void;
  onTitleChange: (id: string, value: string) => void;
  onBodyChange: (id: string, value: string) => void;
  onTitleBlur: (id: string) => void;
  onBodyBlur: (id: string) => void;
  onClose: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ExpandedEntryCard = ({
  entry,
  isDarkMode,
  isDragged,
  isSaving,
  onMouseDown,
  onTouchStart,
  onTitleChange,
  onBodyChange,
  onTitleBlur,
  onBodyBlur,
  onClose,
  onDelete
}: ExpandedEntryCardProps) => (
  <div
    id={`expanded-${entry._id}`}
    className={`absolute rounded-2xl shadow-2xl border-2 transition-all duration-200 ${
      isDarkMode
        ? isDragged 
          ? 'bg-gray-800 border-blue-500 shadow-2xl scale-105'
          : 'bg-gray-800 border-blue-400'
        : isDragged 
          ? 'bg-white border-blue-400 shadow-2xl scale-105'
          : 'bg-white border-blue-300'
    }`}
    style={{
      left: `${entry.x}px`,
      top: `${entry.y}px`,
      width: window.innerWidth < 640 ? 'min(340px, calc(100vw - 40px))' : '340px',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      touchAction: 'none'
    }}
  >
    <div 
      className={`flex items-center justify-between p-4 pb-3 border-b transition-colors duration-200 ${
        isDarkMode
          ? isDragged 
            ? 'border-blue-900/50 bg-blue-900/20'
            : 'border-gray-700'
          : isDragged 
            ? 'border-blue-200 bg-blue-50/50'
            : 'border-gray-100'
      }`}
      onMouseDown={(e) => onMouseDown(entry._id, e)}
      onTouchStart={(e) => onTouchStart(entry._id, e)}
      style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <GripVertical 
          size={20} 
          className={`flex-shrink-0 transition-all duration-200 ${
            isDragged 
              ? 'text-blue-500' 
              : isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}
        />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            isDarkMode
              ? 'text-gray-400 bg-gray-700'
              : 'text-gray-500 bg-gray-100'
          }`}>
            {formatTimestamp(entry.timestamp)}
          </div>
          {isSaving && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold animate-in fade-in zoom-in duration-200">
              <Save size={14} />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onTouchStart={(e) => e.stopPropagation()}
          className={`p-2.5 rounded-lg transition-all duration-200 ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 active:bg-gray-600'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200'
          }`}
          title="Close"
        >
          <X size={20} />
        </button>
        <button
          onClick={(e) => onDelete(entry._id, e)}
          onTouchStart={(e) => e.stopPropagation()}
          className={`group p-2.5 rounded-lg transition-all duration-200 ${
            isDarkMode
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30 active:bg-red-900/50'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100'
          }`}
          title="Delete entry"
        >
          <Trash2 size={20} className="transition-transform duration-200 group-hover:scale-110" />
        </button>
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <label className={`block text-xs font-bold mb-1.5 tracking-tight ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          TITLE
        </label>
        <input
          type="text"
          value={entry.title}
          onChange={(e) => onTitleChange(entry._id, e.target.value)}
          onBlur={() => onTitleBlur(entry._id)}
          placeholder="Enter a title..."
          className={`w-full px-3.5 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-semibold ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 hover:border-gray-500'
              : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 hover:border-gray-300'
          } placeholder:font-normal`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ touchAction: 'auto' }}
        />
      </div>

      <div>
        <label className={`block text-xs font-bold mb-1.5 tracking-tight ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          CONTENT
        </label>
        <textarea
          value={entry.body}
          onChange={(e) => onBodyChange(entry._id, e.target.value)}
          onBlur={() => onBodyBlur(entry._id)}
          placeholder="Write your thoughts here..."
          rows={5}
          className={`w-full px-3.5 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none leading-relaxed ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder:text-gray-500 hover:border-gray-500'
              : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 hover:border-gray-300'
          }`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ touchAction: 'auto' }}
        />
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-2xl" />
  </div>
);