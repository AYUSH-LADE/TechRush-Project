import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, ShieldCheck, Phone } from 'lucide-react';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    adminSecret: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }
    if (role === 'admin' && !formData.adminSecret) {
      setError('Admin Secret is required for admin registration.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const endpoint = role === 'admin' ? '/auth/admin/register' : '/auth/register';
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
      };
      
      if (role === 'admin') {
        payload.adminSecret = formData.adminSecret;
      }

      const response = await api.post(endpoint, payload);

      const data = response.data;
      const token = data.token;
      const user = data.user || (data._id ? { _id: data._id, name: data.name, email: data.email, role: data.role } : null);

      if (user && token) {
        login(user, token);
        navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 400) {
        setError('User already exists with this email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 bg-[#F2F0EF] text-[#333333]">
      <div className="w-full max-w-md">
        <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-8">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-[#898989] text-[#4B6E48] mb-4 bg-[#F2F0EF]">
              <UserPlus className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-[#333333] uppercase">
              REGISTER_USER
            </h1>
            <p className="text-xs font-mono text-[#898989] mt-1 uppercase">
              Join the campus lost property network
            </p>
          </div>
          
          <div className="flex border border-[#898989] bg-[#F2F0EF] p-0.5 mb-6 rounded-none">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 text-xs font-mono font-bold transition-all uppercase rounded-none cursor-pointer ${
                role === 'student' ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#898989] hover:text-[#333333]'
              }`}
            >
              Student Log
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-xs font-mono font-bold transition-all uppercase rounded-none cursor-pointer ${
                role === 'admin' ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#898989] hover:text-[#333333]'
              }`}
            >
              Admin Log
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/20 border border-red-700 flex items-start gap-3 text-red-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Campus Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="alex.morgan@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="e.g. +1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-12 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#898989] hover:text-[#333333] focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {role === 'admin' && (
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Admin Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="adminSecret"
                    required
                    placeholder="Enter admin verification key"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F2F0EF] border border-[#898989] rounded-none text-xs font-mono text-[#333333] placeholder-[#898989]/50 focus:outline-none focus:border-[#4B6E48] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono font-bold text-xs uppercase tracking-wider border border-[#4B6E48] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#F2F0EF] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Log Registration</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dashed border-[#898989] text-center">
            <p className="text-xs font-mono text-[#898989] uppercase">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#4B6E48] hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-[#898989] uppercase">
          <ShieldCheck className="w-4 h-4 text-[#4B6E48]" />
          <span>VERIFIED ENROLLMENT LOG</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
