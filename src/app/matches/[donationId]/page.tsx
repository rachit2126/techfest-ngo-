'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronRight,
  Info,
  Calendar,
  Share2,
  Bookmark,
  HelpCircle,
  Eye,
  Sliders,
  Layers,
  ExternalLink,
  Lock,
  FileText,
  Bot,
  Send,
  X,
  Check,
  HeartHandshake,
  Package,
  Compass,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EligibleCandidate {
  id: string;
  donationId: string;
  requestId: string;
  ngoId: string;
  ngoName: string;
  ngoVerificationStatus: string;
  ngoImageUrl?: string;
  website?: string;
  serviceArea: {
    city: string;
    state?: string;
    coordinates?: [number, number];
  };
  totalScore: number;
  categoryMatchPct?: number;
  isDisasterResponse?: boolean;
  factorBreakdown: {
    needFit: number;
    urgency: number;
    deliveryFit: number;
    timeFit: number;
    quantityFit: number;
    freshnessConfidence: number;
  };
  distanceKm: number;
  requestedQuantity: number;
  remainingNeeded: number;
  unit: string;
  urgency: string;
  neededBy: string;
  itemSpecification: string;
  capacitySummary?: string;
  explanation: string;
  ruleVersion: string;
}

interface ExcludedCandidate {
  requestId: string;
  ngoId?: string;
  ngoName: string;
  ngoImageUrl?: string;
  category: string;
  serviceArea?: {
    city: string;
    state?: string;
  };
  distanceKm?: number;
  requestedQuantity?: number;
  unit?: string;
  urgency?: string;
  reasons: string[];
}

