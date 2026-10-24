'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Globe,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Filter,
  Layers,
  Bell,
  Share2,
  Plus,
  Minus,
  Navigation,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  AlertTriangle,
  ShieldCheck,
  Package,
  Users,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';

export interface MapMarkerItem {
  id: string;
  name: string;
  type: 'disaster' | 'ngo' | 'donation' | 'need';
  coordinates: [number, number]; // [lng, lat]
  country: string;
  count?: number;
  subtitle?: string;
  details?: {
    severity?: string;
    affected?: string;
    verifiedId?: string;
    items?: string[];
    source?: string;
  };
}

export interface EmergencyStory {
  id: string;
  title: string;
  country: string;
  priority: 'High Priority' | 'Medium Priority' | 'Code Red';
  priorityColor: 'red' | 'amber';
  meta: string;
  affected: string;
  image: string;
  coordinates: [number, number];
  zoom: number;
}

const DEFAULT_EMERGENCIES: EmergencyStory[] = [
  {
    id: 'em_assam',
    title: 'Assam Flood Relief',
    country: 'India',
    priority: 'High Priority',
    priorityColor: 'red',
    meta: 'India • 100+ NGOs',
    affected: '25,000+ People Affected',
    image: '/emergency_rescue.jpg',
    coordinates: [91.7362, 26.1445],
    zoom: 6.2
  },
  {
    id: 'em_turkiye',
    title: 'Türkiye Earthquake',
    country: 'Türkiye',
    priority: 'High Priority',
    priorityColor: 'red',
    meta: 'Türkiye • 3 NGOs',
    affected: '1.2M People Affected',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    coordinates: [36.2000, 36.8000],
    zoom: 6.5
  },
  {
    id: 'em_kenya',
    title: 'Kenya Food Crisis',
    country: 'Kenya',
    priority: 'Medium Priority',
    priorityColor: 'amber',
    meta: 'Kenya • 8 NGOs',
    affected: '320,000 People Affected',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80',
    coordinates: [37.9062, 0.0236],
    zoom: 6.0
  }
];

