import React from 'react';
import { Search, Filter, X, MapPin, Tag, Layers } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Keys & Cards',
  'Bags & Backpacks',
  'Books & Notebooks',
  'Clothing & Apparel',
  'Watches & Jewelry',
  'Bottles & Flasks',
  'Documents & IDs',
  'Sports Equipment',
  'Other'
];

const LOCATIONS = [
  'All Locations',
  'Main Library',
  'Student Center / Hub',
  'Engineering Block',
  'Science Complex',
  'Auditorium',
  'Campus Cafeteria',
  'Sports Ground / Gym',
  'Hostel Complex',
  'Lecture Hall A-1',
  'Parking Lot',
  'Other Campus Location'
];

const ItemFilters = ({ filters, setFilters, onReset }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const hasActiveFilters = Boolean(
    filters.keyword ||
    (filters.category && filters.category !== 'All Categories') ||
    (filters.location && filters.location !== 'All Locations') ||
    filters.type
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter & Search</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Keyword */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search keywords..."
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Tag className="w-4 h-4" />
          </div>
          <select
            value={filters.category || 'All Categories'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            value={filters.location || 'All Locations'}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Types (Lost & Found)</option>
            <option value="lost">Lost Only</option>
            <option value="found">Found Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;
