import { useState, useEffect} from 'react';
import type { RefObject } from 'react';

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

export type CacheEntryWithPosition = CacheEntry & EntryPosition;

export const useCacheEntries = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [entries, setEntries] = useState<CacheEntryWithPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingEntries, setSavingEntries] = useState<Set<string>>(new Set());

  const apiUrl = (path: string) => `${import.meta.env.VITE_API_BASE_URL || ''}${path}`;

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl('/cache-entries'));
        const data = await response.json();
        
        const entriesWithPositions = data.map((entry: CacheEntry, index: number) => ({
          ...entry,
          x: entry.position?.x ?? (250 + (index % 4) * 380),
          y: entry.position?.y ?? (250 + Math.floor(index / 4) * 320)
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

      const response = await fetch(apiUrl('/cache-entries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          body: '',
          position: { x, y }
        }),
      });
      
      const newEntry = await response.json();
      setEntries([...entries, { ...newEntry, x, y }]);
    } catch (error) {
      console.error('Error creating cache entry:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateEntry = async (id: string, data: Partial<CacheEntry>) => {
    setSavingEntries(prev => new Set(prev).add(id));
    try {
      await fetch(apiUrl(`/cache-entries/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      setTimeout(() => {
        setSavingEntries(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 800);
    } catch (error) {
      console.error('Error updating entry:', error);
      setSavingEntries(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
    await updateEntry(id, { title: entry.title });
  };

  const handleBodyBlur = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (!entry) return;
    await updateEntry(id, { body: entry.body });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const entry = entries.find(e => e._id === id);
    const confirmed = window.confirm(
      `Delete "${entry?.title || 'Untitled'}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(apiUrl(`/cache-entries/${id}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry._id !== id));
      }
    } catch (error) {
      console.error('Error deleting cache entry:', error);
    }
  };

  const updateEntryPosition = (id: string, x: number, y: number) => {
    setEntries(entries.map(e => 
      e._id === id ? { ...e, x, y } : e
    ));
  };

  const savePosition = async (id: string, x: number, y: number) => {
    await updateEntry(id, { position: { x, y } });
  };

  return {
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
    updateEntryPosition,
    savePosition
  };
};