import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  UploadCloud,
  FileText,
  MapPin,
  Tag,
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: 'Main Library',
    type: 'lost',
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

      // On success, redirect to /dashboard per requirements
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
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Lost or Found Item
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-md mx-auto">
            Provide key details so students and campus administration can help identify and return the item.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Visual Lost / Found Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Report Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'lost' })}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    formData.type === 'lost'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-md font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <HelpCircle className={`w-5 h-5 ${formData.type === 'lost' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>I Lost Something</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'found' })}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    formData.type === 'found'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-md font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 ${formData.type === 'found' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>I Found Something</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Item Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Blue Hydro Flask, Silver MacBook Air, Black Wallet"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Category & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Include identifying details such as brand, stickers, color tone, or unique marks..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              ></textarea>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Item Image <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              
              {!imagePreview ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload-input"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="image-upload-input" className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, JPEG or WEBP up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Attached</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Report</span>
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
