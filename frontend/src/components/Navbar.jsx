import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  ChevronDown,
  User,
  Package,
  PlusCircle,
  Settings,
  Building2,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';
import LoginModal from './LoginModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to enhance glassmorphism when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    dispatch(logout());
    navigate('/');
  };

  // Initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const companyName = user?.company?.name || 'Verified Member';

  return (
    <>
      {/* 
        Glassmorphism floating navbar persistently visible on scroll across all pages
      */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none select-none transition-all duration-300">
        <div
          className={`pointer-events-auto w-full max-w-7xl h-14 sm:h-16 px-5 sm:px-8 rounded-2xl sm:rounded-full transition-all duration-300 flex items-center justify-between gap-4 ${
            scrolled
              ? 'bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.1)]'
              : 'bg-white/70 hover:bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
          }`}
        >
          {/* 1. LEFT SIDE: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group text-decoration-none focus:outline-none">
              <div className="w-8 h-8 rounded-xl bg-[#101010] text-[#FDFCF8] flex items-center justify-center font-black text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                RE
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#101010] uppercase flex items-center gap-0.5 leading-none">
                  RE<span className="text-[#101010]/40">:</span>SOURCE
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#101010]/55 mt-0.5 font-medium">
                  Industrial Exchange
                </span>
              </div>
            </Link>
          </div>

          {/* 2. MIDDLE: Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              Home
            </Link>

            <Link
              to="/marketplace"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/marketplace')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              Marketplace
            </Link>

            <Link
              to="/ai-discovery"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                isActive('/ai-discovery')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#286B4A]" />
              AI Discovery
            </Link>
          </nav>

          {/* 3. RIGHT SIDE: Login / Sign Up OR Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold uppercase tracking-wider text-[#101010] hover:bg-black/5 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationDropdown />

                {/* Profile Button with Dropdown Below It */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] transition-all shadow-xs cursor-pointer focus:outline-none"
                    aria-label="User Profile Dropdown"
                    aria-expanded={profileDropdownOpen}
                  >
                    {/* Avatar Initials Badge */}
                    <div className="w-7 h-7 rounded-full bg-[#101010] text-[#FDFCF8] flex items-center justify-center text-xs font-bold font-mono shadow-inner">
                      {getInitials(displayName)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-[#101010] truncate max-w-[120px]">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-[#101010]/60 font-mono truncate max-w-[120px]">
                        {companyName}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#101010]/60 transition-transform duration-200 ${
                        profileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E3DBCC] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Header Details */}
                      <div className="px-4 py-3 border-b border-[#E3DBCC]/60 bg-[#FDFCF8] rounded-t-2xl">
                        <div className="text-xs font-mono font-bold text-[#286B4A] uppercase tracking-wider mb-0.5">
                          Active Account
                        </div>
                        <div className="text-sm font-bold text-[#101010] truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-[#101010]/65 truncate">
                          {user.email}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#101010]/80 bg-[#E3DBCC]/50 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3 text-[#101010]/60 shrink-0" />
                          <span className="truncate">{companyName}</span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Actions */}
                      <div className="py-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#101010] hover:bg-[#F3F0E9] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#286B4A]" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#101010]/85 hover:bg-[#F3F0E9] hover:text-[#101010] transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#101010]/60" />
                          <span>Purchases & Orders</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=add-product"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#101010]/85 hover:bg-[#F3F0E9] hover:text-[#101010] transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-[#101010]/60" />
                          <span>Add Live Product</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#101010]/85 hover:bg-[#F3F0E9] hover:text-[#101010] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#101010]/60" />
                          <span>Profile Settings</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1.5 border-t border-[#E3DBCC]/60">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-[#101010]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#E3DBCC] rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              Marketplace
            </Link>
            <Link
              to="/ai-discovery"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              AI Discovery
            </Link>

            <div className="pt-2 border-t border-[#E3DBCC]">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#E3DBCC] text-[#101010] text-xs font-bold uppercase tracking-wider text-center"
                  >
                    Log In
                  </button>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold uppercase tracking-wider text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <div className="px-3 py-2 bg-[#F3F0E9] rounded-xl mb-2">
                    <div className="text-xs font-bold text-[#101010]">{displayName}</div>
                    <div className="text-[11px] text-[#101010]/60 font-mono">{companyName}</div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#101010] rounded-lg hover:bg-black/5"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#286B4A]" />
                    Dashboard
                  </Link>

                  <Link
                    to="/dashboard?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#101010]/80 rounded-lg hover:bg-black/5"
                  >
                    <Package className="w-4 h-4 text-[#101010]/60" />
                    Purchases & Orders
                  </Link>

                  <Link
                    to="/dashboard?tab=add-product"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#101010]/80 rounded-lg hover:bg-black/5"
                  >
                    <PlusCircle className="w-4 h-4 text-[#101010]/60" />
                    Add Live Product
                  </Link>

                  <Link
                    to="/dashboard?tab=settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#101010]/80 rounded-lg hover:bg-black/5"
                  >
                    <Settings className="w-4 h-4 text-[#101010]/60" />
                    Profile Settings
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 text-left mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Popup Modal Only */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </>
  );
}
