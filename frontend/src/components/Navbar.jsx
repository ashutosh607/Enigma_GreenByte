import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Shield, Menu, X, LogIn, UserPlus, LogOut, Sparkles } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';
import RoleSwitcher from './RoleSwitcher';
import LoginModal from './LoginModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {/* 
        On Home/Landing page, the navbar floats seamlessly over the background video
        with the logo on the far left, links in the center, and login/sign-up on the far right.
      */}
      <header 
        className={`${
          isHome
            ? 'absolute top-4 sm:top-6 left-0 right-0 z-40 flex justify-center px-4 sm:px-6 pointer-events-none'
            : 'sticky top-0 z-40 w-full bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E3DBCC]'
        } select-none`}
      >
        <div 
          className={`${
            isHome
              ? 'pointer-events-auto w-full max-w-7xl h-14 sm:h-16 px-5 sm:px-8 rounded-2xl sm:rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4 transition-all duration-300'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4'
          }`}
        >
          {/* 1. LEFT SIDE: Logo separated to the far left */}
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

          {/* 2. MIDDLE: Navigation Links (Home, Marketplace, AI Discovery, Impact, and My Activity ONLY when logged in) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {/* Home link */}
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

            {/* Marketplace link */}
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

            {/* AI Discovery link */}
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

            {/* Impact link */}
            <Link
              to="/impact"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/impact')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              Impact
            </Link>

            {/* 
              My Activity: ONLY available and visible when the person has ALREADY LOGGED IN
            */}
            {user && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors animate-in fade-in duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-[#101010] text-[#FDFCF8]'
                    : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
                }`}
              >
                My Activity
              </Link>
            )}
          </nav>

          {/* 3. RIGHT SIDE: Separated Login & Sign Up (or Dashboard when logged in) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              /* When NOT logged in: Separate Login (popup) and Sign Up (new page) */
              <div className="flex items-center gap-2">
                {/* Login Button (Opens Modal Popup) */}
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold uppercase tracking-wider text-[#101010] hover:bg-black/5 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                {/* Sign Up Button (Navigates to dedicated /register page) */}
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : (
              /* When LOGGED IN: Reveal Dashboard Button & Persona Controls */
              <div className="flex items-center gap-2">
                <RoleSwitcher />
                <NotificationDropdown />

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl sm:rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-semibold transition-all shadow-sm"
                  title="Open Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#B8D957]" />
                  <span>Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-[#101010]/60 hover:text-red-600 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              Impact
            </Link>

            {/* My Activity in Mobile Menu ONLY when logged in */}
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
              >
                My Activity
              </Link>
            )}

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
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#101010]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#286B4A]" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-xs font-semibold text-red-600"
                  >
                    Logout
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
