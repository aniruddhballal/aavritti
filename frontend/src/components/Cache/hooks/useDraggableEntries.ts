import { useState, useEffect} from 'react';
import type { RefObject } from 'react';
import type { CacheEntryWithPosition } from './useCacheEntries';

export const useDraggableEntries = (
  entries: CacheEntryWithPosition[],
  updateEntryPosition: (id: string, x: number, y: number) => void,
  savePosition: (id: string, x: number, y: number) => Promise<void>,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const [draggedEntry, setDraggedEntry] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false);
  const [positionChanged, setPositionChanged] = useState<Set<string>>(new Set());
  
  // Touch-specific state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEntryId, setTouchEntryId] = useState<string | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const isInteractiveElement = (target: EventTarget): boolean => {
    const el = target as HTMLElement;
    return el.tagName === 'INPUT' || 
           el.tagName === 'TEXTAREA' ||
           el.tagName === 'BUTTON' ||
           !!el.closest('button');
  };

  const startDrag = (id: string, clientX: number, clientY: number, target: EventTarget) => {
    if (isInteractiveElement(target)) return false;

    setWasDragged(false);

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

    const DRAG_THRESHOLD = 5;
    const entry = entries.find(e => e._id === draggedEntry);
    if (!entry) return;

    const scrollX = containerRef.current?.scrollLeft || 0;
    const scrollY = containerRef.current?.scrollTop || 0;

    const newX = clientX - dragOffset.x + scrollX;
    const newY = clientY - dragOffset.y + scrollY;

    const deltaX = Math.abs(newX - entry.x);
    const deltaY = Math.abs(newY - entry.y);

    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      setWasDragged(true);
    }

    updateEntryPosition(draggedEntry, newX, newY);
    setPositionChanged(prev => new Set(prev).add(draggedEntry));
  };

  const endDrag = async () => {
    if (draggedEntry && positionChanged.has(draggedEntry)) {
      // Actually save the position to the backend
      const entry = entries.find(e => e._id === draggedEntry);
      if (entry) {
        await savePosition(draggedEntry, entry.x, entry.y);
      }
      
      // Clear the position changed flag for this entry
      setPositionChanged(prev => {
        const next = new Set(prev);
        next.delete(draggedEntry);
        return next;
      });
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
    
    const SPATIAL_THRESHOLD = 10;
    const TEMPORAL_THRESHOLD = 200;
    
    if (!isTouchDragging && (deltaX > SPATIAL_THRESHOLD || deltaY > SPATIAL_THRESHOLD || deltaTime > TEMPORAL_THRESHOLD)) {
      const started = startDrag(touchEntryId, touch.clientX, touch.clientY, e.target);
      if (started) {
        setIsTouchDragging(true);
        setWasDragged(true);
      }
    }
    
    if (isTouchDragging) {
      moveDrag(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDragging) {
      endDrag();
    }
    
    setTouchStart(null);
    setTouchEntryId(null);
    setIsTouchDragging(false);
    setWasDragged(false);
  };

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

  return {
    draggedEntry,
    wasDragged,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouchDragging
  };
};