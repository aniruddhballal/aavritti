import { useState } from 'react';
import { createCacheEntry } from '../api/api';
import type { CacheEntry } from '../api/api';
import { Trash2 } from 'lucide-react';

interface EntryPosition {
  x: number;
  y: number;
}

const Cache = () => {
  const [entries, setEntries] = useState<(CacheEntry & EntryPosition)[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // Get click position relative to the viewport
    const x = e.clientX;
    const y = e.clientY;

    // Check if click is on an existing entry (we'll ignore those clicks)
    const target = e.target as HTMLElement;
    if (target.closest('.cache-entry-box')) {
      return;
    }

    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      const newEntry = await createCacheEntry({
        title: '',
        body: ''
      });
      
      console.log('Created new cache entry:', newEntry);
      
      // Add the new entry with its position
      setEntries([...entries, { ...newEntry, x, y }]);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmed = window.confirm('Are you sure you want to delete this cache entry?');
    
    if (!confirmed) return;

    try {
      // Call the delete API (we'll add this to api.ts)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cache-entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        setEntries(entries.filter(entry => entry._id !== id));
        console.log('Deleted cache entry:', id);
      } else {
        console.error('Failed to delete cache entry');
      }
    } catch (error) {
      console.error('Error deleting cache entry:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div 
      className="w-full h-screen bg-gray-50 cursor-pointer relative overflow-auto"
      onClick={handleClick}
    >
      {entries.length === 0 && !isCreating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-2xl text-gray-400">Click/tap to jot</p>
        </div>
      )}
      
      {isCreating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xl text-gray-500">Creating...</p>
        </div>
      )}

      {entries.map((entry) => (
        <div
          key={entry._id}
          className="cache-entry-box absolute bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200"
          style={{
            left: `${entry.x}px`,
            top: `${entry.y}px`,
            width: '300px',
            transform: 'translate(-50%, -50%)' // Center the box on click position
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Timestamp
              </label>
              <div className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                {formatTimestamp(entry.timestamp)}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(entry._id, e)}
              className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete entry"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Title
            </label>
            <input
              type="text"
              value={entry.title}
              onChange={(e) => handleTitleChange(entry._id, e.target.value)}
              placeholder="Enter title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Body
            </label>
            <textarea
              value={entry.body}
              onChange={(e) => handleBodyChange(entry._id, e.target.value)}
              placeholder="Enter body text..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cache;