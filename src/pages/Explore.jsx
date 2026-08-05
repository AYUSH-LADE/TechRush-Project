import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import ItemFilters from '../components/ItemFilters';
import { CardSkeleton } from '../components/Loader';
import { PlusCircle, Search, HelpCircle, AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md text-blue-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Campus Lost & Found Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Lost something on campus? <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Let's help you find it.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            A fast, trusted platform connecting students and faculty to report, search, and reclaim lost items across campus.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Lost / Found Item</span>
            </Link>

            <button
              onClick={handleBrowseFound}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
            >
              <Search className="w-5 h-5 text-blue-400" />
              <span>Browse Found Items</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Campus</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-400">Fast</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Contact</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">Secure</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Claim Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* Filters Card */}
        <ItemFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {filters.type ? `${filters.type.toUpperCase()} Items` : 'All Reported Items'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Showing {items.length} {items.length === 1 ? 'item' : 'items'} found on campus
            </p>
          </div>

          {/* Refresh Action */}
          <button
            onClick={fetchItems}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-red-900 mb-1">Failed to fetch items</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any items matching your current filters. Try resetting search criteria or report a new item.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear Filters
              </button>
              <Link
                to="/report"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
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
