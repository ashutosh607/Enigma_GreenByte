import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Usecases', href: '#usecases' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Careers', href: '#careers' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-6 sm:top-8 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav 
        className="pointer-events-auto relative flex items-center justify-between gap-6 sm:gap-10 h-12 sm:h-13 px-4 sm:px-6 rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
        aria-label="Main Navigation"
      >
        {/* Left: Brand Logo */}
        <a 
          href="#home" 
          className="flex items-center gap-2 group text-[#17231D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A] rounded-full px-1"
        >
          {/* Geometric loop icon matching reference logo */}
          <div className="w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 4.4-2.8 8.1-6.8 9.5" className="text-[#E6623B]" />
              <path d="M12 22a10 10 0 0 1-10-10c0-4.4 2.8-8.1 6.8-9.5" className="text-[#286B4A]" />
              <circle cx="12" cy="12" r="3.5" fill="#E6623B" className="text-[#E6623B]" />
            </svg>
          </div>
          <span className="font-heading font-semibold text-sm sm:text-[15px] tracking-tight text-[#17231D]">
            Haven
          </span>
        </a>

        {/* Center: Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[13px] font-medium text-[#17231D]/75 hover:text-[#17231D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A] rounded-md px-1.5 py-0.5"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right: Login Button & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="#login"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#17231D] hover:bg-[#2A3830] active:scale-95 text-white text-xs font-medium tracking-wide shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A]"
          >
            Login
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-[#17231D] hover:bg-black/5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286B4A]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#17231D] py-2 px-3 rounded-lg hover:bg-black/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-black/10">
              <a
                href="#login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center py-2.5 rounded-full bg-[#17231D] text-white text-xs font-semibold"
              >
                Login
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
