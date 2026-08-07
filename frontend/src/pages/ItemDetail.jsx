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
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F2F0EF]">
        <Loader label="Loading item details..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-[#F2F0EF]">
        <div className="bg-[#F2F0EF] border border-[#898989] p-8 rounded-none">
          <div className="w-12 h-12 border border-[#898989] text-red-800 flex items-center justify-center mx-auto mb-4 bg-red-50/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-[#333333] mb-2 uppercase">LOAD_ERROR</h2>
          <p className="text-xs font-mono text-[#898989] mb-6">{error || 'Item not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono text-xs uppercase border border-[#4B6E48] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK_TO_EXPLORE
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
        await fetchItem();
      } else {
        await fetchClaimRequests();
      }
    } catch (err) {
      console.error('Failed to review claim:', err);
      setActionError(err.response?.data?.message || 'Failed to update claim status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0EF] py-10 px-4 sm:px-6 lg:px-8 text-[#333333]">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#898989] hover:text-[#4B6E48] transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK_TO_EXPLORE
          </Link>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50/20 border border-[#898989] flex items-center gap-3 text-red-800 text-xs font-mono">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Main Card (Claim Tag Design) */}
        <div className="bg-[#F2F0EF] border border-[#898989] rounded-none relative tag-notch-tr grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Decorative tag punch hole */}
          <div className="absolute top-[12px] right-[12px] w-6 h-6 rounded-full bg-[#F2F0EF] border border-[#898989] flex items-center justify-center z-30">
            <div className="w-2.5 h-2.5 rounded-full bg-[#898989]" />
          </div>

          {/* Decorative tag string */}
          <div className="absolute -top-4 right-[28px] w-[1px] h-10 bg-[#898989] rotate-[25deg] origin-bottom z-20 pointer-events-none" />

          {/* Image Section */}
          <div className="md:col-span-6 bg-[#E5E2E0] relative min-h-[320px] md:min-h-[480px] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#898989]">
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
              className={`w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#E5E2E0] text-[#898989] ${imageSrc ? 'hidden' : 'flex'}`}
            >
              {isLost ? <HelpCircle className="w-16 h-16 stroke-[1.2]" /> : <ShieldCheck className="w-16 h-16 stroke-[1.2]" />}
              <p className="text-xs font-mono uppercase tracking-wider mt-4">
                {isLost ? 'Misplaced Property' : 'Recovered Property'}
              </p>
            </div>

            {/* Ink Stamps Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
              <span className={`ink-stamp text-sm ${isLost ? 'ink-stamp-lost -rotate-6' : 'ink-stamp-found rotate-3'}`}>
                {item.type}
              </span>
              <span
                className={`ink-stamp text-sm ${
                  isClaimed
                    ? 'ink-stamp-claimed rotate-2'
                    : item.status === 'pending'
                    ? 'ink-stamp-pending -rotate-3'
                    : 'ink-stamp-found rotate-6'
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
              <div className="flex items-center justify-between text-xs font-mono text-[#898989] mb-4 pb-2 border-b border-dashed border-[#898989]">
                <span className="inline-flex items-center gap-1.5 uppercase font-bold text-[#4B6E48]">
                  <Tag className="w-3.5 h-3.5" />
                  {item.category || 'General'}
                </span>
                {item.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Title (Slab Serif) */}
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#333333] tracking-tight mb-4 uppercase">
                {item.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 p-3 bg-[#F2F0EF] border border-[#898989] rounded-none mb-6">
                <MapPin className="w-4 h-4 text-[#4B6E48] shrink-0" />
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#898989]">Location Reported</p>
                  <p className="text-xs font-mono font-bold text-[#333333]">{item.location || 'Campus Location'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">Description Log</h3>
                <p className="text-xs font-mono text-[#333333] whitespace-pre-line leading-relaxed bg-[#F2F0EF] p-4 border border-[#898989] rounded-none">
                  {item.description || 'No additional description provided.'}
                </p>
              </div>

              {/* Reporter Info Card */}
              <div className="p-4 bg-[#B2AC88]/10 border border-[#898989] rounded-none mb-6">
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#333333] mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#4B6E48]" />
                  REPORTER_CONTACT_INFO
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#898989]">Name</span>
                    <span className="font-bold text-[#333333]">{reporterName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#898989]">Email</span>
                    <a
                      href={`mailto:${reporterEmail}`}
                      className="font-bold text-[#4B6E48] hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {reporterEmail}
                    </a>
                  </div>
                  {reporterPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#898989]">Phone</span>
                      <a
                        href={`tel:${reporterPhone}`}
                        className="font-bold text-[#4B6E48] hover:underline inline-flex items-center gap-1"
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
            <div className="pt-4 border-t border-[#898989]">
              {isOwner ? (
                <div className="space-y-6">
                  {/* Claim Requests Section (Owner Only) */}
                  {!isClaimed && item.type === 'found' && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#333333]">Claim Requests Log</h3>
                      {claimRequests.length > 0 ? (
                        <div className="space-y-3">
                          {claimRequests.map((req) => (
                            <div key={req._id} className="p-4 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold text-[#333333] uppercase">{req.requestedBy?.name}</p>
                                  <p className="text-[10px] text-[#898989]">{req.requestedBy?.email}</p>
                                </div>
                                <span className={`ink-stamp text-[9px] uppercase ${
                                  req.status === 'pending' ? 'ink-stamp-pending' :
                                  req.status === 'approved' ? 'ink-stamp-found' :
                                  'ink-stamp-lost'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="mb-2">
                                <p className="text-[10px] font-bold text-[#898989] mb-0.5">Verification Detail</p>
                                <p className="p-2 bg-[#E5E2E0] border border-[#898989] rounded-none">{req.verificationDetail}</p>
                              </div>
                              <div className="mb-3">
                                <p className="text-[10px] font-bold text-[#898989] mb-0.5">Contact Info</p>
                                <p className="text-[#333333]">{req.contactInfo}</p>
                              </div>
                              {req.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReviewClaim(req._id, 'approve')}
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-bold text-xs rounded-none transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60 uppercase border border-[#4B6E48]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReviewClaim(req._id, 'reject')}
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-transparent hover:bg-red-50 text-red-700 font-bold text-xs rounded-none transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60 border border-red-700"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-[#898989] italic">No active requests logged.</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 font-mono">
                  {!isClaimed && (
                    <button
                      onClick={handleMarkAsClaimed}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-bold text-xs rounded-none border border-[#4B6E48] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 uppercase"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-[#F2F0EF] border-t-transparent rounded-full animate-spin"></div>
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
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-red-50 text-[#898989] hover:text-red-700 font-bold text-xs rounded-none border border-[#898989] hover:border-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Log Entry</span>
                    </button>
                  ) : (
                    <div className="p-3 border border-red-700 bg-red-50/20 rounded-none space-y-2 text-center text-xs">
                      <p className="font-bold text-red-800 uppercase">Confirm delete registry entry?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteItem}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-red-700 text-white font-bold text-xs transition-all cursor-pointer rounded-none uppercase"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-[#898989] text-[#F2F0EF] font-bold text-xs transition-all cursor-pointer rounded-none uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              ) : (
                <div className="font-mono">
                  {(item.status === 'active' || item.status === 'pending') && item.type === 'found' ? (
                    <div className="space-y-4">
                      {claimSuccess ? (
                        <div className="p-4 bg-transparent border border-[#4B6E48] rounded-none text-center text-xs font-bold text-[#4B6E48] flex items-center justify-center gap-2 uppercase">
                          <CheckCircle className="w-4 h-4" />
                          Claim request logged successfully.
                        </div>
                      ) : showClaimForm ? (
                        <form onSubmit={handleClaimSubmit} className="p-4 bg-[#F2F0EF] border border-[#898989] rounded-none space-y-4">
                          <h4 className="font-bold text-[#333333] text-xs uppercase border-b border-[#898989] pb-2">Submit Claim Form</h4>
                          {claimError && (
                            <p className="text-xs text-red-700 font-bold bg-red-50/20 p-2 border border-red-700 rounded-none">{claimError}</p>
                          )}
                          <div>
                            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">Verification Detail</label>
                            <textarea
                              value={verificationDetail}
                              onChange={(e) => setVerificationDetail(e.target.value)}
                              placeholder="Identify marks, locks, contents, etc."
                              className="w-full p-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs focus:outline-none focus:border-[#4B6E48] resize-none h-20 text-[#333333] placeholder-[#898989]"
                              disabled={claimSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">Contact Info</label>
                            <input
                              type="text"
                              value={contactInfo}
                              onChange={(e) => setContactInfo(e.target.value)}
                              placeholder="Phone or contact reference"
                              className="w-full p-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs focus:outline-none focus:border-[#4B6E48] text-[#333333] placeholder-[#898989]"
                              disabled={claimSubmitting}
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={claimSubmitting}
                              className="flex-1 py-2.5 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-bold text-xs rounded-none border border-[#4B6E48] transition-all flex items-center justify-center disabled:opacity-70 uppercase cursor-pointer"
                            >
                              {claimSubmitting ? 'Logging...' : 'Submit Claim'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowClaimForm(false)}
                              disabled={claimSubmitting}
                              className="flex-1 py-2.5 bg-transparent hover:bg-[#B2AC88]/20 text-[#333333] border border-[#898989] font-bold text-xs rounded-none transition-all uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={
                            isAuthenticated
                              ? () => setShowClaimForm(true)
                              : () => navigate('/login')
                          }
                          className="w-full py-3.5 px-4 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 text-center uppercase rounded-none cursor-pointer"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Submit Claim Receipt</span>
                        </button>
                      )}
                      
                      <div className="text-center pt-2">
                        <a
                          href={`mailto:${reporterEmail}?subject=Regarding your Found post: ${encodeURIComponent(item.title)}`}
                          className="text-[11px] font-bold text-[#898989] hover:text-[#4B6E48] underline decoration-[#898989] underline-offset-2 transition-colors uppercase"
                        >
                          EMAIL_REPORTER_DIRECT
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <a
                        href={`mailto:${reporterEmail}?subject=Regarding your Lost %26 Found post: ${encodeURIComponent(item.title)}`}
                        className="w-full py-3.5 px-4 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] border border-[#4B6E48] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 text-center uppercase rounded-none"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Contact {reporterName}</span>
                      </a>
                      <p className="text-[10px] text-[#898989] text-center mt-2 uppercase tracking-wide">
                        Reach out directly via official email to arrange return.
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
