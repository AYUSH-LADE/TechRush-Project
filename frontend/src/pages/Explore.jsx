import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import ItemFilters from '../components/ItemFilters';
import { CardSkeleton } from '../components/Loader';
import { PlusCircle, Search, HelpCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const Explore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    location: '',
    type: '',
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string omitting empty/default filters
      const params = new URLSearchParams();
      if (filters.keyword.trim()) params.append('keyword', filters.keyword.trim());
      if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);
      if (filters.location && filters.location !== 'All Locations') params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);

      const queryString = params.toString();
      const endpoint = `/items${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(endpoint);
      setItems(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Unable to load lost and found items. Please verify backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce search query changes slightly to prevent spamming server
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      location: '',
      type: '',
    });
  };

  const handleBrowseFound = () => {
    setFilters((prev) => ({ ...prev, type: 'found' }));
    const element = document.getElementById('results-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0EF] pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-[#B2AC88]/20 border-b border-[#898989] pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-[#333333]">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#898989] bg-[#F2F0EF] text-[#333333] font-mono text-[10px] uppercase tracking-wider mb-6">
            <span>Official Lost Property Bulletin</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#333333] leading-tight mb-6 uppercase">
            YOUR CAMPUS RECLAIM CENTER
          </h1>

          <p className="text-sm sm:text-base text-[#898989] font-mono max-w-xl mx-auto leading-relaxed mb-8 uppercase">
            A central ledger system connecting the university community to log, search, and reclaim misplaced items.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/report"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono font-bold text-xs uppercase tracking-wider border border-[#4B6E48] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Lost / Found Item</span>
            </Link>

            <button
              onClick={handleBrowseFound}
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-[#B2AC88]/20 text-[#333333] border border-[#898989] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#4B6E48]" />
              <span>Browse Found Register</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 pt-6 border-t border-dashed border-[#898989] grid grid-cols-3 gap-4 max-w-lg mx-auto text-center font-mono">
            <div>
              <p className="text-lg font-bold text-[#333333]">100%</p>
              <p className="text-[9px] font-bold text-[#898989] uppercase tracking-widest">VERIFIED OFFICE</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#4B6E48]">LOGGED</p>
              <p className="text-[9px] font-bold text-[#898989] uppercase tracking-widest">ledger log</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#B2AC88]">SECURED</p>
              <p className="text-[9px] font-bold text-[#898989] uppercase tracking-widest">CLAIM RECEIPTS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        
        {/* Filters Card */}
        <ItemFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#898989] pb-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#333333] uppercase">
              {filters.type ? `${filters.type} Items` : 'All Registered Items'}
            </h2>
            <p className="text-xs font-mono text-[#898989] uppercase mt-0.5">
              Showing {items.length} {items.length === 1 ? 'item' : 'items'} in ledger
            </p>
          </div>

          {/* Refresh Action */}
          <button
            onClick={fetchItems}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#333333] bg-[#F2F0EF] border border-[#898989] hover:bg-[#B2AC88]/20 transition-all cursor-pointer disabled:opacity-50 uppercase"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-[#F2F0EF] border border-[#898989] p-8 text-center max-w-lg mx-auto my-8">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-[#898989] text-red-700 bg-red-50/50 mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif font-bold text-red-900 mb-1 uppercase">LOG_CONNECTION_FAIL</h3>
            <p className="text-xs font-mono text-[#898989] mb-4">{error}</p>
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#4B6E48]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-[#F2F0EF] border border-[#898989] p-10 text-center max-w-md mx-auto my-8">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-[#898989] text-[#898989] mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#333333] mb-2 uppercase">NO_RECORDS_FOUND</h3>
            <p className="text-xs font-mono text-[#898989] mb-6 uppercase">
              No entries found matching filters. Adjust registry options or report a new claim below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-transparent hover:bg-[#B2AC88]/20 text-[#333333] border border-[#898989] font-mono text-xs uppercase cursor-pointer"
              >
                Clear Filters
              </button>
              <Link
                to="/report"
                className="px-4 py-2 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] text-xs font-mono uppercase tracking-wider text-center"
              >
                Report Item
              </Link>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id || item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
