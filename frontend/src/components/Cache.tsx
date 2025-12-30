import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, GripVertical, Sparkles, Save, X, BookOpen } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

interface CacheEntry {
  _id: string;
  title: string;
  body: string;
  timestamp: Date;
  position?: {
    x: number;
    y: number;
  };
}

interface EntryPosition {
  x: number;
  y: number;
}

const Cache = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [entries, setEntries] = useState<(CacheEntry & EntryPosition)[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedEntry, setDraggedEntry] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [savingEntries, setSavingEntries] = useState<Set<string>>(new Set());
  const [wasDragged, setWasDragged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Touch-specific state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEntryId, setTouchEntryId] = useState<string | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [positionChanged, setPositionChanged] = useState<Set<string>>(new Set());
  
  const createCacheEntry = async (data: { title: string; body: string; position?: { x: number; y: number } }) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/cache-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const updateCacheEntry = async (id: string, data: Partial<CacheEntry>) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/cache-entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  };

  // Fetch all entries on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/cache-entries`);
        const data = await response.json();
        
        // Use stored positions if available, otherwise assign default positions
        const entriesWithPositions = data.map((entry: CacheEntry, index: number) => ({
          ...entry,
          x: entry.position?.x ?? (250 + (index % 4) * 380),
          y: entry.position?.y ?? (250 + Math.floor(index / 4) * 320)
        }));
        
        setEntries(entriesWithPositions);
        console.log('Fetched cache entries:', entriesWithPositions);
      } catch (error) {
        console.error('Error fetching cache entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleCreateEntry = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      // Position new entry in center of viewport with scroll offset
      const scrollX = containerRef.current?.scrollLeft || 0;
      const scrollY = containerRef.current?.scrollTop || 0;
      const x = window.innerWidth / 2 + scrollX;
      const y = window.innerHeight / 2 + scrollY;

      const newEntry = await createCacheEntry({
        title: '',
        body: '',
        position: { x, y }
      });
      
      console.log('Created new cache entry:', newEntry);

      setEntries([...entries, { ...newEntry, x, y }]);
      
      // Expand the new entry immediately
      setTimeout(() => {
        setExpandedEntryId(newEntry._id);
      }, 100);
    } catch (error) {
      console.error('Error creating cache entry:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTitleChange = (id: string, value: string) => {
    setEntries(entries.map(entry => 
      entry._id === id ? { ...entry, title: value } : entry
    ));
  };

  const handleBodyChange = (id: string, value: string) => {
    setEntries(entries.map(entry => 
      entry._id === id ? { ...entry, body: value } : entry
    ));
  };

  const handleTitleBlur = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (!entry) return;

    setSavingEntries(prev => new Set(prev).add(id));
    try {
      await updateCacheEntry(id, { title: entry.title });
      console.log('Updated title for entry:', id);
      
      setTimeout(() => {
        setSavingEntries(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 800);
    } catch (error) {
      console.error('Error updating title:', error);
      setSavingEntries(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBodyBlur = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (!entry) return;

    setSavingEntries(prev => new Set(prev).add(id));
    try {
      await updateCacheEntry(id, { body: entry.body });
      console.log('Updated body for entry:', id);
      
      setTimeout(() => {
        setSavingEntries(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 800);
    } catch (error) {
      console.error('Error updating body:', error);
      setSavingEntries(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const entry = entries.find(e => e._id === id);
    const confirmed = window.confirm(
      `Delete "${entry?.title || 'Untitled'}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/cache-entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry._id !== id));
        if (expandedEntryId === id) {
          setExpandedEntryId(null);
        }
        console.log('Deleted cache entry:', id);
      } else {
        console.error('Failed to delete cache entry');
      }
    } catch (error) {
      console.error('Error deleting cache entry:', error);
    }
  };

  // Save position to backend
  const savePosition = async (id: string, x: number, y: number) => {
    try {
      await updateCacheEntry(id, { 
        position: { x, y } 
      });
      console.log('Saved position for entry:', id, { x, y });
      
      setSavingEntries(prev => new Set(prev).add(id));
      setTimeout(() => {
        setSavingEntries(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setPositionChanged(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 800);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  // Unified drag handlers
  const startDrag = (id: string, clientX: number, clientY: number, target: EventTarget) => {
    // Don't start drag if clicking/touching on input elements or buttons
    if ((target as HTMLElement).tagName === 'INPUT' || 
        (target as HTMLElement).tagName === 'TEXTAREA' ||
        (target as HTMLElement).tagName === 'BUTTON' ||
        (target as HTMLElement).closest('button')) {
      return false;
    }

    setWasDragged(false); // Reset drag flag at start of interaction

    const entry = entries.find(e => e._id === id);
    if (!entry) return false;

    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;

    setDraggedEntry(id);
    setDragOffset({
      x: clientX - entry.x + scrollX,
      y: clientY - entry.y + scrollY
    });

    return true;
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!draggedEntry) return;

    const DRAG_THRESHOLD = 5; // pixels
    const entry = entries.find(e => e._id === draggedEntry);
    if (!entry) return;

    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;

    const newX = clientX - dragOffset.x + scrollX;
    const newY = clientY - dragOffset.y + scrollY;

    // Check if movement exceeds threshold
    const deltaX = Math.abs(newX - entry.x);
    const deltaY = Math.abs(newY - entry.y);

    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      setWasDragged(true);
    }

    setEntries(entries.map(e => 
      e._id === draggedEntry 
        ? { ...e, x: newX, y: newY } 
        : e
    ));

    setPositionChanged(prev => new Set(prev).add(draggedEntry));
  };

  const endDrag = () => {
    if (draggedEntry && positionChanged.has(draggedEntry)) {
      const entry = entries.find(e => e._id === draggedEntry);
      if (entry) {
        savePosition(draggedEntry, entry.x, entry.y);
      }
    }
    
    setDraggedEntry(null);
  };

  // Mouse handlers
  const handleMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const started = startDrag(id, e.clientX, e.clientY, e.target);
    if (started) {
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    moveDrag(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    endDrag();
  };

  // Touch handlers
  const handleTouchStart = (id: string, e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    
    // Record which entry this touch started on
    setTouchEntryId(id);
    setTouchStart({ 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now() 
    });
    setIsTouchDragging(false);
    setWasDragged(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !touchEntryId) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;
    
    const SPATIAL_THRESHOLD = 10; // pixels
    const TEMPORAL_THRESHOLD = 200; // milliseconds
    
    // Classify gesture: start dragging if moved beyond threshold or held long enough
    if (!isTouchDragging && (deltaX > SPATIAL_THRESHOLD || deltaY > SPATIAL_THRESHOLD || deltaTime > TEMPORAL_THRESHOLD)) {
      const started = startDrag(touchEntryId, touch.clientX, touch.clientY, e.target);
      if (started) {
        setIsTouchDragging(true);
        setWasDragged(true);
      }
    }
    
    // Continue dragging if already started
    if (isTouchDragging) {
      moveDrag(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    // End any active drag
    if (isTouchDragging) {
      endDrag();
    }
    
    // If it was a tap (no drag initiated), open the entry
    if (!wasDragged && touchEntryId && expandedEntryId !== touchEntryId) {
      setExpandedEntryId(touchEntryId);
    }
    
    // Reset all touch state
    setTouchStart(null);
    setTouchEntryId(null);
    setIsTouchDragging(false);
    setWasDragged(false);
  };

  // Double-click to expand collapsed entry (desktop)
  const handleIconDoubleClick = (id: string) => {
    if (wasDragged) return;
    setExpandedEntryId(id);
  };

  // Single click for desktop
  const handleIconClick = (id: string) => {
    if (wasDragged) return;
    if (expandedEntryId !== id) {
      setExpandedEntryId(id);
    }
  };

  const handleCloseExpanded = () => {
    setExpandedEntryId(null);
  };

  // Click outside to close expanded entry
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedEntryId && !draggedEntry) {
        const expandedElement = document.getElementById(`expanded-${expandedEntryId}`);
        if (expandedElement && !expandedElement.contains(e.target as Node)) {
          setExpandedEntryId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedEntryId, draggedEntry]);

  // Global mouse/touch up handlers
  useEffect(() => {
    if (draggedEntry) {
      const handleGlobalMouseUp = () => endDrag();
      const handleGlobalTouchEnd = () => {
        if (isTouchDragging) {
          endDrag();
          setIsTouchDragging(false);
          setTouchStart(null);
          setTouchEntryId(null);
          setWasDragged(false);
        }
      };
      
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [draggedEntry, isTouchDragging]);

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-screen relative overflow-auto transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: draggedEntry ? 'grabbing' : 'default',
        touchAction: isTouchDragging ? 'none' : 'auto'
      }}
    >
      {/* Animated background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'gray'} 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          opacity: isDarkMode ? 1 : 0.03
        }} 
      />

      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/');
          }}
          className={`group flex items-center gap-2 transition-all duration-200 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
            isDarkMode
              ? 'text-gray-300 hover:text-gray-100 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50'
              : 'text-gray-700 hover:text-gray-900 bg-white/90 backdrop-blur-sm border border-gray-200/50'
          }`}
        >
          <ArrowLeft size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="font-semibold">Back to Calendar</span>
        </button>

        <button
          onClick={handleCreateEntry}
          disabled={isCreating}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus size={20} className={`transition-transform duration-300 ${isCreating ? 'rotate-90' : 'group-hover:rotate-90'}`} />
          <span>{isCreating ? 'Creating...' : 'New Cache Entry'}</span>
        </button>

        {entries.length > 0 && (
          <div className={`ml-2 px-4 py-2.5 rounded-xl shadow-lg border ${
            isDarkMode
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50'
              : 'bg-white/90 backdrop-blur-sm border-gray-200/50'
          }`}>
            <span className={`text-sm font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <Sparkles className={`w-12 h-12 mx-auto mb-3 animate-pulse ${
              isDarkMode ? 'text-blue-400' : 'text-blue-500'
            }`} />
            <p className={`text-xl font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading entries...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && !isCreating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100'
            }`}>
              <Plus className={`w-12 h-12 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-500'
              }`} />
            </div>
            <p className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              No Cache Entries Yet
            </p>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Click "New Cache Entry" to create your first one
            </p>
          </div>
        </div>
      )}

      {/* Cache Entries */}
      {entries.map((entry) => {
        const isDragged = draggedEntry === entry._id;
        const isHovered = hoveredEntry === entry._id;
        const isExpanded = expandedEntryId === entry._id;
        const isSaving = savingEntries.has(entry._id);

        // Render collapsed icon
        if (!isExpanded) {
          return (
            <div
              key={entry._id}
              className="absolute group"
              style={{
                left: `${entry.x}px`,
                top: `${entry.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isDragged ? 50 : isHovered ? 30 : 10,
              }}
              onMouseDown={(e) => handleMouseDown(entry._id, e)}
              onTouchStart={(e) => handleTouchStart(entry._id, e)}
              onMouseEnter={() => setHoveredEntry(entry._id)}
              onMouseLeave={() => setHoveredEntry(null)}
              onClick={() => handleIconClick(entry._id)}
              onDoubleClick={() => handleIconDoubleClick(entry._id)}
            >
              {/* Collapsed Icon */}
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

              {/* Hover Tooltip */}
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
                  {/* Tooltip arrow */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${
                    isDarkMode ? 'bg-gray-800 border-l border-b border-gray-700' : 'bg-gray-900'
                  }`} />
                </div>
              )}
            </div>
          );
        }

        // Render expanded card
        return (
          <div
            key={entry._id}
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
            {/* Drag Handle Header */}
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
              onMouseDown={(e) => handleMouseDown(entry._id, e)}
              onTouchStart={(e) => handleTouchStart(entry._id, e)}
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
                    handleCloseExpanded();
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
                  onClick={(e) => handleDelete(entry._id, e)}
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

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 tracking-tight ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  TITLE
                </label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => handleTitleChange(entry._id, e.target.value)}
                  onBlur={() => handleTitleBlur(entry._id)}
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

              {/* Body */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 tracking-tight ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  CONTENT
                </label>
                <textarea
                  value={entry.body}
                  onChange={(e) => handleBodyChange(entry._id, e.target.value)}
                  onBlur={() => handleBodyBlur(entry._id)}
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

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-2xl" />
          </div>
        );
      })}

      {/* Floating hint */}
      {!isLoading && entries.length > 0 && entries.length <= 3 && expandedEntryId === null && (
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
      )}
    </div>
  );
};

export default Cache;