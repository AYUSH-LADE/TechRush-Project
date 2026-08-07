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
    <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-4 md:p-6 mb-8 text-[#333333] font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-[#898989] pb-3">
        <div className="flex items-center gap-2 font-serif font-bold text-base text-[#333333]">
          <Filter className="w-4 h-4 text-[#4B6E48]" />
          <span>FILTER & SEARCH INDEX</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-mono text-[#898989] hover:text-[#4B6E48] transition-colors cursor-pointer border border-[#898989] px-2 py-0.5"
          >
            <X className="w-3 h-3" />
            RESET_FILTERS
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Keyword */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search keywords..."
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F2F0EF] border border-[#898989] rounded-none text-sm font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
            <Tag className="w-4 h-4" />
          </div>
          <select
            value={filters.category || 'All Categories'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F2F0EF] border border-[#898989] rounded-none text-sm font-mono text-[#333333] focus:outline-none focus:border-[#4B6E48] transition-all appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            value={filters.location || 'All Locations'}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F2F0EF] border border-[#898989] rounded-none text-sm font-mono text-[#333333] focus:outline-none focus:border-[#4B6E48] transition-all appearance-none cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
            <Layers className="w-4 h-4" />
          </div>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F2F0EF] border border-[#898989] rounded-none text-sm font-mono text-[#333333] focus:outline-none focus:border-[#4B6E48] transition-all appearance-none cursor-pointer"
          >
            <option value="">ALL TYPES (LOST & FOUND)</option>
            <option value="lost">LOST ONLY</option>
            <option value="found">FOUND ONLY</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;
