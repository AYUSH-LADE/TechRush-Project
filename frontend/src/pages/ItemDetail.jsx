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
  ExternalLink,
  X
} from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [claimRequests, setClaimRequests] = useState([]);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [verificationDetail, setVerificationDetail] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

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

  const currentUserId = user?._id || user?.id;
  const reportedBy = item?.reportedBy;
  const reportedById = reportedBy ? (typeof reportedBy === 'object' ? reportedBy._id : reportedBy) : null;
  const isOwner = Boolean(
    isAuthenticated &&
    currentUserId &&
    reportedById &&
    String(reportedById) === String(currentUserId)
  );

  const fetchClaimRequests = useCallback(async () => {
    if (!isOwner || !item || (item.status !== 'active' && item.status !== 'pending')) return;
    try {
      const response = await api.get(`/items/${item._id || item.id}/claim-requests`);
      setClaimRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch claim requests:', err);
    }
  }, [isOwner, item]);

  useEffect(() => {
    fetchClaimRequests();
  }, [fetchClaimRequests]);

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

  const reporterName = item.reporterName || (reportedBy && typeof reportedBy === 'object' ? reportedBy.name : null) || 'Campus Member';
  const reporterEmail = item.reporterEmail || (reportedBy && typeof reportedBy === 'object' ? reportedBy.email : null) || 'Contact reporter via dashboard';
  const reporterPhone = item.reporterPhone || (reportedBy && typeof reportedBy === 'object' ? reportedBy.phoneNumber : null);


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

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!verificationDetail.trim() || !contactInfo.trim()) {
      setClaimError('Please provide both verification detail and contact info.');
      return;
    }

    if (verificationDetail.trim().toLowerCase() === item.description.trim().toLowerCase()) {
      setClaimError('Verification detail cannot be exactly the same as the item description. Please provide unique identifying details.');
      return;
    }
    
    try {
      setClaimSubmitting(true);
      setClaimError('');
      await api.post(`/items/${id}/claim-request`, {
        verificationDetail,
        contactInfo
      });
      setClaimSuccess(true);
      setShowClaimForm(false);
    } catch (err) {
      console.error('Failed to submit claim request:', err);
      setClaimError(err.response?.data?.message || 'Failed to submit claim request.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleReviewClaim = async (requestId, action) => {
    try {
      setActionLoading(true);
      setActionError('');
      await api.put(`/items/${id}/claim-request/${requestId}/review`, { action });
      
      if (action === 'approve') {
        await fetchItem(); // This will also re-trigger fetchClaimRequests since item changes
      } else {
        await fetchClaimRequests(); // Just refresh the list
      }
    } catch (err) {
      console.error('Failed to review claim:', err);
      setActionError(err.response?.data?.message || 'Failed to update claim status.');
    } finally {
      setActionLoading(false);
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
                    : item.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-white/90 text-blue-700 border-blue-200'
                }`}
              >
                {isClaimed ? 'Claimed' : item.status === 'pending' ? 'Pending Approval' : 'Active'}
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
                  {reporterPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Phone</span>
                      <a
                        href={`tel:${reporterPhone}`}
                        className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        {reporterPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-100">
              {isOwner ? (
                <div className="space-y-6">
                  {/* Claim Requests Section (Owner Only) */}
                  {!isClaimed && item.type === 'found' && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Claim Requests</h3>
                      {claimRequests.length > 0 ? (
                        <div className="space-y-3">
                          {claimRequests.map((req) => (
                            <div key={req._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold text-slate-900">{req.requestedBy?.name}</p>
                                  <p className="text-xs text-slate-500">{req.requestedBy?.email}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                  req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="mb-2">
                                <p className="text-xs font-bold text-slate-600 mb-0.5">Verification Detail</p>
                                <p className="text-sm text-slate-800 bg-white p-2 rounded border border-slate-100">{req.verificationDetail}</p>
                              </div>
                              <div className="mb-3">
                                <p className="text-xs font-bold text-slate-600 mb-0.5">Contact Info</p>
                                <p className="text-sm text-slate-800">{req.contactInfo}</p>
                              </div>
                              {req.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReviewClaim(req._id, 'approve')}
                                    disabled={actionLoading}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleReviewClaim(req._id, 'reject')}
                                    disabled={actionLoading}
                                    className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60 border border-red-200"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No claim requests yet.</p>
                      )}
                    </div>
                  )}

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
                </div>
              ) : (
                <div>
                  {(item.status === 'active' || item.status === 'pending') && item.type === 'found' ? (
                    <div className="space-y-4">
                      {claimSuccess ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-sm font-medium text-emerald-800 flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Your claim request has been sent to the reporter for review.
                        </div>
                      ) : showClaimForm ? (
                        <form onSubmit={handleClaimSubmit} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                          <h4 className="font-bold text-slate-800 text-sm">Submit Claim Request</h4>
                          {claimError && (
                            <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">{claimError}</p>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Verification Detail</label>
                            <textarea
                              value={verificationDetail}
                              onChange={(e) => setVerificationDetail(e.target.value)}
                              placeholder="Describe something only the real owner would know (a mark, lock screen, contents, etc.)"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20"
                              disabled={claimSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Contact Info</label>
                            <input
                              type="text"
                              value={contactInfo}
                              onChange={(e) => setContactInfo(e.target.value)}
                              placeholder="Phone number or preferred contact"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              disabled={claimSubmitting}
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={claimSubmitting}
                              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70"
                            >
                              {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowClaimForm(false)}
                              disabled={claimSubmitting}
                              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login');
                            } else if (!isAdmin) {
                              setShowClaimForm(true);
                            }
                          }}
                          disabled={isAdmin}
                          title={isAdmin ? "Admins cannot claim items" : ""}
                          className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-center ${isAdmin ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.01] cursor-pointer'}`}
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Claim This Item</span>
                        </button>
                      )}
                      
                      <div className="text-center pt-2">
                        <a
                          href={`mailto:${reporterEmail}?subject=Regarding your Found post: ${encodeURIComponent(item.title)}`}
                          className="text-[12px] font-medium text-slate-500 hover:text-blue-600 underline decoration-slate-300 underline-offset-2 transition-colors"
                        >
                          Or email the reporter directly
                        </a>
                      </div>
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
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetail;
