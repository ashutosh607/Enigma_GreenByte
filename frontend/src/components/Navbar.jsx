import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import RoleSwitcher from './RoleSwitcher';
import ListResourceModal from './ListResourceModal';

export default function Navbar() {
  const location = useLocation();
  const [listModalOpen, setListModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E3DBCC] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex flex-col group text-decoration-none">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#101010] uppercase flex items-center gap-1">
              RE<span className="text-[#101010]/40">:</span>SOURCE
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#101010]/55 -mt-1 font-medium">
              Industrial Resource Exchange
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/marketplace"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/marketplace')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010] hover:bg-[#F3F0E9]'
              }`}
            >
              Marketplace
            </Link>

            <Link
              to="/ai-discovery"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                isActive('/ai-discovery')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010] hover:bg-[#F3F0E9]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#101010] animate-pulse" />
              AI Discovery
            </Link>

            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010] hover:bg-[#F3F0E9]'
              }`}
            >
              My Activity
            </Link>

            <Link
              to="/impact"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/impact')
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010] hover:bg-[#F3F0E9]'
              }`}
            >
              Impact
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* List Resource CTA */}
            <button
              type="button"
              onClick={() => setListModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E3DBCC] hover:bg-[#d6cbba] text-[#101010] text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Resource</span>
            </button>

            {/* Persona Switcher */}
            <RoleSwitcher />

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Dashboard Link Button */}
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-semibold transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            {/* Admin portal shortcut */}
            <Link
              to="/admin"
              className="p-1.5 rounded-lg hover:bg-[#F3F0E9] text-[#101010]/70 hover:text-[#101010] transition-colors"
              title="Admin & Commission Facilitator Portal"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#F3F0E9] text-[#101010]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F3F0E9] border-b border-[#E3DBCC] px-4 py-4 space-y-2">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010]"
            >
              Marketplace
            </Link>
            <Link
              to="/ai-discovery"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010]"
            >
              AI Discovery
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010]"
            >
              My Activity / Dashboard
            </Link>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010]"
            >
              Impact
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#101010]"
            >
              Admin Facilitator Portal
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setListModalOpen(true);
              }}
              className="w-full mt-2 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-sm font-bold text-center"
            >
              + List Resource
            </button>
          </div>
        )}
      </header>

      {/* Global List Resource Modal */}
      <ListResourceModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onCreated={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
