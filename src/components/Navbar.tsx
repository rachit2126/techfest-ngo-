'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  ChevronDown,
  Search,
  Bot,
  Menu,
  X,
  Check,
  User,
  LogOut,
  Sparkles,
  Bell
} from 'lucide-react';

import SahayLogo from '@/components/brand/SahayLogo';
import { SAHAY_BRAND } from '@/config/brand';

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donateDropdown, setDonateDropdown] = useState(false);
  const [bizDropdown, setBizDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  const donateRef = useRef<HTMLDivElement>(null);
  const bizRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Fallback to guest
      }
    }
    checkAuth();
  }, [pathname]);

  // Handle click outside & Escape key for all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (donateRef.current && !donateRef.current.contains(event.target as Node)) {
        setDonateDropdown(false);
      }
      if (bizRef.current && !bizRef.current.contains(event.target as Node)) {
        setBizDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDonateDropdown(false);
        setBizDropdown(false);
        setLangDropdown(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'ar', name: 'Arabic', native: 'العربية' }
  ];

  const isDarkTheme = false;

  return (
    <header className="relative z-40 w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8 pointer-events-auto bg-transparent">
      {/* FLOATING SAHAY CONTAINER */}
      <div className={`w-full max-w-[1420px] mx-auto rounded-[22px] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] px-4 sm:px-6 h-[76px] sm:h-[80px] flex items-center justify-between gap-2 lg:gap-3 transition-all duration-300 ${
        isDarkTheme
          ? 'bg-[#071329]/85 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border border-[#E3EAE3] shadow-[0_4px_24px_rgba(7,91,60,0.06)]'
      }`}>
        
        {/* 1. BRAND LOGO GROUP */}
        <SahayLogo variant="full" />

        {/* 2. DESKTOP NAVIGATION ITEMS */}
        <nav className={`hidden xl:flex items-center gap-0.5 2xl:gap-1.5 text-[13.5px] shrink-0 ${
          isDarkTheme ? 'text-slate-300' : 'text-[#182820]'
        }`}>
          {/* Home Active Pill */}
          <Link
            href="/"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : pathname === '/'
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-bold shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            Home
          </Link>

          {/* Explore NGOs */}
          <Link
            href="/explore"
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/explore')
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-bold shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            Explore NGOs
          </Link>

          {/* Donate Dropdown */}
          <div
            ref={donateRef}
            className="relative"
            onMouseEnter={() => setDonateDropdown(true)}
            onMouseLeave={() => setDonateDropdown(false)}
          >
            <button
              onClick={() => setDonateDropdown(!donateDropdown)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                isDarkTheme
                  ? 'bg-[#092247] text-cyan-400 border border-cyan-500/40 font-bold shadow-xs'
                  : isActive('/donate') || donateDropdown
                    ? 'bg-[#EAF4FF] text-[#087BFF] font-bold shadow-2xs'
                    : 'font-medium text-[#0B1B3A] hover:text-[#087BFF] hover:bg-slate-100/60'
              }`}
              aria-expanded={donateDropdown}
            >
              <span>Donate</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                donateDropdown ? 'rotate-180 text-cyan-400' : isDarkTheme ? 'text-cyan-400' : 'text-slate-400'
              }`} />
            </button>

            {donateDropdown && (
              <div className={`absolute top-full left-0 w-64 mt-1 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                isDarkTheme
                  ? 'bg-[#091b36]/95 border border-white/10 text-white'
                  : 'bg-white/95 border border-white/80'
              }`}>
                <Link
                  href="/donate/individual"
                  onClick={() => setDonateDropdown(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition group ${
                    isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF4FF]/80'
                  }`}
                >
                  <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#0B1B3A] group-hover:text-[#087BFF]'}`}>Individual & Community</div>
                  <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Blankets, rations, clothing aid</div>
                </Link>
                <Link
                  href="/donate/organisation"
                  onClick={() => setDonateDropdown(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition group ${
                    isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF4FF]/80'
                  }`}
                >
                  <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#0B1B3A] group-hover:text-[#087BFF]'}`}>Business & Surplus Lots</div>
                  <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>CSV bulk import with automated match</div>
                </Link>
                <Link
                  href="/donations"
                  onClick={() => setDonateDropdown(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition group ${
                    isDarkTheme ? 'hover:bg-white/10 border-t border-white/10' : 'hover:bg-[#EAF4FF]/80 border-t border-slate-100/80'
                  }`}
                >
                  <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#0B1B3A] group-hover:text-[#087BFF]'}`}>Live Donation Ledger</div>
                  <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Browse confirmed relief lots</div>
                </Link>
              </div>
            )}
          </div>

          {/* For Businesses Dropdown */}
          <div
            ref={bizRef}
            className="relative"
            onMouseEnter={() => setBizDropdown(true)}
            onMouseLeave={() => setBizDropdown(false)}
          >
            <button
              onClick={() => setBizDropdown(!bizDropdown)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                isDarkTheme
                  ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                  : isActive('/donate/organisation') || bizDropdown
                    ? 'bg-[#EAF4FF] text-[#087BFF] font-bold shadow-2xs'
                    : 'font-medium text-[#0B1B3A] hover:text-[#087BFF] hover:bg-slate-100/60'
              }`}
              aria-expanded={bizDropdown}
            >
              <span>For Businesses</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${bizDropdown ? 'rotate-180 text-[#087BFF]' : 'text-slate-400'}`} />
            </button>

            {bizDropdown && (
              <div className={`absolute top-full left-0 w-64 mt-1 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                isDarkTheme
                  ? 'bg-[#091b36]/95 border border-white/10 text-white'
                  : 'bg-white/95 border border-white/80'
              }`}>
                <Link
                  href="/donate/organisation"
                  onClick={() => setBizDropdown(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition group ${
                    isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF4FF]/80'
                  }`}
                >
                  <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#0B1B3A] group-hover:text-[#087BFF]'}`}>Corporate Surplus Donation</div>
                  <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Hotels, retailers & manufacturers</div>
                </Link>
                <Link
                  href="/ngos/register"
                  onClick={() => setBizDropdown(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition group ${
                    isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF4FF]/80'
                  }`}
                >
                  <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#0B1B3A] group-hover:text-[#087BFF]'}`}>Partner NGO Intake</div>
                  <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Statutory 80G verification enrollment</div>
                </Link>
              </div>
            )}
          </div>

          {/* Emergency */}
          <Link
            href="/emergency"
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-rose-400 hover:bg-white/5'
                : isActive('/emergency')
                  ? 'bg-rose-50 text-rose-600 font-bold shadow-2xs'
                  : 'font-medium text-[#0B1B3A] hover:text-rose-600 hover:bg-rose-50/60'
            }`}
          >
            Emergency
          </Link>

          {/* Impact */}
          <Link
            href="/impact"
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/impact')
                  ? 'bg-[#EAF4FF] text-[#087BFF] font-bold shadow-2xs'
                  : 'font-medium text-[#0B1B3A] hover:text-[#087BFF] hover:bg-slate-100/60'
            }`}
          >
            Impact
          </Link>

          {/* AI Assistant Special Pill */}
          <Link
            href="/assistant"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 font-bold text-xs ${
              isDarkTheme
                ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-teal-400/60 shadow-[0_0_15px_rgba(21,156,154,0.35)] text-teal-300'
                : isActive('/assistant')
                  ? 'bg-[#075B3C] text-white shadow-md shadow-emerald-900/20'
                  : 'bg-[#EAF3EC] text-[#075B3C] border border-[#075B3C]/30 hover:bg-[#dbeee0] shadow-2xs'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0 text-[#159C9A]" />
            <span>AI Assistant</span>
          </Link>

          {/* About */}
          <Link
            href="/about"
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/about')
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-bold shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            About
          </Link>
        </nav>

        {/* 3. SEARCH BAR, LANGUAGE SELECTOR, NOTIFICATIONS & AVATAR */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          {/* Pill-shaped search bar */}
          <form onSubmit={handleSearch} className="relative w-36 xl:w-44 2xl:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGOs, locations or needs..."
              className={`w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border transition-all duration-200 shadow-2xs placeholder:truncate focus:outline-none ${
                isDarkTheme
                  ? 'border-slate-700/60 bg-[#091a36]/80 hover:bg-[#0c2145] focus:bg-[#0c2145] text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                  : 'border-slate-200/90 bg-white/70 hover:bg-white focus:bg-white text-[#0B1B3A] placeholder:text-slate-400 focus:border-[#087BFF] focus:ring-2 focus:ring-[#087BFF]/20'
              }`}
            />
          </form>

          {/* Language Selector Dropdown */}
          <div ref={langRef} className="relative shrink-0">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-[#0B1B3A] hover:bg-slate-100/70 border border-transparent hover:border-slate-200'
              }`}
              title="Select Language / Region"
              aria-label="Select Language / Region"
            >
              <Globe className="w-4 h-4" />
            </button>

            {langDropdown && (
              <div className={`absolute top-full right-0 w-44 mt-1 backdrop-blur-xl rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs ${
                isDarkTheme
                  ? 'bg-[#091b36]/95 border border-white/10 text-white'
                  : 'bg-white/95 border border-white/80'
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.name);
                      setLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
                      selectedLang === lang.name
                        ? isDarkTheme ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-[#EAF4FF] text-[#087BFF] font-bold'
                        : isDarkTheme ? 'text-slate-200 hover:bg-white/10' : 'text-[#0B1B3A] hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {selectedLang === lang.name && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell (Reference Matched) */}
          <button
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar / Capsule */}
          <div className="flex items-center gap-2 pl-1 shrink-0 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-md border border-purple-200">
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0B1B3A] leading-tight group-hover:text-[#087BFF] transition">
                {user?.name || 'Vikramaditya S.'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{user?.role || 'Individual'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B1B3A] transition" />
          </div>
        </div>

        {/* 4. MOBILE HAMBURGER BUTTON */}
        <div className="xl:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border border-transparent ${
              isDarkTheme ? 'text-white hover:bg-slate-800' : 'text-[#0B1B3A] hover:bg-white/80 hover:border-slate-200'
            }`}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 5. MOBILE GLASS DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden max-w-7xl mx-auto mt-2 rounded-[22px] bg-white/95 backdrop-blur-[24px] border border-white/70 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGOs, locations or needs..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-[#0B1B3A] focus:bg-white focus:outline-none focus:border-[#087BFF]"
            />
          </form>

          {/* Navigation Links */}
          <div className="space-y-1 text-xs font-semibold text-[#0B1B3A]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl transition ${
                pathname === '/' ? 'bg-[#EAF4FF] text-[#087BFF] font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl transition ${
                isActive('/explore') ? 'bg-[#EAF4FF] text-[#087BFF] font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Explore NGOs & Live Globe
            </Link>
            <Link
              href="/donate/individual"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Donate as Individual / Community
            </Link>
            <Link
              href="/donate/organisation"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              For Businesses (Corporate Surplus CSV)
            </Link>
            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
            >
              Emergency Relief Coordination
            </Link>
            <Link
              href="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Impact & Sustainability Dashboard
            </Link>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl bg-[#EAF3EC] text-[#075B3C] font-bold"
            >
              Ask Sahay AI Assistant
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              About Sahay
            </Link>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {user ? (
              <div className="w-full flex items-center justify-between">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-4 rounded-xl bg-[#EAF4FF] text-[#087BFF] font-bold text-xs"
                >
                  Dashboard ({user.name || 'Account'})
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0B1B3A]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-xl bg-[#071A3D] text-white text-xs font-bold shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
