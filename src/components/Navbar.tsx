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

  const donateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bizTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const langTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDonateEnter = () => {
    if (donateTimeoutRef.current) clearTimeout(donateTimeoutRef.current);
    setDonateDropdown(true);
  };
  const handleDonateLeave = () => {
    if (donateTimeoutRef.current) clearTimeout(donateTimeoutRef.current);
    donateTimeoutRef.current = setTimeout(() => {
      setDonateDropdown(false);
    }, 220);
  };

  const handleBizEnter = () => {
    if (bizTimeoutRef.current) clearTimeout(bizTimeoutRef.current);
    setBizDropdown(true);
  };
  const handleBizLeave = () => {
    if (bizTimeoutRef.current) clearTimeout(bizTimeoutRef.current);
    bizTimeoutRef.current = setTimeout(() => {
      setBizDropdown(false);
    }, 220);
  };

  const handleLangEnter = () => {
    if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
    setLangDropdown(true);
  };
  const handleLangLeave = () => {
    if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
    langTimeoutRef.current = setTimeout(() => {
      setLangDropdown(false);
    }, 220);
  };

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
      {/* FLOATING SAHAY CONTAINER: Symmetrical rounded pill with consistent curvature */}
      <div className={`w-full max-w-[1420px] mx-auto rounded-[26px] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] px-5 sm:px-6 lg:px-7 h-[72px] sm:h-[76px] flex items-center justify-between gap-2 lg:gap-3 transition-all duration-300 relative overflow-visible ${
        isDarkTheme
          ? 'bg-[#071329]/85 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border border-[#E3EAE3] shadow-[0_4px_24px_rgba(7,91,60,0.06)]'
      }`}>
        
        {/* 1. BRAND LOGO GROUP: Authentic Sahay wordmark + Sanskrit tagline directly underneath */}
        <SahayLogo variant="header" />

        {/* 2. DESKTOP NAVIGATION ITEMS */}
        <nav className={`hidden xl:flex items-center gap-0.5 2xl:gap-1.5 text-[13.5px] shrink-0 ${
          isDarkTheme ? 'text-slate-300' : 'text-[#182820]'
        }`}>
          {/* Home Active Pill */}
          <Link
            href="/"
            className={`whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : pathname === '/'
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            Home
          </Link>

          {/* Explore NGOs */}
          <Link
            href="/explore"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/explore')
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            Explore NGOs
          </Link>

          {/* Donate Dropdown */}
          <div
            ref={donateRef}
            className="relative"
            onMouseEnter={handleDonateEnter}
            onMouseLeave={handleDonateLeave}
          >
            <button
              onClick={() => setDonateDropdown(!donateDropdown)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                isDarkTheme
                  ? 'bg-[#092247] text-cyan-400 border border-cyan-500/40 font-bold shadow-xs'
                  : isActive('/donate') || donateDropdown
                    ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                    : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
              }`}
              aria-expanded={donateDropdown}
            >
              <span>Donate</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                donateDropdown ? 'rotate-180 text-[#075B3C]' : 'text-[#88998F]'
              }`} />
            </button>

            {donateDropdown && (
              <div
                className="absolute top-full left-0 w-64 pt-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleDonateEnter}
                onMouseLeave={handleDonateLeave}
              >
                {/* Seamless invisible bridge so cursor movement between button and card never triggers mouseleave */}
                <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />
                <div className={`backdrop-blur-xl rounded-2xl shadow-[0_12px_36px_rgba(7,91,60,0.14)] p-2 ${
                  isDarkTheme
                    ? 'bg-[#091b36]/95 border border-white/10 text-white'
                    : 'bg-white/98 border border-[#E3EAE3]'
                }`}>
                  <Link
                    href="/donate/individual"
                    onClick={() => setDonateDropdown(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#182820] group-hover:text-[#075B3C]'}`}>Individual & Community</div>
                    <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-[#64746A]'}`}>Blankets, rations, clothing aid</div>
                  </Link>
                  <Link
                    href="/donate/organisation"
                    onClick={() => setDonateDropdown(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#182820] group-hover:text-[#075B3C]'}`}>Business & Surplus Lots</div>
                    <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-[#64746A]'}`}>CSV bulk import with automated match</div>
                  </Link>
                  <Link
                    href="/donations"
                    onClick={() => setDonateDropdown(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition group ${
                      isDarkTheme ? 'hover:bg-white/10 border-t border-white/10' : 'hover:bg-[#EAF3EC] border-t border-[#E3EAE3]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#182820] group-hover:text-[#075B3C]'}`}>Live Donation Ledger</div>
                    <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-[#64746A]'}`}>Browse confirmed relief lots</div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* For Businesses Dropdown */}
          <div
            ref={bizRef}
            className="relative"
            onMouseEnter={handleBizEnter}
            onMouseLeave={handleBizLeave}
          >
            <button
              onClick={() => setBizDropdown(!bizDropdown)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                isDarkTheme
                  ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                  : isActive('/donate/organisation') || bizDropdown
                    ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                    : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
              }`}
              aria-expanded={bizDropdown}
            >
              <span>For Businesses</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${bizDropdown ? 'rotate-180 text-[#075B3C]' : 'text-[#88998F]'}`} />
            </button>

            {bizDropdown && (
              <div
                className="absolute top-full left-0 w-64 pt-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleBizEnter}
                onMouseLeave={handleBizLeave}
              >
                {/* Seamless invisible bridge */}
                <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />
                <div className={`backdrop-blur-xl rounded-2xl shadow-[0_12px_36px_rgba(7,91,60,0.14)] p-2 ${
                  isDarkTheme
                    ? 'bg-[#091b36]/95 border border-white/10 text-white'
                    : 'bg-white/98 border border-[#E3EAE3]'
                }`}>
                  <Link
                    href="/donate/organisation"
                    onClick={() => setBizDropdown(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#182820] group-hover:text-[#075B3C]'}`}>Corporate Surplus Donation</div>
                    <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-[#64746A]'}`}>Hotels, retailers & manufacturers</div>
                  </Link>
                  <Link
                    href="/ngos/register"
                    onClick={() => setBizDropdown(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isDarkTheme ? 'text-white group-hover:text-cyan-400' : 'text-[#182820] group-hover:text-[#075B3C]'}`}>Partner NGO Intake</div>
                    <div className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-[#64746A]'}`}>Statutory 80G verification enrollment</div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Emergency */}
          <Link
            href="/emergency"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-rose-400 hover:bg-white/5'
                : isActive('/emergency')
                  ? 'bg-rose-50 text-rose-600 font-bold shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-rose-600 hover:bg-rose-50/60'
            }`}
          >
            Emergency
          </Link>

          {/* Impact */}
          <Link
            href="/impact"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/impact')
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            Impact
          </Link>

          {/* AI Assistant Special Pill matching reference design */}
          <Link
            href="/assistant"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-xs ${
              isDarkTheme
                ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-teal-400/60 shadow-[0_0_15px_rgba(21,156,154,0.35)] text-teal-300'
                : isActive('/assistant')
                  ? 'bg-[#075B3C] text-white shadow-md shadow-emerald-900/20'
                  : 'bg-[#EAF3EC]/70 text-[#075B3C] border border-[#159C9A]/35 hover:bg-[#EAF3EC] hover:border-[#159C9A] shadow-2xs'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0 text-[#159C9A]" />
            <span>AI Assistant</span>
          </Link>

          {/* About */}
          <Link
            href="/about"
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-150 ${
              isDarkTheme
                ? 'font-medium text-slate-300 hover:text-white hover:bg-white/5'
                : isActive('/about')
                  ? 'bg-[#EAF3EC] text-[#075B3C] font-semibold border border-[#075B3C]/15 shadow-2xs'
                  : 'font-medium text-[#182820] hover:text-[#075B3C] hover:bg-[#F4F8F5]'
            }`}
          >
            About
          </Link>
        </nav>

        {/* 3. SEARCH BAR, LANGUAGE SELECTOR, NOTIFICATIONS & AVATAR */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          {/* Pill-shaped search bar */}
          <form onSubmit={handleSearch} className="relative w-36 xl:w-44 2xl:w-52 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#88998F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGOs, locations..."
              className={`w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border transition-all duration-200 shadow-2xs placeholder:truncate focus:outline-none ${
                isDarkTheme
                  ? 'border-slate-700/60 bg-[#091a36]/80 hover:bg-[#0c2145] focus:bg-[#0c2145] text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                  : 'border-[#E3EAE3] bg-[#FBFDFB] hover:bg-white focus:bg-white text-[#182820] placeholder:text-[#88998F] focus:border-[#075B3C] focus:ring-2 focus:ring-[#075B3C]/15'
              }`}
            />
          </form>

          {/* Language Selector Dropdown */}
          <div
            ref={langRef}
            className="relative shrink-0"
            onMouseEnter={handleLangEnter}
            onMouseLeave={handleLangLeave}
          >
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-[#556960] hover:text-[#075B3C] hover:bg-[#EAF3EC] border border-transparent'
              }`}
              title="Select Language / Region"
              aria-label="Select Language / Region"
            >
              <Globe className="w-4 h-4" />
            </button>

            {langDropdown && (
              <div
                className="absolute top-full right-0 w-44 pt-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs"
                onMouseEnter={handleLangEnter}
                onMouseLeave={handleLangLeave}
              >
                {/* Seamless invisible bridge */}
                <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />
                <div className={`backdrop-blur-xl rounded-2xl shadow-[0_12px_36px_rgba(7,91,60,0.14)] p-1.5 ${
                  isDarkTheme
                    ? 'bg-[#091b36]/95 border border-white/10 text-white'
                    : 'bg-white/98 border border-[#E3EAE3]'
                }`}>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#88998F] uppercase tracking-wider">
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
                          ? isDarkTheme ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-[#EAF3EC] text-[#075B3C] font-bold'
                          : isDarkTheme ? 'text-slate-200 hover:bg-white/10' : 'text-[#182820] hover:bg-[#F4F8F5] font-medium'
                      }`}
                    >
                      <span>{lang.native}</span>
                      {selectedLang === lang.name && <Check className="w-3.5 h-3.5 text-[#075B3C]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell (Reference Matched) */}
          <button
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#556960] hover:text-[#075B3C] hover:bg-[#EAF3EC] transition-all cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar / Capsule */}
          <div className="flex items-center gap-2 pl-1 shrink-0 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="text-xs font-bold text-[#182820] leading-tight group-hover:text-[#075B3C] transition">
                {user?.name || 'Vikramaditya S.'}
              </span>
              <span className="text-[10px] text-[#88998F] font-medium">{user?.role || 'Individual'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#88998F] group-hover:text-[#075B3C] transition" />
          </div>
        </div>

        {/* 4. MOBILE HAMBURGER BUTTON */}
        <div className="xl:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border border-transparent ${
              isDarkTheme ? 'text-white hover:bg-slate-800' : 'text-[#182820] hover:bg-[#EAF3EC]'
            }`}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 5. MOBILE GLASS DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden max-w-7xl mx-auto mt-2 rounded-[24px] bg-white/95 backdrop-blur-[24px] border border-[#E3EAE3] shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-[#88998F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGOs, locations or needs..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E3EAE3] bg-[#FBFDFB] text-[#182820] focus:bg-white focus:outline-none focus:border-[#075B3C] focus:ring-2 focus:ring-[#075B3C]/15"
            />
          </form>

          {/* Navigation Links */}
          <div className="space-y-1 text-xs font-semibold text-[#182820]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl transition ${
                pathname === '/' ? 'bg-[#EAF3EC] text-[#075B3C] font-bold' : 'hover:bg-[#F4F8F5]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl transition ${
                isActive('/explore') ? 'bg-[#EAF3EC] text-[#075B3C] font-bold' : 'hover:bg-[#F4F8F5]'
              }`}
            >
              Explore NGOs & Live Globe
            </Link>
            <Link
              href="/donate/individual"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F4F8F5]"
            >
              Donate as Individual / Community
            </Link>
            <Link
              href="/donate/organisation"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F4F8F5]"
            >
              For Businesses (Corporate Surplus CSV)
            </Link>
            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-[#C83D4B] hover:bg-rose-50 font-bold"
            >
              Emergency Relief Coordination
            </Link>
            <Link
              href="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F4F8F5]"
            >
              Impact & Sustainability Dashboard
            </Link>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl bg-[#EAF3EC] text-[#075B3C] font-bold border border-[#075B3C]/20"
            >
              Ask Sahay AI Assistant
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F4F8F5]"
            >
              About Sahay
            </Link>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-[#E3EAE3] flex items-center gap-2">
            {user ? (
              <div className="w-full flex items-center justify-between">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-4 rounded-xl bg-[#EAF3EC] text-[#075B3C] font-bold text-xs"
                >
                  Dashboard ({user.name || 'Account'})
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 rounded-xl border border-[#E3EAE3] text-xs font-bold text-[#64746A] hover:bg-slate-50 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-xl border border-[#E3EAE3] text-xs font-bold text-[#182820] hover:bg-[#F4F8F5]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-xl bg-[#075B3C] hover:bg-[#06452F] text-white text-xs font-bold shadow-md"
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