// Curated global relief points matching reference visualization
const BASELINE_MARKERS: MapMarkerItem[] = [
  // Disasters (Red)
  { id: 'dis_1', name: 'Türkiye Earthquake Zone', type: 'disaster', coordinates: [36.20, 36.80], country: 'Türkiye', subtitle: 'Anatolian Fault Sector', details: { severity: 'High Priority', affected: '1.2M affected', source: 'AFAD Emergency Cluster' } },
  { id: 'dis_2', name: 'Assam River Flood Surge', type: 'disaster', coordinates: [91.7362, 26.1445], country: 'India', subtitle: 'Brahmaputra Basin', details: { severity: 'High Priority', affected: '25,000+ displaced', source: 'NDMA Advisory #88' } },
  { id: 'dis_3', name: 'Manila Typhoon Inundation', type: 'disaster', coordinates: [120.9842, 14.5995], country: 'Philippines', subtitle: 'Coastal Ward Zone', details: { severity: 'High Priority', affected: '15,000 evacuated' } },
  { id: 'dis_4', name: 'Amazon River Basin Wildfire Surge', type: 'disaster', coordinates: [-60.025, -3.119], country: 'Brazil', subtitle: 'Manaus Sector', details: { severity: 'High Priority', affected: '4,500 families' } },
  { id: 'dis_5', name: 'Eastern Mediterranean Coastal Alert', type: 'disaster', coordinates: [35.5, 33.8], country: 'Lebanon', subtitle: 'Bekaa Valley Corridor' },
  { id: 'dis_6', name: 'Central US Winter Freeze', type: 'disaster', coordinates: [-95.7, 37.0], country: 'United States', subtitle: 'Midwest Storm Corridor' },
  { id: 'dis_7', name: 'Morocco Atlas Quake Recovery', type: 'disaster', coordinates: [-8.3, 31.1], country: 'Morocco', subtitle: 'Al Haouz Province' },

  // Verified NGOs (Green)
  { id: 'ngo_1', name: 'SEEDS Disaster Response', type: 'ngo', coordinates: [91.73, 26.15], country: 'India', subtitle: '12 NGOs • Flood Relief', details: { verifiedId: 'NDMA/2026/041', items: ['Water filtration', 'Thermal blankets', 'Emergency tarps'] } },
  { id: 'ngo_2', name: 'Goonj Relief Depot', type: 'ngo', coordinates: [77.26, 28.53], country: 'India', subtitle: 'Delhi Central Distribution', details: { verifiedId: 'DL/2016/0104882', items: ['Winter woolens', 'Dry rations'] } },
  { id: 'ngo_3', name: 'AFAD Humanitarian Cluster', type: 'ngo', coordinates: [32.85, 39.93], country: 'Türkiye', subtitle: 'Central Coordination' },
  { id: 'ngo_4', name: 'Kenya Red Cross Rapid Response', type: 'ngo', coordinates: [36.82, -1.29], country: 'Kenya', subtitle: '8 NGOs • Food Supplies', details: { verifiedId: 'KRC-HUM-104', items: ['Fortified flour', 'Therapeutic nutrition', 'Water purification'] } },
  { id: 'ngo_5', name: 'International Medical Corps', type: 'ngo', coordinates: [-118.24, 34.05], country: 'United States', subtitle: 'Pacific Support Depot' },
  { id: 'ngo_6', name: 'Pelita Care Indonesia', type: 'ngo', coordinates: [106.84, -6.20], country: 'Indonesia', subtitle: 'Jakarta Response Cell' },
  { id: 'ngo_7', name: 'Ahbap Aid Network', type: 'ngo', coordinates: [28.97, 41.00], country: 'Türkiye', subtitle: 'North Marmara Logistical Base' },
  { id: 'ngo_8', name: 'Red Cross Brazil Chapter', type: 'ngo', coordinates: [-46.63, -23.55], country: 'Brazil', subtitle: 'São Paulo Relief Staging' },

  // Available Donations (Blue)
  { id: 'don_1', name: 'Winter Woolens & Blankets', type: 'donation', coordinates: [77.20, 28.61], country: 'India', count: 12, subtitle: 'New Delhi Depot • 50 lots', details: { items: ['Fleece Blankets (New)', 'Dry Ration Kits'] } },
  { id: 'don_2', name: 'Emergency Rations Lot #49', type: 'donation', coordinates: [-87.62, 41.87], country: 'United States', count: 12, subtitle: 'Chicago Food Reserve' },
  { id: 'don_3', name: 'High-Protein Flour Packs', type: 'donation', coordinates: [36.85, -1.28], country: 'Kenya', count: 8, subtitle: 'Nairobi Transit Dock', details: { items: ['Fortified Flour (800kg)', 'Clean Water Sacks'] } },
  { id: 'don_4', name: 'Thermal Shelter Tents', type: 'donation', coordinates: [36.16, 36.20], country: 'Türkiye', count: 8, subtitle: 'Hatay Forward Staging Depot' },
  { id: 'don_5', name: 'Water Filtration Cartons', type: 'donation', coordinates: [151.20, -33.86], country: 'Australia', count: 6, subtitle: 'Sydney Emergency Reserves' },

  // Urgent Needs (Amber)
  { id: 'need_1', name: 'High-Calorie Child Nutrition', type: 'need', coordinates: [35.59, 3.11], country: 'Kenya', count: 8, subtitle: 'Turkana Drylands Corridor', details: { items: ['Plumpy Nut', 'Pediatric Electrolytes', 'Cereals'] } },
  { id: 'need_2', name: 'Winter Thermal Insulated Tents', type: 'need', coordinates: [37.20, 37.05], country: 'Türkiye', count: 3, subtitle: 'Gaziantep Temporary Shelters' },
  { id: 'need_3', name: 'Waterproof Tarpaulins & First Aid', type: 'need', coordinates: [92.15, 26.30], country: 'India', count: 16, subtitle: 'Lower Assam Flood Inundation' },
  { id: 'need_4', name: 'Emergency Shelter Sheets', type: 'need', coordinates: [-105.0, 55.0], country: 'Canada', count: 5, subtitle: 'Northern Community Depot' },
  { id: 'need_5', name: 'Safe Water Storage Barrels', type: 'need', coordinates: [-47.92, -15.78], country: 'Brazil', count: 8, subtitle: 'Central Valley Drought Hub' }
];

