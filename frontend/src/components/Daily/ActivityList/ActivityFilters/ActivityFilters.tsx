import { Search, X, Filter, Tag, Clock } from 'lucide-react';
import { useDarkMode } from '../../../../contexts/DarkModeContext';
import { FilterStyles } from './FilterStyles';
import type { ActivityFiltersProps } from './types';

const ActivityFilters = ({
  categories,
  searchTerm,
  selectedCategory,
  selectedSubcategory,
  filterStartTime,
  filterEndTime,
  expandedFilter,
  onSearchChange,
  onCategoryChange,
  onSubcategoryChange,
  onTimeChange,
  onExpandedFilterChange,
  onClearFilters,
}: ActivityFiltersProps) => {
  const { isDarkMode } = useDarkMode();

  const availableSubcategories = selectedCategory
    ? categories.find(cat => cat.value === selectedCategory)?.subcategories || []
    : [];

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterStartTime || filterEndTime;

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  return (
    <>
      <FilterStyles />
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search Filter */}
        <div className={`transition-all duration-200 ${
          expandedFilter === 'search' ? 'flex-1 min-w-[200px]' : ''
        }`}>
          {expandedFilter === 'search' ? (
            <div className="relative filter-expand">
              <Search 
                size={18} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className={`filter-input w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                    : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                }`}
              />
            </div>
          ) : searchTerm ? (
            <button
              onClick={() => onExpandedFilterChange('search')}
              className={`filter-badge flex items-center gap-2 px-3 py-2.5 rounded-lg border font-medium ${
                isDarkMode
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-green-50 border-green-300 text-green-700'
              }`}
            >
              <Search size={16} className="icon-hover" strokeWidth={2} />
              <span className="text-sm truncate max-w-[120px]">{searchTerm}</span>
            </button>
          ) : (
            <button
              onClick={() => onExpandedFilterChange('search')}
              className={`filter-button p-2.5 rounded-lg border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
              }`}
              title="Search"
            >
              <Search size={18} className="icon-hover" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className={`transition-all duration-200 ${
          expandedFilter === 'category' ? 'flex-1 min-w-[180px]' : ''
        }`}>
          {expandedFilter === 'category' ? (
            <div className="select-wrapper filter-expand">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                autoFocus
                className={`filter-input w-full px-4 py-2.5 rounded-lg border focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          ) : selectedCategory ? (
            <button
              onClick={() => onExpandedFilterChange('category')}
              className={`filter-badge flex items-center gap-2 px-3 py-2.5 rounded-lg border font-medium ${
                isDarkMode
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-green-50 border-green-300 text-green-700'
              }`}
            >
              <Tag size={16} className="icon-hover" strokeWidth={2} />
              <span className="text-sm truncate max-w-[120px]">
                {getCategoryLabel(selectedCategory)}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onExpandedFilterChange('category')}
              className={`filter-button p-2.5 rounded-lg border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
              }`}
              title="Category"
            >
              <Tag size={18} className="icon-hover" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Subcategory Filter */}
        {selectedCategory && availableSubcategories.length > 0 && (
          <div className={`transition-all duration-200 ${
            expandedFilter === 'subcategory' ? 'flex-1 min-w-[180px]' : ''
          }`}>
            {expandedFilter === 'subcategory' ? (
              <div className="select-wrapper filter-expand">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => onSubcategoryChange(e.target.value)}
                  autoFocus
                  className={`filter-input w-full px-4 py-2.5 rounded-lg border focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="">All Subcategories</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            ) : selectedSubcategory ? (
              <button
                onClick={() => onExpandedFilterChange('subcategory')}
                className={`filter-badge flex items-center gap-2 px-3 py-2.5 rounded-lg border font-medium ${
                  isDarkMode
                    ? 'bg-green-900/30 border-green-700 text-green-300'
                    : 'bg-green-50 border-green-300 text-green-700'
                }`}
              >
                <Filter size={16} className="icon-hover" strokeWidth={2} />
                <span className="text-sm truncate max-w-[120px]">
                  {selectedSubcategory}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onExpandedFilterChange('subcategory')}
                className={`filter-button p-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
                }`}
                title="Subcategory"
              >
                <Filter size={18} className="icon-hover" strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Time Range Filter */}
        <div className={`transition-all duration-200 ${
          expandedFilter === 'time' ? 'flex-1 min-w-[240px]' : ''
        }`}>
          {expandedFilter === 'time' ? (
            <div className="flex items-center gap-2 filter-expand">
              <input
                type="time"
                value={filterStartTime}
                onChange={(e) => onTimeChange('start', e.target.value)}
                className={`filter-input flex-1 px-3 py-2.5 rounded-lg border focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>—</span>
              <input
                type="time"
                value={filterEndTime}
                onChange={(e) => onTimeChange('end', e.target.value)}
                className={`filter-input flex-1 px-3 py-2.5 rounded-lg border focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              />
            </div>
          ) : (filterStartTime || filterEndTime) ? (
            <button
              onClick={() => onExpandedFilterChange('time')}
              className={`filter-badge flex items-center gap-2 px-3 py-2.5 rounded-lg border font-medium ${
                isDarkMode
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-green-50 border-green-300 text-green-700'
              }`}
            >
              <Clock size={16} className="icon-hover" strokeWidth={2} />
              <span className="text-sm">
                {filterStartTime || '—'} – {filterEndTime || '—'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onExpandedFilterChange('time')}
              className={`filter-button p-2.5 rounded-lg border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
              }`}
              title="Time Range"
            >
              <Clock size={18} className="icon-hover" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className={`clear-button p-2.5 rounded-lg ${
              isDarkMode
                ? 'text-red-400 hover:text-white'
                : 'text-red-500 hover:text-white'
            }`}
            title="Clear all filters"
            aria-label="Clear all filters"
          >
            <X size={20} className="icon-hover" strokeWidth={2} />
          </button>
        )}
      </div>
    </>
  );
};

export default ActivityFilters;