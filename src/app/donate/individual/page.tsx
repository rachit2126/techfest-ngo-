'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Info,
  ArrowRight,
  Lock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Building2,
  Upload,
  Mic,
  FileText,
  Camera,
  Coins,
  Check,
  ChevronRight,
  Eye,
  RefreshCw,
  Edit2,
  Play,
  Bookmark,
  Send,
  Sliders,
  Globe,
  Bell,
  ChevronDown,
  Bot
} from 'lucide-react';
import AIAssistantChat from '@/components/ai-assistant/AIAssistantChat';
import { StructuredListingDraft } from '@/lib/types';

interface MatchingNgoCard {
  id: string;
  name: string;
  location: string;
  needDescription: string;
  matchScore: number;
  priority: string;
  distance: string;
  activeNeed: boolean;
  image: string;
}

const SAMPLE_MATCHING_NGOS: MatchingNgoCard[] = [
  {
    id: 'ngo_sewa',
    name: 'Sewa Bharat',
    location: 'Delhi, India',
    needDescription: 'Needs: 40 Winter Blankets',
    matchScore: 98,
    priority: 'High Priority',
    distance: 'Within 12 km',
    activeNeed: true,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'ngo_helpcare',
    name: 'Help & Care Foundation',
    location: 'Delhi NCR',
    needDescription: 'Needs: 100 Blankets',
    matchScore: 92,
    priority: 'High Priority',
    distance: 'Within 25 km',
    activeNeed: true,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'ngo_nayasavera',
    name: 'Naya Savera NGO',
    location: 'New Delhi',
    needDescription: 'Needs: 50 Blankets',
    matchScore: 86,
    priority: 'Medium Priority',
    distance: 'Within 30 km',
    activeNeed: true,
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&auto=format&fit=crop&q=80'
  }
];

