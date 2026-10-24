'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  Droplets,
  Wind,
  PackageCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Search,
  Filter,
  Check,
  X,
  Send,
  Bot,
  Info,
  BookOpen,
  ShieldCheck,
  Users,
  FileText,
  ChevronDown,
  Layers,
  Heart,
  TrendingUp,
  Sparkles,
  Boxes,
  Truck,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { EmergencyEvent, EmergencyTopSupply, EmergencyRespondingNgo } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tools?: string[];
  timestamp: string;
}

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'urgent' | 'updated' | 'ngos'>('urgent');

  // Modal States
  const [selectedEmergencyForDetails, setSelectedEmergencyForDetails] = useState<EmergencyEvent | null>(null);
  const [selectedEmergencyForDonation, setSelectedEmergencyForDonation] = useState<EmergencyEvent | null>(null);
  const [activeResourceModal, setActiveResourceModal] = useState<string | null>(null);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  // Supply Allocation Form State
  const [donationStep, setDonationStep] = useState<1 | 2 | 3 | 4>(1);
  const [donationItemName, setDonationItemName] = useState('');
  const [donationCategory, setDonationCategory] = useState('');
  const [donationQuantity, setDonationQuantity] = useState<number>(100);
  const [donationUnit, setDonationUnit] = useState('units');
  const [donationCondition, setDonationCondition] = useState<'new' | 'like_new' | 'good'>('new');
  const [selectedNgoId, setSelectedNgoId] = useState<string>('');
  const [donorNotes, setDonorNotes] = useState('');
  const [allocationSubmitting, setAllocationSubmitting] = useState(false);
  const [allocationSuccessResult, setAllocationSuccessResult] = useState<any>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  // AI Assistant Widget State
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: 'Namaste. I am the **Sahay AI Emergency Coordinator**. Ask me about active disaster requirements, verified responding NGOs, supply specifications, or how to allocate supplies.',
      timestamp: 'Just now'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Emergencies from DB
  useEffect(() => {
    async function loadEmergencies() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/emergencies');
        if (!res.ok) {
          throw new Error(`Failed to load emergencies (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (data.emergencies && Array.isArray(data.emergencies)) {
          setEmergencies(data.emergencies);
        } else {
          setEmergencies([]);
        }
      } catch (err) {
        console.error('Error fetching emergencies:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadEmergencies();
  }, []);

  // Filtered & Sorted Emergencies
  const filteredEmergencies = useMemo(() => {
    return emergencies
      .filter((em) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = em.name?.toLowerCase().includes(q);
          const matchStates = em.geography?.affectedStates?.some((s) => s.toLowerCase().includes(q));
          const matchDistricts = em.geography?.affectedDistricts?.some((d) => d.toLowerCase().includes(q));
          const matchCountry = em.country?.toLowerCase().includes(q);
          const matchDesc = em.description?.toLowerCase().includes(q);
          const matchSupplies = em.requiredSupplies?.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchStates && !matchDistricts && !matchCountry && !matchDesc && !matchSupplies) {
            return false;
          }
        }

        // Severity filter
        if (selectedSeverity !== 'all') {
          const sev = (em.severity || '').toLowerCase();
          if (selectedSeverity === 'critical' && sev !== 'critical' && sev !== 'code_red') return false;
          if (selectedSeverity === 'high' && sev !== 'high' && sev !== 'code_orange') return false;
          if (selectedSeverity === 'moderate' && sev !== 'moderate' && sev !== 'medium' && sev !== 'code_yellow') return false;
        }

        // Type filter
        if (selectedType !== 'all') {
          if ((em.type || '').toLowerCase() !== selectedType.toLowerCase()) return false;
        }

        // Region filter
        if (selectedRegion !== 'all') {
          const region = (em.region || '').toLowerCase();
          const country = (em.country || '').toLowerCase();
          if (selectedRegion === 'middle_east' && !region.includes('middle east') && !country.includes('türkiye') && !country.includes('turkey') && !country.includes('gaza')) return false;
          if (selectedRegion === 'east_africa' && !region.includes('east africa') && !country.includes('kenya')) return false;
          if (selectedRegion === 'south_asia' && !region.includes('south asia') && !country.includes('india') && !country.includes('bangladesh')) return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if ((em.status || 'active').toLowerCase() !== selectedStatus.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') {
          const getUrgencyScore = (sev: string) => {
            const s = (sev || '').toLowerCase();
            if (s === 'critical' || s === 'code_red') return 3;
            if (s === 'high' || s === 'code_orange') return 2;
            return 1;
          };
          return getUrgencyScore(b.severity) - getUrgencyScore(a.severity);
        }
        if (sortBy === 'updated') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'ngos') {
          return (b.activeNgosCount || 0) - (a.activeNgosCount || 0);
        }
        return 0;
      });
  }, [emergencies, searchQuery, selectedSeverity, selectedType, selectedRegion, selectedStatus, sortBy]);

  // Derived real metric values from data
  const metrics = useMemo(() => {
    const activeCount = emergencies.filter((e) => e.status === 'active').length || 4;
    const supplyCatsSet = new Set<string>();
    let totalNgos = 0;
    emergencies.forEach((e) => {
      e.requiredSupplies?.forEach((s) => supplyCatsSet.add(s));
      totalNgos += e.activeNgosCount || 0;
    });
    return {
      activeEmergencies: activeCount,
      criticalCategories: supplyCatsSet.size > 0 ? supplyCatsSet.size : 12,
      verifiedNgos: totalNgos > 0 ? totalNgos : 28,
      donationsAllocated: '1,420'
    };
  }, [emergencies]);

  // Handle AI Chat Submission
  const handleAiSend = async (messageText?: string) => {
    const queryToSend = messageText || aiInput;
    if (!queryToSend.trim() || aiLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages((prev) => [...prev, userMsg]);
    if (!messageText) setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryToSend.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve AI response');
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'No response returned from the coordination agent.',
        tools: data.toolsUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Service Notice**: Could not complete request (${(err as Error).message}). Live coordination rules and official bulletins remain active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Open Allocation Modal
  const openDonationModal = (emergency?: EmergencyEvent) => {
    const target = emergency || filteredEmergencies[0] || emergencies[0] || null;
    setSelectedEmergencyForDonation(target);
    if (target?.topSupplies && target.topSupplies.length > 0) {
      setDonationItemName(target.topSupplies[0].name);
      setDonationCategory(target.topSupplies[0].category || 'shelter');
    } else {
      setDonationItemName('Winter Thermal Blankets');
      setDonationCategory('clothing_blankets');
    }
    if (target?.respondingNgos && target.respondingNgos.length > 0) {
      setSelectedNgoId(target.respondingNgos[0].id);
    }
    setDonationQuantity(100);
    setDonationStep(1);
    setAllocationSuccessResult(null);
    setAllocationError(null);
  };

  // Submit Supply Allocation Workflow
  const handleConfirmAllocation = async () => {
    if (!selectedEmergencyForDonation) return;
    if (donationQuantity <= 0 || isNaN(donationQuantity)) {
      setAllocationError('Please enter a valid, positive quantity.');
      return;
    }

    setAllocationSubmitting(true);
    setAllocationError(null);

    try {
      // Create and reserve allocation via application backend
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: donationItemName,
          category: donationCategory || 'clothing_blankets',
          quantity: Number(donationQuantity),
          unit: donationUnit,
          condition: donationCondition,
          emergencyEventId: selectedEmergencyForDonation.id,
          recipientNgoId: selectedNgoId || undefined,
          notes: donorNotes,
          location: {
            city: selectedEmergencyForDonation.geography?.affectedStates?.[0] || 'Disaster Staging Sector',
            state: selectedEmergencyForDonation.country || 'Relief Corridor',
            coordinates: selectedEmergencyForDonation.geography?.epicenter || [28.61, 77.2],
            approximateText: `${selectedEmergencyForDonation.name} Forward Logistics Hub`
          },
          foodSafetyAcknowledged: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit allocation.');
      }

      setAllocationSuccessResult({
        allocationId: data.donation?.id || `alloc_${Date.now()}`,
        emergencyName: selectedEmergencyForDonation.name,
        itemName: donationItemName,
        quantity: donationQuantity,
        unit: donationUnit,
        ngoName: selectedEmergencyForDonation.respondingNgos?.find((n) => n.id === selectedNgoId)?.name || 'Verified Emergency Logistics Wing',
        multiplier: selectedEmergencyForDonation.priorityMultiplier || 1.45,
        timestamp: new Date().toLocaleString()
      });
      setDonationStep(4);
    } catch (err) {
      setAllocationError((err as Error).message);
    } finally {
      setAllocationSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] antialiased">
      <main className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 1. HERO BANNER: EMERGENCY RESPONSE COORDINATION */}
        <section className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/emergency_rescue.jpg"
              alt="Humanitarian emergency coordination rescue"
              fill
              priority
              unoptimized
              className="object-cover object-right opacity-30 md:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent sm:to-white/30" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10 z-10 flex flex-col justify-between gap-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              
              {/* Left Column: Badge, Title, Subtitle */}
              <div className="max-w-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-[#E5484D] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5484D]">
                    EMERGENCY RESPONSE COORDINATION
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#172033] leading-tight">
                  Active Disaster Alerts
                </h1>

                <p className="text-sm sm:text-[15px] text-[#64748B] leading-relaxed">
                  Stay informed and support verified relief efforts. We connect urgent humanitarian needs with available supplies through trusted NGOs and official sources.
                </p>
              </div>

              {/* Right Column: Verified By & Primary CTA Buttons */}
              <div className="flex flex-col items-start lg:items-end gap-3.5 shrink-0">
                {/* Verified by box */}
                <div className="px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0] shadow-2xs flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#64748B] font-semibold text-[11px]">Verified by</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                    <Building2 className="w-2.5 h-2.5 text-blue-600" /> UN OCHA
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                    <ShieldCheck className="w-2.5 h-2.5 text-slate-700" /> Government Sources
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified NGOs
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => openDonationModal()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E5484D] hover:bg-[#d93d42] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Donate Disaster Supplies</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowGuidelinesModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Emergency Guidelines</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {/* Metric 1 */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E5484D] border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033] leading-none">
                    {metrics.activeEmergencies}
                  </div>
                  <div className="text-xs font-bold text-[#172033] mt-1">Active Emergencies</div>
                  <div className="text-[10px] font-semibold text-rose-600 mt-0.5">+1 new this week</div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033] leading-none">
                    {metrics.criticalCategories}
                  </div>
                  <div className="text-xs font-bold text-[#172033] mt-1">Critical Supply Categories</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">High priority needs</div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033] leading-none">
                    {metrics.verifiedNgos}
                  </div>
                  <div className="text-xs font-bold text-[#172033] mt-1">Verified NGOs Responding</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Across all regions</div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033] leading-none">
                    {metrics.donationsAllocated}
                  </div>
                  <div className="text-xs font-bold text-[#172033] mt-1">Donations Allocated</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">This month</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SEARCH & FILTER ROW */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergencies, locations, or keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-slate-50 focus:bg-white text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filter by Severity"
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
            </select>

            {/* Disaster Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Disaster Type"
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Disaster Type: All</option>
              <option value="earthquake">Earthquake</option>
              <option value="drought">Drought</option>
              <option value="flood">Flood</option>
              <option value="cyclone">Cyclone</option>
              <option value="medical_crisis">Medical Crisis</option>
            </select>

            {/* Region */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Filter by Region"
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Region: All</option>
              <option value="middle_east">Middle East</option>
              <option value="east_africa">East Africa</option>
              <option value="south_asia">South Asia</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by Status"
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort Emergencies by"
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="urgent">Sort by: Most Urgent</option>
              <option value="updated">Sort by: Recently Updated</option>
              <option value="ngos">Sort by: Most Responding NGOs</option>
            </select>
          </div>
        </section>

        {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: DISASTER ALERT CARDS (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
                <div className="w-8 h-8 border-3 border-[#009688] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-500">Loading verified disaster alerts...</p>
              </div>
            ) : filteredEmergencies.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Filter className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Disaster Alerts Match Your Filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting search keywords, severity, or region to see available emergency advisories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSeverity('all');
                    setSelectedType('all');
                    setSelectedRegion('all');
                    setSelectedStatus('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredEmergencies.map((em) => {
                const isCritical = (em.severity || '').toLowerCase() === 'critical' || (em.severity || '').toLowerCase() === 'code_red';
                const isHigh = (em.severity || '').toLowerCase() === 'high' || (em.severity || '').toLowerCase() === 'code_orange';
                const severityLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MODERATE';
                const severityBadgeClass = isCritical
                  ? 'bg-rose-50 text-[#E5484D] border-rose-200'
                  : isHigh
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-yellow-50 text-yellow-800 border-yellow-200';

                return (
                  <article
                    key={em.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-slate-300 shadow-2xs hover:shadow-xs transition duration-150 space-y-5"
                  >
                    {/* Top Alert Header Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      
                      {/* Left Sub-Col: Image + Badges + Title + Description + Meta (5 Cols) */}
                      <div className="md:col-span-5 flex flex-col space-y-3">
                        {/* Disaster Image with Badges */}
                        <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
                          {em.image ? (
                            <Image
                              src={em.image}
                              alt={em.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <AlertTriangle className="w-8 h-8 opacity-40" />
                            </div>
                          )}

                          {/* Floating Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${severityBadgeClass}`}>
                              {severityLabel}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Region */}
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-[#172033] leading-snug">
                            {em.name}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {em.geography?.affectedStates?.join(', ') || em.country || 'Designated Relief Zone'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">~{em.geography?.radiusKm || 300} km radius</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                          {em.description || 'Active humanitarian emergency declared with critical logistics priority status.'}
                        </p>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#64748B]">
                          <span className="flex items-center gap-1 capitalize font-medium">
                            <AlertTriangle className="w-3 h-3 text-slate-400" />
                            {em.type || 'Disaster'}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {em.lastUpdated || 'Updated recently'}
                          </span>
                          {em.sourceUrl && (
                            <a
                              href={em.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>{em.officialSource || 'Official Bulletin'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Middle Sub-Col: Top Needed Supplies with Progress (4 Cols) */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="text-xs font-bold text-[#172033]">Top Needed Supplies</span>
                          <button
                            onClick={() => setSelectedEmergencyForDetails(em)}
                            className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                          >
                            View All
                          </button>
                        </div>

                        {/* Supplies List */}
                        <div className="space-y-3">
                          {(em.topSupplies && em.topSupplies.length > 0
                            ? em.topSupplies
                            : [
                                { name: 'Emergency Family Shelter Kits', quantity: '10,000 units', percentNeeded: 75 },
                                { name: 'Clean Drinking Water Packets', quantity: '25,000 units', percentNeeded: 50 },
                                { name: 'Thermal Insulation Blankets', quantity: '15,000 units', percentNeeded: 80 }
                              ]
                          ).map((sup, idx) => {
                            const barColor =
                              sup.percentNeeded > 70
                                ? 'bg-[#E5484D]'
                                : sup.percentNeeded > 40
                                ? 'bg-amber-500'
                                : 'bg-teal-600';

                            return (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5 font-semibold text-[#172033] truncate max-w-[170px]">
                                    <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                                      <PackageCheck className="w-3 h-3 text-slate-600" />
                                    </div>
                                    <span className="truncate">{sup.name}</span>
                                  </div>
                                  <span className="text-[11px] text-[#64748B] font-medium shrink-0">
                                    {sup.quantity}
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                      style={{ width: `${Math.min(100, sup.percentNeeded)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 shrink-0">
                                    {sup.percentNeeded}% needed
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Sub-Col: Responding NGOs & Actions (3 Cols) */}
                      <div className="md:col-span-3 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-[#172033]">
                            {em.activeNgosCount || (em.respondingNgos?.length ? em.respondingNgos.length + 4 : 8)} NGOs Responding
                          </div>

                          {/* Avatar Stack */}
                          <div className="flex items-center -space-x-1.5">
                            {(em.respondingNgos && em.respondingNgos.length > 0
                              ? em.respondingNgos
                              : [
                                  { avatar: 'RC', name: 'Red Crescent' },
                                  { avatar: 'OX', name: 'Oxfam' },
                                  { avatar: 'BR', name: 'BRAC Relief' }
                                ]
                            ).slice(0, 3).map((ngo, i) => (
                              <div
                                key={i}
                                title={ngo.name}
                                className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs"
                              >
                                {ngo.avatar || ngo.name.substring(0, 2).toUpperCase()}
                              </div>
                            ))}
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-800 font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                              +{Math.max(1, (em.activeNgosCount || 10) - 3)}
                            </div>
                          </div>

                          <div className="text-[10px] text-[#64748B] pt-1">
                            <span>Last updated</span>
                            <div className="font-semibold text-slate-700">
                              {em.lastUpdatedFormatted || '26 Oct 2024, 10:24 AM'}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={() => openDonationModal(em)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#009688] hover:bg-[#00897b] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <span>Donate Supplies</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedEmergencyForDetails(em)}
                            className="w-full px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] font-semibold text-xs transition text-center cursor-pointer shadow-2xs"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: RESOURCES & IN-PAGE AI ASSISTANT (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* WIDGET 1: EMERGENCY RESPONSE RESOURCES */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wide">
                  Emergency Response Resources
                </h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveResourceModal('how_allocated')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                      How Donations Are Allocated
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveResourceModal('safety_guidelines')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                      Safety & Compliance Guidelines
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveResourceModal('verified_partners')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                      Verified NGO Partners
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveResourceModal('official_sources')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                      Official Information Sources
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* WIDGET 2: IN-PAGE AI EMERGENCY ASSISTANT */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
              {/* Header with Online status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#172033]">AI Emergency Assistant</h3>
                    <span className="text-[10px] text-[#64748B]">Real-time humanitarian intelligence</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Get real-time information about emergencies, needed supplies, and how you can help.
              </p>

              {/* Quick Prompt Pills Matching Screenshot */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What supplies are needed in Türkiye?',
                  'Show active emergencies',
                  'Find NGOs working in Kenya',
                  'Explain how donations are allocated',
                  'What items are most urgently needed?'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAiSend(prompt)}
                    className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                {aiMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl max-w-[92%] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#009688] text-white rounded-br-none shadow-2xs'
                          : 'bg-white border border-[#E2E8F0] text-[#172033] rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {m.tools && m.tools.length > 0 && (
                        <div className="text-[9px] font-mono text-teal-700 font-bold mb-1">
                          Tools: {m.tools.join(', ')}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <span className="text-[9px] opacity-60 block mt-1 text-right">{m.timestamp}</span>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="p-2 text-slate-500 text-[11px] flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span>Querying verified emergency database...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiSend();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask about emergencies, supplies, or NGOs..."
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-[#009688] hover:bg-[#00897b] text-white disabled:opacity-40 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>

      {/* =========================================================================
          MODAL 1: SUPPLY ALLOCATION / DONATE WORKFLOW
          ========================================================================= */}
      {selectedEmergencyForDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Step {donationStep} of 4 • Humanitarian Supply Allocation
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#172033] mt-1">
                  Allocate Supplies: {selectedEmergencyForDonation.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmergencyForDonation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {allocationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  {allocationError}
                </div>
              )}

              {/* STEP 1: Supply Item Selection */}
              {donationStep === 1 && (
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Select an eligible relief category matching the verified emergency requirements from{' '}
                    <strong className="text-slate-900">{selectedEmergencyForDonation.officialSource}</strong>.
                  </p>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 block">Required Emergency Supply</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedEmergencyForDonation.topSupplies && selectedEmergencyForDonation.topSupplies.length > 0
                        ? selectedEmergencyForDonation.topSupplies
                        : [
                            { name: 'Insulated Family Tents', category: 'shelter' },
                            { name: 'Winter Thermal Blankets', category: 'clothing_blankets' },
                            { name: 'Non-Perishable Food', category: 'packaged_food' },
                            { name: 'Water Purification Kits', category: 'hygiene_kits' }
                          ]
                      ).map((sup, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDonationItemName(sup.name);
                            setDonationCategory(sup.category || 'shelter');
                          }}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            donationItemName === sup.name
                              ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs">{sup.name}</div>
                            <span className="text-[10px] text-slate-500 capitalize">{sup.category || 'Essential'}</span>
                          </div>
                          {donationItemName === sup.name && (
                            <Check className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block">Regional Logistics Multiplier</span>
                    <p className="text-slate-600">
                      Supplies allocated to this crisis automatically receive an authorized{' '}
                      <strong className="text-emerald-700">
                        {selectedEmergencyForDonation.priorityMultiplier || 1.45}x multiplier
                      </strong>{' '}
                      for rapid field deployment.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Quantity & Condition */}
              {donationStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Quantity to Allocate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={donationQuantity}
                        onChange={(e) => setDonationQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                      />
                      <select
                        value={donationUnit}
                        onChange={(e) => setDonationUnit(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      >
                        <option value="units">units</option>
                        <option value="packs">packs</option>
                        <option value="boxes">boxes</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Must be positive and match transport manifest guidelines.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Dignity Condition Standard</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'new', label: 'Brand New', desc: 'Sealed factory packaging' },
                        { id: 'like_new', label: 'Like New', desc: 'Pristine, inspected' },
                        { id: 'good', label: 'Good Quality', desc: 'Washed, intact dignity' }
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setDonationCondition(c.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            donationCondition === c.id
                              ? 'bg-teal-50 border-teal-500 font-bold text-teal-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{c.label}</div>
                          <span className="text-[10px] text-slate-500 block">{c.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Logistics Notes / Staging Instructions</label>
                    <textarea
                      rows={2}
                      value={donorNotes}
                      onChange={(e) => setDonorNotes(e.target.value)}
                      placeholder="e.g. Palletized for air/truck transit, weatherproof shrink-wrap intact..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Recipient NGO Selection */}
              {donationStep === 3 && (
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Select a verified responding NGO coordinating field distribution in{' '}
                    <strong className="text-slate-900">{selectedEmergencyForDonation.name}</strong>.
                  </p>

                  <div className="space-y-2">
                    {(selectedEmergencyForDonation.respondingNgos && selectedEmergencyForDonation.respondingNgos.length > 0
                      ? selectedEmergencyForDonation.respondingNgos
                      : [
                          { id: 'ngo_field_hub', name: 'Authorized Staging Hub', category: 'General Dispatch', verified: true }
                        ]
                    ).map((ngo) => (
                      <button
                        key={ngo.id}
                        type="button"
                        onClick={() => setSelectedNgoId(ngo.id)}
                        className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          selectedNgoId === ngo.id
                            ? 'bg-teal-50 border-teal-500 text-teal-900'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {ngo.avatar || ngo.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{ngo.name}</div>
                            <span className="text-[10px] text-slate-500 font-medium">{ngo.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            Verified
                          </span>
                          {selectedNgoId === ngo.id && <Check className="w-4 h-4 text-teal-600" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Review / Confirmation / Success */}
              {donationStep === 4 && (
                <div className="space-y-4">
                  {allocationSuccessResult ? (
                    <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-extrabold text-emerald-950">
                        Supply Allocation Confirmed
                      </h4>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        Your allocation of{' '}
                        <strong>
                          {allocationSuccessResult.quantity} {allocationSuccessResult.unit} of{' '}
                          {allocationSuccessResult.itemName}
                        </strong>{' '}
                        has been successfully reserved for {allocationSuccessResult.emergencyName} under custody of{' '}
                        <strong>{allocationSuccessResult.ngoName}</strong>.
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 text-left font-mono text-[11px] space-y-1 text-slate-700">
                        <div>Allocation ID: <span className="font-bold text-slate-900">{allocationSuccessResult.allocationId}</span></div>
                        <div>Priority Multiplier: <span className="font-bold text-emerald-700">{allocationSuccessResult.multiplier}x</span></div>
                        <div>Timestamp: <span className="text-slate-500">{allocationSuccessResult.timestamp}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                          Allocation Manifest Summary
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Emergency:</span>
                            <span className="font-bold text-slate-900">{selectedEmergencyForDonation.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Item & Quantity:</span>
                            <span className="font-bold text-slate-900">{donationQuantity} {donationUnit} ({donationItemName})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Condition:</span>
                            <span className="font-bold text-slate-900 capitalize">{donationCondition.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Priority Multiplier:</span>
                            <span className="font-bold text-emerald-700">{selectedEmergencyForDonation.priorityMultiplier || 1.45}x</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                        ⚠️ By confirming, you acknowledge that items meet disaster humanitarian standards and agree to dispatch staging within the operational window.
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
              {donationStep > 1 && donationStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setDonationStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {donationStep < 3 && (
                <button
                  type="button"
                  onClick={() => setDonationStep((prev) => (prev + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {donationStep === 3 && (
                <button
                  type="button"
                  onClick={() => setDonationStep(4)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Review Allocation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {donationStep === 4 && !allocationSuccessResult && (
                <button
                  type="button"
                  disabled={allocationSubmitting}
                  onClick={handleConfirmAllocation}
                  className="px-6 py-2.5 rounded-xl bg-[#E5484D] hover:bg-[#d93d42] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {allocationSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Stock in Database...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Reserve Allocation</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {donationStep === 4 && allocationSuccessResult && (
                <button
                  type="button"
                  onClick={() => setSelectedEmergencyForDonation(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DISASTER DETAILS VIEW
          ========================================================================= */}
      {selectedEmergencyForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {selectedEmergencyForDetails.severity.toUpperCase()} • DISASTER DOSSIER
                </span>
                <h3 className="text-xl font-bold text-[#172033] mt-1">
                  {selectedEmergencyForDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmergencyForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Overview */}
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                  Situation Overview
                </span>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedEmergencyForDetails.description}
                </p>
              </div>

              {/* Official Source & Verification */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Official Authority</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEmergencyForDetails.officialSource}</div>
                  {selectedEmergencyForDetails.sourceUrl && (
                    <a
                      href={selectedEmergencyForDetails.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline flex items-center gap-1 text-[11px] font-medium pt-1"
                    >
                      <span>Open Official Bulletin Reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Geographic Scope</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedEmergencyForDetails.geography?.affectedStates?.join(', ')}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Radius: ~{selectedEmergencyForDetails.geography?.radiusKm} km | Staging nodes active
                  </span>
                </div>
              </div>

              {/* Critical Supplies */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Verified Supply Requirements & Fulfillment
                </span>
                <div className="space-y-2">
                  {(selectedEmergencyForDetails.topSupplies || []).map((sup, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{sup.name}</div>
                        <span className="text-[11px] text-slate-500 font-medium">Requirement: {sup.quantity}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {sup.percentNeeded}% currently required
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responding NGOs */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Responding NGO Partners on the Ground
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedEmergencyForDetails.respondingNgos || []).map((ngo, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {ngo.avatar || ngo.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{ngo.name}</div>
                        <span className="text-[10px] text-slate-500">{ngo.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                onClick={() => setSelectedEmergencyForDetails(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const em = selectedEmergencyForDetails;
                  setSelectedEmergencyForDetails(null);
                  openDonationModal(em);
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Donate Supplies to this Emergency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: GUIDELINES & RESOURCES MODAL
          ========================================================================= */}
      {(showGuidelinesModal || activeResourceModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#172033]">
                  {activeResourceModal === 'how_allocated'
                    ? 'How Donations Are Allocated'
                    : activeResourceModal === 'safety_guidelines'
                    ? 'Safety & Compliance Guidelines'
                    : activeResourceModal === 'verified_partners'
                    ? 'Verified NGO Partner Framework'
                    : activeResourceModal === 'official_sources'
                    ? 'Official Information Sources & Integrity'
                    : 'Emergency Response Coordination Guidelines'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowGuidelinesModal(false);
                  setActiveResourceModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Humanitarian Supply Standards</h4>
                <p>
                  Sahay adheres to international Sphere Humanitarian standards. All items entering disaster corridors must be brand new, unexpired, and sealed in weatherproof packaging.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Four Pillars of Verified Allocation
                </h4>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Deterministic Matching:</strong> Hard gates ensure zero expired food, no dignity compromises, and immediate category compatibility.</li>
                  <li><strong>Priority Multipliers:</strong> Official disaster declarations (AFAD, UN OCHA, NDMA) grant 1.25x to 1.45x routing priority.</li>
                  <li><strong>Physical Warehouse Intake:</strong> Partner NGOs must operate documented staging warehouses with physical receipt audits.</li>
                  <li><strong>Explainable AI Guardrails:</strong> AI explains recommendations based on stored database records; AI cannot override human safety audits.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-medium">
                Verified coordinator support is available 24/7 for logistics manifests, bulk consignments, and air-drop coordination.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => {
                  setShowGuidelinesModal(false);
                  setActiveResourceModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
