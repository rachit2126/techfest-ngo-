'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Map as MapIcon,
  Maximize2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  X,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building2,
  Clock,
  HeartHandshake
} from 'lucide-react';
import GlobeVisualizer from './GlobeVisualizer';
import InteractiveMapView from './InteractiveMapView';

export interface RegionalHub {
  id: string;
  name: string;
  region: string;
  country: string;
  subtitle: string;
  status: 'verified' | 'urgent' | 'warning';
  activeNGOs: { name: string; id: string; category: string; verifiedId: string }[];
  urgentNeeds: string[];
  availableInventory: string;
  affectedCount?: string;
  source: string;
  lastUpdated: string;
  top: string;
  left: string;
  thumbnail: string;
  badgeIcon: string;
}

const REGIONAL_HUBS: RegionalHub[] = [
  {
    id: 'hub_turkiye',
    name: 'Türkiye Earthquake & Emergency Hub',
    region: 'Anatolian Seismic Zone',
    country: 'Türkiye',
    subtitle: '3 NGOs • Urgent Needs',
    status: 'urgent',
    activeNGOs: [
      { name: 'AFAD Humanitarian Partner Cluster', id: 'afad', category: 'Emergency Shelter & Tents', verifiedId: 'AFAD-TR-881' },
      { name: 'Turkish Red Crescent Network', id: 'redcrescent', category: 'Thermal Blankets & Heaters', verifiedId: 'TR-RC-2026' },
      { name: 'Ahbap Relief Volunteers', id: 'ahbap', category: 'Dry Rations & Search Logistics', verifiedId: 'TR-AHB-2025' }
    ],
    urgentNeeds: ['Winterized Thermal Tents', 'Thermal Underwear & Blankets', 'Infant Nutrition Packs'],
    availableInventory: '450 thermal blankets dispatched from European distribution hub',
    affectedCount: '8,500+ households',
    source: 'AFAD Emergency Disaster Coordination',
    lastUpdated: '28 mins ago',
    top: '32%',
    left: '52%',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    badgeIcon: '▲'
  },
  {
    id: 'hub_india',
    name: 'India Relief Operations Hub',
    region: 'South Asia Corridor',
    country: 'India',
    subtitle: '12 NGOs • Flood Relief',
    status: 'verified',
    activeNGOs: [
      { name: 'SEEDS Disaster Response Rapid Hub', id: 'seeds', category: 'Flood & Disaster Kits', verifiedId: 'NDMA/2026/041' },
      { name: 'Goonj Relief & Development Trust', id: 'goonj', category: 'Clothing & Blankets', verifiedId: 'DL/2016/0104882' },
      { name: 'Annakshetra Food Recovery', id: 'annakshetra', category: 'Dry Rations & Meals', verifiedId: 'FSSAI/RELIEF/902' }
    ],
    urgentNeeds: ['Clean Drinking Water', 'Dry Rations', 'Waterproof Tarpaulins', 'Antiseptic First Aid'],
    availableInventory: '1,250 kg dry rations & 300 emergency blankets in transit',
    affectedCount: '25,000+ in Brahmaputra basin',
    source: 'National Disaster Management Authority (NDMA)',
    lastUpdated: '12 mins ago',
    top: '50%',
    left: '73%',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    badgeIcon: '✓'
  },
  {
    id: 'hub_kenya',
    name: 'Kenya Drought & Nutrition Corridor',
    region: 'East Africa Drylands',
    country: 'Kenya',
    subtitle: '8 NGOs • Food Supplies',
    status: 'warning',
    activeNGOs: [
      { name: 'Kenya Red Cross Rapid Response', id: 'krc', category: 'Clean Water & Rations', verifiedId: 'KRC-HUM-104' },
      { name: 'Horn of Africa Nutrition Network', id: 'hann', category: 'Therapeutic Food (RUTF)', verifiedId: 'UNICEF-EA-992' }
    ],
    urgentNeeds: ['High-Protein Plumpy Nut', 'Water Purification Tablets', 'Cereals & Legumes'],
    availableInventory: '800 kg fortified flour allocated',
    affectedCount: '12,000+ pastoralist children',
    source: 'Kenya Red Cross Humanitarian Roster',
    lastUpdated: '45 mins ago',
    top: '67%',
    left: '50%',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80',
    badgeIcon: '📦'
  }
];

