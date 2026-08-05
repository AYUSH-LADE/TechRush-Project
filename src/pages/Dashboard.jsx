import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import { CardSkeleton } from '../components/Loader';
import {
  PlusCircle,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/items/mine');
      setMyItems(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (err) {
      console.error('Failed to fetch user items:', err);
      setError('Unable to load your reported items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const activeCount = myItems.filter((i) => i.status !== 'claimed').length;
  const claimedCount = myItems.filter((i) => i.status === 'claimed').length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Control Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, <span className="text-blue-400">{user?.name || 'Student'}</span>!
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-xl">
                Manage your lost & found posts, mark items as claimed, or submit new reports to the campus network.
              </p>
            </div>

            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report New Item</span>
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Reports</span>
                <LayoutDashboard className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{myItems.length}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Active Posts</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-400 mt-2">{activeCount}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Items Claimed</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400 mt-2">{claimedCount}</p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Reported Items</h2>
            <p className="text-xs font-medium text-slate-500">Items submitted by your campus account</p>
          </div>

          <button
            onClick={fetchMyItems}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
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
            <h3 className="text-base font-bold text-red-900 mb-1">Failed to load reports</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchMyItems}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && myItems.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">You haven't reported anything yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              Have you lost something or found an item on campus? Submit a report so students can reach you.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Item Now</span>
            </Link>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && !error && myItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {myItems.map((item) => (
              <ItemCard key={item._id || item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
