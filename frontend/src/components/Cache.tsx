import { useState, useEffect, useRef } from 'react';
import { Trash2, ArrowLeft, Plus, Sparkles, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [savingEntries, setSavingEntries] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track which entry is being dragged
  const [isDraggingEntry, setIsDraggingEntry] = useState<string | null>(null);
  
  // Track which entries have already been animated on mount
  const animatedEntries = useRef<Set<string>>(new Set());
  
  // Double-click and long-press detection
  const longPressTimer = useRef<number | null>(null);

  const createCacheEntry = async (data: { title: string; body: string; position: { x: number; y: number } }) => {
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

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/cache-entries`);
        const data = await response.json();
        
        const entriesWithPositions = data.map((entry: CacheEntry, index: number) => ({
          ...entry,
          position: entry.position || {
            x: 150 + (index % 5) * 120,
            y: 150 + Math.floor(index / 5) * 120
          }
        }));
        
        setEntries(entriesWithPositions);
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
      
      setEntries([...entries, { ...newEntry, position: { x, y } }]);
      
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
        animatedEntries.current.delete(id);
      }
    } catch (error) {
      console.error('Error deleting cache entry:', error);
    }
  };

  const savePosition = async (id: string, x: number, y: number) => {
    try {
      await updateCacheEntry(id, { 
        position: { x, y } 
      });
      
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

  const handleDragEnd = (id: string, info: any) => {
    const entry = entries.find(e => e._id === id);
    if (!entry?.position) return;

    // Calculate final position based on offset
    const newX = entry.position.x + info.offset.x;
    const newY = entry.position.y + info.offset.y;

    // Update state once with final position
    setEntries(entries.map(e => 
      e._id === id 
        ? { ...e, position: { x: newX, y: newY } }
        : e
    ));

    savePosition(id, newX, newY);
    setIsDraggingEntry(null);
  };

  const handleDoubleClick = (id: string) => {
    if (isDraggingEntry !== id) {
      setExpandedEntry(expandedEntry === id ? null : id);
    }
  };

  const handleLongPress = (id: string) => {
    longPressTimer.current = window.setTimeout(() => {
      if (!isDraggingEntry) {
        setExpandedEntry(id);
      }
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClickOutside = () => {
    if (!isDraggingEntry) {
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

  const CacheEntryDot = ({ entry, index }: { entry: CacheEntry; index: number }) => {
    const isExpanded = expandedEntry === entry._id;
    const isSaving = savingEntries.has(entry._id);
    const isDragged = isDraggingEntry === entry._id;
    const position = entry.position || { x: 150, y: 150 };
    
    // Check if this entry should animate on mount
    const shouldAnimateOnMount = !animatedEntries.current.has(entry._id);
    if (shouldAnimateOnMount) {
      animatedEntries.current.add(entry._id);
    }

    return (
      <motion.div
        layout // Smooth position transitions
        drag={!isExpanded}
        dragMomentum={false}
        dragElastic={0.05}
        dragTransition={{ 
          power: 0.1,
          timeConstant: 100
        }}
        onDragStart={() => {
          setIsDraggingEntry(entry._id);
          cancelLongPress();
        }}
        onDragEnd={(e, info) => handleDragEnd(entry._id, info)}
        onDoubleClick={() => handleDoubleClick(entry._id)}
        onTouchStart={() => handleLongPress(entry._id)}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        initial={shouldAnimateOnMount ? { 
          scale: 0, 
          opacity: 0,
          x: position.x,
          y: position.y
        } : {
          x: position.x,
          y: position.y
        }}
        animate={shouldAnimateOnMount ? { 
          scale: 1, 
          opacity: 1,
          x: position.x,
          y: position.y
        } : {
          x: position.x,
          y: position.y
        }}
        transition={shouldAnimateOnMount ? {
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: index * 0.05
        } : {
          type: "spring",
          stiffness: 500,
          damping: 40
        }}
        whileHover={!isExpanded ? { scale: 1.15 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        className={`absolute ${
          isExpanded ? 'w-full sm:w-[400px]' : 'w-12'
        }`}
        style={{
          left: 0,
          top: 0,
          x: '-50%',
          y: '-50%',
          zIndex: isDragged ? 100 : isExpanded ? 50 : 10,
          cursor: isExpanded ? 'default' : 'grab',
          touchAction: isExpanded ? 'auto' : 'none'
        }}
      >
        {/* Dot View (collapsed) */}
        {!isExpanded && (
          <motion.div
            className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center select-none ${
              entry.title
                ? 'from-blue-500 to-indigo-600 shadow-lg'
                : 'from-gray-300 to-gray-400 shadow-md'
            }`}
            whileDrag={{ 
              scale: 1.2,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              cursor: 'grabbing'
            }}
          >
            <motion.div 
              className="w-2 h-2 bg-white rounded-full pointer-events-none"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-blue-300"
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
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1.5 text-xs text-green-600 font-semibold"
                    >
                      <Save size={14} />
                      <span>Saved</span>
                    </motion.div>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleDelete(entry._id, e)}
                className="group ml-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors duration-200"
                title="Delete entry"
              >
                <Trash2 size={20} />
              </motion.button>
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

            {/* Gradient bar */}
            <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-2xl" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative overflow-auto"
      onClick={handleClickOutside}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            window.history.back();
          }}
          className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-gray-200/50"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Calendar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateEntry}
          disabled={isCreating}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white px-4 py-2.5 rounded-xl shadow-lg font-semibold disabled:cursor-not-allowed"
        >
          <motion.div
            animate={{ rotate: isCreating ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus size={20} />
          </motion.div>
          <span>{isCreating ? 'Creating...' : 'New Cache Entry'}</span>
        </motion.button>

        {entries.length > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50"
          >
            <span className="text-sm font-semibold text-gray-600">
              {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            </motion.div>
            <p className="text-xl font-semibold text-gray-600">Loading entries...</p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && !isCreating && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Plus className="w-12 h-12 text-blue-500" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-700 mb-2">No Cache Entries Yet</p>
            <p className="text-lg text-gray-500">Click "New Cache Entry" to create your first one</p>
          </div>
        </motion.div>
      )}

      {/* Cache Entries */}
      <div className="relative w-full h-full">
        {entries.map((entry, index) => (
          <CacheEntryDot key={entry._id} entry={entry} index={index} />
        ))}
      </div>

      {/* Hint */}
      {!isLoading && entries.length === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-4 max-w-sm z-20"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">💡 Pro Tip</h4>
              <div className="text-xs text-gray-600 leading-relaxed space-y-1">
                <p><strong>Desktop:</strong> Double-click to open. Drag to move.</p>
                <p><strong>Mobile:</strong> Long-press to open. Drag to move.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cache;