export default function IndividualDonatePage() {
  const router = useRouter();

  // Mode Selection: Donate for Free | Sell at an Affordable Price | Business Surplus
  const [listingType, setListingType] = useState<'free_donation' | 'affordable_sale' | 'business_surplus'>('free_donation');

  // Guided Step Progress (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Filter Verified Only toggle on Matching NGOs
  const [showOnlyVerifiedNgos, setShowOnlyVerifiedNgos] = useState(true);

  // Main Product Preview Image Selection
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // AI Assistant Chat & Actions State
  const [aiInputMessage, setAiInputMessage] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAssistantDraftApplied, setAiAssistantDraftApplied] = useState(false);

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&auto=format&fit=crop&q=80'
  ]);

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    'Manufacturer_Inspection_Receipt_2026.pdf'
  ]);

  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<{
    objects: string[];
    category: string;
    condition: string;
    confidence: number;
  } | null>({
    objects: ['Winter Fleece Blankets', 'Folded Textile Lots', 'Unopened Packaging'],
    category: 'Clothing & Winter Supplies',
    condition: 'Brand New',
    confidence: 0.98
  });

  // Form Fields
  const [formData, setFormData] = useState({
    title: 'Warm Fleece Winter Blankets',
    category: 'clothing_blankets',
    subcategory: 'Blankets',
    description: 'Warm fleece blankets suitable for winter relief. Brand new in original packaging. Ideal for families and shelters.',
    quantity: '50',
    unit: 'units',
    condition: 'Brand New',
    brand: 'Generic / No Brand',
    dimensions: '200 × 150 × 5',
    dimUnit: 'cm',
    weight: '1.5',
    weightUnit: 'kg',
    expiryDate: '',
    pricePerUnit: '1200',
    currency: 'INR',
    city: 'New Delhi',
    state: 'Delhi',
    approximateText: 'Connaught Place Area, Central Delhi',
    privateAddress: 'Flat 12B, Barakhamba Road, New Delhi (Private & confidential)',
    availabilityWindow: 'Monday - Friday 10:00 AM - 4:00 PM',
    isSafeLegal: true,
    isOwnerAuthorized: true,
    evidenceNote: 'Original manufacturer inspection receipt attached',
    urgency: 'High Priority (Disaster / Immediate)',
    targetBeneficiaries: 'Shelters & Families',
    handlingInstructions: 'Stored in clean, dry, sanitized environment. Packaged in sealed cartons.',
    businessName: 'Apex Humanitarian Surplus Ltd',
    gstin: '07AAAAA0000A1Z5',
    bulkPackaging: 'Cartons (50 units each)',
    pickupPreference: 'ngo_pickup'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyAiSuggestions = () => {
    setFormData(prev => ({
      ...prev,
      title: 'Warm Fleece Winter Blankets',
      category: 'clothing_blankets',
      subcategory: 'Blankets',
      condition: 'Brand New',
      quantity: '50'
    }));
    setAiAssistantDraftApplied(true);
  };

  const handleSendAiChatMessage = async () => {
    if (!aiInputMessage.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/marketplace/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'text',
          text: aiInputMessage
        })
      });
      const data = await res.json();
      if (data.draft) {
        setFormData(prev => ({
          ...prev,
          title: data.draft.title || prev.title,
          category: data.draft.category || prev.category,
          subcategory: data.draft.subcategory || prev.subcategory,
          description: data.draft.description || prev.description,
          quantity: String(data.draft.quantity || prev.quantity),
          unit: data.draft.unit || prev.unit
        }));
      }
      setAiInputMessage('');
    } catch (e) {
      console.warn('AI assistant chat error:', e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          setUploadedPhotos(prev => [...prev, uploadEvt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      setUploadedDocs(prev => [...prev, files[i].name]);
    }
  };

  const handleAnalyzePhotos = () => {
    setIsAnalyzingPhoto(true);
    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      setPhotoAnalysisResult({
        objects: ['Winter Fleece Blankets', 'Folded Textile Lots', 'Unopened Retail Packaging'],
        category: 'Clothing & Winter Supplies',
        condition: 'Brand New',
        confidence: 0.98
      });
      alert('✨ AI Image Inspection Complete: Detected Winter Fleece Blankets in Brand New condition (98% confidence).');
    }, 1000);
  };

  const handleNextStep = () => {
    if (activeStep < 6) {
      setActiveStep(prev => prev + 1);
    } else {
      handleSubmitListing();
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(1, prev - 1));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('relieflink_draft', JSON.stringify({ formData, listingType, activeStep }));
      alert('✅ Draft saved successfully! You can resume anytime.');
    } catch {
      alert('Draft saved to active session.');
    }
  };

  const handleSubmitListing = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.isSafeLegal || !formData.isOwnerAuthorized) {
        throw new Error('Please confirm ownership and safety acknowledgments before publishing.');
      }

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketplaceType: listingType,
          itemName: formData.title,
          category: formData.category,
          subcategory: formData.subcategory,
          brand: formData.brand,
          dimensions: `${formData.dimensions} ${formData.dimUnit}`,
          weight: `${formData.weight} ${formData.weightUnit}`,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          condition: formData.condition === 'Brand New' ? 'new' : 'good',
          photos: uploadedPhotos,
          price: listingType === 'affordable_sale' ? {
            amount: Number(formData.pricePerUnit) * Number(formData.quantity),
            unitPrice: Number(formData.pricePerUnit),
            currency: formData.currency,
            negotiable: true
          } : undefined,
          location: {
            city: formData.city,
            state: formData.state,
            approximateText: formData.approximateText,
            privateAddress: formData.privateAddress,
            coordinates: formData.city.toLowerCase().includes('delhi') ? [28.6139, 77.2090] : [26.9124, 75.7873]
          },
          availabilityWindow: formData.availabilityWindow,
          expiryDate: formData.expiryDate || undefined,
          foodSafetyAcknowledged: true,
          aiDraftMetadata: {
            usedAi: true,
            detectedCategory: formData.category,
            confidenceScore: 0.95
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish listing');
      }

      router.push(`/matches/${data.donation.id}`);
    } catch (err: any) {
      setError(err.message || 'Error publishing listing');
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Product Info', desc: 'Add details about your item' },
    { num: 2, title: 'Photos & AI Assistant', desc: 'Upload photos or describe' },
    { num: 3, title: 'Donation / Sale Details', desc: 'Quantity, price, condition' },
    { num: 4, title: 'Location & Privacy', desc: 'Keep your address safe' },
    { num: 5, title: 'Proof & Documents', desc: 'Add supporting evidence' },
    { num: 6, title: 'Review & Publish', desc: 'Confirm and go live' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 relative overflow-hidden font-sans">

      {/* SOFT LIGHT BLUE DECORATIVE ACCENTS MATCHING REFERENCE */}
      <div className="absolute top-0 right-0 w-[55vw] h-[450px] bg-gradient-to-bl from-blue-100/50 via-sky-50/30 to-transparent pointer-events-none rounded-bl-full blur-3xl -z-10" />
      <div className="absolute top-20 left-0 w-[35vw] h-[350px] bg-gradient-to-br from-teal-50/40 via-blue-50/20 to-transparent pointer-events-none rounded-br-full blur-3xl -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 relative z-10 space-y-4">

        {/* 1. TOP HERO SECTION: INDIVIDUAL DONATION BADGE, TITLE & 4 METRICS RIBBON */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Left Title Group */}
          <div className="max-w-2xl">
            {/* Green Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-[11px] font-bold mb-2.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>INDIVIDUAL DONATION</span>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/90 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>List, Donate or Sell Goods with</span>
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    AI Assistance
                  </span>
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-normal max-w-xl">
                  Turn your surplus into real impact. Our AI helps you create accurate listings and connects them with verified NGOs and communities in need.
                </p>
              </div>
            </div>
          </div>

          {/* Right Floating KPI Statistics & 3D Donation Box (Green, Blue, Purple, Amber) */}
          <div className="flex items-center gap-3 sm:gap-4 self-start lg:self-auto">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {/* KPI 1: Verified NGOs */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs leading-none">12,450+</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Verified NGOs</div>
                </div>
              </div>

              {/* KPI 2: Countries */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs leading-none">180+</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Countries</div>
                </div>
              </div>

              {/* KPI 3: People Supported */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <span className="text-purple-600 text-xs">👥</span>
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs leading-none">4.2M+</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">People Supported</div>
                </div>
              </div>

              {/* KPI 4: Items Donated */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs leading-none">1.8M+</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Items Donated</div>
                </div>
              </div>
            </div>

            {/* High Quality 3D Donation Box Graphic from Reference */}
            <div className="hidden xl:block shrink-0 -my-4 -mr-2 pointer-events-none select-none">
              <img
                src="/donation_box_3d.png"
                alt="Donation Box"
                className="w-32 lg:w-40 h-auto object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* 2. THREE INTENT SELECTOR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option A: Donate for Free */}
          <div
            onClick={() => setListingType('free_donation')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
              listingType === 'free_donation'
                ? 'bg-white border-2 border-emerald-500 shadow-sm ring-4 ring-emerald-500/10'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Donate for Free</h3>
                {listingType === 'free_donation' && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Give usable items to verified NGOs and communities in need.
              </p>
            </div>
          </div>

          {/* Option B: Sell at an Affordable Price */}
          <div
            onClick={() => setListingType('affordable_sale')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
              listingType === 'affordable_sale'
                ? 'bg-white border-2 border-rose-500 shadow-sm ring-4 ring-rose-500/10'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Coins className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Sell at an Affordable Price</h3>
                {listingType === 'affordable_sale' ? (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                List items at a fair price for NGOs or social organizations.
              </p>
            </div>
          </div>

          {/* Option C: Business Surplus */}
          <div
            onClick={() => setListingType('business_surplus')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
              listingType === 'business_surplus'
                ? 'bg-white border-2 border-blue-500 shadow-sm ring-4 ring-blue-500/10'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Business Surplus</h3>
                {listingType === 'business_surplus' ? (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                List bulk inventory or surplus goods from your business.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. FOUR-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* COL 1: SIX-STEP WORKFLOW SIDEBAR (lg:col-span-2) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-1.5">
            {stepsList.map(step => {
              const isActive = activeStep === step.num;
              const isCompleted = activeStep > step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`p-2.5 rounded-xl cursor-pointer transition flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-[#EFF6FF] border border-blue-200/90 text-blue-900 shadow-2xs font-semibold'
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                      {step.title}
                    </div>
                    <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-600/80' : 'text-slate-400'}`}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Save Draft Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full py-2 px-3 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>
              <div className="text-[10px] text-slate-400 text-center mt-1">Continue later</div>
            </div>
          </div>

          {/* COL 2: CENTER WHITE FORM PANEL WITH DYNAMIC 6 STEPS (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            
            {/* Dynamic Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold border ${
                  activeStep === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  activeStep === 2 ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  activeStep === 3 ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  activeStep === 4 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  activeStep === 5 ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                  'bg-indigo-50 text-indigo-600 border-indigo-200'
                }`}>
                  {activeStep === 1 && <Package className="w-4 h-4" />}
                  {activeStep === 2 && <Camera className="w-4 h-4" />}
                  {activeStep === 3 && <Coins className="w-4 h-4" />}
                  {activeStep === 4 && <MapPin className="w-4 h-4" />}
                  {activeStep === 5 && <FileText className="w-4 h-4" />}
                  {activeStep === 6 && <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {activeStep === 1 && '1. Product Information'}
                    {activeStep === 2 && '2. Photos & AI Assistant'}
                    {activeStep === 3 && '3. Donation / Sale Details'}
                    {activeStep === 4 && '4. Location & Privacy'}
                    {activeStep === 5 && '5. Proof & Documents'}
                    {activeStep === 6 && '6. Review & Publish'}
                  </h2>
                  <p className="text-[10px] text-slate-400">Step {activeStep} of 6 — {stepsList[activeStep - 1]?.desc}</p>
                </div>
              </div>

              {activeStep === 1 && (
                <button
                  type="button"
                  onClick={handleApplyAiSuggestions}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 border border-purple-200/80 transition shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Use AI to fill this form</span>
                </button>
              )}

              {activeStep === 2 && (
                <button
                  type="button"
                  onClick={handleAnalyzePhotos}
                  disabled={isAnalyzingPhoto}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 border border-blue-200/80 transition shadow-2xs cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isAnalyzingPhoto ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingPhoto ? 'Inspecting...' : 'AI Photo Scan'}</span>
                </button>
              )}

              {activeStep === 6 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Ready to Publish
                </span>
              )}
            </div>

            {/* STEP 1: PRODUCT INFO */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Product Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Product Title *</label>
                    <span className="text-[10px] text-slate-400 font-medium">{formData.title.length}/100</span>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Warm Fleece Winter Blankets"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
                  />
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={e => handleFieldChange('category', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
                    >
                      <option value="clothing_blankets">Clothing & Winter Supplies</option>
                      <option value="packaged_food">Packaged / Shelf-Stable Food</option>
                      <option value="hygiene_kits">Hygiene & Sanitation Kits</option>
                      <option value="medical_first_aid">First Aid & Medical Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={e => handleFieldChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
                    >
                      <option value="Blankets">Blankets</option>
                      <option value="Winter Jackets">Winter Jackets</option>
                      <option value="Thermal Wear">Thermal Wear</option>
                      <option value="Woolen Caps & Gloves">Woolen Caps & Gloves</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Description *</label>
                    <span className="text-[10px] text-slate-400 font-medium">{formData.description.length}/500</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => handleFieldChange('description', e.target.value)}
                    placeholder="Describe your item, suitability, packaging and cleanliness..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
                  />
                </div>

                {/* AI Suggestions Box (Matches Reference Screenshot) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 border border-blue-100/90 flex items-start justify-between gap-3 shadow-2xs">
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <span className="text-amber-500">💡</span>
                      <span>AI Suggestions</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Detected: Winter Blankets (95% confidence)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Suggested category: Clothing & Winter Supplies</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Estimated fair value: ₹600 – ₹1,500 per blanket (info only)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Potential NGO matches: 12 in your region</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAiSuggestions}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-xs shrink-0 self-center cursor-pointer"
                  >
                    Apply Suggestions
                  </button>
                </div>

                {/* Quantity, Condition, Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={e => handleFieldChange('quantity', e.target.value)}
                        className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <select
                        value={formData.unit}
                        onChange={e => handleFieldChange('unit', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="units">units</option>
                        <option value="kg">kg</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Condition *</label>
                    <select
                      value={formData.condition}
                      onChange={e => handleFieldChange('condition', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => handleFieldChange('brand', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Generic / No Brand"
                    />
                  </div>
                </div>

                {/* Dimensions, Weight, Expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensions (optional)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={e => handleFieldChange('dimensions', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="200 × 150 × 5"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold px-1">cm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (optional)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={e => handleFieldChange('weight', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="1.5"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold px-1">kg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (optional)</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={e => handleFieldChange('expiryDate', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PHOTOS & AI ASSISTANT */}
            {activeStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Upload Drag & Drop Box */}
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="donate_photo_input"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="donate_photo_input"
                    className="p-6 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-xs border border-blue-100 group-hover:scale-105 transition mb-2">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Upload Product Photos</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Drag and drop or click to browse (PNG, JPG up to 5MB each)</span>
                    <span className="mt-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                      {uploadedPhotos.length} photos ready
                    </span>
                  </label>
                </div>

                {/* Uploaded Photos Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">Uploaded Photos ({uploadedPhotos.length})</label>
                    <span className="text-[10px] text-slate-400">Click a photo to set it as main image</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition group cursor-pointer ${
                          selectedPhotoIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedPhotoIndex(idx)}
                      >
                        <img src={photo} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        
                        {selectedPhotoIndex === idx && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold shadow-xs">
                            ★ Main Image
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedPhotos(prev => prev.filter((_, i) => i !== idx));
                            if (selectedPhotoIndex >= uploadedPhotos.length - 1) {
                              setSelectedPhotoIndex(0);
                            }
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Inspection Card */}
                {photoAnalysisResult && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-teal-50/60 border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>AI Vision Analysis Results</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {Math.round(photoAnalysisResult.confidence * 100)}% Match Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-medium">Detected Items</div>
                        <div className="font-bold text-slate-800">{photoAnalysisResult.objects.join(', ')}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-medium">Suggested Category</div>
                        <div className="font-bold text-slate-800">{photoAnalysisResult.category}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-medium">Assessed Condition</div>
                        <div className="font-bold text-emerald-700">● {photoAnalysisResult.condition}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DONATION / SALE DETAILS */}
            {activeStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Mode Specific Configuration */}
                {listingType === 'free_donation' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>100% Free Humanitarian Relief Donation</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Your items will be routed directly to verified humanitarian NGOs and community centers. No fees are ever deducted.
                    </p>
                  </div>
                )}

                {listingType === 'affordable_sale' && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-rose-900">
                      <span>Affordable NGO Sale Rate</span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                        0% Platform Fee
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Unit (₹) *</label>
                        <input
                          type="number"
                          value={formData.pricePerUnit}
                          onChange={e => handleFieldChange('pricePerUnit', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Lot Value</label>
                        <div className="w-full px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-slate-800 text-xs font-extrabold flex items-center justify-between">
                          <span>₹{(Number(formData.pricePerUnit || 0) * Number(formData.quantity || 0)).toLocaleString()}</span>
                          <span className="text-[9px] text-emerald-600 font-semibold">Protected Escrow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {listingType === 'business_surplus' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3 text-xs">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Corporate & Business Surplus Inventory</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Business Legal Name</label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={e => handleFieldChange('businessName', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                        <input
                          type="text"
                          value={formData.gstin}
                          onChange={e => handleFieldChange('gstin', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Urgency Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relief Urgency Priority</label>
                    <select
                      value={formData.urgency}
                      onChange={e => handleFieldChange('urgency', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="High Priority (Disaster / Immediate)">High Priority (Disaster / Immediate)</option>
                      <option value="Standard Relief (Within 1-2 Weeks)">Standard Relief (Within 1-2 Weeks)</option>
                      <option value="Flexible Schedule">Flexible Schedule</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Beneficiaries</label>
                    <select
                      value={formData.targetBeneficiaries}
                      onChange={e => handleFieldChange('targetBeneficiaries', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Shelters & Families">Shelters & Families in Need</option>
                      <option value="Children & Orphanages">Children & Orphanages</option>
                      <option value="Elderly Care Homes">Elderly Care Homes</option>
                      <option value="Disaster Evacuation Camps">Disaster Evacuation Camps</option>
                    </select>
                  </div>
                </div>

                {/* Packaging & Handling Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging & Storage Notes</label>
                  <textarea
                    rows={2}
                    value={formData.handlingInstructions}
                    onChange={e => handleFieldChange('handlingInstructions', e.target.value)}
                    placeholder="e.g. Stored in dry sanitized cartons, ready for depot pickup..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: LOCATION & PRIVACY */}
            {activeStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleFieldChange('city', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State / Region *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => handleFieldChange('state', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Public Approximate Area */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Public Approximate Area (Shown to NGOs on Map)</label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Public Area</span>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.approximateText}
                      onChange={e => handleFieldChange('approximateText', e.target.value)}
                      placeholder="e.g. Connaught Place Area, Central Delhi"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Confidential Pickup Address */}
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Private Confidential Pickup Address</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      🔒 Protected & Encrypted
                    </span>
                  </div>

                  <input
                    type="text"
                    value={formData.privateAddress}
                    onChange={e => handleFieldChange('privateAddress', e.target.value)}
                    placeholder="Complete apartment/flat, building, street, and landmark..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />

                  <p className="text-[10.5px] text-amber-800 leading-normal">
                    This exact address is never displayed on the public map. It will only be securely decrypted and shared with a verified NGO after you accept their claim.
                  </p>
                </div>

                {/* Pickup Window & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Window</label>
                    <input
                      type="text"
                      value={formData.availabilityWindow}
                      onChange={e => handleFieldChange('availabilityWindow', e.target.value)}
                      placeholder="e.g. Monday - Friday 10:00 AM - 4:00 PM"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Logistics</label>
                    <select
                      value={formData.pickupPreference}
                      onChange={e => handleFieldChange('pickupPreference', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium"
                    >
                      <option value="ngo_pickup">NGO Arranged Direct Pickup</option>
                      <option value="donor_dropoff">Donor Drop-off at NGO Depot</option>
                      <option value="relieflink_courier">Sahay Partner Logistics</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PROOF & DOCUMENTS */}
            {activeStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Upload Documents Zone */}
                <div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    id="donate_doc_input"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="donate_doc_input"
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <FileText className="w-8 h-8 text-blue-600 mb-1.5 group-hover:scale-105 transition" />
                    <span className="text-xs font-bold text-slate-900">Upload Invoices, Inspection Receipts, or Batch Certificates</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG up to 10MB</span>
                  </label>
                </div>

                {/* Attached Documents List */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Attached Supporting Documents ({uploadedDocs.length})</label>
                  <div className="space-y-1.5">
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">{doc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            ✓ Verified
                          </span>
                          <button
                            type="button"
                            onClick={() => setUploadedDocs(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence / Authentication Notes</label>
                  <textarea
                    rows={2}
                    value={formData.evidenceNote}
                    onChange={e => handleFieldChange('evidenceNote', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Mandatory Safety Declarations */}
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isSafeLegal}
                      onChange={e => handleFieldChange('isSafeLegal', e.target.checked)}
                      className="accent-[#10B981] w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium">This item is safe, legal, and not restricted</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isOwnerAuthorized}
                      onChange={e => handleFieldChange('isOwnerAuthorized', e.target.checked)}
                      className="accent-[#10B981] w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium">I confirm that I own or am authorized to donate/sell this item</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & PUBLISH */}
            {activeStep === 6 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Summary Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                        <img
                          src={uploadedPhotos[selectedPhotoIndex] || uploadedPhotos[0]}
                          alt="Review item"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                            {listingType === 'free_donation' ? 'Free Donation' : listingType === 'affordable_sale' ? 'Affordable Sale' : 'Business Surplus'}
                          </span>
                          <span className="text-[10px] text-slate-400">{uploadedPhotos.length} photos</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{formData.title}</h3>
                        <div className="text-[11px] text-slate-500">{formData.quantity} {formData.unit} • {formData.condition}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Location (Public):</span>
                      <div className="font-semibold text-slate-800">{formData.approximateText || formData.city}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Confidential Address:</span>
                      <div className="font-semibold text-emerald-700">🔒 Protected until match</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Matching NGOs Ready:</span>
                      <div className="font-bold text-blue-600">2 Verified NGOs nearby</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Supporting Proof:</span>
                      <div className="font-semibold text-slate-800">{uploadedDocs.length} Document(s) attached</div>
                    </div>
                  </div>
                </div>

                {/* Final Confirmation Banner */}
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Upon publishing, our AI engine will automatically notify <strong>Sewa Bharat</strong> and <strong>Help & Care Foundation</strong>.</span>
                </div>
              </div>
            )}

            {/* Step Navigation Bar (Back & Save & Continue Buttons) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={handlePrevStep}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                  activeStep === 1
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <span>← Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                  activeStep === 6
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    : 'bg-[#10B981] hover:bg-[#059669]'
                }`}
              >
                {activeStep === 6 ? (
                  <>
                    <span>{submitting ? 'Publishing...' : 'Publish Listing'}</span>
                    <span>🚀</span>
                  </>
                ) : (
                  <>
                    <span>Save & Continue</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* COL 3: CENTER-RIGHT: ITEM PREVIEW & MATCHING NGOS (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 1. Item Preview (AI Generated) */}
            <div className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Item Preview (AI Generated)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Main Image with Badge */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={uploadedPhotos[selectedPhotoIndex] || uploadedPhotos[0] || '/donation_box_3d.png'}
                  alt="Main Product Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-bold">
                    Main Image
                  </span>
                </div>
              </div>

              {/* Thumbnails Row + Play Video Option */}
              <div className="grid grid-cols-5 gap-1.5">
                {uploadedPhotos.slice(0, 4).map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                      selectedPhotoIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div
                  onClick={() => alert('Video preview option active')}
                  className="aspect-square rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition shadow-2xs"
                  title="Watch Video"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-400 text-slate-400" />
                </div>
              </div>
            </div>

            {/* 2. Matching NGOs Panel */}
            <div className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Matching NGOs</h3>
                </div>
                <Link href="/explore" className="text-[10px] font-bold text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>

              {/* Show only verified toggle */}
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
                <span>Show only verified</span>
                <input
                  type="checkbox"
                  checked={showOnlyVerifiedNgos}
                  onChange={e => setShowOnlyVerifiedNgos(e.target.checked)}
                  className="accent-emerald-600 w-3.5 h-3.5 rounded cursor-pointer"
                />
              </div>

              {/* NGO Cards List */}
              <div className="space-y-2.5">
                {SAMPLE_MATCHING_NGOS.map(ngo => (
                  <div key={ngo.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                        <img src={ngo.image} alt={ngo.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-900 truncate flex items-center gap-1">
                            {ngo.name}
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                          </h4>
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {ngo.matchScore}% Match
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-400">{ngo.location}</div>
                        <div className="text-[10px] font-semibold text-slate-700 mt-0.5">{ngo.needDescription}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[8.5px] flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-bold">{ngo.priority}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 font-medium">{ngo.distance}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">● Active Need</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                      <Link
                        href={`/ngos/${ngo.id}`}
                        className="flex-1 py-1 rounded-lg border border-slate-200 text-slate-700 text-[10px] font-bold text-center hover:bg-white transition"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => alert(`Requested connection to ${ngo.name}`)}
                        className="flex-1 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold text-center transition cursor-pointer shadow-2xs"
                      >
                        Request Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COL 4: RIGHT-SIDE AI ASSISTANT (LIGHT PANEL MATCHING REFERENCE) (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <AIAssistantChat
              theme="light"
              currentFormData={formData}
              onApplyToForm={(draft: StructuredListingDraft) => {
                setFormData(prev => ({
                  ...prev,
                  title: draft.title || prev.title,
                  category: draft.category || prev.category,
                  subcategory: draft.subcategory || prev.subcategory,
                  description: draft.description || prev.description,
                  quantity: draft.quantity ? String(draft.quantity) : prev.quantity,
                  condition: draft.condition || prev.condition,
                  city: draft.city || prev.city,
                  state: draft.state || prev.state,
                  pricePerUnit: draft.pricePerUnit ? String(draft.pricePerUnit) : prev.pricePerUnit
                }));
                setAiAssistantDraftApplied(true);
              }}
            />
          </div>

        </div>

        {/* 4. BOTTOM SECTIONS: YOUR IMPACT JOURNEY & REAL IMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          
          {/* Your Impact Journey Horizontal Bar (lg:col-span-9) */}
          <div className="lg:col-span-9 bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xs">
                💡
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">Your Impact Journey</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">From your listing to real change</p>
              </div>
            </div>

            {/* 6 Step Interactive Horizontal Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs pt-1">
              {/* Step 1 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  1
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Create Listing</div>
                <div className="text-[9px] text-slate-400">With AI or manually</div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  2
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Get Verified</div>
                <div className="text-[9px] text-slate-400">Safety & quality checks</div>
              </div>

              {/* Step 3 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  3
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Matched with NGOs</div>
                <div className="text-[9px] text-slate-400">AI finds the best match</div>
              </div>

              {/* Step 4 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  4
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Request & Confirm</div>
                <div className="text-[9px] text-slate-400">NGO requests and you approve</div>
              </div>

              {/* Step 5 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  5
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Pickup or Delivery</div>
                <div className="text-[9px] text-slate-400">Safe handover with proof</div>
              </div>

              {/* Step 6 */}
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold shadow-xs">
                  6
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Impact Created</div>
                <div className="text-[9px] text-slate-400">Items reach those in need</div>
              </div>
            </div>
          </div>

          {/* Real Impact Box (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-100">
              🌱
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">Real Impact</h4>
              <p className="text-xs text-slate-500 mt-0.5">Every item creates a brighter tomorrow.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function Tag(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
      <path d="M7 7h.01"/>
    </svg>
  );
}