const MAP_STYLES = {
  satellite: {
    id: 'satellite',
    name: 'Satellite Streets',
    style: {
      version: 8,
      sources: {
        'esri-imagery': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri, Maxar, Earthstar Geographics'
        },
        'esri-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'satellite-base',
          type: 'raster',
          source: 'esri-imagery',
          minzoom: 0,
          maxzoom: 22
        },
        {
          id: 'satellite-labels',
          type: 'raster',
          source: 'esri-labels',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark Matter',
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors © CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-base',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain Topo',
    style: {
      version: 8,
      sources: {
        'esri-shaded': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri Shaded Relief'
        },
        'esri-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'terrain-base',
          type: 'raster',
          source: 'esri-shaded',
          minzoom: 0,
          maxzoom: 18
        },
        {
          id: 'terrain-labels',
          type: 'raster',
          source: 'esri-labels',
          minzoom: 0,
          maxzoom: 18
        }
      ]
    }
  }
};

interface InteractiveMapViewProps {
  onSwitchToGlobe: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function InteractiveMapView({
  onSwitchToGlobe,
  isCollapsed = false,
  onToggleCollapse
}: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // State
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [currentLayer, setCurrentLayer] = useState<'satellite' | 'dark' | 'terrain'>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [sidebarPanel, setSidebarPanel] = useState<'filters' | 'layers' | 'alerts' | null>(null);
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [emergencyCarouselIdx, setEmergencyCarouselIdx] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter categories
  const [filters, setFilters] = useState({
    disaster: true,
    ngo: true,
    donation: true,
    need: true
  });

  // Dynamic live markers from backend merged with curated baseline
  const [markers, setMarkers] = useState<MapMarkerItem[]>(BASELINE_MARKERS);
  const [activeAlertCount, setActiveAlertCount] = useState(12);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch live DB records on mount to enrich map
  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      try {
        const [emergRes, ngoRes, donRes] = await Promise.all([
          fetch('/api/emergencies').then((r) => r.ok ? r.json() : null),
          fetch('/api/ngos').then((r) => r.ok ? r.json() : null),
          fetch('/api/donations').then((r) => r.ok ? r.json() : null)
        ]);

        if (!isMounted) return;

        const liveMarkers: MapMarkerItem[] = [];

        // Incorporate DB emergencies
        if (emergRes?.emergencies && Array.isArray(emergRes.emergencies)) {
          emergRes.emergencies.forEach((em: any) => {
            if (em.geography?.epicenter && Array.isArray(em.geography.epicenter)) {
              liveMarkers.push({
                id: em.id || `em_${Math.random()}`,
                name: em.name,
                type: 'disaster',
                coordinates: [em.geography.epicenter[1], em.geography.epicenter[0]], // [lng, lat]
                country: em.geography.affectedStates?.[0] || 'Disaster Zone',
                subtitle: `Live Verified Alert (${em.severity?.toUpperCase() || 'HIGH'})`,
                details: {
                  severity: em.severity,
                  affected: em.geography.affectedDistricts?.join(', ') || 'Active Corridor',
                  source: em.officialSource || 'Official National Disaster Agency'
                }
              });
            }
          });
          setActiveAlertCount(Math.max(12, emergRes.emergencies.length + 9));
        }

        // Incorporate DB NGOs
        if (ngoRes?.ngos && Array.isArray(ngoRes.ngos)) {
          ngoRes.ngos.forEach((ngo: any) => {
            if (ngo.serviceArea?.coordinates && Array.isArray(ngo.serviceArea.coordinates)) {
              liveMarkers.push({
                id: ngo.id || `ngo_${Math.random()}`,
                name: ngo.legalName,
                type: 'ngo',
                coordinates: [ngo.serviceArea.coordinates[1], ngo.serviceArea.coordinates[0]], // [lng, lat]
                country: ngo.serviceArea.state || 'India',
                subtitle: `${ngo.verificationStatus === 'verified' ? 'Verified NGO' : 'Accredited Hub'} • ${ngo.serviceArea.city}`,
                details: {
                  verifiedId: ngo.registrationNumber,
                  items: ngo.supportedCategories || []
                }
              });
            }
          });
        }

        // Incorporate DB Donations
        if (donRes?.donations && Array.isArray(donRes.donations)) {
          donRes.donations.forEach((don: any) => {
            if (don.location?.coordinates && Array.isArray(don.location.coordinates)) {
              liveMarkers.push({
                id: don.id || `don_${Math.random()}`,
                name: don.itemName || 'Relief Consignment',
                type: 'donation',
                coordinates: [don.location.coordinates[1], don.location.coordinates[0]],
                country: don.location.state || 'India',
                count: don.quantity || 10,
                subtitle: `${don.quantity} ${don.unit || 'units'} ready for transit`
              });
            }
          });
        }

        // Merge without duplicating
        if (liveMarkers.length > 0) {
          setMarkers((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUnique = liveMarkers.filter((m) => !existingIds.has(m.id));
            return [...newUnique, ...prev];
          });
        }
      } catch (err) {
        console.warn('Realtime map sync fallback to baseline:', err);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize MapLibre GL
  useEffect(() => {
    let mapInstance: any = null;
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const maplibre = await import('maplibre-gl');
        if (cancelled) return;

        // Clean up previous instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: MAP_STYLES[currentLayer].style as any,
          center: [30, 20],
          zoom: 1.85,
          minZoom: 1.2,
          maxZoom: 16,
          attributionControl: false
        });

        map.on('load', () => {
          if (cancelled) return;
          mapInstanceRef.current = map;
          renderMarkers(map, maplibre);
          map.resize();
        });

        mapInstance = map;
      } catch (err) {
        console.error('Failed to initialize MapLibre GL:', err);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapInstanceRef.current = null;
    };
  }, [currentLayer]);

  // 3. Render HTML markers on map instance
  const renderMarkers = (map: any, maplibreInstance: any) => {
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter markers based on current toggle state
    const visibleMarkers = markers.filter((m) => filters[m.type]);

    visibleMarkers.forEach((item) => {
      // Create customized DOM element matching reference styling
      const el = document.createElement('div');
      el.className = 'relieflink-map-marker group cursor-pointer';

      // Build marker visuals based on category
      let innerHtml = '';
      if (item.type === 'disaster') {
        innerHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-125">
            <span class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
        `;
      } else if (item.type === 'ngo') {
        innerHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-125">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
        `;
      } else if (item.type === 'donation') {
        innerHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-125">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-black">
              ${item.count ? item.count : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>'}
            </div>
          </div>
        `;
      } else {
        // need
        innerHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-125">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-white shadow-md flex items-center justify-center text-slate-900 text-[10px] font-black">
              ${item.count ? item.count : '▲'}
            </div>
          </div>
        `;
      }

      el.innerHTML = innerHtml;

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedItem(item);
        map.flyTo({
          center: item.coordinates,
          zoom: Math.max(map.getZoom(), 5.2),
          essential: true,
          speed: 1.2
        });
      });

      const marker = new maplibreInstance.Marker({ element: el })
        .setLngLat(item.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // Re-render markers whenever filters change
  useEffect(() => {
    if (mapInstanceRef.current) {
      import('maplibre-gl').then((maplibre) => {
        renderMarkers(mapInstanceRef.current, maplibre);
      });
    }
  }, [filters, markers]);

  // Handle region selector change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const map = mapInstanceRef.current;
    if (!map) return;

    const regions: Record<string, { center: [number, number]; zoom: number }> = {
      Global: { center: [30, 20], zoom: 1.85 },
      India: { center: [78.9629, 22.5937], zoom: 4.8 },
      Turkiye: { center: [35.2433, 38.9637], zoom: 5.6 },
      'East Africa': { center: [37.9062, 0.0236], zoom: 5.2 },
      Asia: { center: [85.0, 28.0], zoom: 3.5 },
      'Southeast Asia': { center: [115.0, 5.0], zoom: 4.2 }
    };

    const target = regions[region] || regions.Global;
    map.flyTo({
      center: target.center,
      zoom: target.zoom,
      speed: 1.2,
      essential: true
    });
  };

  // Handle emergency carousel item select
  const handleSelectEmergency = (em: EmergencyStory, idx: number) => {
    setEmergencyCarouselIdx(idx);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo({
        center: em.coordinates,
        zoom: em.zoom,
        speed: 1.2,
        essential: true
      });
    }
  };

  // Handle Share functionality
  const handleShare = async () => {
    const map = mapInstanceRef.current;
    const center = map ? map.getCenter() : { lng: 30, lat: 20 };
    const zoom = map ? Math.round(map.getZoom() * 10) / 10 : 2;

    const shareUrl = `${window.location.origin}/?view=map&region=${encodeURIComponent(selectedRegion)}&lng=${center.lng.toFixed(4)}&lat=${center.lat.toFixed(4)}&z=${zoom}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ReliefLink AI — Live Humanitarian Relief Map',
          text: 'Inspect real-time verified disaster zones, NGO staging depots, and relief inventory on ReliefLink AI.',
          url: shareUrl
        });
        return;
      } catch {
        // User cancelled or failed -> fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Map link copied to clipboard!');
    } catch {
      showToast('Could not copy link');
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleResetBearing = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.resetNorthPitch();
      mapInstanceRef.current.flyTo({ center: [30, 20], zoom: 2 });
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.resize();
    }, 150);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-[#06152F] border border-slate-700/80 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[580px] sm:h-[640px] lg:h-[700px]'
      }`}
    >
      {/* 1. TOP MAP TOOLBAR (matching reference image) */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-4 z-30 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Left Toolbar: Globe View | Map View | Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#071A3D]/90 backdrop-blur-md rounded-full p-1 border border-slate-700/80 shadow-xl text-xs font-bold">
            <button
              onClick={onSwitchToGlobe}
              className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Globe View</span>
            </button>
            <button
              className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 bg-[#00A86B] text-white shadow-md shadow-emerald-500/30 font-bold transition cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xl cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Toolbar: Live Relief Map Status | Scope Selector | Hide/Collapse Toggle */}
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-white shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Relief Map</span>
          </div>

          {/* Region Scope Dropdown */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="text-xs font-bold text-white bg-[#071A3D]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Global">Global</option>
              <option value="India">India</option>
              <option value="Turkiye">Türkiye</option>
              <option value="East Africa">East Africa</option>
              <option value="Asia">Asia</option>
              <option value="Southeast Asia">Southeast Asia</option>
            </select>
          </div>

          {/* Collapse/Expand Toggle if provided */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-full bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xl cursor-pointer"
              title="Toggle Live Panel"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. LEFT FLOATING CONTROL RAIL (Filters | Layers | Alerts | Share) */}
      <div className="absolute top-16 left-3 sm:left-4 z-30 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col bg-[#071A3D]/90 backdrop-blur-md rounded-2xl p-1.5 border border-slate-700/80 shadow-2xl divide-y divide-slate-800 text-[11px] font-semibold text-slate-300">
          {/* Filters */}
          <button
            onClick={() => setSidebarPanel(sidebarPanel === 'filters' ? null : 'filters')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              sidebarPanel === 'filters' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Filter Marker Categories"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Layers */}
          <button
            onClick={() => setSidebarPanel(sidebarPanel === 'layers' ? null : 'layers')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              sidebarPanel === 'layers' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Switch Map Layers"
          >
            <Layers className="w-4 h-4" />
            <span>Layers</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() => setSidebarPanel(sidebarPanel === 'alerts' ? null : 'alerts')}
            className={`relative p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer ${
              sidebarPanel === 'alerts' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Active Emergency Alerts"
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-600 text-white font-black text-[9px] rounded-full">
                {activeAlertCount}
              </span>
            </div>
            <span>Alerts</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl flex flex-col items-center gap-1 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Share Current Map Location"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 2b. SLIDE-OUT SUB-PANEL (Filters / Layers / Alerts) */}
      {sidebarPanel && (
        <div className="absolute top-16 left-20 z-40 w-64 bg-[#081734]/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/80 shadow-2xl text-white space-y-3 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {sidebarPanel === 'filters' && 'Marker Filters'}
              {sidebarPanel === 'layers' && 'Map Basemap'}
              {sidebarPanel === 'alerts' && 'Active Alerts'}
            </span>
            <button
              onClick={() => setSidebarPanel(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FILTERS PANEL */}
          {sidebarPanel === 'filters' && (
            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Disaster Affected Areas</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.disaster}
                  onChange={(e) => setFilters({ ...filters, disaster: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Verified NGOs</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.ngo}
                  onChange={(e) => setFilters({ ...filters, ngo: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Available Donations</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.donation}
                  onChange={(e) => setFilters({ ...filters, donation: e.target.checked })}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Urgent Needs</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.need}
                  onChange={(e) => setFilters({ ...filters, need: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
              </label>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setFilters({ disaster: true, ngo: true, donation: true, need: true })}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* LAYERS PANEL */}
          {sidebarPanel === 'layers' && (
            <div className="space-y-1.5 text-xs">
              {(Object.keys(MAP_STYLES) as Array<'satellite' | 'dark' | 'terrain'>).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrentLayer(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentLayer === key
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{MAP_STYLES[key].name}</span>
                  {currentLayer === key && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}

          {/* ALERTS PANEL */}
          {sidebarPanel === 'alerts' && (
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {DEFAULT_EMERGENCIES.map((em) => (
                <div
                  key={em.id}
                  onClick={() => {
                    handleSelectEmergency(em, 0);
                    setSidebarPanel(null);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{em.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {em.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{em.affected}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. INTERACTIVE MAP CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 4. THREE HERO LOCATION CARDS (Türkiye, India, Kenya) matching reference image */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Türkiye Card */}
        <div
          onClick={() => {
            const turk = BASELINE_MARKERS.find((m) => m.country === 'Türkiye');
            if (turk) setSelectedItem(turk);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo({ center: [35.2433, 38.9637], zoom: 5.5, essential: true });
            }
          }}
          style={{ top: '28%', left: '48%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-[#081734]/90 backdrop-blur-md border border-rose-500/60 shadow-xl shadow-rose-950/40 text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs tracking-tight text-white group-hover:text-rose-300">Türkiye</div>
              <div className="text-[10px] text-rose-300 font-semibold whitespace-nowrap">3 NGOs • Urgent Needs</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&auto=format&fit=crop&q=80"
              alt="Türkiye disaster area"
              className="w-10 h-8 rounded-lg object-cover ml-1 border border-slate-700 hidden sm:block"
            />
          </div>
        </div>

        {/* India Card */}
        <div
          onClick={() => {
            const ind = BASELINE_MARKERS.find((m) => m.country === 'India');
            if (ind) setSelectedItem(ind);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo({ center: [78.9629, 22.5937], zoom: 5.2, essential: true });
            }
          }}
          style={{ top: '48%', left: '72%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-[#081734]/90 backdrop-blur-md border border-emerald-500/60 shadow-xl shadow-emerald-950/40 text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs tracking-tight text-white group-hover:text-emerald-300">India</div>
              <div className="text-[10px] text-emerald-300 font-semibold whitespace-nowrap">12 NGOs • Flood Relief</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"
              alt="India relief center"
              className="w-10 h-8 rounded-lg object-cover ml-1 border border-slate-700 hidden sm:block"
            />
          </div>
        </div>

        {/* Kenya Card */}
        <div
          onClick={() => {
            const ken = BASELINE_MARKERS.find((m) => m.country === 'Kenya');
            if (ken) setSelectedItem(ken);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo({ center: [37.9062, 0.0236], zoom: 5.5, essential: true });
            }
          }}
          style={{ top: '62%', left: '55%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-[#081734]/90 backdrop-blur-md border border-amber-500/60 shadow-xl shadow-amber-950/40 text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-900 shrink-0 shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs tracking-tight text-white group-hover:text-amber-300">Kenya</div>
              <div className="text-[10px] text-amber-300 font-semibold whitespace-nowrap">8 NGOs • Food Supplies</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&auto=format&fit=crop&q=80"
              alt="Kenya drought depot"
              className="w-10 h-8 rounded-lg object-cover ml-1 border border-slate-700 hidden sm:block"
            />
          </div>
        </div>
      </div>

      {/* 5. BOTTOM-RIGHT ZOOM & ROTATION CONTROLS */}
      <div className="absolute bottom-28 sm:bottom-24 right-3 sm:right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetBearing}
          className="w-8 h-8 rounded-xl bg-[#071A3D]/90 backdrop-blur-md border border-slate-700/80 text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition cursor-pointer"
          title="Reset North & View"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. BOTTOM PANELS: ACTIVE EMERGENCIES CAROUSEL & MAP LEGEND */}
      <div className="absolute bottom-3 inset-x-3 sm:inset-x-4 z-30 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 pointer-events-none">
        
        {/* 6a. ACTIVE EMERGENCIES CAROUSEL */}
        <div className="w-full lg:max-w-3xl bg-[#081734]/95 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 shadow-2xl text-white pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-xs">Active Emergencies</span>
            </div>
            <Link
              href="/emergency"
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards Grid / Carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEFAULT_EMERGENCIES.map((em, idx) => (
              <div
                key={em.id}
                onClick={() => handleSelectEmergency(em, idx)}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer border ${
                  emergencyCarouselIdx === idx
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={em.image}
                  alt={em.title}
                  className="w-14 h-12 rounded-lg object-cover shrink-0 border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                        em.priorityColor === 'red'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {em.priority}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white truncate mt-0.5">{em.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{em.meta}</div>
                  <div className="text-[9.5px] text-slate-500 truncate">{em.affected}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel footer indicators */}
          <div className="flex items-center justify-between pt-2 mt-1">
            <button
              onClick={() => {
                const next = (emergencyCarouselIdx - 1 + DEFAULT_EMERGENCIES.length) % DEFAULT_EMERGENCIES.length;
                handleSelectEmergency(DEFAULT_EMERGENCIES[next], next);
              }}
              className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5">
              {DEFAULT_EMERGENCIES.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    emergencyCarouselIdx === i ? 'w-4 bg-sky-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const next = (emergencyCarouselIdx + 1) % DEFAULT_EMERGENCIES.length;
                handleSelectEmergency(DEFAULT_EMERGENCIES[next], next);
              }}
              className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6b. MAP LEGEND (matching reference image) */}
        {showLegend && (
          <div className="bg-[#081734]/95 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 shadow-2xl text-white text-xs pointer-events-auto min-w-[210px] animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
              <span className="font-bold text-xs text-white">Map Legend</span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Hide Legend"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 border border-white/60 flex items-center justify-center text-[8px] font-black text-white shrink-0">
                  ▲
                </span>
                <span>Disaster Affected Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border border-white/60 flex items-center justify-center text-[8px] font-black text-white shrink-0">
                  ✓
                </span>
                <span>Verified NGOs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 border border-white/60 flex items-center justify-center text-[7px] font-black text-white shrink-0">
                  ■
                </span>
                <span>Available Donations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border border-white/60 flex items-center justify-center text-[8px] font-black text-slate-900 shrink-0">
                  ●
                </span>
                <span>Urgent Needs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. CONTEXTUAL MODAL FOR CLICKED MARKER / LOCATION CARD */}
      {selectedItem && (
        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#081734] border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  selectedItem.type === 'disaster'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : selectedItem.type === 'ngo'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : selectedItem.type === 'donation'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {selectedItem.type.toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-white">{selectedItem.name}</h3>
                <p className="text-xs text-slate-400">{selectedItem.subtitle || selectedItem.country}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedItem.details && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                {selectedItem.details.severity && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity:</span>
                    <span className="font-bold text-rose-400">{selectedItem.details.severity}</span>
                  </div>
                )}
                {selectedItem.details.affected && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Scope:</span>
                    <span className="font-bold text-slate-200">{selectedItem.details.affected}</span>
                  </div>
                )}
                {selectedItem.details.verifiedId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verification ID:</span>
                    <span className="font-mono text-emerald-400">{selectedItem.details.verifiedId}</span>
                  </div>
                )}
                {selectedItem.details.source && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source:</span>
                    <span className="text-slate-300">{selectedItem.details.source}</span>
                  </div>
                )}
                {selectedItem.details.items && selectedItem.details.items.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 mb-1">Supplies & Needs:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.details.items.map((it, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-200">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/donate/individual"
                className="flex-1 py-2 px-3 rounded-xl bg-[#00A86B] hover:bg-emerald-700 text-white font-bold text-xs text-center transition"
              >
                Donate to Hub
              </Link>
              <Link
                href="/emergency"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center border border-slate-700 transition"
              >
                Inspect Zone
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 text-white text-xs font-bold border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