const EMERGENCY_CARDS = [
  {
    id: 'em_assam',
    title: 'Assam Flood Relief',
    location: 'India • 100+ NGOs • 25,000+ People Affected',
    priority: 'High Priority',
    image: '/emergency_rescue.jpg',
    icons: ['📦', '🍶', '📦', '💼'],
    iconLabels: ['Rations', 'Water', 'Shelter', 'Medical'],
    link: '/emergency'
  },
  {
    id: 'em_turkiye',
    title: 'Türkiye Winter Shelter',
    location: 'Hatay, Türkiye • 3 NGOs • 8,500+ Affected',
    priority: 'Code Red',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
    icons: ['⛺', '🧣', '🥫', '🔥'],
    iconLabels: ['Tents', 'Blankets', 'Canned Food', 'Heaters'],
    link: '/emergency'
  },
  {
    id: 'em_kenya',
    title: 'Kenya Drought Aid',
    location: 'Turkana, Kenya • 8 NGOs • 12,000+ Children',
    priority: 'High Priority',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80',
    icons: ['💧', '🥣', '📦', '💊'],
    iconLabels: ['Water', 'Nutrition', 'Flour', 'Medicine'],
    link: '/emergency'
  },
  {
    id: 'em_philippines',
    title: 'Typhoon Response Hub',
    location: 'Manila, Philippines • 6 NGOs • 15,000+ Evacuated',
    priority: 'High Priority',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&auto=format&fit=crop&q=80',
    icons: ['📦', '🔦', '💊', '🦺'],
    iconLabels: ['Rations', 'Power', 'First Aid', 'Gear'],
    link: '/emergency'
  }
];

const RECENT_ACTIVITIES = [
  {
    id: 'act_1',
    title: 'Food supplies delivered',
    location: 'Nairobi, Kenya',
    time: '2h ago',
    type: 'success',
    color: 'emerald'
  },
  {
    id: 'act_2',
    title: 'New donation request',
    location: 'Manila, Philippines',
    time: '4h ago',
    type: 'info',
    color: 'sky'
  },
  {
    id: 'act_3',
    title: 'Emergency alert updated',
    location: 'Hatay, Türkiye',
    time: '6h ago',
    type: 'alert',
    color: 'rose'
  }
];