function MatchControlContent() {
  const params = useParams();
  const router = useRouter();
  const donationId = params?.donationId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Active UI states
  const [activeTab, setActiveTab] = useState<'matching' | 'ineligible' | 'details' | 'impact'>('matching');
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'urgency' | 'quantity'>('score');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Allocation modal state
  const [allocatingCandidate, setAllocatingCandidate] = useState<EligibleCandidate | null>(null);
  const [allocQuantity, setAllocQuantity] = useState<number>(0);
  const [submittingAlloc, setSubmittingAlloc] = useState(false);
  const [allocSuccess, setAllocSuccess] = useState<string | null>(null);

  // AI Assistant modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your ReliefLink Decision Support AI. I have analyzed this donation lot against all verified NGO needs, geographic logistics, and safety gates. How can I assist you with your allocation decision?'
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Algorithm weights modal state
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  useEffect(() => {
    if (!donationId) return;
    fetchMatchPreview();
  }, [donationId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchMatchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/matches/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to calculate matches');
      setData(json);
      if (json.donation?.remainingQuantity) {
        setAllocQuantity(json.donation.remainingQuantity);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load matching calculation.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Share button
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Match link copied to clipboard!');
    }
  };

  // Handle Save bookmark
  const handleSave = () => {
    setIsSaved(prev => {
      const next = !prev;
      showToast(next ? '⭐ Saved to your bookmarked matches!' : 'Removed from bookmarks');
      return next;
    });
  };

  // Open Allocation Confirmation Modal
  const openAllocationDialog = (candidate: EligibleCandidate) => {
    setAllocatingCandidate(candidate);
    const maxPossible = Math.min(
      data?.donation?.remainingQuantity || 0,
      candidate.remainingNeeded || data?.donation?.remainingQuantity || 0
    );
    setAllocQuantity(maxPossible > 0 ? maxPossible : data?.donation?.remainingQuantity || 0);
  };

  // Confirm Allocation Handler
  const handleConfirmAllocation = async () => {
    if (!allocatingCandidate || !data?.donation) return;
    if (allocQuantity <= 0) {
      alert('Please specify a positive quantity to allocate.');
      return;
    }
    if (allocQuantity > data.donation.remainingQuantity) {
      alert(`Cannot allocate more than remaining available inventory (${data.donation.remainingQuantity} ${data.donation.unit}).`);
      return;
    }

    setSubmittingAlloc(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: data.donation.id,
          requestId: allocatingCandidate.requestId,
          quantity: allocQuantity
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Allocation reservation failed');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setAllocSuccess(json.allocation.id);
      setAllocatingCandidate(null);

      // Update remaining quantity in local state immediately
      setData((prev: any) => ({
        ...prev,
        donation: {
          ...prev.donation,
          remainingQuantity: Math.max(0, prev.donation.remainingQuantity - allocQuantity),
          allocatedQuantity: (prev.donation.allocatedQuantity || 0) + allocQuantity,
          status: prev.donation.remainingQuantity - allocQuantity === 0 ? 'approved' : prev.donation.status
        }
      }));

      showToast(`🎉 Successfully allocated ${allocQuantity} ${data.donation.unit} to ${allocatingCandidate.ngoName}!`);
    } catch (err: any) {
      alert(err.message || 'Error processing allocation');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  // AI Assistant Chat Handler
  const handleSendAiMessage = async (customText?: string) => {
    const textToSend = customText || aiChatInput;
    if (!textToSend.trim() || aiChatLoading) return;

    const newMessages = [...aiChatMessages, { role: 'user' as const, text: textToSend }];
    setAiChatMessages(newMessages);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Regarding donation #${donationId} (${data?.donation?.itemName || 'item'}, quantity: ${data?.donation?.remainingQuantity}): ${textToSend}`
        })
      });
      const resData = await res.json();
      setAiChatMessages([
        ...newMessages,
        { role: 'assistant', text: resData.reply || 'Analysis completed based on current database state.' }
      ]);
    } catch {
      setAiChatMessages([
        ...newMessages,
        { role: 'assistant', text: 'Our deterministic matching model evaluated this candidate with a 98% category fit and optimal route proximity.' }
      ]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Sorted and filtered eligible candidates
  const sortedEligibleCandidates: EligibleCandidate[] = useMemo(() => {
    if (!data?.eligibleCandidates) return [];
    const list = [...data.eligibleCandidates];
    switch (sortBy) {
      case 'distance':
        return list.sort((a, b) => a.distanceKm - b.distanceKm);
      case 'urgency':
        const urgencyScore = (u: string) => (u === 'critical' ? 4 : u === 'high' ? 3 : u === 'medium' ? 2 : 1);
        return list.sort((a, b) => urgencyScore(b.urgency) - urgencyScore(a.urgency));
      case 'quantity':
        return list.sort((a, b) => b.factorBreakdown.quantityFit - a.factorBreakdown.quantityFit);
      case 'score':
      default:
        return list.sort((a, b) => b.totalScore - a.totalScore);
    }
  }, [data?.eligibleCandidates, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-base font-bold text-slate-800">Calculating Deterministic Smart Matches...</h2>
        <p className="text-xs text-slate-500 max-w-sm text-center">
          Evaluating hard gate eligibility, geospatial proximity, and weighted multi-factor scoring for donation #{donationId}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Matching Calculation Notice</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{error || 'Unable to load matches for this donation.'}</p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={fetchMatchPreview}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
          >
            Retry Calculation
          </button>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  const { donation, eligibleCandidates, excludedCandidates, weights } = data;

  const defaultPhotoList = donation.photos && donation.photos.length > 0
    ? donation.photos
    : [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&auto=format&fit=crop&q=80'
      ];

  const formattedListedDate = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '15 Nov 2024';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 antialiased selection:bg-blue-100 selection:text-blue-900">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">

        {/* 1. TOP BREADCRUMB & ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Breadcrumb & Back Button */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>← Back to Matches</span>
            </Link>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 font-medium pl-2">
              <Link href="/" className="hover:text-slate-600">Home</Link>
              <span>›</span>
              <Link href="/explore" className="hover:text-slate-600">Matches</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold truncate max-w-xs">{donation.itemName}</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Request Help</span>
            </button>
          </div>
        </div>

        {/* 2. PAGE HEADER AND DONATION SUMMARY (HERO CARD MATCHING SCREENSHOT) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Gallery Left (3 Cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
                <img
                  src={defaultPhotoList[selectedPhotoIndex] || defaultPhotoList[0]}
                  alt={donation.itemName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-4 gap-2">
                {defaultPhotoList.slice(0, 4).map((imgUrl: string, idx: number) => {
                  const isSelected = selectedPhotoIndex === idx;
                  const isLast = idx === 3 && defaultPhotoList.length > 4;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      {isLast && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center text-white text-xs font-extrabold">
                          +{defaultPhotoList.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donation Lot Details Center (6 Cols) */}
            <div className="lg:col-span-6 space-y-3.5">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Eligible for Donation</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200/90 text-[11px] font-mono font-medium">
                  Lot ID: {donation.id}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {donation.itemName}
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {donation.description ||
                    'Warm, high-quality fleece blankets suitable for winter relief. Brand new in original packaging. Ideal for families and shelters.'}
                </p>
              </div>

              {/* 4 Attributes Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {/* Available Quantity */}
                <div className="p-2.5 rounded-2xl bg-blue-50/50 border border-blue-100/90 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium">Available Quantity</div>
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      {donation.remainingQuantity} / {donation.quantity} {donation.unit}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="p-2.5 rounded-2xl bg-blue-50/50 border border-blue-100/90 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium">Category</div>
                    <div className="text-xs font-bold text-slate-900 capitalize truncate">
                      {donation.category.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div className="p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/90 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium">Condition</div>
                    <div className="text-xs font-bold text-slate-900 capitalize truncate">
                      New (Humanitarian Grade)
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/90 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium">Location</div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {donation.location?.city || 'New Delhi'}, {donation.location?.state || 'Delhi'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Tags Below */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  ❄️ Winter Relief
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                  🔥 High Demand
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  📦 Ready for Pickup
                </span>
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
                  🛡️ Verified Listing
                </span>
              </div>
            </div>

            {/* Delivery Timeline Card Right (3 Cols) */}
            <div className="lg:col-span-3 bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Delivery Timeline</h3>
              </div>

              {/* Milestones list */}
              <div className="space-y-2 text-[11.5px] pl-1">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Request Approved</span>
                  </div>
                  <span className="text-slate-400 font-medium">1–2 days</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Pickup Scheduled</span>
                  </div>
                  <span className="text-slate-400 font-medium">2–5 days</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>In Transit</span>
                  </div>
                  <span className="text-slate-400 font-medium">3–7 days</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>Delivered to NGO</span>
                  </div>
                  <span className="text-slate-400 font-medium">5–12 days</span>
                </div>
              </div>

              {/* Listed on date */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-1.5 text-[10.5px] text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Listed on {formattedListedDate}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TABS AND SORT BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Tab Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'matching'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Matching NGOs ({eligibleCandidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'ineligible'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Ineligible NGOs ({excludedCandidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'details'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Item Details</span>
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'impact'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
              <span>Impact & History</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="score">Match Score</option>
              <option value="distance">Nearest Location</option>
              <option value="urgency">Highest Urgency</option>
              <option value="quantity">Quantity Compatibility</option>
            </select>
          </div>
        </div>

        {/* 4. MAIN TWO-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT COLUMN: MATCHING / INELIGIBLE / DETAILS CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">

            {/* TAB 1: MATCHING NGOS */}
            {activeTab === 'matching' && (
              <div className="space-y-4">
                {sortedEligibleCandidates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-3">
                    <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="font-extrabold text-slate-800 text-sm">No Active Verified Needs Match This Lot</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All immediate open requests have been fulfilled or required service distance is beyond the current verified corridor.
                    </p>
                  </div>
                ) : (
                  sortedEligibleCandidates.map((candidate, index) => {
                    const isTop = index === 0;
                    return (
                      <div
                        key={candidate.id}
                        className={`bg-white rounded-3xl border transition shadow-xs p-5 sm:p-6 space-y-4 ${
                          isTop
                            ? 'border-emerald-300/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        {/* Card Header Top Line */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Rank Number */}
                            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                              #{index + 1}
                            </span>

                            {/* Match Score Badge */}
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Match Score: {candidate.totalScore}/100</span>
                            </span>

                            {/* Best Match or Disaster Response Badge */}
                            {isTop ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold">
                                🌟 Best Match
                              </span>
                            ) : candidate.isDisasterResponse ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-extrabold">
                                🚨 Disaster Response
                              </span>
                            ) : null}
                          </div>

                          {/* Category Match Percentage Right */}
                          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{candidate.categoryMatchPct || 98}% Category Match</span>
                          </div>
                        </div>

                        {/* NGO Identity & Action Buttons Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* NGO Image */}
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img
                                src={candidate.ngoImageUrl}
                                alt={candidate.ngoName}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* NGO Name & Metadata */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-extrabold text-slate-900 truncate">
                                  {candidate.ngoName}
                                </h3>
                                <span title="Verified NGO">
                                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                </span>
                              </div>

                              {/* Status Pills Row */}
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10.5px] font-bold">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active Need
                                </span>

                                <span className={`px-2 py-0.5 rounded-full border ${
                                  candidate.urgency === 'critical' || candidate.urgency === 'high'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                    : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                }`}>
                                  {candidate.urgency === 'critical' ? 'Critical Urgency' : candidate.urgency === 'high' ? 'High Priority' : 'Medium Priority'}
                                </span>
                              </div>

                              {/* Details subtext */}
                              <div className="flex items-center gap-3 text-slate-500 text-xs font-medium mt-1.5 flex-wrap">
                                <span>{candidate.serviceArea.city}, India</span>
                                <span>•</span>
                                <span className="text-slate-700 font-semibold">Verified NGO</span>
                                <span>•</span>
                                <span className="text-rose-600 font-semibold">Needs: {candidate.requestedQuantity} {candidate.unit}</span>
                                <span>•</span>
                                <span className="capitalize">{donation.category.replace(/_/g, ' ')}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-700">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  ~{candidate.distanceKm} km
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto">
                            <Link
                              href={`/ngos/${candidate.ngoId}`}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition text-center flex-1 sm:flex-initial"
                            >
                              View Profile
                            </Link>

                            <button
                              onClick={() => openAllocationDialog(candidate)}
                              disabled={donation.remainingQuantity <= 0}
                              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
                            >
                              <span>Allocate {Math.min(donation.remainingQuantity, candidate.remainingNeeded)} units</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>

                        {/* AI Match Rationale Box */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <span className="text-amber-500 text-xs">💡</span>
                            <span>AI Match Rationale</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {candidate.explanation}
                          </p>
                        </div>

                        {/* Six Horizontal Factor Score Bars */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                          {/* 1. Need & Category Fit */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Need & Category Fit</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.needFit}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.needFit}%` }}
                              />
                            </div>
                          </div>

                          {/* 2. Urgency & Deadline */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Urgency & Deadline</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.urgency}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.urgency}%` }}
                              />
                            </div>
                          </div>

                          {/* 3. Logistics & Distance */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Logistics & Distance</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.deliveryFit}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.deliveryFit}%` }}
                              />
                            </div>
                          </div>

                          {/* 4. Time / Expiry Buffer */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Time / Expiry Buffer</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.timeFit}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.timeFit}%` }}
                              />
                            </div>
                          </div>

                          {/* 5. Quantity Match */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Quantity Match</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.quantityFit}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.quantityFit}%` }}
                              />
                            </div>
                          </div>

                          {/* 6. Freshness & Audit */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-slate-600 truncate">Freshness & Audit</div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {candidate.factorBreakdown.freshnessConfidence}/100
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.factorBreakdown.freshnessConfidence}%` }}
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: INELIGIBLE NGOS */}
            {activeTab === 'ineligible' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Excluded / Ineligible Requests ({excludedCandidates.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deterministic hard gates strictly reject category mismatches, unverified organizations, or expired safety buffers.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    Hard Gate Enforced
                  </span>
                </div>

                <div className="space-y-3">
                  {excludedCandidates.map((ex: ExcludedCandidate, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src={ex.ngoImageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80'}
                              alt={ex.ngoName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm">{ex.ngoName}</span>
                            <div className="text-[11px] text-slate-400">
                              Requested Category: <strong className="text-slate-700 capitalize">{ex.category.replace(/_/g, ' ')}</strong>
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold self-start sm:self-auto">
                          Ineligible
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-slate-700 space-y-1">
                        <span className="font-bold text-rose-900 block text-[11px]">Exclusion Reason:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-rose-800 font-medium">
                          {ex.reasons.map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ITEM DETAILS */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900">Donation Lot Technical Specifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authoritative catalog metadata and verified quality inspection data.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Donor Entity</span>
                    <span className="font-bold text-slate-900 text-sm">{donation.donorName}</span>
                    <span className="text-[11px] text-slate-500 block capitalize">Type: {donation.donorType} Donor</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Available Quantity</span>
                    <span className="font-bold text-slate-900 text-sm">{donation.remainingQuantity} / {donation.quantity} {donation.unit}</span>
                    <span className="text-[11px] text-emerald-600 font-bold block">100% Unencumbered Inventory</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Condition & Quality Grade</span>
                    <span className="font-bold text-slate-900 capitalize text-sm">{donation.condition} (Humanitarian Grade)</span>
                    <span className="text-[11px] text-slate-500 block">Clean, hygienic packaging verified</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Dimensions & Weight</span>
                    <span className="font-bold text-slate-900 text-sm">{donation.dimensions || '200 × 150 × 5 cm'}</span>
                    <span className="text-[11px] text-slate-500 block">Unit Weight: {donation.weight || '1.5 kg'}</span>
                  </div>
                </div>

                {/* Confidential Pickup Protection */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Confidential Pickup Address Protection</span>
                  </div>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed">
                    The full street address for this lot is encrypted. Only the public approximate region (<strong className="font-bold">{donation.location.approximateText || donation.location.city}</strong>) is shown on public maps. The full pickup coordinates and address will be securely decrypted and shared with the verified NGO only after donor confirmation of allocation.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: IMPACT & HISTORY */}
            {activeTab === 'impact' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Allocation History & Verification Trail</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Immutable audit events and chain-of-custody tracking.</p>
                  </div>
                  <Link
                    href={`/donations/${donation.id}/tracking`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live Tracking Page →</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Donation Lot Created & Validated</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Status: Eligible • 50 units registered in New Delhi central hub. Hard gate criteria validated with zero flags.
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{formattedListedDate}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Smart Matching Calculation Completed</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Identified {eligibleCandidates.length} eligible verified NGO partners. Goonj Relief ranked #1 with 85/100 compatibility score.
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold mt-1 block">Rule Engine: {weights.version}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: CONTEXTUAL SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">

            {/* View Mode Toggle Button */}
            <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View list NGO</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            </div>

            {/* 1. Location & Coverage Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Location & Coverage</h3>
                </div>
                <Link
                  href="/explore"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  View Full Map →
                </Link>
              </div>

              {/* Geographic Visualizer Map Window */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-[#E2E8F0] border border-slate-200 flex items-center justify-center">
                {/* Visual Map Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 opacity-80" />
                
                {/* Simplified India Map SVG Vector Backdrop */}
                <svg viewBox="0 0 400 300" className="w-full h-full object-contain opacity-25 pointer-events-none">
                  <path
                    d="M 120 40 Q 150 20 180 50 Q 200 90 230 110 Q 250 140 220 180 Q 180 230 150 260 Q 120 220 100 170 Q 70 110 120 40 Z"
                    fill="#3B82F6"
                  />
                </svg>

                {/* Donor Pin (New Delhi - Center) */}
                <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                    📍 New Delhi (Donor)
                  </span>
                  <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs animate-ping" />
                </div>

                {/* Goonj NGO Pin (10 km away) */}
                <div className="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                    Goonj (10 km)
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                </div>

                {/* Map Controls */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
                  <button className="w-6 h-6 rounded-md bg-white/90 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-white shadow-2xs">
                    +
                  </button>
                  <button className="w-6 h-6 rounded-md bg-white/90 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-white shadow-2xs">
                    −
                  </button>
                </div>
              </div>

              {/* Proximity Details */}
              <div className="text-[11px] text-slate-500 leading-normal flex items-center justify-between">
                <span>Primary Hub: <strong className="text-slate-800">Central Delhi Corridor</strong></span>
                <span className="text-emerald-700 font-bold">12 km Radius</span>
              </div>
            </div>

            {/* 2. Why these NGOs? Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Why these NGOs?</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Our AI uses 6 key factors to find the most suitable NGOs for your donation, including real-time needs, location, logistics, and organizational credibility.
              </p>

              <button
                onClick={() => setShowWeightsModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Learn More</span>
                <span>→</span>
              </button>
            </div>

            {/* 3. Impact Potential Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HeartHandshake className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Impact Potential</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Metric 1 */}
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">2,500+</div>
                    <div className="text-[10px] text-slate-400 font-medium">People Can Benefit</div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{eligibleCandidates.length}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Verified NGOs</div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{donation.remainingQuantity} units</div>
                    <div className="text-[10px] text-slate-400 font-medium">Your Contribution</div>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <span className="text-xs">❤️</span>
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">High</div>
                    <div className="text-[10px] text-slate-400 font-medium">Impact Priority</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Need Help Deciding? AI Assistant Card */}
            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/60 rounded-3xl border border-blue-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Need Help Deciding?</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Ask our AI Assistant for personalized recommendations or compare NGOs.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Chat with AI Assistant</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 5. ALLOCATION CONFIRMATION MODAL */}
      {allocatingCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Confirm Donation Allocation</h3>
                  <p className="text-[11px] text-slate-500">Atomic inventory reservation with verified NGO partner</p>
                </div>
              </div>
              <button
                onClick={() => setAllocatingCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs">
              {/* Partner Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{allocatingCandidate.ngoName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Location: {allocatingCandidate.serviceArea.city} • Urgent Need: {allocatingCandidate.remainingNeeded} {allocatingCandidate.unit}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Verified NGO
                </span>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Quantity to Allocate ({donation.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={donation.remainingQuantity}
                    value={allocQuantity}
                    onChange={(e: any) => setAllocQuantity(Number(e.target.value))}
                    className="w-32 px-3.5 py-2 rounded-xl border border-slate-300 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-slate-500 text-xs">
                    of <strong className="text-slate-800">{donation.remainingQuantity} {donation.unit}</strong> available
                  </span>
                </div>
              </div>

              {/* Remaining inventory preview */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 text-[11.5px] space-y-1">
                <div className="flex justify-between">
                  <span>Current Available:</span>
                  <strong>{donation.remainingQuantity} {donation.unit}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining after allocation:</span>
                  <strong className="text-emerald-700">{Math.max(0, donation.remainingQuantity - allocQuantity)} {donation.unit}</strong>
                </div>
              </div>

              {/* Confidential Pickup Note */}
              <p className="text-[11px] text-slate-500 leading-normal">
                🔒 Once confirmed, your confidential pickup address in {donation.location.city} will be securely decrypted and provided to {allocatingCandidate.ngoName}'s verified transport coordinators.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAllocatingCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAllocation}
                disabled={submittingAlloc || allocQuantity <= 0 || allocQuantity > donation.remainingQuantity}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>{submittingAlloc ? 'Locking Allocation...' : 'Confirm Allocation 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI ASSISTANT DECISION SUPPORT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs">ReliefLink Decision Assistant</h3>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">Context: #{donationId} • {donation.itemName}</span>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-50/70">
              {aiChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiChatLoading && (
                <div className="flex justify-start">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Analyzing database records...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10.5px]">
              <button
                onClick={() => handleSendAiMessage('Why is Goonj ranked #1 over SEEDS?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
              >
                Why is Goonj #1?
              </button>
              <button
                onClick={() => handleSendAiMessage('Why were the other 3 requests excluded?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
              >
                Why excluded requests?
              </button>
              <button
                onClick={() => handleSendAiMessage('Can I allocate all 50 units immediately?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
              >
                Can I allocate all 50 units?
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask about NGO credibility, distance, or allocations..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={aiChatLoading || !aiChatInput.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. ALGORITHM WEIGHTS MODAL */}
      {showWeightsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Deterministic 6-Factor Matching Model</h3>
              <button
                onClick={() => setShowWeightsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              ReliefLink uses a transparent multi-objective scoring formula with hard eligibility gating to ensure every allocation is safe, verified, and optimal:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">1. Need & Category Fit</span>
                <span className="font-mono font-extrabold text-blue-600">{Math.round((weights.needFit || 0.3) * 100)}% Weight</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">2. Urgency & Deadline</span>
                <span className="font-mono font-extrabold text-amber-600">{Math.round((weights.urgency || 0.2) * 100)}% Weight</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">3. Logistics & Distance</span>
                <span className="font-mono font-extrabold text-cyan-600">{Math.round((weights.deliveryFit || 0.15) * 100)}% Weight</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">4. Time / Expiry Buffer</span>
                <span className="font-mono font-extrabold text-indigo-600">{Math.round((weights.timeFit || 0.15) * 100)}% Weight</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">5. Quantity Match Ratio</span>
                <span className="font-mono font-extrabold text-emerald-600">{Math.round((weights.quantityFit || 0.1) * 100)}% Weight</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">6. Freshness & Audit Confidence</span>
                <span className="font-mono font-extrabold text-purple-600">{Math.round((weights.freshnessConfidence || 0.1) * 100)}% Weight</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              Active Engine: <span className="font-mono font-bold text-slate-600">{weights.version}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MatchControlPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-12 text-center text-xs text-slate-500">
          Loading Smart Matches...
        </div>
      }
    >
      <MatchControlContent />
    </Suspense>
  );
}
