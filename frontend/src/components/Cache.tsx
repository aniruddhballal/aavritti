import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus } from 'lucide-react';

interface CacheEntry {
  _id: string;
  title: string;
  body: string;
  timestamp: Date;
}

interface EntryPosition {
  x: number;
  y: number;
}

const Cache = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<(CacheEntry & EntryPosition)[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const createCacheEntry = async (data: { title: string; body: string }) => {
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
        
        // Assign random positions to existing entries
        const entriesWithPositions = data.map((entry: CacheEntry, index: number) => ({
          ...entry,
          x: 200 + (index % 5) * 350, // Spread horizontally
          y: 200 + Math.floor(index / 5) * 300 // Spread vertically
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
      const newEntry = await createCacheEntry({
        title: '',
        body: ''
      });
      
      console.log('Created new cache entry:', newEntry);
      
      // Position new entry in center of viewport
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      
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

  const handleTitleBlur = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (!entry) return;

    try {
      await updateCacheEntry(id, { title: entry.title });
      console.log('Updated title for entry:', id);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleBodyBlur = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (!entry) return;

    try {
      await updateCacheEntry(id, { body: entry.body });
      console.log('Updated body for entry:', id);
    } catch (error) {
      console.error('Error updating body:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmed = window.confirm('Are you sure you want to delete this cache entry?');
    
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
    <div className="w-full h-screen bg-gray-50 relative overflow-auto">
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('/');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-md"
        >
          <ArrowLeft size={20} />
          <span>Back to Calendar</span>
        </button>

        <button
          onClick={handleCreateEntry}
          disabled={isCreating}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
        >
          <Plus size={20} />
          <span>{isCreating ? 'Creating...' : 'Create New Cache Entry'}</span>
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xl text-gray-500">Loading entries...</p>
        </div>
      )}

      {!isLoading && entries.length === 0 && !isCreating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-2xl text-gray-400">Click "Create New Cache Entry" to start</p>
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
            transform: 'translate(-50%, -50%)'
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
              onBlur={() => handleTitleBlur(entry._id)}
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
              onBlur={() => handleBodyBlur(entry._id)}
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