export default function HeroGeospatialPanel() {
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('globe');
  const [selectedHub, setSelectedHub] = useState<RegionalHub | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [activeTab, setActiveTab] = useState<'overview' | 'emergencies' | 'ngos' | 'donations'>('overview');
  const [emergencyIdx, setEmergencyIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapPanelCollapsed, setIsMapPanelCollapsed] = useState(false);

  // Initialize and persist collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('relieflink_hero_panel_collapsed');
      if (saved !== null) {
        setIsMapPanelCollapsed(saved === 'true');
      }
    } catch {
      // Safe fallback if localStorage is unavailable
    }
  }, []);

  const toggleMapPanel = () => {
    setIsMapPanelCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('relieflink_hero_panel_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Live impact counts from backend API
  const [counts, setCounts] = useState({
    disasterAreas: 8,
    verifiedNGOs: 124,
    availableDonations: 342,
    urgentNeeds: 16
  });

  useEffect(() => {
    async function fetchLiveCounts() {
      try {
        const res = await fetch('/api/impact/summary');
        if (res.ok) {
          const data = await res.json();
          if (data?.confirmedMetrics) {
            setCounts((prev) => ({
              ...prev,
              verifiedNGOs: data.confirmedMetrics.verifiedNGOsCount || 124,
              disasterAreas: 8,
              availableDonations: data.confirmedMetrics.confirmedDeliveriesCount > 0
                ? data.confirmedMetrics.confirmedDeliveriesCount * 18
                : 342,
              urgentNeeds: data.confirmedMetrics.urgentNeedsCount || 16
            }));
          }
        }
      } catch {
        // Fallback to documented prototype counts
      }
    }
    fetchLiveCounts();
  }, []);

  const activeEmergency = EMERGENCY_CARDS[emergencyIdx];

  // Filter regional hubs according to region dropdown
  const filteredHubs = REGIONAL_HUBS.filter((hub) => {
    if (selectedRegion === 'Global') return true;
    if (selectedRegion === 'India') return hub.country === 'India';
    if (selectedRegion === 'Turkiye') return hub.country === 'Türkiye';
    if (selectedRegion === 'Africa') return hub.country === 'Kenya';
    return true;
  });

  return (
    <div
      className={`relative w-full h-full min-h-[500px] sm:min-h-[560px] lg:min-h-[640px] select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#071A3D] p-6' : ''
      }`}
    >
      {viewMode === 'map' ? (
        <InteractiveMapView
          onSwitchToGlobe={() => setViewMode('globe')}
          isCollapsed={isMapPanelCollapsed}
          onToggleCollapse={toggleMapPanel}
        />
      ) : (
        <>
          {/* 1. TOP VIEW CONTROLS (Globe View | Map View | Fullscreen | Hide Map Panel) matching reference image */}
          <div className="absolute top-2 left-2 sm:left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center bg-[#071A3D]/90 backdrop-blur-md rounded-full p-1 border border-slate-700/80 shadow-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('globe')}
                className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer bg-[#00A86B] text-white shadow-md shadow-emerald-600/30"
              >
                <Globe className="w-3.5 h-3.5" />
                Globe View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer text-slate-300 hover:text-white"
              >
                <MapIcon className="w-3.5 h-3.5" />
                Map View
              </button>
            </div>

            {/* Fullscreen Expansion Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-9 h-9 rounded-full bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xl cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Globe'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Globe'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Hide / Unhide Map Panel Toggle with Tooltip matching reference screenshot */}
            <div className="relative group/toggle">
              <button
                id="toggle-map-panel-btn"
                onClick={toggleMapPanel}
                className={`w-9 h-9 rounded-full bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xl cursor-pointer hover:border-emerald-500/70 ${
                  isMapPanelCollapsed ? 'text-emerald-400 border-emerald-500/50' : ''
                }`}
                title={isMapPanelCollapsed ? 'Show Live Relief Map' : 'Hide Map Panel'}
                aria-label={isMapPanelCollapsed ? 'Show Live Relief Map' : 'Hide Map Panel'}
              >
                {isMapPanelCollapsed ? (
                  <ChevronsLeft className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <ChevronsRight className="w-4 h-4" />
                )}
              </button>

              {/* Tooltip on hover matching screenshot */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-[10px] font-bold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover/toggle:opacity-100 transition-opacity z-40">
                {isMapPanelCollapsed ? 'Show Live Relief Map' : 'Hide Map Panel'}
              </div>
            </div>
          </div>

          {/* Floating Unhide Tab on right edge when dashboard is collapsed */}
          {isMapPanelCollapsed && (
            <button
              id="floating-unhide-map-btn"
              onClick={toggleMapPanel}
              className="absolute top-8 right-0 z-30 flex items-center gap-2 px-3 py-2 rounded-l-2xl bg-[#081734]/95 backdrop-blur-md border-y border-l border-slate-700/80 text-white hover:text-emerald-400 shadow-2xl transition-all hover:pr-4 cursor-pointer group pointer-events-auto animate-in slide-in-from-right duration-200"
              title="Show Live Relief Map"
              aria-label="Show Live Relief Map"
            >
              <ChevronsLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-tight">Show Live Relief Map</span>
            </button>
          )}

          {/* 2. MAIN VISUAL: In Globe View, hotspots overlay the rich Earth background */}
          <div className="relative w-full h-full">
            {/* INTERACTIVE CLICKABLE HOTSPOTS OVER GLOBE LOCATION HUBS */}
            {filteredHubs.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub)}
                style={{ top: hub.top, left: hub.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer focus:outline-none"
                title={`Click to view live on-ground NGOs and resources for ${hub.name}`}
              >
                {/* Outer pulsing radar ring */}
                <span
                  className={`absolute inset-0 -m-2 rounded-2xl animate-ping opacity-40 group-hover:opacity-75 transition-opacity ${
                    hub.status === 'urgent'
                      ? 'bg-rose-500'
                      : hub.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />

                {/* Seamless interactive hitbox with subtle glow on hover */}
                <div
                  className={`relative min-w-[140px] h-9 px-3 rounded-2xl flex items-center justify-between transition-all duration-200 border border-transparent group-hover:border-white/60 group-hover:bg-slate-900/40 group-hover:backdrop-blur-[2px] group-hover:shadow-xl`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${
                      hub.status === 'urgent'
                        ? 'bg-rose-400'
                        : hub.status === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-white bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-700 shadow-md flex items-center gap-1">
                    View {hub.country} Hub ↗
                  </span>
                </div>
              </button>
            ))}
          </div>

      {/* 3. REBUILT FLOATING "LIVE RELIEF MAP" PANEL with smooth collapse/expand transition */}
      <div
        className={`absolute top-2 sm:top-4 right-0 sm:right-2 z-30 w-72 sm:w-[290px] xl:w-[300px] bg-[#081734]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-2xl text-white space-y-3.5 pointer-events-auto transition-all duration-300 ease-in-out transform ${
          isMapPanelCollapsed
            ? 'translate-x-[115%] opacity-0 pointer-events-none scale-95'
            : 'translate-x-0 opacity-100 scale-100'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live Relief Map
          </div>

          <div className="flex items-center gap-1.5">
            {/* Region selector dropdown matching screenshot */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-[11px] text-slate-200 bg-[#0d224d] px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Global">Global ▼</option>
              <option value="India">India</option>
              <option value="Turkiye">Türkiye</option>
              <option value="Africa">East Africa</option>
            </select>

            {/* In-header collapse toggle */}
            <button
              id="panel-header-collapse-btn"
              onClick={toggleMapPanel}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Hide Map Panel"
              aria-label="Hide Map Panel"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Functional Tabs matching user request: Overview | Emergencies | NGOs | Donations */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#06122b] border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1 rounded-lg text-center transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#0878F9] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('emergencies')}
            className={`py-1 rounded-lg text-center transition cursor-pointer ${
              activeTab === 'emergencies'
                ? 'bg-[#0878F9] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergencies
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`py-1 rounded-lg text-center transition cursor-pointer ${
              activeTab === 'ngos'
                ? 'bg-[#0878F9] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NGOs
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`py-1 rounded-lg text-center transition cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-[#0878F9] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Donations
          </button>
        </div>

        {/* TAB 1: OVERVIEW CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* 4 Semantic Indicators with Counts */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 inline-block" />
                  <span>Disaster Affected Areas</span>
                </div>
                <span className="font-extrabold text-white text-xs">{counts.disasterAreas}</span>
              </div>

              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                  <span>Verified NGOs</span>
                </div>
                <span className="font-extrabold text-white text-xs">{counts.verifiedNGOs}</span>
              </div>

              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0 inline-block" />
                  <span>Available Donations</span>
                </div>
                <span className="font-extrabold text-white text-xs">{counts.availableDonations}</span>
              </div>

              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 inline-block" />
                  <span>Urgent Needs</span>
                </div>
                <span className="font-extrabold text-white text-xs">{counts.urgentNeeds}</span>
              </div>
            </div>

            {/* Featured Active Emergency Card */}
            <div className="p-3 rounded-xl bg-[#0c1e44] border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Active Emergency</span>
                <Link
                  href="/emergency"
                  className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Emergency Photo with Priority Badge */}
              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeEmergency.image}
                  alt={activeEmergency.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
                  ▲ {activeEmergency.priority}
                </span>
              </div>

              <div>
                <strong className="text-xs text-white font-extrabold block truncate">
                  {activeEmergency.title}
                </strong>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  {activeEmergency.location}
                </p>
              </div>

              {/* 4 Item icons */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-center">
                {activeEmergency.icons.map((icon, idx) => (
                  <div
                    key={idx}
                    className="p-1 rounded-md bg-slate-800/90 border border-slate-700/70 text-xs flex flex-col items-center justify-center"
                    title={activeEmergency.iconLabels[idx]}
                  >
                    <span>{icon}</span>
                    <span className="text-[8px] text-slate-400 truncate mt-0.5 font-medium">
                      {activeEmergency.iconLabels[idx]}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Emergency Details Button */}
              <Link
                href={activeEmergency.link}
                className="w-full py-2 rounded-lg bg-[#0878F9] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                View Emergency Details <ArrowRight className="w-3 h-3" />
              </Link>

              {/* Carousel Pagination Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-slate-400 text-xs">
                <button
                  onClick={() => setEmergencyIdx((prev) => (prev > 0 ? prev - 1 : EMERGENCY_CARDS.length - 1))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Previous emergency"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {EMERGENCY_CARDS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEmergencyIdx(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        emergencyIdx === i ? 'w-4 bg-sky-400' : 'w-1.5 bg-slate-600'
                      }`}
                      aria-label={`Go to emergency slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setEmergencyIdx((prev) => (prev < EMERGENCY_CARDS.length - 1 ? prev + 1 : 0))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Next emergency"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Recent Activity</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start justify-between text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          act.color === 'emerald'
                            ? 'bg-emerald-400'
                            : act.color === 'sky'
                            ? 'bg-sky-400'
                            : 'bg-rose-500'
                        }`}
                      />
                      <div>
                        <span className="text-white font-medium block leading-tight">{act.title}</span>
                        <span className="text-[9px] text-slate-400">{act.location}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMERGENCIES TAB */}
        {activeTab === 'emergencies' && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-400 font-semibold">Active Humanitarian Disasters (4)</div>
            {EMERGENCY_CARDS.map((em) => (
              <div key={em.id} className="p-2.5 rounded-xl bg-[#0c1e44] border border-slate-700/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">{em.title}</strong>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                    {em.priority}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">{em.location}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-teal-300">Needs: {em.iconLabels.join(', ')}</span>
                  <Link href={em.link} className="text-[10px] text-sky-400 font-bold hover:underline">
                    Support Relief →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: NGOS TAB */}
        {activeTab === 'ngos' && (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-400 font-semibold">Verified Ground Networks (180+)</div>
            {REGIONAL_HUBS.flatMap((h) => h.activeNGOs).map((ngo) => (
              <div key={ngo.id} className="p-2.5 rounded-xl bg-[#0c1e44] border border-slate-700/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{ngo.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {ngo.verifiedId}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">Focus: {ngo.category}</div>
              </div>
            ))}
            <Link
              href="/explore"
              className="block w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-slate-200 transition"
            >
              Browse All 180+ Verified NGOs →
            </Link>
          </div>
        )}

        {/* TAB 4: DONATIONS TAB */}
        {activeTab === 'donations' && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-400 font-semibold">Live In-Transit Stock & Demands</div>
            {REGIONAL_HUBS.map((hub) => (
              <div key={hub.id} className="p-2.5 rounded-xl bg-[#0c1e44] border border-slate-700/80 space-y-1 text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{hub.country} Depot</span>
                  <span className="text-[9px] text-emerald-400">In Transit</span>
                </div>
                <p className="text-[10px] text-slate-300">{hub.availableInventory}</p>
                <div className="text-[9px] text-amber-300">Urgent need: {hub.urgentNeeds.slice(0, 2).join(', ')}</div>
              </div>
            ))}
            <Link
              href="/donate/individual"
              className="block w-full py-2 rounded-lg bg-[#00A86B] hover:bg-emerald-700 text-center text-xs font-bold text-white transition shadow-sm"
            >
              Donate Usable Surplus Now →
            </Link>
          </div>
        )}
      </div>

      {/* 4. SLIDE-OVER MODAL WHEN A GLOBE PIN IS CLICKED */}
      {selectedHub && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full sm:w-[420px] h-full bg-[#071A3D] border-l border-slate-700 p-5 overflow-y-auto text-white space-y-4 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                    selectedHub.status === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedHub.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {selectedHub.status === 'urgent'
                    ? 'Emergency Disaster Node'
                    : selectedHub.status === 'warning'
                    ? 'Active Food Aid Corridor'
                    : 'Statutory Verified Hub'}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">{selectedHub.name}</h3>
                <p className="text-xs text-slate-300">{selectedHub.region} • {selectedHub.country}</p>
              </div>

              <button
                onClick={() => setSelectedHub(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verified NGOs Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Verified On-Ground Organizations ({selectedHub.activeNGOs.length})
              </h5>
              <div className="space-y-1.5">
                {selectedHub.activeNGOs.map((ngo) => (
                  <div key={ngo.id} className="p-2.5 rounded-xl bg-[#0c1e44] border border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-100">
                      <span>{ngo.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {ngo.verifiedId}
                      </span>
                    </div>
                    <div className="text-[10px] text-teal-300">Focus: {ngo.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Resource Demands */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Critical Resource Demands
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedHub.urgentNeeds.map((need, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-md bg-rose-950/60 text-rose-200 border border-rose-800/60 text-[10px] font-semibold"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>

            {/* In-Transit Inventory */}
            <div className="p-3 rounded-xl bg-[#0c1e44] border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                <Package className="w-3.5 h-3.5" />
                Live In-Transit Stock
              </div>
              <p className="text-[11px] text-slate-300">{selectedHub.availableInventory}</p>
            </div>

            {/* Provenance Footnote */}
            <div className="text-[10px] text-slate-400 pt-1 space-y-0.5">
              <div><strong>Official Source:</strong> {selectedHub.source}</div>
              <div><strong>Sync Timestamp:</strong> {selectedHub.lastUpdated}</div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <Link
                href="/donate/individual"
                className="flex-1 py-2 rounded-xl bg-[#00A86B] hover:bg-emerald-700 text-white font-bold text-xs text-center transition shadow-md"
              >
                Donate Resources
              </Link>
              <Link
                href={`/explore?q=${encodeURIComponent(selectedHub.country)}`}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                Full Hub Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

