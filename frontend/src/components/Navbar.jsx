import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PlusCircle, LayoutDashboard, Shield, Menu, X, LogIn, LogOut, UserCheck, Sparkles } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';
import RoleSwitcher from './RoleSwitcher';
import ListResourceModal from './ListResourceModal';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [listModalOpen, setListModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  const handleMyActivityClick = (e) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* 
        On Home/Landing page, the navbar floats seamlessly over the video as a small sleek bar
        so the video is completely visible behind and around it with zero scroll needed!
      */}
      <header 
        className={`${
          isHome
            ? 'absolute top-4 sm:top-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none'
            : 'sticky top-0 z-40 w-full bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E3DBCC]'
        } select-none`}
      >
        <div 
          className={`${
            isHome
              ? 'pointer-events-auto w-full max-w-6xl h-14 sm:h-15 px-4 sm:px-6 rounded-2xl sm:rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between transition-all duration-300'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4'
          }`}
        >
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-2 group text-decoration-none focus:outline-none">
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

          {/* Middle: Navigation Links (Marketplace, AI Discovery, My Activity, Impact) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/marketplace"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/marketplace')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              Marketplace
            </Link>

            <Link
              to="/ai-discovery"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                isActive('/ai-discovery')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#286B4A]" />
              AI Discovery
            </Link>

            {/* My Activity Link — triggers Auth if not logged in */}
            <button
              type="button"
              onClick={handleMyActivityClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                isActive('/dashboard')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              My Activity
            </button>

            <Link
              to="/impact"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/impact')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/75 hover:text-[#101010] hover:bg-black/5'
              }`}
            >
              Impact
            </Link>
          </nav>

          {/* Right: Authentication & Conditional Dashboard */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* List Resource CTA (when logged in or opens modal) */}
            <button
              type="button"
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else setListModalOpen(true);
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E3DBCC]/80 hover:bg-[#E3DBCC] text-[#101010] text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Resource</span>
            </button>

            {/* If NOT Authenticated: Show Login / Sign Up */}
            {!user ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl sm:rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
              </button>
            ) : (
              /* If Authenticated: Show Dashboard Button, Role Switcher & Notifications */
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
                  className="p-1.5 rounded-lg hover:bg-black/5 text-[#101010]/60 hover:text-red-600 transition-colors"
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

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#E3DBCC] rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
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
            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleMyActivityClick(e);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              My Activity
            </button>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010] hover:bg-black/5"
            >
              Impact
            </Link>

            <div className="pt-2 border-t border-[#E3DBCC]">
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold uppercase tracking-wider text-center"
                >
                  Login / Sign Up
                </button>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#101010]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#286B4A]" />
                    Go to Dashboard
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

      {/* Resource Listing Modal */}
      <ListResourceModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSuccess={() => setListModalOpen(false)}
      />

      {/* Enterprise Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </>
  );
}
