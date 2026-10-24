'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  ShieldCheck,
  Package,
  Globe,
  Heart,
  Users,
  Building2,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Apple,
  Cross,
  GraduationCap,
  Droplets,
  Home,
  Baby,
  Leaf,
  Plus
} from 'lucide-react';
import ExploreMap from '@/components/ExploreMap';
import GlobeVisualizer from '@/components/GlobeVisualizer';
import RealisticGlobeDashboard from '@/components/RealisticGlobeDashboard';

interface OrganisationItem {
  id: string;
  legalName: string;
  type: string;
  serviceArea: {
    country: string;
    state: string;
    city: string;
    district?: string;
    coordinates: [number, number];
    approximateLocationText: string;
    radiusKm: number;
  };
  publicProfile: {
    description: string;
    website?: string;
    contactEmail: string;
    contactPhone?: string;
    imageUrl?: string;
  };
  supportedCategories: string[];
  capacitySummary?: string;
  verificationStatus: string;
  verificationDate?: string;
  sourceProvenance?: {
    directoryName: string;
    recordId?: string;
  };
  activeNeedsCount: number;
  distanceKm?: number | null;
}

const FEATURED_CATEGORIES = [
  { id: 'food', name: 'Food & Nutrition', count: '1,245 NGOs', icon: Apple, color: 'text-amber-500 bg-amber-50' },
  { id: 'healthcare', name: 'Healthcare', count: '980 NGOs', icon: Cross, color: 'text-blue-500 bg-blue-50' },
  { id: 'education', name: 'Education', count: '764 NGOs', icon: GraduationCap, color: 'text-purple-500 bg-purple-50' },
  { id: 'disaster_relief', name: 'Disaster Relief', count: '692 NGOs', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50' },
  { id: 'clean_water', name: 'Clean Water', count: '580 NGOs', icon: Droplets, color: 'text-cyan-500 bg-cyan-50' },
  { id: 'shelter_housing', name: 'Shelter & Housing', count: '432 NGOs', icon: Home, color: 'text-orange-500 bg-orange-50' },
  { id: 'child_welfare', name: 'Child Welfare', count: '410 NGOs', icon: Baby, color: 'text-pink-500 bg-pink-50' },
  { id: 'environment', name: 'Environment', count: '362 NGOs', icon: Leaf, color: 'text-emerald-500 bg-emerald-50' }
];

function ExploreNGOsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View state
  const [viewMode, setViewMode] = useState<'map' | 'globe' | 'split' | 'directory'>('map');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRadius, setSelectedRadius] = useState<number>(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [verificationStatus, setVerificationStatus] = useState('all');
  const [donationOpportunities, setDonationOpportunities] = useState(false);
  const [emergencyResponse, setEmergencyResponse] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Data & Selection states
  const [ngos, setNgos] = useState<OrganisationItem[]>([]);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll ref for featured categories
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Load NGOs whenever filters or location change
  useEffect(() => {
    fetchNGOs();
  }, [
    selectedCategory,
    selectedCountry,
    selectedState,
    selectedCity,
    verificationStatus,
    donationOpportunities,
    emergencyResponse,
    sortBy,
    userLocation,
    selectedRadius
  ]);

  const fetchNGOs = async (queryOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = queryOverride !== undefined ? queryOverride : searchQuery;
      const params = new URLSearchParams();

      if (q.trim()) params.set('q', q.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedCountry !== 'all') params.set('country', selectedCountry);
      if (selectedState !== 'all') params.set('state', selectedState);
      if (selectedCity !== 'all') params.set('city', selectedCity);
      if (verificationStatus === 'verified') params.set('verifiedOnly', 'true');
      else if (verificationStatus !== 'all') params.set('status', verificationStatus);
      if (donationOpportunities) params.set('donationOpportunities', 'true');
      if (emergencyResponse) params.set('emergencyOnly', 'true');
      if (sortBy) params.set('sort', sortBy);

      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
        if (selectedRadius) params.set('radius', selectedRadius.toString());
      }

      const res = await fetch(`/api/ngos/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch organisations');
      const data = await res.json();
      setNgos(data.organisations || []);

      // If currently selected NGO is no longer in results, select first or null
      if (data.organisations?.length > 0 && !selectedNgoId) {
        setSelectedNgoId(data.organisations[0].id);
      }
    } catch (err: any) {
      console.error('Fetch NGOs error:', err);
      setError(err.message || 'Error searching organisations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNGOs();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setSelectedState('all');
    setSelectedCity('all');
    setSelectedCategory('all');
    setVerificationStatus('all');
    setDonationOpportunities(false);
    setEmergencyResponse(false);
    setUserLocation(null);
    setSelectedRadius(50);
    setSortBy('relevance');
    fetchNGOs('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocatingUser(false);
        setSortBy('distance');
      },
      err => {
        console.warn('Geolocation denied or failed:', err);
        setLocatingUser(false);
        // Fallback default: Connaught Place, New Delhi for demonstrative discovery
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
        setSortBy('distance');
      }
    );
  };

  const handleCardClick = (id: string) => {
    setSelectedNgoId(id);
    if (window.innerWidth < 1024) {
      setMobileTab('map');
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      categoriesScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      {/* SECTION A: TOP CONTROLS ROW (View Mode Selector, Metrics Ribbon, + Add NGO) */}
      <div className="pt-4 pb-2 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Selector Pills (Map View, Globe View, Split View, Directory) */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'map'
                  ? 'bg-[#00A878] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'globe'
                  ? 'bg-[#00A878] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Globe View</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'split'
                  ? 'bg-[#00A878] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'directory'
                  ? 'bg-[#00A878] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          </div>

          {/* Impact Metric Cards Ribbon */}
          <div className="hidden lg:flex items-center gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">12,450+</div>
                <div className="text-[9px] text-slate-400 font-medium">Verified NGOs</div>
              </div>
            </div>

            <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">180+</div>
                <div className="text-[9px] text-slate-400 font-medium">Countries</div>
              </div>
            </div>

            <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">560T</div>
                <div className="text-[9px] text-slate-400 font-medium">Resources Addressed</div>
              </div>
            </div>

            <div className="px-3 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">4.2M+</div>
                <div className="text-[9px] text-slate-400 font-medium">People Supported</div>
              </div>
            </div>
          </div>

          {/* + Add NGO Action Button */}
          <Link
            href="/ngos/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold shadow-md hover:shadow-lg transition shrink-0 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add NGO</span>
          </Link>
        </div>

        {/* SECTION B: ADVANCED SEARCH & DISCOVERY TOOLBAR */}
        <div className="pt-4 space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row items-center gap-3"
          >
            {/* Primary Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search NGO name, city, state, country, or relief category..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878] shadow-2xs"
              />
            </div>

            {/* Location & Radius Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleGetLocation}
                className={`flex-1 md:flex-none px-4 py-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition shadow-2xs ${
                  userLocation
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Navigation className={`w-4 h-4 ${locatingUser ? 'animate-spin text-teal-600' : 'text-teal-600'}`} />
                <span>{userLocation ? 'Location Active' : 'My Location'}</span>
              </button>

              <select
                value={selectedRadius}
                onChange={e => setSelectedRadius(Number(e.target.value))}
                className="px-3.5 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold transition shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
              >
                Search NGOs
              </button>
            </div>
          </form>

          {/* Secondary Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Country */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="all">Country: All</option>
                <option value="India">India</option>
                <option value="Türkiye">Türkiye</option>
                <option value="Kenya">Kenya</option>
                <option value="United States">United States</option>
                <option value="Brazil">Brazil</option>
              </select>
            </div>

            {/* State / Region */}
            <div className="relative">
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="all">State / Region: All</option>
                <option value="Delhi">Delhi</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Assam">Assam</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            {/* City */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="all">City: All</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Guwahati">Guwahati</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Varanasi">Varanasi</option>
              </select>
            </div>

            {/* Relief Category */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="all">Relief Category: All</option>
                <option value="packaged_food">Food & Nutrition</option>
                <option value="clothing_blankets">Clothing & Blankets</option>
                <option value="hygiene_kits">Hygiene Kits</option>
                <option value="medical_first_aid">Healthcare & First Aid</option>
                <option value="clean_water">Clean Water</option>
                <option value="disaster_relief">Disaster Relief</option>
              </select>
            </div>

            {/* Verification Status */}
            <div className="relative">
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="all">Verification Status: All</option>
                <option value="verified">Verified Hubs Only</option>
                <option value="in_review">Registered / In Review</option>
              </select>
            </div>

            {/* Donation Opportunities */}
            <button
              type="button"
              onClick={() => setDonationOpportunities(!donationOpportunities)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition shadow-2xs flex items-center gap-1.5 ${
                donationOpportunities
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span>Donation Opportunities</span>
            </button>

            {/* Emergency Response */}
            <button
              type="button"
              onClick={() => setEmergencyResponse(!emergencyResponse)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition shadow-2xs flex items-center gap-1.5 ${
                emergencyResponse
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Response</span>
            </button>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE TAB SELECTOR (Map vs List) */}
      <div className="lg:hidden px-4 mb-4">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setMobileTab('map')}
            className={`py-2 rounded-lg transition ${
              mobileTab === 'map' ? 'bg-[#00A878] text-white' : 'text-slate-600'
            }`}
          >
            World Map View
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`py-2 rounded-lg transition ${
              mobileTab === 'list' ? 'bg-[#00A878] text-white' : 'text-slate-600'
            }`}
          >
            NGO Directory List ({ngos.length})
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* LAYOUT 1: SPLIT VIEW */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Map + Featured Categories (lg:col-span-7) */}
            <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
              <ExploreMap
                ngos={ngos}
                selectedNgoId={selectedNgoId}
                onSelectNgo={id => setSelectedNgoId(id)}
                heightClass="h-[520px] sm:h-[580px]"
              />

              {/* FEATURED CATEGORIES CAROUSEL */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Featured Relief Categories
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollCategories('left')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                      title="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollCategories('right')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                      title="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={categoriesScrollRef}
                  className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1"
                >
                  {FEATURED_CATEGORIES.map(cat => {
                    const IconComp = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(isActive ? 'all' : cat.id);
                        }}
                        className={`flex-shrink-0 w-36 p-3.5 rounded-2xl border text-left transition ${
                          isActive
                            ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-200'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${cat.color} flex items-center justify-center mb-2.5 shadow-2xs`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cat.count}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: NGO Directory Cards List (lg:col-span-5) */}
            <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
              {/* Directory Header with Sort selector */}
              <div className="flex items-center justify-between pb-2">
                <div className="text-sm font-bold text-slate-900">
                  Showing <span className="text-[#00A878]">{ngos.length}</span> NGOs
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="py-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Relevance ▾</option>
                    <option value="distance">Nearest Distance</option>
                    <option value="verified">Verified Hubs First</option>
                    <option value="needs">Most Urgent Needs</option>
                  </select>
                </div>
              </div>

              {/* NGO Directory Cards Stack */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-48" />
                      <div className="h-3 bg-slate-100 rounded w-32" />
                      <div className="h-12 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : ngos.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No NGOs found for your current search</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try broadening your search keywords, expanding the radius, or clearing category filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[820px] overflow-y-auto pr-1">
                  {ngos.map(ngo => {
                    const isSelected = selectedNgoId === ngo.id;
                    return (
                      <div
                        key={ngo.id}
                        onClick={() => handleCardClick(ngo.id)}
                        className={`p-4 rounded-3xl bg-white border transition duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
                          isSelected
                            ? 'border-[#00A878] ring-2 ring-emerald-100'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Left Photo Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                            <img
                              src={ngo.publicProfile?.imageUrl || '/hero_volunteer.jpg'}
                              alt={ngo.legalName}
                              className="w-full h-full object-cover"
                            />
                            {ngo.verificationStatus === 'verified' && (
                              <div className="absolute top-1.5 left-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs block" />
                              </div>
                            )}
                          </div>

                          {/* Center Details */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Badges Bar */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              {ngo.verificationStatus === 'verified' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                                  <span>Registered</span>
                                </span>
                              )}

                              {ngo.verificationDate && (
                                <span className="text-slate-400 text-[10px]">
                                  Verified {new Date(ngo.verificationDate).toLocaleDateString()}
                                </span>
                              )}

                              {ngo.distanceKm !== null && ngo.distanceKm !== undefined && (
                                <span className="ml-auto font-mono font-semibold text-slate-500 text-[10px] bg-slate-100 px-2 py-0.5 rounded-md">
                                  {ngo.distanceKm} km
                                </span>
                              )}
                            </div>

                            {/* NGO Title */}
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                              {ngo.legalName}
                            </h4>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                              <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                              <span className="truncate">
                                {ngo.serviceArea.city}, {ngo.serviceArea.state}, {ngo.serviceArea.country}
                              </span>
                            </div>

                            {/* Short Description */}
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {ngo.publicProfile?.description}
                            </p>

                            {/* Category Tags */}
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              {ngo.supportedCategories?.slice(0, 3).map((cat, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium capitalize"
                                >
                                  {cat.replace(/_/g, ' ')}
                                </span>
                              ))}
                              {ngo.supportedCategories && ngo.supportedCategories.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  +{ngo.supportedCategories.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom CTA Actions */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {ngo.activeNeedsCount > 0 ? (
                              <span className="text-emerald-700 font-semibold">
                                {ngo.activeNeedsCount} active urgent needs
                              </span>
                            ) : (
                              'Accepting general surplus'
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/ngos/${encodeURIComponent(ngo.id)}`}
                              onClick={e => e.stopPropagation()}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                            >
                              View Profile
                            </Link>

                            <Link
                              href={`/donate/individual?ngoId=${encodeURIComponent(ngo.id)}`}
                              onClick={e => e.stopPropagation()}
                              className="px-3.5 py-1.5 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-semibold transition shadow-xs"
                            >
                              Donate Here
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BOTTOM CALLOUT: NEED HELP FINDING AN NGO? ASK AI ASSISTANT */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Need Help Finding an NGO?</div>
                    <div className="text-[11px] text-slate-500">Ask our AI Assistant for personalized recommendations</div>
                  </div>
                </div>

                <Link
                  href="/assistant"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <span>Ask AI Assistant</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 2: WORLD MAP ONLY */}
        {viewMode === 'map' && (
          <div className="space-y-6">
            <ExploreMap
              ngos={ngos}
              selectedNgoId={selectedNgoId}
              onSelectNgo={id => setSelectedNgoId(id)}
              heightClass="h-[750px]"
            />
          </div>
        )}

        {/* LAYOUT: GLOBE VIEW (3D Interactive Geospatial Hub) */}
        {viewMode === 'globe' && (
          <div className="space-y-6">
            <RealisticGlobeDashboard
              ngos={ngos}
              selectedNgoId={selectedNgoId}
              onSelectNgo={id => setSelectedNgoId(id)}
              onNavigateToDirectory={region => {
                setViewMode('directory');
                if (region) setSelectedCountry(region);
              }}
            />
          </div>
        )}

        {/* LAYOUT 3: DIRECTORY ONLY (Full width grid) */}
        {viewMode === 'directory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="text-sm font-bold text-slate-900">
                Directory Hubs Listing: <span className="text-[#00A878]">{ngos.length}</span> Verified Organisations
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="py-1 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs"
                >
                  <option value="relevance">Relevance</option>
                  <option value="distance">Nearest Distance</option>
                  <option value="verified">Verified Hubs First</option>
                  <option value="needs">Most Urgent Needs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngos.map(ngo => (
                <div
                  key={ngo.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={ngo.publicProfile?.imageUrl || '/hero_volunteer.jpg'}
                        alt={ngo.legalName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold border border-emerald-200 shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </div>
                      {ngo.distanceKm !== null && ngo.distanceKm !== undefined && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                            {ngo.distanceKm} km away
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 line-clamp-1">{ngo.legalName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{ngo.serviceArea.city}, {ngo.serviceArea.state}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ngo.publicProfile?.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {ngo.supportedCategories?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] capitalize">
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href={`/ngos/${encodeURIComponent(ngo.id)}`}
                      className="flex-1 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold text-center transition"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/donate/individual?ngoId=${encodeURIComponent(ngo.id)}`}
                      className="flex-1 py-2 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-semibold text-center transition"
                    >
                      Donate Here
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExploreNGOsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-10 bg-slate-200 rounded w-96" />
          <div className="h-14 bg-slate-200 rounded-2xl" />
          <div className="h-[520px] bg-slate-200 rounded-3xl" />
        </div>
      }
    >
      <ExploreNGOsContent />
    </Suspense>
  );
}

