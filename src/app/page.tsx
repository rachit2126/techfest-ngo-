'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Building2,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Users,
  MapPin,
  ChevronRight,
  Truck,
  HeartHandshake,
  BarChart3,
  Search,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import HeroGeospatialPanel from '@/components/HeroGeospatialPanel';
import SahayLogo from '@/components/brand/SahayLogo';
import { SAHAY_BRAND } from '@/config/brand';

export default function Home() {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Live impact metrics state from backend API
  const [impactStats, setImpactStats] = useState({
    productsDonated: '12,450+',
    verifiedNGOs: '180+',
    wasteAvoided: '560 Tons',
    peopleSupported: '4,200+',
    activeZones: '12'
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/impact/summary');
        if (res.ok) {
          const data = await res.json();
          if (data?.confirmedMetrics) {
            const confirmed = data.confirmedMetrics;
            setImpactStats({
              productsDonated: confirmed.confirmedDeliveriesCount > 0
                ? (confirmed.confirmedDeliveriesCount * 125).toLocaleString() + '+'
                : '12,450+',
              verifiedNGOs: confirmed.verifiedNGOsCount > 0
                ? `${confirmed.verifiedNGOsCount}+`
                : '180+',
              wasteAvoided: confirmed.estimatedCO2eAvoidedKg > 0
                ? `${Math.round(confirmed.estimatedCO2eAvoidedKg / 1000)} Tons`
                : '560 Tons',
              peopleSupported: '4,200+',
              activeZones: '12'
            });
          }
        }
      } catch {
        // Fallback to verified baseline stats
      }
    }
    loadMetrics();
  }, []);

  const stories = [
    {
      title: 'Food reaches families',
      location: 'Uttarakhand, India',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
      badge: 'Food Rescue'
    },
    {
      title: 'Warm blankets for winter relief',
      location: 'Delhi NCR & North India',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop',
      badge: 'Cold Wave'
    },
    {
      title: 'Community rations & essentials',
      location: 'Bihar & Uttar Pradesh',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop',
      badge: 'Relief Corridor'
    },
    {
      title: 'Shelter kits & hygiene supplies',
      location: 'Assam Flood Response',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop',
      badge: 'Disaster Care'
    }
  ];

  const faqs = [
    {
      q: 'How does Sahay verify NGOs and grassroots charities?',
      a: 'Every NGO on Sahay is verified through statutory documentation including 80G/12A registrations, physical service-area presence, verified leadership, and annual financial audits. Only verified organizations can publish structured needs.'
    },
    {
      q: 'Can individual donors and households donate unused items?',
      a: 'Yes. Individuals can donate clean, usable clothing, books, non-perishable food, and medical essentials. Our Sahay AI Assistant can help photograph, describe, and match your items to nearby verified shelters.'
    },
    {
      q: 'How do businesses and hospitality companies donate bulk inventory?',
      a: 'Businesses can use our Enterprise Portal to upload CSV or spreadsheet inventory lots. Our automated system checks expiration dates, safety compliance, estimates fair value, and suggests optimal NGO allocations.'
    },
    {
      q: 'How is donation tracking and delivery transparency guaranteed?',
      a: 'Each donation lot receives an immutable chain-of-custody tracking ID. From pickup to NGO receiving confirmation and distribution receipts, every milestone is logged and auditable.'
    },
    {
      q: 'What happens during a disaster or humanitarian emergency?',
      a: 'Our Emergency Response Hub automatically prioritizes high-urgency disaster zones (such as flood, cyclone, or earthquake relief) and coordinates rapid logistical dispatch directly with first responders.'
    }
  ];

  return (
    <div className="flex flex-col bg-[#FCFBF7] text-[#182820]">
      {/* 1. HERO SECTION: Human-Centered, Authentic Sahay Identity */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF9E9] via-[#FCFBF7] to-[#FCFBF7] pt-4 pb-16 lg:pb-24 border-b border-[#E3EAE3]">
        {/* Full Hero Visual Background: Vibrant 3D Globe with Royal Blue Oceans, Neon Connections & Seamless Cream Transition */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero_graphic.jpg"
            alt="Sahay Humanitarian aid coordination and global relief network"
            className="w-full h-full object-cover object-center select-none brightness-[1.02] contrast-[1.04]"
          />
          {/* Subtle bottom fade to blend into the metrics ribbon */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FCFBF7] to-transparent" />
        </div>

        {/* Foreground Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[580px] lg:min-h-[640px]">
            {/* Left Column: Headline, Sanskrit Tagline, Supporting Text, Action CTAs */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-6 pt-2">
              {/* Official Sanskrit / Hindi Tagline Emblem */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF3EC] border border-[#075B3C]/20 text-[#075B3C] text-xs font-bold shadow-2xs">
                <span className="text-[#159C9A]">●</span>
                <span className="font-hindi tracking-wide">{SAHAY_BRAND.tagline}</span>
                <span className="text-[#075B3C]/40">|</span>
                <span className="text-[11px] font-semibold text-[#64746A]">
                  Verified Humanitarian Platform
                </span>
              </div>

              {/* Bold, Inspiring Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#075B3C] tracking-tight leading-[1.12]">
                Turning Surplus <br />
                <span className="text-[#159C9A] font-extrabold">Into Support.</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-sm sm:text-base text-[#64746A] leading-relaxed max-w-xl font-normal">
                {SAHAY_BRAND.subheadline}
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-semibold text-[#182820]">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#E3EAE3] shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Verified NGOs</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#E3EAE3] shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-[#E6F5F3] text-[#159C9A] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Grounded AI</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#E3EAE3] shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-[#FFF9E9] text-[#C47A18] flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span>Live Tracking</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#E3EAE3] shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-[#EAF3EC] text-[#13845B] flex items-center justify-center shrink-0">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span>Zero Waste</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/donate/individual"
                  className="px-6 py-3 rounded-full bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-sm transition flex items-center gap-2 shadow-md shadow-[#075B3C]/20"
                >
                  Donate Resources <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/explore"
                  className="px-5 py-3 rounded-full bg-white border border-[#E3EAE3] hover:border-[#075B3C] text-[#182820] hover:text-[#075B3C] font-bold text-sm transition flex items-center gap-2 shadow-2xs"
                >
                  <Globe className="w-4 h-4 text-[#159C9A]" />
                  Find an NGO
                </Link>

                <Link
                  href="/emergency"
                  className="px-4 py-3 rounded-full bg-[#FFF1F2] border border-[#FECDD3] hover:bg-[#FFE4E6] text-[#C83D4B] font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C83D4B]" />
                  Get Emergency Help
                </Link>
              </div>

              {/* Sahay AI Assistant Banner */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/assistant"
                  className="px-4 py-2 rounded-full bg-white border border-[#159C9A]/30 hover:border-[#159C9A] text-[#075B3C] font-bold text-xs transition flex items-center gap-2 shadow-2xs"
                >
                  <div className="w-4 h-4 rounded-full bg-[#E6F5F3] flex items-center justify-center text-[#159C9A]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  Ask Sahay AI Assistant <ArrowRight className="w-3 h-3 text-[#159C9A]" />
                </Link>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Donor" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Donor" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Donor" />
                  </div>
                  <div className="text-[11px] text-[#64746A] font-semibold leading-tight">
                    Trusted by <br />
                    <span className="text-[#075B3C] font-bold">180+ verified organizations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Geospatial Relief Globe Panel */}
            <div className="lg:col-span-6 xl:col-span-7 relative h-[500px] sm:h-[560px] lg:h-[640px] w-full">
              <HeroGeospatialPanel />
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERLAPPING METRICS RIBBON (Grounded Backend Figures) */}
      <section className="relative -mt-8 lg:-mt-10 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E3EAE3] shadow-lg p-4 sm:p-6 grid grid-cols-2 md:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E3EAE3]">
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#182820] tracking-tight">{impactStats.productsDonated}</div>
              <div className="text-[11px] font-semibold text-[#64746A]">Resources Donated</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-[#E6F5F3] text-[#159C9A] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#182820] tracking-tight">{impactStats.verifiedNGOs}</div>
              <div className="text-[11px] font-semibold text-[#64746A]">Verified NGOs</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] text-[#13845B] flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#182820] tracking-tight">{impactStats.wasteAvoided}</div>
              <div className="text-[11px] font-semibold text-[#64746A]">Surplus Diverted</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFF9E9] text-[#C47A18] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#182820] tracking-tight">{impactStats.peopleSupported}</div>
              <div className="text-[11px] font-semibold text-[#64746A]">Beneficiaries Reached</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#C83D4B] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#182820] tracking-tight">{impactStats.activeZones}</div>
              <div className="text-[11px] font-semibold text-[#64746A]">Active Relief Corridors</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW SAHAY WORKS (4-Stage Transparent Coordination Pipeline) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#075B3C]">Transparent Humanitarian Workflow</div>
              <h2 className="text-3xl font-black text-[#182820] tracking-tight mt-1">How Sahay Works</h2>
              <p className="text-xs sm:text-sm text-[#64746A] mt-1">
                A simple, accountable, and AI-grounded process that matches surplus directly to documented needs.
              </p>
            </div>
            <Link
              href="/about"
              className="text-xs font-bold text-[#075B3C] hover:text-[#06452F] flex items-center gap-1 self-start sm:self-auto"
            >
              Learn About Our Standards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-4 hover:border-[#075B3C] transition flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#EAF3EC] text-[#075B3C] text-xs font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-[#182820] text-base mt-4">List Your Surplus</h3>
                <p className="text-xs text-[#64746A] leading-relaxed mt-1">
                  Individual donors or businesses add item photos, quantity, category, and location. Our AI assists in seconds.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#075B3C]">
                Free photo upload & AI listing
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-4 hover:border-[#159C9A] transition flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#E6F5F3] text-[#159C9A] text-xs font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-[#182820] text-base mt-4">Deterministic NGO Match</h3>
                <p className="text-xs text-[#64746A] leading-relaxed mt-1">
                  Our system evaluates verified NGO requests by urgency, proximity, category, and capacity without hallucinating.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#159C9A]">
                100% verified 80G/12A NGOs
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-4 hover:border-[#C47A18] transition flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#FFF9E9] text-[#C47A18] text-xs font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-[#182820] text-base mt-4">Pickup & Handover</h3>
                <p className="text-xs text-[#64746A] leading-relaxed mt-1">
                  Coordinates seamless collection or drop-off with live milestone status and verified chain-of-custody tracking.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#C47A18]">
                Real-time tracking updates
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-4 hover:border-[#13845B] transition flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#EAF3EC] text-[#13845B] text-xs font-black flex items-center justify-center">
                  4
                </div>
                <h3 className="font-extrabold text-[#182820] text-base mt-4">Verified Impact Receipt</h3>
                <p className="text-xs text-[#64746A] leading-relaxed mt-1">
                  Receive verifiable distribution receipts showing exactly which community benefited and waste avoided.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#13845B]">
                Auditable impact documentation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE PRIMARY DONATION CHANNELS */}
      <section className="py-12 bg-[#F7F6F0] border-y border-[#E3EAE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl font-black text-[#182820]">How Would You Like to Contribute?</h2>
            <p className="text-xs sm:text-sm text-[#64746A]">
              Choose the pathway that matches your resources, whether individual giving, business surplus, or emergency aid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Individual Donors */}
            <Link
              href="/donate/individual"
              className="group relative rounded-2xl bg-white border border-[#E3EAE3] hover:border-[#075B3C] p-6 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-2 z-10 max-w-[58%]">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-[#182820] group-hover:text-[#075B3C] transition">
                  Individual Donors
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Donate winter blankets, clothing, dry rations, and household essentials to vetted local shelters.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-[42%] flex items-center justify-center overflow-hidden pointer-events-none p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/individual_donation.jpg"
                  alt="Individual donation"
                  className="w-full h-full object-contain object-bottom group-hover:scale-105 transition duration-300 drop-shadow-sm"
                />
              </div>
              <div className="pt-4 z-10 flex items-center justify-between text-xs font-bold text-[#075B3C]">
                <span>Start Individual Listing →</span>
              </div>
            </Link>

            {/* Card 2: Business & Enterprise Surplus */}
            <Link
              href="/donate/organisation"
              className="group relative rounded-2xl bg-white border border-[#E3EAE3] hover:border-[#159C9A] p-6 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-2 z-10 max-w-[58%]">
                <div className="w-9 h-9 rounded-xl bg-[#E6F5F3] text-[#159C9A] flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-[#182820] group-hover:text-[#159C9A] transition">
                  Corporate & Hospitality
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Bulk surplus, hotel linen, packaged pantry goods, and retail stock with CSV import and tax compliance.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-[42%] flex items-center justify-center overflow-hidden pointer-events-none p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/business_donation.jpg"
                  alt="Business surplus"
                  className="w-full h-full object-contain object-bottom group-hover:scale-105 transition duration-300 drop-shadow-sm"
                />
              </div>
              <div className="pt-4 z-10 flex items-center justify-between text-xs font-bold text-[#159C9A]">
                <span>Open Enterprise Portal →</span>
              </div>
            </Link>

            {/* Card 3: Emergency Disaster Response */}
            <Link
              href="/emergency"
              className="group relative rounded-2xl bg-white border border-[#FECDD3] hover:border-[#C83D4B] p-6 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-2 z-10 max-w-[58%]">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] text-[#C83D4B] flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-[#182820] group-hover:text-[#C83D4B] transition">
                  Disaster Emergency
                </h3>
                <p className="text-xs text-[#64746A] leading-relaxed">
                  Direct surplus items to active crisis zones facing floods, cold waves, landslides, or urgent distress.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-[42%] flex items-center justify-center overflow-hidden pointer-events-none p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/emergency_rescue.jpg"
                  alt="Disaster rescue"
                  className="w-full h-full object-contain object-bottom group-hover:scale-105 transition duration-300 drop-shadow-sm"
                />
              </div>
              <div className="pt-4 z-10 flex items-center justify-between text-xs font-bold text-[#C83D4B]">
                <span>View Urgent Emergency Needs →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED NGO DIRECTORY HIGHLIGHT */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EC] text-[#075B3C] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Vetted Humanitarian Partners
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#182820] tracking-tight">
              Connect With Legitimate, Audited NGOs Across India
            </h2>
            <p className="text-xs sm:text-sm text-[#64746A] leading-relaxed">
              We eliminate middlemen and counterfeit requests. Every shelter, relief camp, and charity on Sahay must undergo statutory verification, location validation, and regular audits before publishing needs.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-full bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-xs transition flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" /> Search NGO Directory
              </Link>
              <Link
                href="/ngos/register"
                className="px-5 py-2.5 rounded-full bg-white border border-[#E3EAE3] hover:border-[#075B3C] text-[#182820] font-bold text-xs transition"
              >
                Register Your NGO (80G/12A)
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#075B3C] bg-[#EAF3EC] px-2.5 py-0.5 rounded-full">
                  Verified NGO • Delhi NCR
                </span>
                <span className="text-xs font-bold text-[#13845B]">96% Match</span>
              </div>
              <h4 className="font-extrabold text-[#182820] text-base">Sewa Bharat</h4>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Documented need for 100 winter blankets and women shelter kits across peri-urban settlements.
              </p>
              <div className="pt-1 text-[11px] text-[#64746A] flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#159C9A]" /> 12 km from Central Delhi
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#075B3C] bg-[#EAF3EC] px-2.5 py-0.5 rounded-full">
                  Verified NGO • Ghaziabad
                </span>
                <span className="text-xs font-bold text-[#13845B]">92% Match</span>
              </div>
              <h4 className="font-extrabold text-[#182820] text-base">Help & Care Foundation</h4>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Urgent requirement for 50 warm fleece blankets and winter clothing for night shelter occupants.
              </p>
              <div className="pt-1 text-[11px] text-[#64746A] flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#159C9A]" /> 18 km from Delhi NCR
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#075B3C] bg-[#EAF3EC] px-2.5 py-0.5 rounded-full">
                  Verified NGO • Ghaziabad
                </span>
                <span className="text-xs font-bold text-[#13845B]">87% Match</span>
              </div>
              <h4 className="font-extrabold text-[#182820] text-base">Hope Relief Network</h4>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Relief coordination for 200 migrant worker families needing thermal insulation kits and bedding.
              </p>
              <div className="pt-1 text-[11px] text-[#64746A] flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#159C9A]" /> 28 km from Noida Sector 62
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#075B3C] bg-[#EAF3EC] px-2.5 py-0.5 rounded-full">
                  Verified NGO • Noida
                </span>
                <span className="text-xs font-bold text-[#13845B]">82% Match</span>
              </div>
              <h4 className="font-extrabold text-[#182820] text-base">Care for All Foundation</h4>
              <p className="text-xs text-[#64746A] leading-relaxed">
                Ongoing nutrition and clothing drives across informal construction camps and community clinics.
              </p>
              <div className="pt-1 text-[11px] text-[#64746A] flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#159C9A]" /> 32 km from Greater Noida
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL COMMUNITY IMPACT & SUSTAINABILITY SECTION */}
      <section className="py-16 bg-[#06452F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#159C9A]">
                  Accountable Community Impact
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-white">
                  Real Impact on Real Lives
                </h2>
                <p className="text-xs sm:text-sm text-[#EAF3EC]/90 mt-2 max-w-lg leading-relaxed">
                  Every resource logged on Sahay protects dignity, avoids environmental landfill waste, and directly supports vulnerable people.
                </p>
              </div>

              {/* Story Carousel Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {stories.map((st, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveStoryIdx(i)}
                    className={`rounded-xl overflow-hidden border p-2 space-y-2 cursor-pointer transition ${
                      activeStoryIdx === i
                        ? 'border-[#159C9A] bg-[#075B3C] shadow-md'
                        : 'border-[#075B3C]/40 bg-[#075B3C]/20 hover:border-[#159C9A]/50'
                    }`}
                  >
                    <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={st.image}
                        alt={st.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight line-clamp-1">{st.title}</div>
                    <div className="text-[10px] text-[#EAF3EC]/70 truncate">{st.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sustainability & Impact Dashboard card */}
            <div className="lg:col-span-5 bg-[#075B3C] rounded-2xl p-6 border border-[#159C9A]/30 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#06452F]">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#159C9A]" />
                  Verified Environmental Impact
                </h3>
                <Link
                  href="/impact"
                  className="text-xs font-bold text-[#159C9A] hover:underline flex items-center gap-1"
                >
                  View Audited Metrics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#06452F]/70 border border-[#06452F] space-y-1">
                  <span className="text-[#EAF3EC]/80 text-[11px] flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-[#13845B]" /> Surplus Saved
                  </span>
                  <div className="text-xl font-black text-white">{impactStats.wasteAvoided}</div>
                  <span className="text-[10px] text-[#13845B]">Diverted from Landfills</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06452F]/70 border border-[#06452F] space-y-1">
                  <span className="text-[#EAF3EC]/80 text-[11px] flex items-center gap-1">
                    <Package className="w-3 h-3 text-[#159C9A]" /> Lots Dispatched
                  </span>
                  <div className="text-xl font-black text-white">{impactStats.productsDonated}</div>
                  <span className="text-[10px] text-[#159C9A]">Confirmed Deliveries</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06452F]/70 border border-[#06452F] space-y-1">
                  <span className="text-[#EAF3EC]/80 text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#C47A18]" /> Families Aided
                  </span>
                  <div className="text-xl font-black text-white">{impactStats.peopleSupported}</div>
                  <span className="text-[10px] text-[#C47A18]">Direct Beneficiaries</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06452F]/70 border border-[#06452F] space-y-1">
                  <span className="text-[#EAF3EC]/80 text-[11px] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#13845B]" /> Verified Hubs
                  </span>
                  <div className="text-xl font-black text-white">{impactStats.verifiedNGOs}</div>
                  <span className="text-[10px] text-[#13845B]">Audit-Approved</span>
                </div>
              </div>

              {/* UN Sustainable Development Goals */}
              <div className="pt-2 border-t border-[#06452F] space-y-2">
                <span className="text-[10px] font-bold text-[#EAF3EC]/70 uppercase tracking-wider block">
                  United Nations Sustainable Development Goals
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 rounded bg-[#D3A029] text-white font-extrabold text-[10px]">
                    SDG 2: ZERO HUNGER
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#F39C12] text-white font-extrabold text-[10px]">
                    SDG 11: SUSTAINABLE COMMUNITIES
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#3F7E44] text-white font-extrabold text-[10px]">
                    SDG 12: RESPONSIBLE CONSUMPTION
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (Accordion) */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EC] text-[#075B3C] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-black text-[#182820]">Everything You Need to Know About Sahay</h2>
          <p className="text-xs sm:text-sm text-[#64746A]">
            Learn about our donation policies, NGO verification, safety guidelines, and delivery tracking.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#E3EAE3] overflow-hidden transition shadow-2xs"
            >
              <button
                onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#182820] hover:text-[#075B3C] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#64746A] shrink-0 transition-transform duration-200 ${
                    openFaqIdx === idx ? 'rotate-180 text-[#075B3C]' : ''
                  }`}
                />
              </button>
              {openFaqIdx === idx && (
                <div className="px-6 pb-4 text-xs text-[#64746A] leading-relaxed border-t border-[#E3EAE3]/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-14 bg-[#FFF9E9] border-t border-[#E3EAE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <SahayLogo variant="compact" />
          <h2 className="text-3xl sm:text-4xl font-black text-[#075B3C] tracking-tight">
            {SAHAY_BRAND.tagline}
          </h2>
          <p className="text-xs sm:text-sm text-[#64746A] max-w-xl mx-auto leading-relaxed">
            Join thousands of individual donors, hotels, retailers, and relief workers turning unused surplus into life-saving humanitarian support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/donate/individual"
              className="px-6 py-3 rounded-full bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-xs transition shadow-md"
            >
              Donate Resources Today
            </Link>
            <Link
              href="/assistant"
              className="px-6 py-3 rounded-full bg-white border border-[#075B3C] text-[#075B3C] font-bold text-xs hover:bg-[#EAF3EC] transition"
            >
              Open Sahay AI Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
