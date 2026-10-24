'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Camera,
  Tag,
  TrendingUp,
  Users,
  ShieldCheck,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { StructuredListingDraft } from '@/lib/types';

export interface AIAssistantChatProps {
  onApplyToForm?: (draft: StructuredListingDraft) => void;
  currentFormData?: any;
  className?: string;
  isStandalone?: boolean;
  theme?: 'light' | 'dark';
}

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  images?: string[];
  structuredDraft?: StructuredListingDraft;
  matchingNgos?: Array<{
    id: string;
    name: string;
    location: string;
    needDescription: string;
    matchScore: number;
    distance: string;
    image: string;
  }>;
  priceData?: any;
  safetyData?: any;
}

export default function AIAssistantChat({
  onApplyToForm,
  currentFormData,
  className = '',
  isStandalone = false,
  theme = 'light'
}: AIAssistantChatProps) {
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Upload photos, describe your item, or ask me anything. I\'ll help you create the best listing with correct category, condition, and NGO matches.',
      timestamp: 'Online'
    },
    {
      id: 'user_seed',
      role: 'user',
      text: 'I have 50 winter blankets. Can you create a listing?',
      timestamp: 'Just now',
      images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80']
    },
    {
      id: 'bot_seed',
      role: 'assistant',
      text: "Here's a draft based on your photos:\n• Title: Warm Fleece Winter Blankets\n• Category: Clothing & Winter Supplies\n• Quantity: 50 units\n• Condition: Brand New (please confirm)",
      timestamp: 'Just now',
      structuredDraft: {
        title: 'Warm Fleece Winter Blankets',
        listingType: 'free_donation',
        category: 'clothing_blankets',
        subcategory: 'Blankets',
        description: 'Warm fleece blankets suitable for winter relief. Brand new in original packaging. Ideal for families and shelters.',
        quantity: 50,
        unit: 'units',
        condition: 'Brand New',
        city: 'New Delhi',
        state: 'Delhi',
        confidenceScore: 0.95
      }
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);
  const [appliedDraftId, setAppliedDraftId] = useState<string | null>(null);
  const [confirmModalDraft, setConfirmModalDraft] = useState<StructuredListingDraft | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Voice speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        continue;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setSelectedImages(prev => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if ((!message.trim() && selectedImages.length === 0) || isGenerating) return;

    const userMessageItem: ChatMessageItem = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: message,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessageItem]);
    setInputMessage('');
    const currentImages = [...selectedImages];
    setSelectedImages([]);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          images: currentImages,
          currentDraft: currentFormData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Assistant unavailable');

      const botMessageItem: ChatMessageItem = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Here is what I found for your listing.',
        timestamp: data.timestamp || 'Just now',
        structuredDraft: data.structuredDraft,
        matchingNgos: data.matchingNgos,
        priceData: data.priceData,
        safetyData: data.safetyData
      };

      setMessages(prev => [...prev, botMessageItem]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          text: `⚠️ ${err.message || 'Error communicating with AI service. Please try again.'}`,
          timestamp: 'Error'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyClick = (draft: StructuredListingDraft, messageId: string) => {
    // If form already has customized title or description, request confirmation
    if (currentFormData && currentFormData.title && currentFormData.title !== draft.title) {
      setConfirmModalDraft(draft);
    } else {
      executeApply(draft, messageId);
    }
  };

  const executeApply = async (draft: StructuredListingDraft, messageId: string) => {
    setAppliedDraftId(messageId);
    if (onApplyToForm) {
      onApplyToForm(draft);
    }

    try {
      await fetch('/api/listings/apply-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft })
      });
    } catch (err) {
      console.warn('Draft sync notice:', err);
    }

    setConfirmModalDraft(null);
  };

  return (
    <div className={`flex flex-col rounded-3xl overflow-hidden font-sans ${
      isLight
        ? 'bg-white border border-slate-200/90 shadow-sm text-slate-900'
        : 'bg-[#071329]/95 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl text-white'
    } ${className}`}>
      
      {/* 1. HEADER (Reference Matched) */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isLight ? 'border-slate-100 bg-white' : 'border-white/10 bg-[#061226]/80'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isLight
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : 'bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          }`}>
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isLight ? 'bg-blue-50' : 'bg-[#071329]'
            }`}>
              <Bot className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400 animate-pulse'}`} />
            </div>
          </div>
          <div>
            <h3 className={`text-xs font-bold tracking-tight flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>AI Assistant</span>
              <Sparkles className={`w-3 h-3 ${isLight ? 'text-blue-500' : 'text-cyan-400'}`} />
            </h3>
            <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              Your smart companion for better impact
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isLight
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      {/* 2. CHAT SCROLL AREA */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs custom-scrollbar max-h-[560px]">
        
        {/* Welcome Message Card */}
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
            isLight
              ? 'bg-blue-50 text-blue-600 border-blue-100'
              : 'bg-blue-500/20 text-cyan-400 border-cyan-500/30'
          }`}>
            <Bot className="w-4 h-4" />
          </div>
          <div className={`p-3.5 rounded-2xl text-[11.5px] leading-relaxed shadow-xs max-w-[92%] border ${
            isLight
              ? 'bg-[#F0F7FF] border-blue-100/90 text-slate-700'
              : 'bg-[#091b33]/90 border-slate-800 text-slate-200 shadow-lg'
          }`}>
            Upload photos, describe your item, or ask me anything. I&apos;ll help you create the best listing with correct category, condition, and NGO matches.
          </div>
        </div>

        {/* 5 Quick Action Buttons (Matching Screenshot) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Action 1: Photos */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition group cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-[#FAF5FF] border-purple-200/80 hover:border-purple-300 hover:bg-purple-50 text-slate-700'
                : 'bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/30 hover:border-purple-400/60 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
              isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400'
            }`}>
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10.5px] font-semibold leading-tight ${isLight ? 'text-purple-900' : 'text-purple-200'}`}>
              Generate listing from photos
            </span>
          </button>

          {/* Action 2: Recommend Category */}
          <button
            onClick={() => handleSendMessage('Recommend the best category and subcategory for this item.')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition group cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-[#EFF6FF] border-blue-200/80 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                : 'bg-gradient-to-r from-blue-950/40 to-cyan-950/40 border-blue-500/30 hover:border-blue-400/60 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
              isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10.5px] font-semibold leading-tight ${isLight ? 'text-blue-900' : 'text-blue-200'}`}>
              Recommend category
            </span>
          </button>

          {/* Action 3: Estimate Price */}
          <button
            onClick={() => handleSendMessage('What is a reasonable fair price to sell this at for NGOs?')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition group cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-[#FFF1F2] border-rose-200/80 hover:border-rose-300 hover:bg-rose-50 text-slate-700'
                : 'bg-gradient-to-r from-fuchsia-950/40 to-pink-950/40 border-fuchsia-500/30 hover:border-fuchsia-400/60 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
              isLight ? 'bg-rose-100 text-rose-600' : 'bg-fuchsia-500/20 text-fuchsia-400'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10.5px] font-semibold leading-tight ${isLight ? 'text-rose-900' : 'text-rose-200'}`}>
              Estimate fair price (for sale)
            </span>
          </button>

          {/* Action 4: Find NGOs */}
          <button
            onClick={() => handleSendMessage('Find verified NGOs that currently need this in Delhi NCR.')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition group cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-[#F0FDFA] border-teal-200/80 hover:border-teal-300 hover:bg-teal-50 text-slate-700'
                : 'bg-gradient-to-r from-teal-950/40 to-emerald-950/40 border-teal-500/30 hover:border-teal-400/60 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
              isLight ? 'bg-teal-100 text-teal-600' : 'bg-teal-500/20 text-teal-400'
            }`}>
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10.5px] font-semibold leading-tight ${isLight ? 'text-teal-900' : 'text-teal-200'}`}>
              Find matching NGOs
            </span>
          </button>

          {/* Action 5: Check Safety (Full Width) */}
          <button
            onClick={() => handleSendMessage('Check item safety and platform donation guidelines.')}
            className={`col-span-2 flex items-center gap-2 p-2.5 rounded-xl border text-left transition group cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-[#ECFDF5] border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700'
                : 'bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border-emerald-500/30 hover:border-emerald-400/60 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
              isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10.5px] font-semibold leading-tight ${isLight ? 'text-emerald-900' : 'text-emerald-200'}`}>
              Check item safety & guidelines
            </span>
          </button>
        </div>

        {/* Message Thread */}
        {messages.filter(m => m.id !== 'welcome').map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {/* Assistant Avatar */}
            {msg.role === 'assistant' && (
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                isLight ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-blue-500/20 text-cyan-400 border-cyan-500/30'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Bubble Container */}
            <div className={`p-3 rounded-2xl max-w-[88%] text-[11px] leading-relaxed space-y-2.5 ${
              msg.role === 'user'
                ? isLight
                  ? 'bg-[#EFF6FF] text-slate-900 rounded-tr-xs border border-blue-200/80 shadow-2xs'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs border border-blue-400/30 shadow-lg'
                : isLight
                  ? 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs'
                  : 'bg-[#091b33]/90 text-slate-200 rounded-tl-xs border border-slate-800 shadow-lg'
            }`}>
              
              {/* Optional User Uploaded Thumbnails */}
              {msg.images && msg.images.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {msg.images.map((img, i) => (
                    <img key={i} src={img} alt="Uploaded item" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0" />
                  ))}
                </div>
              )}

              {/* Message Text */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Structured Listing Draft Card (Reference Matched) */}
              {msg.structuredDraft && (
                <div className={`p-3 rounded-xl space-y-2 mt-2 border ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#040e1f] border-cyan-500/30'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                    isLight ? 'text-slate-600' : 'text-cyan-400'
                  }`}>
                    <span>Draft Listing (AI Generated)</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                      isLight ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {Math.round((msg.structuredDraft.confidenceScore || 0.95) * 100)}% Conf.
                    </span>
                  </div>

                  {msg.structuredDraft.images?.[0] && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                      <img src={msg.structuredDraft.images[0]} alt="Draft preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-[8px] rounded font-bold text-white">
                        {msg.structuredDraft.quantity} {msg.structuredDraft.unit}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1 text-[10.5px]">
                    <div className={`flex items-center gap-1.5 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <span className={isLight ? 'text-blue-600' : 'text-cyan-400'}>📦 Title:</span>
                      <span className="truncate">{msg.structuredDraft.title}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className={isLight ? 'text-emerald-600' : 'text-teal-400'}>🏷️ Category:</span>
                      <span>Clothing & Winter Supplies</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className={isLight ? 'text-purple-600' : 'text-purple-400'}>🔢 Quantity:</span>
                      <span>{msg.structuredDraft.quantity} {msg.structuredDraft.unit}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className={isLight ? 'text-amber-600' : 'text-emerald-400'}>✨ Condition:</span>
                      <span>{msg.structuredDraft.condition} (please confirm)</span>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {showDetailsId === msg.id && (
                    <div className={`pt-2 border-t text-[10px] space-y-1 animate-in fade-in duration-150 ${
                      isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                    }`}>
                      <div><strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>Description:</strong> {msg.structuredDraft.description}</div>
                      <div><strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>Dimensions:</strong> {msg.structuredDraft.dimensions || '200 × 150 × 5 cm'}</div>
                      <div><strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>Location:</strong> {msg.structuredDraft.city || 'Delhi'}, {msg.structuredDraft.state || 'India'}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowDetailsId(showDetailsId === msg.id ? null : msg.id)}
                      className={`text-[10px] flex items-center gap-0.5 cursor-pointer font-semibold ${
                        isLight ? 'text-blue-600 hover:text-blue-700' : 'text-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      <span>{showDetailsId === msg.id ? 'Hide details' : 'View more details'}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${showDetailsId === msg.id ? 'rotate-90' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleApplyClick(msg.structuredDraft!, msg.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer ${
                        appliedDraftId === msg.id
                          ? 'bg-emerald-600 text-white'
                          : isLight
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      {appliedDraftId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Form</span>
                        </>
                      ) : (
                        <span>Apply to Form</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Matching NGOs Cards */}
              {msg.matchingNgos && msg.matchingNgos.length > 0 && (
                <div className={`space-y-2 mt-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <div className={`text-[10px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Verified NGO Matches in Database:</div>
                  <div className="space-y-1.5">
                    {msg.matchingNgos.map(ngo => (
                      <div key={ngo.id} className={`p-2 rounded-xl flex items-center justify-between gap-2 border ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#051124] border-slate-700/80'
                      }`}>
                        <div className="flex items-center gap-2">
                          <img src={ngo.image} alt={ngo.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className={`font-bold text-[11px] leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{ngo.name}</div>
                            <div className={`text-[9.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{ngo.needDescription}</div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold shrink-0">
                          {ngo.matchScore}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-md">
                V
              </div>
            )}
          </div>
        ))}

        {/* AI Generating Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2.5 text-slate-400 text-[11px] pt-1">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-blue-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
              isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-[#091b33] border-slate-800 text-cyan-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              <span>Analyzing images and relief needs...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. SUGGESTED CHIPS (Reference Matched) */}
      <div className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 ${
        isLight ? 'border-slate-100 bg-[#F8FAFC]' : 'border-white/5 bg-[#051124]/60'
      }`}>
        <button
          onClick={() => handleSendMessage('Suggest a compelling, detailed description for winter relief blankets.')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] transition cursor-pointer border ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/70 text-slate-300'
          }`}
        >
          Suggest description
        </button>
        <button
          onClick={() => handleSendMessage('Find verified NGOs that need blankets in Delhi NCR.')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] transition cursor-pointer border ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/70 text-slate-300'
          }`}
        >
          Find NGOs
        </button>
        <button
          onClick={() => handleSendMessage('Check statutory restrictions and hygiene safety guidelines.')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] transition cursor-pointer border ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/70 text-slate-300'
          }`}
        >
          Check restrictions
        </button>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Selected Image Badges Before Send */}
      {selectedImages.length > 0 && (
        <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040e1f] border-slate-800'
        }`}>
          {selectedImages.map((img, i) => (
            <div key={i} className="relative group shrink-0">
              <img src={img} alt="Selected preview" className="w-10 h-10 rounded-lg object-cover border border-blue-500/50" />
              <button
                onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <span className={`text-[10px] font-medium ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
            Ready to analyze with message
          </span>
        </div>
      )}

      {/* 4. CHAT COMPOSER WITH VOICE & SEND BUTTON (Reference Matched) */}
      <div className={`p-3 border-t ${
        isLight ? 'border-slate-100 bg-white' : 'border-white/10 bg-[#061226]/95'
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Voice Input */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                : isLight
                  ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 border border-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Click to speak (Voice input)'}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Photo attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
              isLight
                ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 border border-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
            }`}
            title="Attach product photos"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Multiline Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isRecording ? 'Listening to voice...' : 'Ask anything about your listing...'}
            disabled={isGenerating}
            className={`flex-1 rounded-full px-3.5 py-1.5 text-xs transition focus:outline-none ${
              isLight
                ? 'bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/10'
                : 'bg-[#091b33] border border-slate-700/70 hover:border-slate-600 focus:border-cyan-400 text-white placeholder-slate-400 focus:ring-1 focus:ring-cyan-500/30 shadow-inner'
            }`}
          />

          {/* Blue Send Button */}
          <button
            type="submit"
            disabled={(!inputMessage.trim() && selectedImages.length === 0) || isGenerating}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 5. CONFIRM OVERWRITE MODAL */}
      {confirmModalDraft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-900">
            <div className="flex items-center gap-2 text-amber-600 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Confirm Apply to Form</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Applying this AI draft will update your form with:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] space-y-1">
              <div><strong className="text-slate-900">Title:</strong> {confirmModalDraft.title}</div>
              <div><strong className="text-slate-900">Category:</strong> Clothing & Winter Supplies ({confirmModalDraft.subcategory})</div>
              <div><strong className="text-slate-900">Quantity:</strong> {confirmModalDraft.quantity} {confirmModalDraft.unit}</div>
              <div><strong className="text-slate-900">Condition:</strong> {confirmModalDraft.condition}</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModalDraft(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeApply(confirmModalDraft, 'confirmed')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
              >
                Confirm & Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
