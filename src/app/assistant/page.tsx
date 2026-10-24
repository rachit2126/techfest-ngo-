'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bot,
  Plus,
  FileEdit,
  Users,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  Flame,
  ChevronRight,
  Clock,
  Share2,
  Trash2,
  MoreHorizontal,
  Check,
  CheckCircle2,
  Info,
  Sparkles,
  Paperclip,
  Mic,
  Send,
  Edit,
  X,
  ExternalLink,
  MapPin,
  Package,
  Layers,
  ArrowRight,
  HelpCircle,
  Search,
  UploadCloud,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { StructuredListingDraft } from '@/lib/types';
import SahayLogo from '@/components/brand/SahayLogo';
import { SAHAY_BRAND } from '@/config/brand';



interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  statusIcon?: string;
  filterPill?: 'listing' | 'ngos' | 'safety' | 'problem';
  draft?: StructuredListingDraft;
  ngos?: any[];
  safety?: any;
  price?: any;
  problem?: any;
  toolsUsed?: string[];
}

export default function AssistantPage() {
  // Stepper state (1: Understand, 2: Analyze, 3: Generate, 4: Refine, 5: Apply)
  const [activeStep, setActiveStep] = useState<number>(3);

  // Active filter tab in the assistant message: 'listing' | 'ngos' | 'safety' | 'problem'
  const [activeResponseTab, setActiveResponseTab] = useState<'listing' | 'ngos' | 'safety' | 'problem'>('listing');

  // Input & loading states
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=80'
  );
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNgoDetail, setSelectedNgoDetail] = useState<any | null>(null);
  const [applySuccessToast, setApplySuccessToast] = useState<string | null>(null);

  // Problem Solver Modal & Diagnostic States
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemInput, setProblemInput] = useState('');
  const [problemDiagnosis, setProblemDiagnosis] = useState<any>(null);
  const [diagnosingProblem, setDiagnosingProblem] = useState(false);
  const [executedActionId, setExecutedActionId] = useState<string | null>(null);

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Current Item Context / Draft State
  const [currentDraft, setCurrentDraft] = useState<StructuredListingDraft>({
    title: 'Warm Fleece Winter Blankets',
    listingType: 'free_donation',
    category: 'clothing_blankets',
    subcategory: 'Blankets & Bedding',
    description:
      'High-quality, soft and warm fleece blankets suitable for winter relief and emergency support. New and unused condition.',
    quantity: 50,
    unit: 'units',
    condition: 'Brand New',
    brand: 'Relief Quality / Unbranded',
    dimensions: '200 × 150 cm',
    weight: '1.2 kg per unit',
    city: 'New Delhi',
    state: 'Delhi',
    approximateLocationText: 'New Delhi, Delhi',
    confidenceScore: 0.95,
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=80'],
    safetyGuidelines: [
      'Item category is allowed',
      'Suitable for donation',
      'No safety restrictions',
      'Condition is acceptable',
      'Ready for NGO matching'
    ]
  });

  // Top NGO Matches State (Matches the 5 candidates in reference screenshot)
  const [ngoMatches, setNgoMatches] = useState<any[]>([
    {
      id: 'ngo_sewa_bharat',
      name: 'Sewa Bharat',
      location: 'Delhi, India • 12 km',
      needsCount: '100 blankets',
      matchScore: 96,
      avatar: 'SB',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'ngo_help_care',
      name: 'Help & Care Foundation',
      location: 'Delhi NCR • 18 km',
      needsCount: '50 blankets',
      matchScore: 92,
      avatar: 'HC',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'ngo_hope_relief',
      name: 'Hope Relief Network',
      location: 'Ghaziabad • 28 km',
      needsCount: '200 blankets',
      matchScore: 87,
      avatar: 'HR',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'ngo_care_for_all',
      name: 'Care for All',
      location: 'Noida • 32 km',
      needsCount: '75 blankets',
      matchScore: 82,
      avatar: 'CA',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'ngo_relief_hands',
      name: 'Relief Hands',
      location: 'Gurugram • 35 km',
      needsCount: '60 blankets',
      matchScore: 78,
      avatar: 'RH',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    }
  ]);

  // Initial Conversation Thread matching Screenshot exactly
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-user-1',
      role: 'user',
      text: 'I have 50 winter blankets. Can you create a listing and suggest the best NGO matches?',
      timestamp: '10:24 AM'
    },
    {
      id: 'msg-ai-1',
      role: 'assistant',
      text: "I'll help you create a complete listing for your winter blankets and find the best NGO matches.",
      timestamp: '10:24 AM',
      draft: {
        title: 'Warm Fleece Winter Blankets',
        listingType: 'free_donation',
        category: 'clothing_blankets',
        subcategory: 'Blankets & Bedding',
        description:
          'High-quality, soft and warm fleece blankets suitable for winter relief and emergency support. New and unused condition.',
        quantity: 50,
        unit: 'units',
        condition: 'Brand New',
        brand: 'Relief Quality / Unbranded',
        dimensions: '200 × 150 cm',
        weight: '1.2 kg per unit',
        city: 'New Delhi',
        state: 'Delhi',
        approximateLocationText: 'New Delhi, Delhi',
        confidenceScore: 0.95,
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=80'],
        safetyGuidelines: [
          'Item category is allowed',
          'Suitable for donation',
          'No safety restrictions',
          'Condition is acceptable',
          'Ready for NGO matching'
        ]
      }
    }
  ]);

  // Recent Conversations List
  const recentConversations = [
    { id: 'c1', title: 'Winter blankets listing', snippet: 'I have 50 winter blankets...', time: '2 min ago', active: true },
    { id: 'c2', title: 'Import error help', snippet: '30 items were rejected...', time: '1 hour ago', active: false },
    { id: 'c3', title: 'NGO matches for food items', snippet: 'Find NGOs in Delhi for...', time: '3 hours ago', active: false },
    { id: 'c4', title: 'Safety check for medicines', snippet: 'Are these items allowed?', time: '1 day ago', active: false }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          currentDraft,
          images: [selectedImage]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI Agent');
      }

      // Update draft if returned
      if (data.structuredDraft) {
        setCurrentDraft((prev) => ({ ...prev, ...data.structuredDraft }));
        setActiveStep(4);
      }

      // Update NGO matches if returned
      if (data.matchingNgos && Array.isArray(data.matchingNgos)) {
        setNgoMatches(
          data.matchingNgos.slice(0, 5).map((n: any, idx: number) => ({
            id: n.id,
            name: n.name,
            location: `${n.city}, India • ${n.distanceKm || 12} km`,
            needsCount: `${n.quantityRequested || 50} units`,
            matchScore: n.matchScore || 90 - idx * 4,
            avatar: n.name.substring(0, 2).toUpperCase(),
            badgeColor:
              (n.matchScore || 90) > 90
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
          }))
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Here is the response from Sahay AI Assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        draft: data.structuredDraft || currentDraft,
        ngos: data.matchingNgos,
        safety: data.safetyData,
        price: data.priceData,
        toolsUsed: data.toolsUsed
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Notice**: ${(err as Error).message}. Grounded platform guidelines and NGO directories remain active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setSelectedImage(dataUrl);

      // Trigger automatic image analysis
      try {
        const res = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: dataUrl,
            fileName: file.name
          })
        });
        const data = await res.json();
        if (data.analysis) {
          handleSendMessage(`I uploaded a photo of ${data.analysis.detectedItem || file.name}. Please analyze it.`);
        }
      } catch (err) {
        console.error('Image analysis error:', err);
      } finally {
        setImageUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply to Donation Form Handler
  const handleApplyToForm = async () => {
    try {
      const res = await fetch('/api/ai/apply-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: currentDraft })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply draft');
      }

      setActiveStep(5);
      setApplySuccessToast(`Listing "${currentDraft.title}" saved as draft!`);
      setTimeout(() => setApplySuccessToast(null), 5000);
    } catch (err) {
      alert(`Error applying draft: ${(err as Error).message}`);
    }
  };

  // Clear Chat Handler
  const handleClearChat = () => {
    if (confirm('Start a fresh conversation? Current draft context will be retained.')) {
      setMessages([
        {
          id: `ai-init-${Date.now()}`,
          role: 'assistant',
          text: 'Hello! I am ready to help you coordinate donations, verify safety, or match with active NGOs.',
          timestamp: 'Just now'
        }
      ]);
      setActiveStep(1);
    }
  };

  // Problem Solver Diagnostic Handler
  const handleDiagnoseProblem = async (customDesc?: string) => {
    const query = customDesc || problemInput;
    if (!query.trim() || diagnosingProblem) return;
    setDiagnosingProblem(true);
    setExecutedActionId(null);
    try {
      const res = await fetch('/api/ai/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemDescription: query.trim() })
      });
      const data = await res.json();
      if (res.ok && data.diagnosis) {
        setProblemDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error('Problem solver error:', err);
    } finally {
      setDiagnosingProblem(false);
    }
  };

  const handleExecuteAction = (actionId: string) => {
    setExecutedActionId(actionId);
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] antialiased">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Main 3-Column Responsive Workspace matching Reference Screenshot */}
      <main className="max-w-[1520px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: AI ASSISTANT NAVIGATION & RECENT CONVERSATIONS (3 Cols)
              ========================================================================= */}
          <aside className="lg:col-span-3 space-y-4">
            
            {/* 1. Sahay AI Assistant Header Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3EAE3] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center border border-[#075B3C]/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#182820] leading-tight">Sahay AI Assistant</h2>
                    <p className="text-[10px] text-[#075B3C] font-hindi font-semibold">{SAHAY_BRAND.tagline}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#075B3C] border border-[#075B3C]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#13845B] animate-pulse" />
                  <span>Online</span>
                </span>
              </div>

              {/* Big + New Conversation Button */}
              <button
                onClick={handleClearChat}
                className="w-full py-2.5 px-4 rounded-xl bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>
            </div>

            {/* 2. Quick Action Navigation Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E3EAE3] shadow-2xs space-y-1">
              {[
                {
                  id: 'gen_listing',
                  icon: FileEdit,
                  title: 'Generate Donation Listing',
                  desc: 'Create a listing from item details or photos',
                  iconColor: 'text-[#075B3C]',
                  iconBg: 'bg-[#EAF3EC] border-[#075B3C]/20',
                  action: () => handleSendMessage('Create a listing for 50 winter blankets.')
                },
                {
                  id: 'find_ngos',
                  icon: Users,
                  title: 'Find Matching NGOs',
                  desc: 'Get AI-powered NGO recommendations',
                  iconColor: 'text-[#159C9A]',
                  iconBg: 'bg-[#E6F5F3] border-[#159C9A]/20',
                  action: () => handleSendMessage('Find verified NGOs that need winter blankets in Delhi.')
                },
                {
                  id: 'est_price',
                  icon: TrendingUp,
                  title: 'Estimate Fair Price',
                  desc: 'Get market-based price estimate',
                  iconColor: 'text-amber-600',
                  iconBg: 'bg-amber-50 border-amber-100',
                  action: () => handleSendMessage('Estimate fair price for 50 winter blankets.')
                },
                {
                  id: 'check_safety',
                  icon: ShieldCheck,
                  title: 'Check Safety & Guidelines',
                  desc: 'Verify item eligibility and restrictions',
                  iconColor: 'text-emerald-700',
                  iconBg: 'bg-emerald-50 border-emerald-100',
                  action: () => handleSendMessage('Check safety guidelines and dignity restrictions for blankets.')
                },
                {
                  id: 'analyze_csv',
                  icon: FileSpreadsheet,
                  title: 'Analyze Inventory (CSV)',
                  desc: 'Explain errors and suggest fixes',
                  iconColor: 'text-cyan-700',
                  iconBg: 'bg-cyan-50 border-cyan-100',
                  action: () => handleSendMessage('Explain inventory import errors and corrective actions.')
                },
                {
                  id: 'solve_prob',
                  icon: Sparkles,
                  title: 'Solve Problems',
                  badge: 'NEW',
                  desc: 'Get step-by-step solutions to any issue',
                  iconColor: 'text-[#159C9A]',
                  iconBg: 'bg-[#E6F5F3] border-[#159C9A]/30',
                  action: () => {
                    setShowProblemModal(true);
                    setProblemInput('What should I do if delivery transit gets delayed or road is blocked?');
                    handleDiagnoseProblem('What should I do if delivery transit gets delayed or road is blocked?');
                  }
                },
                {
                  id: 'emerg_support',
                  icon: Flame,
                  title: 'Emergency Support',
                  desc: 'Guidance for urgent disaster donations',
                  iconColor: 'text-[#C83D4B]',
                  iconBg: 'bg-rose-50 border-rose-100',
                  action: () => {
                    window.location.href = '/emergency';
                  }
                }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-left group cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} border flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#172033] group-hover:text-blue-600 transition truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-extrabold text-[9px] tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#64748B] truncate">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>

            {/* 3. Recent Conversations Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-[#172033]">Recent Conversations</span>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-1">
                {recentConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      if (conv.id === 'c1') {
                        handleSendMessage('I have 50 winter blankets. Can you create a listing and suggest the best NGO matches?');
                      } else if (conv.id === 'c2') {
                        handleSendMessage('Explain import error help: 30 items were rejected.');
                      } else if (conv.id === 'c3') {
                        handleSendMessage('Find NGOs in Delhi for packaged food rations.');
                      } else {
                        handleSendMessage('Safety check for medicines: Are these items allowed?');
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl transition flex items-start gap-2.5 text-left cursor-pointer border ${
                      conv.active
                        ? 'bg-blue-50/60 border-blue-200 text-[#172033]'
                        : 'hover:bg-slate-50 border-transparent text-slate-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#172033] truncate">{conv.title}</div>
                      <div className="text-[10.5px] text-[#64748B] truncate">{conv.snippet}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{conv.time}</span>
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* =========================================================================
              CENTER COLUMN: MAIN CHAT & WORKFLOW WORKSPACE (6 Cols)
              ========================================================================= */}
          <section className="lg:col-span-6 space-y-4">
            
            {/* Main Chat Container Card */}
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[640px]">
              
              {/* Center Top Header: Title, Subtitle, Actions */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base font-bold text-[#172033] truncate">
                      {currentDraft.title || 'Winter Blankets Listing'}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span>Hotel Horizon Hospitality Group</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified Business</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Clear Chat</span>
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stepper Bar: 1 Understand -> 2 Analyze -> 3 Generate -> 4 Refine -> 5 Apply */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between text-xs overflow-x-auto">
                {[
                  { step: 1, label: 'Understand' },
                  { step: 2, label: 'Analyze' },
                  { step: 3, label: 'Generate' },
                  { step: 4, label: 'Refine' },
                  { step: 5, label: 'Apply' }
                ].map((s, idx) => {
                  const isCurrent = activeStep === s.step;
                  const isPassed = activeStep > s.step;
                  return (
                    <React.Fragment key={s.step}>
                      <button
                        onClick={() => setActiveStep(s.step)}
                        className={`flex items-center gap-1.5 font-medium transition cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'text-blue-600 font-bold'
                            : isPassed
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isPassed ? <Check className="w-3 h-3" /> : s.step}
                        </span>
                        <span>{s.label}</span>
                      </button>
                      {idx < 4 && <div className="w-4 sm:w-8 h-px bg-slate-200 shrink-0" />}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Chat Thread Messages */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[520px] bg-white text-xs"
              >
                {/* Notification toast if draft applied */}
                {applySuccessToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{applySuccessToast}</span>
                    </div>
                    <Link
                      href="/donate/individual"
                      className="text-xs text-emerald-800 underline font-bold"
                    >
                      View on Listing Page →
                    </Link>
                  </div>
                )}

                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      {/* Message Bubble Header */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-semibold">{isUser ? 'You (Hotel Horizon)' : 'Sahay AI Assistant'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {isUser && <span className="text-blue-500 font-bold">✓✓</span>}
                      </div>

                      {/* Bubble Text */}
                      <div
                        className={`p-3.5 rounded-2xl max-w-[94%] leading-relaxed ${
                          isUser
                            ? 'bg-[#EBF3FF] text-[#172033] rounded-tr-none border border-blue-100 font-medium'
                            : 'bg-slate-50 text-[#172033] rounded-tl-none border border-slate-200/80 space-y-3'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Assistant Filter Pills matching Reference Screenshot */}
                        {!isUser && msg.draft && (
                          <div className="space-y-3 pt-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { id: 'listing', label: 'Listing Created', checked: true },
                                { id: 'ngos', label: 'NGO Matches', checked: false },
                                { id: 'safety', label: 'Safety Check', checked: false },
                                { id: 'problem', label: 'Problem Analysis', checked: false }
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setActiveResponseTab(tab.id as any)}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border flex items-center gap-1 ${
                                    activeResponseTab === tab.id
                                      ? 'bg-white text-blue-700 border-blue-300 shadow-2xs font-bold'
                                      : 'bg-white/80 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {tab.checked && <Check className="w-3 h-3 text-emerald-600" />}
                                  <span>{tab.label}</span>
                                </button>
                              ))}
                            </div>

                            {/* TAB 1: AI Generated Listing Preview Card (Exact Layout from Screenshot) */}
                            {activeResponseTab === 'listing' && (
                              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                                  {/* Left: Blanket Photo with Change Image button */}
                                  <div className="sm:col-span-4 relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200 h-32 sm:h-36">
                                    <Image
                                      src={selectedImage}
                                      alt="Winter blanket listing preview"
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="absolute bottom-2 left-2 right-2 py-1 px-2 rounded-md bg-black/75 hover:bg-black text-white text-[10px] font-semibold flex items-center justify-center gap-1 backdrop-blur-xs transition cursor-pointer"
                                    >
                                      <span>Change Image</span>
                                    </button>
                                  </div>

                                  {/* Right: Title, Description, and Badges */}
                                  <div className="sm:col-span-8 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>AI Generated Listing</span>
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                        <span>95% confidence</span>
                                        <Info className="w-3 h-3 text-slate-400" />
                                      </span>
                                    </div>

                                    <h3 className="text-sm font-bold text-[#172033] leading-snug">
                                      {currentDraft.title}
                                    </h3>

                                    <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                                      {currentDraft.description}
                                    </p>

                                    {/* 2x3 Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[10.5px]">
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Category</span>
                                        <span className="font-semibold text-slate-800">Clothing & Winter Supplies</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Subcategory</span>
                                        <span className="font-semibold text-slate-800">{currentDraft.subcategory || 'Blankets & Bedding'}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Quantity</span>
                                        <span className="font-semibold text-slate-800">{currentDraft.quantity} units</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Condition</span>
                                        <span className="font-semibold text-slate-800">{currentDraft.condition}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Estimated Fair Price (for reference)</span>
                                        <span className="font-semibold text-slate-800">₹800 – ₹1,200 per unit</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9.5px]">Location</span>
                                        <span className="font-semibold text-slate-800">{currentDraft.city || 'New Delhi, Delhi'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Action Buttons */}
                                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                                  <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                                  >
                                    Edit Details
                                  </button>

                                  <button
                                    onClick={handleApplyToForm}
                                    className="px-4 py-1.5 rounded-xl bg-[#009688] hover:bg-[#00897b] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  >
                                    <span>Apply to Donation Form</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                              </div>
                            )}

                            {/* TAB 2: NGO Matches */}
                            {activeResponseTab === 'ngos' && (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                                <span className="font-bold text-slate-800 block text-xs">Matching Verified NGOs</span>
                                <div className="space-y-1.5">
                                  {ngoMatches.slice(0, 3).map((n) => (
                                    <div key={n.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-slate-900 block">{n.name}</span>
                                        <span className="text-[10px] text-slate-500">{n.location} • Needs: {n.needsCount}</span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        {n.matchScore}% Match
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* TAB 3: Safety Check */}
                            {activeResponseTab === 'safety' && (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-800 block text-xs">Safety & Compliance Findings</span>
                                <p className="text-slate-600 text-[11px]">
                                  Winter blankets meet humanitarian hygiene and dignity standards. Item is unexpired, non-hazardous, and suitable for rapid distribution.
                                </p>
                              </div>
                            )}

                            {/* TAB 4: Problem Analysis */}
                            {activeResponseTab === 'problem' && (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-800 block text-xs">Coordination Insights</span>
                                <p className="text-slate-600 text-[11px]">
                                  No blocking delivery bottlenecks detected. Transport from Delhi central depot is accessible by regular 3-ton vans.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Sahay AI is analyzing requests and checking verified database records...</span>
                  </div>
                )}
              </div>

              {/* Suggested Action Pills Below Chat matching Screenshot */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 block sm:inline">
                  Suggested Actions:
                </span>
                <button
                  onClick={() => handleSendMessage('Find matching NGOs for these 50 blankets in Delhi.')}
                  className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>Find matching NGOs</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Estimate fair price for 50 winter blankets.')}
                  className="px-2.5 py-1 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  <span>Estimate fair price</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Check safety guidelines and restrictions for these items.')}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Check safety guidelines</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Suggest an improved humanitarian description for this listing.')}
                  className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Improve description</span>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                  <span>+ Add more details</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Solve logistics problem: How to handle transport delivery delay?')}
                  className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>Solve a problem</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-[#E2E8F0] space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Item Photograph"
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your donation, inventory, NGOs, or any problem..."
                    className="flex-1 text-xs text-[#172033] placeholder-slate-400 bg-transparent focus:outline-none"
                  />

                  <button
                    type="button"
                    title="Voice input"
                    onClick={() => alert('Voice input listening... Speak your donation query.')}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="w-7 h-7 rounded-full bg-[#075B3C] hover:bg-[#06452F] text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 -ml-0.5" />
                  </button>
                </form>

                {/* Follow-up Prompts under Input */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-500">
                  <span className="font-medium text-slate-400">Suggestions:</span>
                  {[
                    'Suggest better title',
                    'Find NGOs in Delhi',
                    'Is this item allowed?',
                    'Improve this description',
                    'Help me fix errors'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </section>

          {/* =========================================================================
              RIGHT COLUMN: LIVE CONTEXT, TOP NGO MATCHES, & SAFETY (3 Cols)
              ========================================================================= */}
          <aside className="lg:col-span-3 space-y-4">
            
            {/* Card 1: Current Item Context */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#172033]">Current Item Context</span>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={selectedImage}
                    alt={currentDraft.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#172033] truncate">Winter Blankets</h4>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold shrink-0">
                      Ready to List
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">50 units • New</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="font-semibold text-slate-800">Clothing & Winter Supplies</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Price</span>
                  <span className="font-semibold text-slate-800">₹800 – ₹1,200 per unit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-800">New Delhi, Delhi</span>
                </div>
              </div>
            </div>

            {/* Card 2: Top NGO Matches (5) matching Screenshot */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-[#172033]">Top NGO Matches (5)</span>
                </div>
                <Link
                  href="/explore"
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {ngoMatches.map((ngo) => (
                  <div
                    key={ngo.id}
                    className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {ngo.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#172033] truncate">{ngo.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{ngo.location}</div>
                        <div className="text-[9.5px] font-semibold text-slate-600">Needs: {ngo.needsCount}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold border ${ngo.badgeColor}`}>
                        {ngo.matchScore}% Match
                      </span>
                      <button
                        onClick={() => setSelectedNgoDetail(ngo)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[10px] font-semibold transition cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Safety & Compliance Check */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#172033]">Safety & Compliance Check</span>
                </div>
                <button
                  onClick={() => alert('All items strictly verified against 80G/12A and NDMA dignity protocols.')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  View Details
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No issues found</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-700">
                {[
                  'Item category is allowed',
                  'Suitable for donation',
                  'No safety restrictions',
                  'Condition is acceptable',
                  'Ready for NGO matching'
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Problem Solver */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3EAE3] shadow-2xs">
              <button
                onClick={() => {
                  setShowProblemModal(true);
                  setProblemInput('What should I do if delivery transit gets delayed?');
                  handleDiagnoseProblem('What should I do if delivery transit gets delayed?');
                }}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E6F5F3] text-[#159C9A] flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#182820] group-hover:text-[#075B3C] transition">
                      Problem Solver
                    </h4>
                    <p className="text-[10px] text-[#64746A]">Describe any issue and get step-by-step solutions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#075B3C] group-hover:translate-x-0.5 transition" />
              </button>
            </div>

          </aside>

        </div>
      </main>

      {/* =========================================================================
          MODAL: EDIT LISTING DETAILS
          ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#172033]">Edit Listing Draft Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Item Title</label>
                <input
                  type="text"
                  value={currentDraft.title}
                  onChange={(e) => setCurrentDraft({ ...currentDraft, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={currentDraft.quantity}
                    onChange={(e) => setCurrentDraft({ ...currentDraft, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Condition</label>
                  <select
                    value={currentDraft.condition}
                    onChange={(e) => setCurrentDraft({ ...currentDraft, condition: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good Quality</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">City / Dispatch Hub</label>
                <input
                  type="text"
                  value={currentDraft.city || 'New Delhi'}
                  onChange={(e) => setCurrentDraft({ ...currentDraft, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={3}
                  value={currentDraft.description}
                  onChange={(e) => setCurrentDraft({ ...currentDraft, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  handleSendMessage(`I updated the listing details: ${currentDraft.title}, quantity: ${currentDraft.quantity}.`);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SHARE CHAT OR LISTING SUMMARY
          ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#172033]">Share Coordination Link</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Share this live donation draft and matched NGO roster with your team or logistics drivers:
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 break-all select-all">
              https://sahay.org/assistant?draft=winter_blankets_50
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://sahay.org/assistant?draft=winter_blankets_50');
                  alert('Link copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#075B3C] text-white font-bold text-xs hover:bg-[#06452F] transition"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NGO DETAILS VIEW
          ========================================================================= */}
      {selectedNgoDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {selectedNgoDetail.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">{selectedNgoDetail.name}</h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">Verified NGO • 80G Certified</span>
                </div>
              </div>
              <button onClick={() => setSelectedNgoDetail(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] block">Location & Radius</span>
                <span className="font-semibold text-slate-900">{selectedNgoDetail.location}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Documented Winter Need</span>
                <span className="font-semibold text-slate-900">{selectedNgoDetail.needsCount}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Algorithmic Match Score</span>
                <span className="font-bold text-emerald-700">{selectedNgoDetail.matchScore}% Compatibility</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedNgoDetail(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedNgoDetail(null);
                  handleSendMessage(`I want to match my 50 blankets directly with ${selectedNgoDetail.name}.`);
                }}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
              >
                Match with this NGO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INTERACTIVE PROBLEM SOLVER
          ========================================================================= */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E3EAE3] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FFF9E9] to-white border-b border-[#E3EAE3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F5F3] text-[#159C9A] flex items-center justify-center border border-[#159C9A]/30">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#182820]">Sahay Problem Solving Center</h3>
                  <p className="text-[11px] text-[#64746A]">Grounded diagnostics for donation, CSV, NGO matching, and logistics issues</p>
                </div>
              </div>
              <button
                onClick={() => setShowProblemModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Input & Quick Chips */}
              <div className="space-y-2">
                <label className="font-bold text-[#182820] block">Describe your issue or coordination roadblock:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiagnoseProblem()}
                    placeholder="e.g., CSV row rejected due to expiration date, or no NGOs found near Noida..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E3EAE3] text-xs focus:outline-none focus:border-[#075B3C] shadow-2xs"
                  />
                  <button
                    onClick={() => handleDiagnoseProblem()}
                    disabled={diagnosingProblem || !problemInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    {diagnosingProblem ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Diagnosing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Diagnose Issue</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Example Quick-Pick Issues */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#64746A] font-semibold">Common issues:</span>
                  {[
                    'CSV row rejected for < 48 hours expiry',
                    'No matching NGOs in my district',
                    'Driver delayed in transit to shelter',
                    'Item flagged by safety rules'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setProblemInput(preset);
                        handleDiagnoseProblem(preset);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#EAF3EC] hover:bg-[#dbeee0] text-[#075B3C] text-[10.5px] font-medium border border-[#075B3C]/10 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis Output Card */}
              {problemDiagnosis && (
                <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#E3EAE3] space-y-3.5 animate-in fade-in duration-200">
                  {/* Top Bar with Summary and Risk Badge */}
                  <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#E3EAE3]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#159C9A]">
                        Diagnostic Result
                      </span>
                      <h4 className="text-sm font-extrabold text-[#182820] mt-0.5">
                        {problemDiagnosis.problemSummary}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          problemDiagnosis.riskLevel === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : problemDiagnosis.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Risk Level: {problemDiagnosis.riskLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#075B3C] border border-[#075B3C]/20">
                        {problemDiagnosis.isConfirmed ? '✓ Confirmed Cause' : 'Diagnostic Hypothesis'}
                      </span>
                    </div>
                  </div>

                  {/* Likely Cause */}
                  <div className="space-y-1">
                    <span className="font-bold text-[#182820] text-xs">Probable Root Cause:</span>
                    <p className="text-xs text-[#64746A] leading-relaxed bg-white p-2.5 rounded-lg border border-[#E3EAE3]">
                      {problemDiagnosis.likelyCause}
                    </p>
                  </div>

                  {/* Supporting Evidence */}
                  {problemDiagnosis.supportingEvidence?.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-[#182820] text-xs">Supporting Evidence:</span>
                      <ul className="space-y-1 text-xs text-[#64746A]">
                        {problemDiagnosis.supportingEvidence.map((ev: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#159C9A] font-bold">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Solution */}
                  <div className="space-y-1 p-3 rounded-xl bg-[#EAF3EC] border border-[#075B3C]/20 text-[#075B3C]">
                    <span className="font-bold text-xs block">Recommended Solution:</span>
                    <p className="text-xs leading-relaxed">{problemDiagnosis.recommendedSolution}</p>
                  </div>

                  {/* Step-by-Step Instructions */}
                  {problemDiagnosis.stepByStepInstructions?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-[#182820] text-xs">Step-by-Step Resolution:</span>
                      <div className="space-y-1">
                        {problemDiagnosis.stepByStepInstructions.map((st: string, idx: number) => (
                          <div key={idx} className="p-2 rounded-lg bg-white border border-[#E3EAE3] text-xs text-[#182820]">
                            {st}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Corrective Actions */}
                  {problemDiagnosis.availableCorrectiveActions?.length > 0 && (
                    <div className="pt-2 border-t border-[#E3EAE3] space-y-2">
                      <span className="font-bold text-[#182820] text-xs block">Available Corrective Actions:</span>
                      <div className="flex flex-wrap gap-2">
                        {problemDiagnosis.availableCorrectiveActions.map((act: any) => {
                          const isDone = executedActionId === act.id;
                          return (
                            <button
                              key={act.id}
                              onClick={() => handleExecuteAction(act.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                isDone
                                  ? 'bg-[#EAF3EC] text-[#075B3C] border border-[#075B3C]'
                                  : 'bg-[#075B3C] hover:bg-[#06452F] text-white'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#075B3C]" />
                                  <span>Action Applied</span>
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                  <span>{act.label}</span>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Human Escalation Option */}
                  {problemDiagnosis.escalationOption?.available && (
                    <div className="pt-2 text-[11px] text-[#64746A] flex items-center justify-between border-t border-[#E3EAE3]">
                      <span>Need human assistance?</span>
                      <a
                        href={`mailto:${problemDiagnosis.escalationOption.contact}`}
                        className="font-bold text-[#075B3C] hover:underline"
                      >
                        Contact {problemDiagnosis.escalationOption.contact} →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E3EAE3] flex items-center justify-between">
              <span className="text-[10px] text-[#64746A]">
                Sahay Grounded Problem Solver • Safe, non-destructive execution
              </span>
              <button
                onClick={() => setShowProblemModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white border border-[#E3EAE3] hover:bg-slate-100 text-[#182820] font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

