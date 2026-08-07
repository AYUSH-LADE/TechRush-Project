import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#F2F0EF] border-b border-[#898989] text-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 border border-[#898989] bg-[#F2F0EF] flex items-center justify-center text-[#4B6E48]">
              <Search className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg text-[#333333] tracking-tight flex items-center gap-1">
                <span className="text-[#4B6E48]">RECLAIM</span>
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-wider text-[#898989] -mt-1">
                CAMPUS LOST PROPERTY LOG
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-0 border border-[#898989] bg-[#F2F0EF]">
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-all border-r border-[#898989] uppercase ${isActive('/')
                      ? 'bg-[#4B6E48] text-[#F2F0EF]'
                      : 'text-[#898989] hover:text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Explore
                </Link>

                <Link
                  to="/report"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-all border-r border-[#898989] uppercase ${isActive('/report')
                      ? 'bg-[#4B6E48] text-[#F2F0EF]'
                      : 'text-[#898989] hover:text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Log Item
                </Link>

                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-all uppercase ${isActive('/dashboard')
                      ? 'bg-[#4B6E48] text-[#F2F0EF]'
                      : 'text-[#898989] hover:text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-all uppercase ${isActive('/admin')
                    ? 'bg-[#4B6E48] text-[#F2F0EF]'
                    : 'text-[#898989] hover:bg-[#B2AC88]/20'
                  }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Moderation
              </Link>
            )}
          </div>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F0EF] border border-[#898989] rounded-none">
                  <div className="w-6 h-6 rounded-none bg-[#B2AC88] text-[#333333] flex items-center justify-center text-xs font-mono font-bold uppercase">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-mono font-bold text-[#333333] leading-none uppercase">
                      {user?.name || 'STUDENT'}
                    </p>
                    {isAdmin && (
                      <span className="text-[8px] font-mono font-extrabold uppercase text-[#4B6E48] leading-none">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#898989] text-xs font-mono font-bold text-[#898989] hover:text-[#333333] hover:bg-[#B2AC88]/20 transition-all cursor-pointer rounded-none uppercase"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#898989] text-xs font-mono font-bold text-[#333333] hover:bg-[#B2AC88]/20 transition-all uppercase rounded-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4B6E48] text-[#F2F0EF] text-xs font-mono font-bold hover:bg-[#4B6E48]/90 transition-all uppercase rounded-none"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[#898989] text-[#333333] hover:bg-[#B2AC88]/20 transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#898989] bg-[#F2F0EF] px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && (
            <div className="p-3 bg-[#F2F0EF] border border-[#898989] flex items-center gap-3 mb-2 rounded-none">
              <div className="w-9 h-9 bg-[#B2AC88] text-[#333333] flex items-center justify-center text-sm font-mono font-bold uppercase">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-[#333333] uppercase">{user?.name}</p>
                <p className="text-xs font-mono text-[#898989]">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-mono font-semibold transition-all border border-[#898989] mb-1.5 uppercase ${isActive('/') ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <Compass className="w-4 h-4" />
                  Explore Log
                </Link>

                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-mono font-semibold transition-all border border-[#898989] mb-1.5 uppercase ${isActive('/report') ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Log New Item
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-mono font-semibold transition-all border border-[#898989] uppercase ${isActive('/dashboard') ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#333333] hover:bg-[#B2AC88]/20'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-mono font-semibold transition-all border border-[#898989] uppercase ${isActive('/admin') ? 'bg-[#4B6E48] text-[#F2F0EF]' : 'text-[#898989] hover:bg-[#B2AC88]/20'
                  }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Moderation Log
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-[#898989]">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#898989] text-sm font-mono font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 border border-[#898989] text-sm font-mono font-bold text-[#333333] hover:bg-[#B2AC88]/20 transition-all text-center uppercase"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 bg-[#4B6E48] text-white text-sm font-mono font-bold hover:bg-[#4B6E48]/90 transition-all text-center uppercase"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
