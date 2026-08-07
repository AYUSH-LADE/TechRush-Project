import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  UploadCloud,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
  PlusCircle,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = [
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

const ReportItem = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const [formData, setFormData] = useState({
    title: locationState?.prefillData?.title || locationState?.title || '',
    description: locationState?.prefillData?.description || locationState?.description || '',
    category: CATEGORIES.includes(locationState?.prefillData?.category || locationState?.category)
      ? (locationState?.prefillData?.category || locationState?.category)
      : 'Electronics',
    location: LOCATIONS.includes(locationState?.prefillData?.location || locationState?.location)
      ? (locationState?.prefillData?.location || locationState?.location)
      : 'Main Library',
    type: locationState?.prefillData?.type || locationState?.type || 'lost',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    if (error) setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('type', formData.type);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit item:', err);
      setError(
        err.response?.data?.message || 'Failed to submit report. Please check server or file details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0EF] py-10 px-4 sm:px-6 lg:px-8 text-[#333333]">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-[#898989] text-[#4B6E48] mb-3 bg-[#F2F0EF]">
            <PlusCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#333333] uppercase">
            Log Property Report
          </h1>
          <p className="text-xs font-mono text-[#898989] mt-1 max-w-md mx-auto uppercase">
            Provide details to register this entry into the campus log book.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-6 sm:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/20 border border-red-700 flex items-start gap-3 text-red-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Visual Lost / Found Toggle */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-3">
                Report Type <span className="text-red-700">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'lost' })}
                  className={`p-4 rounded-none border flex items-center justify-center gap-3 transition-all cursor-pointer font-mono text-xs uppercase ${
                    formData.type === 'lost'
                      ? 'border-[#898989] bg-[#B2AC88]/30 text-[#333333] font-bold'
                      : 'border-[#898989] bg-transparent text-[#898989]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>I Lost Something</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'found' })}
                  className={`p-4 rounded-none border flex items-center justify-center gap-3 transition-all cursor-pointer font-mono text-xs uppercase ${
                    formData.type === 'found'
                      ? 'border-[#4B6E48] bg-[#4B6E48] text-[#F2F0EF] font-bold'
                      : 'border-[#898989] bg-transparent text-[#898989]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>I Found Something</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Item Title <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Silver MacBook Air, Black Wallet"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
              />
            </div>

            {/* Category & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                  Category <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] focus:outline-none focus:border-[#4B6E48] transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                  Location <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] focus:outline-none focus:border-[#4B6E48] transition-all appearance-none cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Detailed Description <span className="text-red-700">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Include identifying details such as brand, color tone, or unique marks..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
              ></textarea>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Item Image <span className="text-[#898989] font-normal lowercase">(optional)</span>
              </label>
              
              {!imagePreview ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border border-dashed border-[#898989] p-8 text-center transition-all cursor-pointer rounded-none bg-transparent`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload-input"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="image-upload-input" className="cursor-pointer block">
                    <div className="w-10 h-10 border border-[#898989] text-[#898989] flex items-center justify-center mx-auto mb-3 bg-[#F2F0EF]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-mono font-bold text-[#333333] uppercase">
                      Select image to upload
                    </p>
                    <p className="text-[10px] font-mono text-[#898989] mt-1 uppercase">
                      PNG, JPG, JPEG or WEBP up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-none overflow-hidden border border-[#898989] max-h-64 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 bg-red-700 text-white rounded-none border border-red-700 shadow-none transition-all cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-[#F2F0EF] border border-[#898989] text-[#333333] text-[10px] px-3 py-1 font-mono flex items-center gap-1.5 uppercase">
                    <ImageIcon className="w-3.5 h-3.5 text-[#4B6E48]" />
                    <span>Image Attached</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono font-bold text-xs uppercase tracking-wider border border-[#4B6E48] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-none mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#F2F0EF] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Register Report</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;
