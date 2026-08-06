import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import Loader from '../components/Loader';
import {
  MapPin,
  Tag,
  User,
  Mail,
  CheckCircle,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  PhoneCall,
  ExternalLink
} from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/items/${id}`);
      setItem(response.data);
    } catch (err) {
      console.error('Failed to load item:', err);
      if (err.response && err.response.status === 404) {
        setError('The requested lost/found item could not be found.');
      } else {
        setError('Failed to fetch item details. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader label="Loading item details..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Item</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Item not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Check ownership safely handling null/undefined
  const reportedBy = item.reportedBy;
  const reportedById = reportedBy ? (typeof reportedBy === 'object' ? reportedBy._id : reportedBy) : null;
  const currentUserId = user?._id || user?.id;

  const isOwner = Boolean(
    isAuthenticated &&
    currentUserId &&
    reportedById &&
    String(reportedById) === String(currentUserId)
  );

  const reporterName = item.reporterName || (reportedBy && typeof reportedBy === 'object' ? reportedBy.name : null) || 'Campus Member';
  const reporterEmail = item.reporterEmail || (reportedBy && typeof reportedBy === 'object' ? reportedBy.email : null) || 'Contact reporter via dashboard';


  const isClaimed = item.status === 'claimed';
  const isLost = item.type === 'lost';
  // Images are stored as binary in MongoDB; the API returns hasImage (bool)
  // and we fetch the actual bytes from /api/items/:id/image
  const hasImage = item.hasImage;
  const imageSrc = hasImage ? (item._id || item.id) : null;

  const handleMarkAsClaimed = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await api.put(`/items/${id}/claim`);
      await fetchItem();
    } catch (err) {
      console.error('Failed to mark item as claimed:', err);
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await api.delete(`/items/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete item:', err);
      setActionError(err.response?.data?.message || 'Failed to delete item.');
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all items
          </Link>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Main Card Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Image Section */}
          <div className="md:col-span-6 bg-slate-100 relative min-h-[320px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img
                src={getImageUrl(imageSrc)}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback */}
            <div
              className={`w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br ${
                isLost ? 'from-amber-50 to-orange-100 text-amber-600' : 'from-emerald-50 to-teal-100 text-emerald-600'
              } ${imageSrc ? 'hidden' : 'flex'}`}
            >
              {isLost ? <HelpCircle className="w-20 h-20 stroke-[1.5]" /> : <ShieldCheck className="w-20 h-20 stroke-[1.5]" />}
              <p className="text-sm font-bold uppercase tracking-wider mt-4">
                {isLost ? 'Lost Item Post' : 'Found Item Post'}
              </p>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md ${
                  isLost ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}
              >
                {item.type}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md border ${
                  isClaimed
                    ? 'bg-slate-900/80 text-white border-slate-700'
                    : 'bg-white/90 text-blue-700 border-blue-200'
                }`}
              >
                {isClaimed ? 'Claimed' : 'Active'}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              
              {/* Category & Date */}
              <div className="flex items-center justify-between text-xs font-semibold text-blue-600 mb-3">
                <span className="inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  <Tag className="w-3.5 h-3.5" />
                  {item.category || 'General'}
                </span>
                {item.createdAt && (
                  <span className="text-slate-400 font-medium inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                {item.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-6">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location Reported</p>
                  <p className="text-sm font-bold text-slate-800">{item.location || 'Campus Location'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {item.description || 'No additional description provided.'}
                </p>
              </div>

              {/* Reporter Info Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-100 mb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Reporter Contact Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Name</span>
                    <span className="font-bold text-slate-900">{reporterName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Email</span>
                    <a
                      href={`mailto:${reporterEmail}`}
                      className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {reporterEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-100">
              {isOwner ? (
                <div className="space-y-3">
                  {!isClaimed && (
                    <button
                      onClick={handleMarkAsClaimed}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as Claimed</span>
                        </>
                      )}
                    </button>
                  )}

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-center">
                      <p className="text-xs font-bold text-red-800">Are you sure you want to delete this post?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteItem}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <a
                    href={`mailto:${reporterEmail}?subject=Regarding your Lost %26 Found post: ${encodeURIComponent(item.title)}`}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact {reporterName}</span>
                  </a>
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                    Reach out directly via official email to arrange item return or claim.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetail;
