import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
  Search,
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
      const response = await api.get('/items');
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
      await api.delete(`/admin/items/${itemId}/flag`);
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">403 — Access Forbidden</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your current account credentials do not have administrative privileges to manage moderation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Moderation Console</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Content & Flag Moderation
              </h1>
              <p className="text-amber-200/80 text-sm mt-1">
                Review all campus reports, flag inappropriate content, or remove rule-violating listings.
              </p>
            </div>

            <button
              onClick={fetchAllItems}
              disabled={loading}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-100 bg-amber-900/60 border border-amber-700/60 rounded-xl hover:bg-amber-800/80 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Global Action Toast Notification */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-semibold">{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {itemToRemove && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Moderation Deletion</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove post <span className="font-bold text-slate-800">"{itemToRemove.title}"</span>? This operation cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleRemoveItem(itemToRemove._id || itemToRemove.id)}
                  disabled={actionLoadingId === (itemToRemove._id || itemToRemove.id)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
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
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-900">{error}</p>
            <button
              onClick={fetchAllItems}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table / Cards List */}
        {!loading && !error && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Total Items ({items.length})</h2>
              <span className="text-xs text-slate-500 font-medium">Logged in as Administrator</span>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="font-semibold text-sm">No items in system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-4 px-6">Item</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const itemId = item._id || item.id;
                      const isFlagged = item.flagged || item.isFlagged;
                      const isClaimed = item.status === 'claimed';

                      return (
                        <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs">
                                {item.imageUrl || item.image ? (
                                  <img
                                    src={
                                      (item.imageUrl || item.image).startsWith('http')
                                        ? item.imageUrl || item.image
                                        : `${import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')}${(item.imageUrl || item.image).startsWith('/') ? '' : '/'}${item.imageUrl || item.image}`
                                    }
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  'NO IMG'
                                )}
                              </div>
                              <span className="truncate">{item.title}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {item.category || 'General'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-xs font-medium">
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.location || 'Campus'}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                item.type === 'lost'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isClaimed ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {isClaimed ? 'Claimed' : 'Active'}
                              </span>
                              {isFlagged && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1">
                                  <Flag className="w-3 h-3" /> Flagged
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleFlagItem(itemId)}
                                disabled={actionLoadingId === itemId}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isFlagged
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200'
                                }`}
                                title="Flag this post"
                              >
                                <Flag className="w-3.5 h-3.5" />
                                {isFlagged ? 'Flagged' : 'Flag'}
                              </button>

                              <button
                                onClick={() => setItemToRemove(item)}
                                disabled={actionLoadingId === itemId}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded-xl text-xs font-bold border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                                title="Remove this post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
