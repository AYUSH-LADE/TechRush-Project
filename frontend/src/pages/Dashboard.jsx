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
  RefreshCw
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
    <div className="min-h-screen bg-[#F2F0EF] py-10 px-4 sm:px-6 lg:px-8 text-[#333333]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Banner */}
        <div className="bg-[#B2AC88]/10 border border-[#898989] rounded-none p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#898989] bg-[#F2F0EF] text-[#333333] font-mono text-[10px] uppercase tracking-wider mb-3">
                <span>Student Control Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight uppercase">
                Welcome, <span className="text-[#4B6E48]">{user?.name || 'Student'}</span>
              </h1>
              <p className="text-[#898989] font-mono text-xs mt-2 max-w-xl uppercase">
                Manage personal log records, update claim status, or register new reports to the central ledger system.
              </p>
            </div>

            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] font-mono font-bold text-xs uppercase tracking-wider transition-all rounded-none shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log New Report</span>
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-dashed border-[#898989] font-mono text-xs">
            <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#898989] uppercase">Total Logs</span>
                <LayoutDashboard className="w-4 h-4 text-[#898989]" />
              </div>
              <p className="text-2xl font-bold text-[#333333] mt-2">{myItems.length}</p>
            </div>

            <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#898989] uppercase">Active Logs</span>
                <Clock className="w-4 h-4 text-[#B2AC88]" />
              </div>
              <p className="text-2xl font-bold text-[#333333] mt-2">{activeCount}</p>
            </div>

            <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#898989] uppercase">Closed Logs</span>
                <CheckCircle2 className="w-4 h-4 text-[#4B6E48]" />
              </div>
              <p className="text-2xl font-bold text-[#333333] mt-2">{claimedCount}</p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 border-b border-[#898989] pb-3">
          <div>
            <h2 className="text-lg font-serif font-bold uppercase">My Registered Items</h2>
            <p className="text-xs font-mono text-[#898989] uppercase mt-0.5">Entries logged under your campus account</p>
          </div>

          <button
            onClick={fetchMyItems}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#333333] bg-[#F2F0EF] border border-[#898989] hover:bg-[#B2AC88]/20 transition-all cursor-pointer disabled:opacity-50 uppercase"
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
            <h3 className="text-xs font-serif font-bold text-red-900 mb-1 uppercase">DASHBOARD_LOAD_ERROR</h3>
            <p className="text-xs font-mono text-[#898989] mb-4">{error}</p>
            <button
              onClick={fetchMyItems}
              className="px-4 py-2 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] font-mono text-xs uppercase"
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
          <div className="bg-[#F2F0EF] border border-[#898989] p-10 text-center max-w-md mx-auto my-8">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-[#898989] text-[#898989] mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#333333] mb-2 uppercase">NO_REPORTS_LOGGED</h3>
            <p className="text-xs font-mono text-[#898989] mb-6 uppercase">
              You have not registered any lost or found items in the official campus database.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] text-xs font-mono font-bold uppercase rounded-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log New Report Now</span>
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
