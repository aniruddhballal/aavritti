import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Sparkles, Save } from 'lucide-react';

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

const Cache = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [savingEntries, setSavingEntries] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag state
  const [draggedEntry, setDraggedEntry] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Desktop: click and hold detection
  const mouseDownTime = useRef<number>(0);
  const mouseDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragThreshold = 5; // pixels movement to consider it a drag
  const holdThreshold = 200; // ms to consider it a hold (for drag)
  
  // Mobile: long press detection
  const touchStartTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimeout = useRef<number | null>(null);
  const longPressThreshold = 500; // ms for long press to open

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
        
        // Use stored positions if available, otherwise assign grid positions
        const entriesWithPositions = data.map((entry: CacheEntry, index: number) => ({
          ...entry,
          position: entry.position || {
            x: 150 + (index % 5) * 120,
            y: 150 + Math.floor(index / 5) * 120
          }
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
      setEntries([...entries, { ...newEntry, position: { x, y } }]);
      
      // Auto-expand the new entry
      setTimeout(() => {
        setExpandedEntry(newEntry._id);
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
        setExpandedEntry(null);
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
      }, 800);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  // Desktop: Mouse handlers
  const handleMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const entry = entries.find(e => e._id === id);
    if (!entry || !entry.position) return;

    mouseDownTime.current = Date.now();
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    
    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;

    setDragOffset({
      x: e.clientX - entry.position.x + scrollX,
      y: e.clientY - entry.position.y + scrollY
    });
  };

  const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownTime.current === 0) return;

    const timeDiff = Date.now() - mouseDownTime.current;
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    const hasMoved = dx > dragThreshold || dy > dragThreshold;

    // Start dragging if held long enough and moved
    if (timeDiff > holdThreshold && hasMoved && !isDragging) {
      setIsDragging(true);
      setDraggedEntry(id);
    }

    // Update position while dragging
    if (isDragging && draggedEntry === id) {
      const scrollX = containerRef.current?.scrollLeft || 0;
      const scrollY = containerRef.current?.scrollTop || 0;

      setEntries(entries.map(entry => 
        entry._id === id 
          ? { 
              ...entry, 
              position: {
                x: e.clientX - dragOffset.x + scrollX,
                y: e.clientY - dragOffset.y + scrollY
              }
            } 
          : entry
      ));
    }
  };

  const handleMouseUp = (id: string) => {    
    // If dragging, save position
    if (isDragging && draggedEntry === id) {
      const entry = entries.find(e => e._id === id);
      if (entry && entry.position) {
        savePosition(id, entry.position.x, entry.position.y);
      }
    }
    
    mouseDownTime.current = 0;
    setDraggedEntry(null);
    setIsDragging(false);
  };

  const handleDoubleClick = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) {
      setExpandedEntry(expandedEntry === id ? null : id);
    }
  };

  // Mobile: Touch handlers
  const handleTouchStart = (id: string, e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartTime.current = Date.now();
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    const entry = entries.find(e => e._id === id);
    if (!entry || !entry.position) return;

    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;

    setDragOffset({
      x: touch.clientX - entry.position.x + scrollX,
      y: touch.clientY - entry.position.y + scrollY
    });

    // Set up long press detection for opening
    longPressTimeout.current = window.setTimeout(() => {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      
      // Only open if haven't moved much (not dragging)
      if (dx < dragThreshold && dy < dragThreshold) {
        setExpandedEntry(id);
        touchStartTime.current = 0; // Cancel drag
      }
    }, longPressThreshold);
  };

  const handleTouchMove = (id: string, e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartTime.current === 0) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    // If moved, cancel long press and start dragging
    if (dx > dragThreshold || dy > dragThreshold) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      if (!isDragging) {
        setIsDragging(true);
        setDraggedEntry(id);
      }
    }

    // Update position while dragging
    if (isDragging && draggedEntry === id) {
      e.preventDefault();
      
      const scrollX = containerRef.current?.scrollLeft || 0;
      const scrollY = containerRef.current?.scrollTop || 0;

      setEntries(entries.map(entry => 
        entry._id === id 
          ? { 
              ...entry, 
              position: {
                x: touch.clientX - dragOffset.x + scrollX,
                y: touch.clientY - dragOffset.y + scrollY
              }
            } 
          : entry
      ));
    }
  };

  const handleTouchEnd = (id: string) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    // If dragging, save position
    if (isDragging && draggedEntry === id) {
      const entry = entries.find(e => e._id === id);
      if (entry && entry.position) {
        savePosition(id, entry.position.x, entry.position.y);
      }
    }

    touchStartTime.current = 0;
    setDraggedEntry(null);
    setIsDragging(false);
  };

  const handleClickOutside = () => {
    if (!isDragging) {
      setExpandedEntry(null);
    }
  };

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
      className="w-full h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative overflow-auto"
      onClick={handleClickOutside}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/');
          }}
          className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all duration-200 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:scale-105 active:scale-95"
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
          <div className="ml-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
            <span className="text-sm font-semibold text-gray-600">
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-pulse" />
            <p className="text-xl font-semibold text-gray-600">Loading entries...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && !isCreating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Plus className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-700 mb-2">No Cache Entries Yet</p>
            <p className="text-lg text-gray-500">Click "New Cache Entry" to create your first one</p>
          </div>
        </div>
      )}

      {/* Cache Entries as Positioned Dots */}
      <div className="relative w-full h-full">
        {entries.map((entry, index) => {
          const isExpanded = expandedEntry === entry._id;
          const isSaving = savingEntries.has(entry._id);
          const isDragged = draggedEntry === entry._id;
          const position = entry.position || { x: 150, y: 150 };

          return (
            <div
              key={entry._id}
              className={`absolute transition-all ${
                isDragging && isDragged ? 'duration-0' : 'duration-300'
              } ${isExpanded ? 'w-full sm:w-[400px]' : 'w-12'}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isDragged ? 100 : isExpanded ? 50 : 10,
                cursor: isDragged ? 'grabbing' : 'grab'
              }}
            >
              {/* Dot View (collapsed) */}
              {!isExpanded && (
                <div
                  onDoubleClick={(e) => handleDoubleClick(entry._id, e)}
                  onMouseDown={(e) => handleMouseDown(entry._id, e)}
                  onMouseMove={(e) => handleMouseMove(entry._id, e)}
                  onMouseUp={() => handleMouseUp(entry._id)}
                  onTouchStart={(e) => handleTouchStart(entry._id, e)}
                  onTouchMove={(e) => handleTouchMove(entry._id, e)}
                  onTouchEnd={() => handleTouchEnd(entry._id)}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br transition-all duration-300 flex items-center justify-center select-none ${
                    isDragged 
                      ? 'scale-110 shadow-2xl'
                      : entry.title
                      ? 'from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-110'
                      : 'from-gray-300 to-gray-400 shadow-md hover:shadow-lg hover:scale-110'
                  }`}
                >
                  <div className="w-2 h-2 bg-white rounded-full pointer-events-none" />
                </div>
              )}

              {/* Expanded View */}
              {isExpanded && (
                <div
                  className="bg-white rounded-2xl shadow-xl border-2 border-blue-300 transition-all duration-200 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
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
                    <button
                      onClick={(e) => handleDelete(entry._id, e)}
                      className="group ml-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Delete entry"
                    >
                      <Trash2 size={20} className="transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 tracking-tight">
                        TITLE
                      </label>
                      <input
                        type="text"
                        value={entry.title}
                        onChange={(e) => handleTitleChange(entry._id, e.target.value)}
                        onBlur={() => handleTitleBlur(entry._id)}
                        placeholder="Enter a title..."
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal hover:border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus={index === entries.length - 1}
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 tracking-tight">
                        CONTENT
                      </label>
                      <textarea
                        value={entry.body}
                        onChange={(e) => handleBodyChange(entry._id, e.target.value)}
                        onBlur={() => handleBodyBlur(entry._id)}
                        placeholder="Write your thoughts here..."
                        rows={5}
                        className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-700 placeholder:text-gray-400 leading-relaxed hover:border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Subtle gradient overlay at bottom */}
                  <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-2xl" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating hint */}
      {!isLoading && entries.length === 1 && (
        <div className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-4 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500 z-20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">💡 Pro Tip</h4>
              <div className="text-xs text-gray-600 leading-relaxed space-y-1">
                <p><strong>Desktop:</strong> Double-click to open. Click & hold to drag.</p>
                <p><strong>Mobile:</strong> Long-press to open. Tap & drag to move.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cache;