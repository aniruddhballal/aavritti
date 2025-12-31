import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import { useCacheEntries } from './hooks/useCacheEntries';
import { useDraggableEntries } from './hooks/useDraggableEntries';
import { CacheHeader } from './components/CacheHeader';
import { CacheBackground } from './components/CacheBackground';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { CollapsedEntryIcon } from './components/CollapsedEntryIcon';
import { ExpandedEntryCard } from './components/ExpandedEntryCard';
import { FloatingHints } from './components/FloatingHints';

const Cache = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

  const {
    entries,
    isLoading,
    isCreating,
    savingEntries,
    handleCreateEntry,
    handleTitleChange,
    handleBodyChange,
    handleTitleBlur,
    handleBodyBlur,
    handleDelete,
    updateEntryPosition
  } = useCacheEntries(containerRef);

  const {
    draggedEntry,
    wasDragged,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouchDragging
  } = useDraggableEntries(entries, updateEntryPosition, containerRef);

  const handleIconClick = (id: string) => {
    if (wasDragged) return;
    if (expandedEntryId !== id) {
      setExpandedEntryId(id);
    }
  };

  const handleIconDoubleClick = (id: string) => {
    if (wasDragged) return;
    setExpandedEntryId(id);
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

  // Expand newly created entries
  useEffect(() => {
    if (entries.length > 0 && !expandedEntryId) {
      const latestEntry = entries[entries.length - 1];
      const hasNoContent = !latestEntry.title && !latestEntry.body;
      if (hasNoContent) {
        setTimeout(() => {
          setExpandedEntryId(latestEntry._id);
        }, 100);
      }
    }
  }, [entries.length]);

  return (
    <>
      <DarkModeToggle />
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
        <CacheBackground isDarkMode={isDarkMode} />
        
        <CacheHeader
          isDarkMode={isDarkMode}
          entriesCount={entries.length}
          isCreating={isCreating}
          onBack={() => navigate('/')}
          onCreate={handleCreateEntry}
        />

        {isLoading && <LoadingState isDarkMode={isDarkMode} />}

        {!isLoading && entries.length === 0 && !isCreating && (
          <EmptyState isDarkMode={isDarkMode} />
        )}

        {entries.map((entry) => {
          const isDragged = draggedEntry === entry._id;
          const isHovered = hoveredEntry === entry._id;
          const isExpanded = expandedEntryId === entry._id;
          const isSaving = savingEntries.has(entry._id);

          if (!isExpanded) {
            return (
              <CollapsedEntryIcon
                key={entry._id}
                entry={entry}
                isDarkMode={isDarkMode}
                isDragged={isDragged}
                isHovered={isHovered}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onMouseEnter={() => setHoveredEntry(entry._id)}
                onMouseLeave={() => setHoveredEntry(null)}
                onClick={() => handleIconClick(entry._id)}
                onDoubleClick={() => handleIconDoubleClick(entry._id)}
              />
            );
          }

          return (
            <ExpandedEntryCard
              key={entry._id}
              entry={entry}
              isDarkMode={isDarkMode}
              isDragged={isDragged}
              isSaving={isSaving}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTitleChange={handleTitleChange}
              onBodyChange={handleBodyChange}
              onTitleBlur={handleTitleBlur}
              onBodyBlur={handleBodyBlur}
              onClose={handleCloseExpanded}
              onDelete={handleDelete}
            />
          );
        })}

        {!isLoading && entries.length > 0 && entries.length <= 3 && expandedEntryId === null && (
          <FloatingHints isDarkMode={isDarkMode} />
        )}
      </div>
    </>
  );
};

export default Cache;