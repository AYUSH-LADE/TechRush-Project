import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Search, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, {
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = response.data;
      const token = data.token;
      const user = data.user || (data._id ? { _id: data._id, name: data.name, email: data.email, role: data.role } : null);

      if (user && token) {
        login(user, token);
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.response && err.response.status === 403) {
        setError('Not authorized as an admin.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to log in. Please check your connection or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 bg-[#F2F0EF] text-[#333333]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#F2F0EF] border border-[#898989] rounded-none p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-[#898989] text-[#4B6E48] mb-4 bg-[#F2F0EF]">
              <Search className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-[#333333] uppercase">
              RECLAIM_LOGIN
            </h1>
            <p className="text-xs font-mono text-[#898989] mt-1 uppercase">
              Access the campus lost property registry
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

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/20 border border-red-700 flex items-start gap-3 text-red-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#898989] mb-2">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#898989]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@university.edu"
                  value={formData.email}
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
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#4B6E48] hover:bg-[#4B6E48]/90 text-[#F2F0EF] font-mono font-bold text-xs uppercase tracking-wider border border-[#4B6E48] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#F2F0EF] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate Log</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dashed border-[#898989] text-center">
            <p className="text-xs font-mono text-[#898989] uppercase">
              No active log record?{' '}
              <Link to="/signup" className="font-bold text-[#4B6E48] hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-[#898989] uppercase">
          <ShieldCheck className="w-4 h-4 text-[#4B6E48]" />
          <span>SECURED REGISTER LOG SYSTEM</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
