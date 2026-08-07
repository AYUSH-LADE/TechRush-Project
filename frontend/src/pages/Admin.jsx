import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import Loader from '../components/Loader';
import {
  ShieldAlert,
  Flag,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  MapPin,
  Tag,
  Lock
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);

  const fetchAllItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);
      const response = await api.get('/admin/items');
      setItems(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (err) {
      console.error('Admin fetch failed:', err);
      if (err.response && err.response.status === 403) {
        setIsUnauthorized(true);
      } else {
        setError('Failed to fetch items for administration.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  const handleFlagItem = async (itemId) => {
    try {
      setActionLoadingId(itemId);
      setActionMessage(null);
      await api.put(`/admin/items/${itemId}/flag`);
      setActionMessage({ type: 'success', text: 'Item flagged successfully.' });
      await fetchAllItems();
    } catch (err) {
      console.error('Flag failed:', err);
      if (err.response && err.response.status === 403) {
        setIsUnauthorized(true);
      } else {
        setActionMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to flag item.',
        });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setActionLoadingId(itemId);
      setActionMessage(null);
      await api.delete(`/admin/items/${itemId}`);
      setActionMessage({ type: 'success', text: 'Item post removed permanently by admin.' });
      setItemToRemove(null);
      await fetchAllItems();
    } catch (err) {
      console.error('Remove failed:', err);
      if (err.response && err.response.status === 403) {
        setIsUnauthorized(true);
      } else {
        setActionMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to remove post.',
        });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isUnauthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center bg-[#F2F0EF] text-[#333333]">
        <div className="bg-[#F2F0EF] border border-[#898989] p-8 rounded-none">
          <div className="w-12 h-12 border border-[#898989] text-red-800 flex items-center justify-center mx-auto mb-4 bg-red-50/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold mb-2 uppercase">ACCESS_DENIED</h2>
          <p className="text-xs font-mono text-[#898989] mb-6 uppercase">
            Administrative privileges required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EF] py-10 px-4 sm:px-6 lg:px-8 text-[#333333]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-[#B2AC88]/10 border border-[#898989] rounded-none p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#898989] bg-[#F2F0EF] text-[#333333] font-mono text-[10px] uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Moderation Console</span>
              </div>
              <h1 className="text-3xl font-serif font-extrabold uppercase">
                Content & Flag Moderation
              </h1>
              <p className="text-[#898989] font-mono text-xs mt-1 uppercase">
                Review all campus reports, flag inappropriate content, or remove rule-violating listings.
              </p>
            </div>

            <button
              onClick={fetchAllItems}
              disabled={loading}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-[#333333] bg-[#F2F0EF] border border-[#898989] hover:bg-[#B2AC88]/20 transition-all cursor-pointer disabled:opacity-50 uppercase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Global Action Toast Notification */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-none border flex items-center justify-between text-xs font-mono uppercase ${
              actionMessage.type === 'success'
                ? 'bg-transparent border-[#4B6E48] text-[#4B6E48]'
                : 'bg-red-50/20 border-red-700 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="font-bold">{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-[10px] font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {itemToRemove && (
          <div className="fixed inset-0 z-50 bg-[#F2F0EF]/80 flex items-center justify-center p-4">
            <div className="bg-[#F2F0EF] rounded-none p-6 max-w-md w-full border border-[#898989] space-y-4 text-xs font-mono">
              <div className="w-10 h-10 border border-[#898989] text-red-800 flex items-center justify-center bg-red-50/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#333333] uppercase">Confirm Moderation Deletion</h3>
                <p className="text-[#898989] mt-1 uppercase">
                  Are you sure you want to remove post <span className="font-bold text-[#333333]">"{itemToRemove.title}"</span>? This operation cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleRemoveItem(itemToRemove._id || itemToRemove.id)}
                  disabled={actionLoadingId === (itemToRemove._id || itemToRemove.id)}
                  className="flex-1 py-2 bg-red-700 text-white font-bold transition-all cursor-pointer rounded-none uppercase"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 py-2 bg-[#898989] text-[#F2F0EF] font-bold transition-all cursor-pointer rounded-none uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12">
            <Loader label="Loading moderation queue..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-[#F2F0EF] border border-[#898989] p-8 text-center max-w-lg mx-auto my-8">
            <AlertTriangle className="w-6 h-6 text-red-800 mx-auto mb-2" />
            <p className="text-xs font-mono text-[#898989] uppercase">{error}</p>
            <button
              onClick={fetchAllItems}
              className="mt-4 px-4 py-2 bg-[#4B6E48] text-[#F2F0EF] border border-[#4B6E48] font-mono text-xs uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table / Cards List */}
        {!loading && !error && (
          <div className="bg-[#F2F0EF] rounded-none border border-[#898989] overflow-hidden">
            <div className="p-6 border-b border-[#898989] flex items-center justify-between text-xs font-mono">
              <h2 className="text-sm font-serif font-bold text-[#333333] uppercase">Total Logs ({items.length})</h2>
              <span className="text-[#898989] uppercase">Logged in as Administrator</span>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center text-[#898989] font-mono text-xs uppercase">
                <p>No ledger logs in database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-[#333333]">
                  <thead className="bg-[#B2AC88]/10 border-b border-[#898989] text-[10px] font-bold uppercase tracking-wider text-[#898989]">
                    <tr>
                      <th className="py-4 px-6">Item Log</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#898989]">
                    {items.map((item) => {
                      const itemId = item._id || item.id;
                      const isFlagged = item.flagged || item.isFlagged;
                      const isClaimed = item.status === 'claimed';
                      const hasImage = !!item.hasImage;

                      return (
                        <tr key={itemId} className="hover:bg-[#B2AC88]/5 transition-colors">
                          <td className="py-4 px-6 font-bold text-[#333333] max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 border border-[#898989] bg-[#E5E2E0] overflow-hidden shrink-0 flex items-center justify-center text-[#898989] font-bold text-[9px] rounded-none">
                                {hasImage ? (
                                  <img
                                    src={getImageUrl(itemId)}
                                    alt={item.title}
                                    className="w-full h-full object-cover grayscale"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                {!hasImage && <span>NO IMG</span>}
                              </div>
                              <span className="truncate uppercase">{item.title}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 text-[#898989] px-2 py-0.5 border border-[#898989] uppercase text-[10px]">
                              <Tag className="w-3 h-3 text-[#B2AC88]" />
                              {item.category || 'General'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-[11px]">
                            <div className="flex items-center gap-1 text-[#898989]">
                              <MapPin className="w-3 h-3 text-[#B2AC88]" />
                              {item.location || 'Campus'}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span
                              className={`ink-stamp text-[10px] uppercase ${
                                item.type === 'lost'
                                  ? 'ink-stamp-lost'
                                  : 'ink-stamp-found'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`ink-stamp text-[10px] ${
                                  isClaimed 
                                    ? 'ink-stamp-claimed' 
                                    : item.status === 'pending'
                                    ? 'ink-stamp-pending'
                                    : 'ink-stamp-found'
                                }`}
                              >
                                {isClaimed ? 'Claimed' : item.status === 'pending' ? 'Pending' : 'Active'}
                              </span>
                              {isFlagged && (
                                <span className="ink-stamp text-[10px] ink-stamp-lost">
                                  Flagged
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2 text-[10px]">
                              <Link
                                to={`/items/${itemId}`}
                                className="px-3 py-1 bg-transparent hover:bg-[#B2AC88]/20 text-[#333333] border border-[#898989] font-bold uppercase transition-all flex items-center gap-1"
                              >
                                View
                              </Link>

                              <button
                                onClick={() => handleFlagItem(itemId)}
                                disabled={actionLoadingId === itemId}
                                className={`px-3 py-1 font-bold flex items-center gap-1 transition-all cursor-pointer uppercase ${
                                  isFlagged
                                    ? 'bg-[#B2AC88]/30 border border-[#898989] text-[#333333]'
                                    : 'bg-transparent hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-[#898989]'
                                }`}
                              >
                                {isFlagged ? 'Flagged' : 'Flag'}
                              </button>

                              <button
                                onClick={() => setItemToRemove(item)}
                                disabled={actionLoadingId === itemId}
                                className="px-3 py-1 bg-transparent hover:bg-red-50 text-red-700 border border-red-700 font-bold transition-all flex items-center gap-1 cursor-pointer uppercase"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
