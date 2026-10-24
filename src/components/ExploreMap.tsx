'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  BarChart3,
  Plus,
  Minus,
  Navigation,
  X,
  RotateCcw,
  Search,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldCheck,
  Package,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Clock,
  Sparkles,
  CloudRain,
  Droplets,
  Wind,
  Flame,
  Thermometer,
  Activity,
  Send,
  Copy,
  Download,
  Info,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export interface ExploreMarkerItem {
  id: string;
  name: string;
  type: 'disaster' | 'ngo' | 'donation' | 'need';
  coordinates: [number, number]; // [lng, lat]
  country: string;
  count?: number;
  subtitle?: string;
  imageUrl?: string;
  details?: {
    severity?: string;
    affected?: string;
    verifiedId?: string;
    items?: string[];
    city?: string;
    state?: string;
    source?: string;
  };
}

export interface EmergencyCard {
  id: string;
  name: string;
  type: string;
  priority: 'High Priority' | 'Medium Priority' | 'Code Red';
  country: string;
  affected: string;
  activeNgosCount: number;
  image: string;
  coordinates: [number, number]; // [lng, lat]
  source?: string;
}

const DEFAULT_EMERGENCIES: EmergencyCard[] = [
  {
    id: 'em_assam',
    name: 'Assam Flood Relief',
    type: 'flood',
    priority: 'High Priority',
    country: 'India',
    affected: '25,000+ People Affected',
    activeNgosCount: 12,
    image: '/emergency_rescue.jpg',
    coordinates: [91.7362, 26.1445],
    source: 'ASDMA Advisory #88'
  },
  {
    id: 'em_turkiye',
    name: 'Türkiye Earthquake',
    type: 'earthquake',
    priority: 'High Priority',
    country: 'Türkiye',
    affected: '1.2M People Affected',
    activeNgosCount: 15,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    coordinates: [36.2000, 36.8000],
    source: 'AFAD Emergency Cluster'
  },
  {
    id: 'em_kenya',
    name: 'Kenya Food Crisis',
    type: 'drought',
    priority: 'High Priority',
    country: 'Kenya',
    affected: '320,000 People Affected',
    activeNgosCount: 8,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80',
    coordinates: [35.5900, 3.1100],
    source: 'Kenya NDMA Advisory'
  },
  {
    id: 'em_philippines',
    name: 'Philippines Typhoon',
    type: 'cyclone',
    priority: 'Medium Priority',
    country: 'Philippines',
    affected: '280,000 People Affected',
    activeNgosCount: 10,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&auto=format&fit=crop&q=80',
    coordinates: [120.9800, 14.6000],
    source: 'NDRRMC Weather Bulletin'
  },
  {
    id: 'em_gaza',
    name: 'Gaza Humanitarian Aid',
    type: 'medical_crisis',
    priority: 'Medium Priority',
    country: 'Gaza',
    affected: '1.7M People Affected',
    activeNgosCount: 18,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80',
    coordinates: [34.4600, 31.5000],
    source: 'UN OCHA Dispatch'
  }
];

export interface MapClusterItem {
  id: string;
  name: string;
  count: number;
  color: 'blue' | 'green' | 'red' | 'amber';
  coordinates: [number, number]; // [lng, lat]
  region: string;
  subtitle: string;
}

const GLOBAL_CLUSTERS: MapClusterItem[] = [
  { id: 'cluster_na', name: 'North America Relief Reserve', count: 12, color: 'blue', coordinates: [-89.0, 40.0], region: 'North America', subtitle: '12 Logistics Hubs & Food Depots' },
  { id: 'cluster_sa', name: 'South America Emergency Cluster', count: 8, color: 'red', coordinates: [-55.0, -10.0], region: 'South America', subtitle: '8 Displaced Inundation Zones' },
  { id: 'cluster_af', name: 'Sub-Saharan Food & Medical Corridor', count: 6, color: 'green', coordinates: [21.0, -4.0], region: 'Africa', subtitle: '6 Verified Nutritional Centers' },
  { id: 'cluster_as', name: 'Central & East Asia Relief Stockpile', count: 10, color: 'blue', coordinates: [104.0, 35.0], region: 'Asia', subtitle: '10 Strategic Medical Consignment Warehouses' },
];

const BASELINE_MARKERS: ExploreMarkerItem[] = [
  // Verified NGOs (Green) - Global Locations
  { id: 'ngo_canada', name: 'Canada Arctic Relief Alliance', type: 'ngo', coordinates: [-106.34, 56.13], country: 'Canada', subtitle: 'Saskatchewan Forward Base', details: { city: 'Prince Albert', state: 'Saskatchewan', items: ['Winter Clothing', 'Emergency Medical'], verifiedId: 'CAN-REG-449' } },
  { id: 'ngo_california', name: 'West Coast Disaster Network', type: 'ngo', coordinates: [-122.41, 37.77], country: 'United States', subtitle: 'San Francisco Marine Staging', details: { city: 'San Francisco', state: 'California', items: ['Disaster Relief', 'Clean Water'], verifiedId: 'US-NGO-8821' } },
  { id: 'ngo_france', name: 'Médecins Humanitaires Europe', type: 'ngo', coordinates: [2.35, 48.85], country: 'France', subtitle: 'Paris Global Dispatch Hub', details: { city: 'Paris', state: 'Île-de-France', items: ['Trauma Medicine', 'Surgical Packs'], verifiedId: 'FRA-VER-109' } },
  { id: 'ngo_nigeria', name: 'West Africa Emergency Coalition', type: 'ngo', coordinates: [7.49, 9.08], country: 'Nigeria', subtitle: 'Abuja Federal Relief Depot', details: { city: 'Abuja', state: 'FCT', items: ['Food Rations', 'Water Purification'], verifiedId: 'NGA-NGO-310' } },
  { id: 'ngo_south_africa', name: 'Cape Hope Disaster Relief', type: 'ngo', coordinates: [28.04, -26.20], country: 'South Africa', subtitle: 'Johannesburg Regional Logistics', details: { city: 'Johannesburg', state: 'Gauteng', items: ['Shelter Kits', 'Medical First Aid'], verifiedId: 'ZAF-REG-902' } },
  { id: 'ngo_japan', name: 'Nippon Humanitarian Logistics', type: 'ngo', coordinates: [139.69, 35.68], country: 'Japan', subtitle: 'Tokyo Seaport Crisis Center', details: { city: 'Tokyo', state: 'Kanto', items: ['Tsunami Kits', 'Emergency Power'], verifiedId: 'JPN-AID-404' } },
  { id: 'ngo_indonesia', name: 'Nusantara Disaster Responders', type: 'ngo', coordinates: [106.84, -6.20], country: 'Indonesia', subtitle: 'Jakarta Coastal Maritime Depot', details: { city: 'Jakarta', state: 'Java', items: ['Flood Rescue Boats', 'Clean Water'], verifiedId: 'IDN-NGO-771' } },
  { id: 'ngo_melbourne', name: 'Australian Disaster Volunteers', type: 'ngo', coordinates: [144.96, -37.81], country: 'Australia', subtitle: 'Melbourne Southern Base', details: { city: 'Melbourne', state: 'Victoria', items: ['Bushfire Response', 'Trauma First Aid'], verifiedId: 'AUS-NGO-551' } },
  { id: 'ngo_colombia', name: 'Andes Humanitarian Outreach', type: 'ngo', coordinates: [-74.07, 4.71], country: 'Colombia', subtitle: 'Bogotá Emergency Dispatch', details: { city: 'Bogotá', state: 'Cundinamarca', items: ['Emergency Blankets', 'Nutrition'], verifiedId: 'COL-NGO-202' } },

  // Disasters (Red)
  { id: 'dis_turkiye', name: 'Türkiye Earthquake Zone', type: 'disaster', coordinates: [36.20, 36.80], country: 'Türkiye', subtitle: 'Anatolian Sector • Code Red', details: { severity: 'High Priority', affected: '1.2M affected' } },
  { id: 'dis_assam', name: 'Assam Flood Inundation', type: 'disaster', coordinates: [91.7362, 26.1445], country: 'India', subtitle: 'Brahmaputra Basin • Urgent', details: { severity: 'High Priority', affected: '25,000+ displaced' } },
  { id: 'dis_kenya', name: 'East Africa Drought Corridor', type: 'disaster', coordinates: [35.59, 3.11], country: 'Kenya', subtitle: 'Turkana Drylands Relief Zone', details: { severity: 'High Priority', affected: '320,000 affected' } },
  { id: 'dis_gaza', name: 'Gaza Medical Consignment Sector', type: 'disaster', coordinates: [34.46, 31.50], country: 'Gaza', subtitle: 'Khan Younis Field Corridor', details: { severity: 'Code Red', affected: '1.7M affected' } },
  { id: 'dis_manila', name: 'Luzon Storm Surge', type: 'disaster', coordinates: [120.9842, 14.5995], country: 'Philippines', subtitle: 'Coastal Inundation Corridor', details: { severity: 'Medium Priority' } },
  { id: 'dis_argentina', name: 'Parana Basin Inundation', type: 'disaster', coordinates: [-64.0, -34.0], country: 'Argentina', subtitle: 'Cordoba Relief Operations', details: { severity: 'Medium Priority' } },
  { id: 'dis_brazil', name: 'Amazon Basin Flood Emergency', type: 'disaster', coordinates: [-60.025, -3.119], country: 'Brazil', subtitle: 'Manaus Staging Corridor', details: { severity: 'High Priority' } },
  { id: 'dis_greece', name: 'Aegean Wildfire Incident', type: 'disaster', coordinates: [23.72, 37.98], country: 'Greece', subtitle: 'Attica Air Evacuation Base', details: { severity: 'Medium Priority' } },

  // Available Donations (Blue)
  { id: 'don_delhi', name: 'Delhi Winter Blankets Lot #12', type: 'donation', coordinates: [77.20, 28.61], country: 'India', count: 12, subtitle: 'New Delhi Staging Depot • 50 lots' },
  { id: 'don_chicago', name: 'Emergency Rations Lot #49', type: 'donation', coordinates: [-87.62, 41.87], country: 'United States', count: 12, subtitle: 'Chicago Food Reserve' },
  { id: 'don_germany', name: 'Frankfurt Air Cargo Medical Depot', type: 'donation', coordinates: [8.68, 50.11], country: 'Germany', count: 16, subtitle: 'Rhein-Main Transit Depot' },
  { id: 'don_nairobi', name: 'Fortified Flour Reserves', type: 'donation', coordinates: [36.85, -1.28], country: 'Kenya', count: 8, subtitle: 'Nairobi Transit Dock' },
  { id: 'don_sydney', name: 'Water Filtration Units', type: 'donation', coordinates: [151.20, -33.86], country: 'Australia', count: 6, subtitle: 'Sydney Emergency Reserves' },
  { id: 'don_hatay', name: 'Thermal Shelter Tents', type: 'donation', coordinates: [36.16, 36.20], country: 'Türkiye', count: 8, subtitle: 'Hatay Forward Staging Depot' },
  { id: 'don_mumbai', name: '500 Food Packets Depot', type: 'donation', coordinates: [72.8777, 19.0760], country: 'India', count: 24, subtitle: 'Mumbai Port Authority Hub' },

  // Urgent Needs (Amber)
  { id: 'need_turkana', name: 'Child Therapeutic Nutrition', type: 'need', coordinates: [35.59, 3.11], country: 'Kenya', count: 8, subtitle: 'Turkana Drylands Corridor' },
  { id: 'need_gaziantep', name: 'Winter Insulated Family Tents', type: 'need', coordinates: [37.20, 37.05], country: 'Türkiye', count: 3, subtitle: 'Gaziantep Temporary Shelters' },
  { id: 'need_assam', name: 'Waterproof Tarpaulins & Meds', type: 'need', coordinates: [92.15, 26.30], country: 'India', count: 16, subtitle: 'Lower Assam Flood Inundation' },
  { id: 'need_brazil', name: 'Clean Drinking Water Kits', type: 'need', coordinates: [-47.92, -15.78], country: 'Brazil', count: 8, subtitle: 'Central Valley Drought Hub' }
];

// Transport Route Arcs between Global Relief Corridors
interface RouteArc {
  id: string;
  name: string;
  from: [number, number]; // [lng, lat]
  to: [number, number];
  type: 'air' | 'sea' | 'land';
  cargo: string;
}

export function isValidCoordinates(coords: unknown): coords is [number, number] {
  if (!Array.isArray(coords) || coords.length < 2) return false;
  const [lng, lat] = coords;
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

const HUMANITARIAN_ROUTES: RouteArc[] = [
  { id: 'route_1', name: 'Transatlantic Medical Airlift', from: [-74.0, 40.7], to: [2.35, 48.85], type: 'air', cargo: 'Surgical Kits & Antibiotics' },
  { id: 'route_2', name: 'South Asia Relief Air Bridge', from: [77.20, 28.61], to: [91.73, 26.14], type: 'air', cargo: 'Flood Boats & Water Filters' },
  { id: 'route_3', name: 'Anatolian Emergency Pipeline', from: [28.97, 41.0], to: [36.2, 36.8], type: 'land', cargo: 'Thermal Tents & Generators' },
  { id: 'route_4', name: 'Horn of Africa Nutrition Corridor', from: [36.82, -1.29], to: [35.59, 3.11], type: 'air', cargo: 'Fortified Flour & Electrolytes' },
  { id: 'route_5', name: 'Pacific Island Disaster Sealift', from: [151.2, -33.86], to: [120.98, 14.6], type: 'sea', cargo: 'Desalination Units' },
  { id: 'route_6', name: 'Mediterranean Humanitarian Sea Corridor', from: [12.5, 41.9], to: [34.46, 31.5], type: 'sea', cargo: 'Emergency Trauma Consignments' }
];

const MAP_STYLES = {
  satellite: {
    name: 'Satellite',
    style: {
      version: 8,
      sources: {
        'esri-imagery': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri, Maxar, Earthstar Geographics'
        },
        'esri-labels': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        }
      },
      layers: [
        { id: 'sat-base', type: 'raster', source: 'esri-imagery', minzoom: 0, maxzoom: 22 },
        { id: 'sat-labels', type: 'raster', source: 'esri-labels', minzoom: 0, maxzoom: 22 }
      ]
    }
  },
  map: {
    name: 'Map',
    style: {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors © CARTO'
        }
      },
      layers: [{ id: 'map-base', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 20 }]
    }
  },
  terrain: {
    name: 'Terrain',
    style: {
      version: 8,
      sources: {
        'esri-terrain': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri Shaded Relief'
        },
        'esri-labels': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        }
      },
      layers: [
        { id: 'terrain-base', type: 'raster', source: 'esri-terrain', minzoom: 0, maxzoom: 18 },
        { id: 'terrain-labels', type: 'raster', source: 'esri-labels', minzoom: 0, maxzoom: 18 }
      ]
    }
  },
  hybrid: {
    name: 'Hybrid',
    style: {
      version: 8,
      sources: {
        'esri-hybrid-sat': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        },
        'esri-hybrid-ref': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        },
        'esri-hybrid-labels': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        }
      },
      layers: [
        { id: 'hyb-base', type: 'raster', source: 'esri-hybrid-sat', minzoom: 0, maxzoom: 22 },
        { id: 'hyb-roads', type: 'raster', source: 'esri-hybrid-ref', minzoom: 0, maxzoom: 22 },
        { id: 'hyb-labels', type: 'raster', source: 'esri-hybrid-labels', minzoom: 0, maxzoom: 22 }
      ]
    }
  }
};

interface ExploreMapProps {
  ngos?: any[];
  selectedNgoId?: string | null;
  onSelectNgo?: (id: string) => void;
  heightClass?: string;
  onViewChange?: (view: 'map' | 'globe' | 'split' | 'directory') => void;
}

export default function ExploreMap({
  ngos = [],
  selectedNgoId,
  onSelectNgo,
  heightClass = 'h-[680px]',
  onViewChange
}: ExploreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // States
  const [currentBasemap, setCurrentBasemap] = useState<'satellite' | 'map' | 'terrain' | 'hybrid'>('satellite');
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [inMapSearch, setInMapSearch] = useState('');
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(100); // 100% is Live
  const [showTimelineBar, setShowTimelineBar] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInitRetry, setMapInitRetry] = useState(0);

  // Drawer / Modal states
  const [activeSideDrawer, setActiveSideDrawer] = useState<'layers' | 'filters' | 'alerts' | 'problems' | 'solutions' | 'share' | 'analytics' | null>(null);
  const [problemsList, setProblemsList] = useState<any[]>([]);
  const [solutionsList, setSolutionsList] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<ExploreMarkerItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Layer toggles
  const [humanitarianLayers, setHumanitarianLayers] = useState({
    verifiedNgo: true,
    disasters: true,
    activeEmergencies: true,
    donationCenters: true,
    urgentNeeds: true,
    reliefRoutes: true,
    heatmap: true
  });

  const [environmentalLayers, setEnvironmentalLayers] = useState({
    weatherLive: false,
    rainfall: false,
    cycloneTracks: false,
    earthquakeZones: false,
    floodRisk: false,
    wildfireAlerts: false,
    temperature: false
  });

  // Alerts State
  const [alerts, setAlerts] = useState<any[]>(DEFAULT_EMERGENCIES);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [alertSearchQuery, setAlertSearchQuery] = useState('');

  // Emergency carousel state
  const [emergencies, setEmergencies] = useState<EmergencyCard[]>(DEFAULT_EMERGENCIES);
  const emergencyScrollRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Convert incoming DB NGOs into markers with coordinate validation
  const liveNgoMarkers: ExploreMarkerItem[] = useMemo(() => {
    if (!Array.isArray(ngos)) return [];
    return ngos
      .filter(ngo => {
        if (!ngo?.serviceArea?.coordinates || !Array.isArray(ngo.serviceArea.coordinates)) return false;
        const [lat, lng] = ngo.serviceArea.coordinates;
        return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);
      })
      .map(ngo => {
        const [lat, lng] = ngo.serviceArea.coordinates;
        return {
          id: ngo.id,
          name: ngo.legalName,
          type: 'ngo' as const,
          coordinates: [lng, lat] as [number, number], // [lng, lat]
          country: ngo.serviceArea.country || 'India',
          subtitle: `${ngo.serviceArea.city}, ${ngo.serviceArea.state}`,
          imageUrl: ngo.publicProfile?.imageUrl,
          details: {
            city: ngo.serviceArea.city,
            state: ngo.serviceArea.state,
            items: ngo.supportedCategories || [],
            verifiedId: ngo.registrationNumber || 'Statutory Verified'
          }
        };
      })
      .filter(marker => isValidCoordinates(marker.coordinates));
  }, [ngos]);

  const allMarkers = useMemo(() => {
    return [...BASELINE_MARKERS.filter(m => isValidCoordinates(m.coordinates)), ...liveNgoMarkers];
  }, [liveNgoMarkers]);

  // Fetch live emergencies from DB on mount
  useEffect(() => {
    async function loadEmergencies() {
      try {
        const res = await fetch('/api/emergencies');
        if (res.ok) {
          const data = await res.json();
          if (data.emergencies && Array.isArray(data.emergencies) && data.emergencies.length > 0) {
            const mapped: EmergencyCard[] = data.emergencies
              .map((em: any) => {
                const epic = em.geography?.epicenter;
                const coords: [number, number] = (Array.isArray(epic) && epic.length >= 2 && Number.isFinite(epic[0]) && Number.isFinite(epic[1]))
                  ? [epic[1], epic[0]]
                  : [91.73, 26.14];
                return {
                  id: em.id,
                  name: em.name,
                  type: em.type || 'disaster',
                  priority: em.severity === 'code_red' ? 'Code Red' : em.severity === 'high' ? 'High Priority' : 'Medium Priority',
                  country: em.country || em.geography?.affectedStates?.[0] || 'Disaster Zone',
                  affected: em.affected || (em.affectedPeopleCount ? `${em.affectedPeopleCount.toLocaleString()}+ People Affected` : 'Corridor in Alert'),
                  activeNgosCount: em.activeNgosCount || 10,
                  image: em.image || '/emergency_rescue.jpg',
                  coordinates: coords,
                  source: em.officialSource || 'Official National Disaster Agency'
                };
              })
              .filter((em: EmergencyCard) => isValidCoordinates(em.coordinates));

            if (mapped.length > 0) {
              setEmergencies(mapped);
              setAlerts(mapped);
            }
          }
        }
      } catch (e) {
        console.warn('Emergencies fetch fallback to defaults:', e);
      }
    }
    loadEmergencies();
  }, []);

  // Initialize MapLibre GL Safely
  useEffect(() => {
    let mapInstance: any = null;
    let cancelled = false;

    async function initMap() {
      const container = containerRef.current;
      if (!container) return;

      try {
        setMapLoading(true);
        setMapError(null);

        const maplibre = await import('maplibre-gl');
        if (cancelled) return;

        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch {}
          mapInstanceRef.current = null;
        }

        const basemap = MAP_STYLES[currentBasemap] ?? MAP_STYLES.satellite ?? Object.values(MAP_STYLES)[0];
        if (!basemap?.style) {
          setMapError('Selected map style configuration is not available.');
          setMapLoading(false);
          return;
        }

        const map = new maplibre.Map({
          container,
          style: basemap.style as any,
          center: [30, 22],
          zoom: 2.1,
          minZoom: 1.2,
          maxZoom: 18,
          // CRITICAL: Do not pass maxBounds with [-180, 180] which triggers MapLibre wrap modular singularity
          attributionControl: false
        });

        map.on('error', (e: any) => {
          console.warn('MapLibre tile notice:', e?.error?.message || e);
        });

        map.on('load', () => {
          if (cancelled) return;
          mapInstanceRef.current = map;
          setMapLoading(false);
          setMapError(null);
          renderMapMarkers(map, maplibre);
          map.resize();
        });

        map.on('style.load', () => {
          if (!cancelled && mapInstanceRef.current) {
            renderMapMarkers(mapInstanceRef.current, maplibre);
          }
        });

        map.on('zoomend', () => {
          if (!cancelled && mapInstanceRef.current) {
            renderMapMarkers(mapInstanceRef.current, maplibre);
          }
        });

        map.on('move', () => {
          drawCanvasOverlays();
        });

        mapInstance = map;
      } catch (err: any) {
        console.error('MapLibre GL init error:', err);
        if (!cancelled) {
          setMapError(err?.message || 'Failed to initialize map.');
          setMapLoading(false);
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch {}
      }
      mapInstanceRef.current = null;
    };
  }, [mapInitRetry]);

  // Smooth Basemap Switcher without destroying the Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const basemap = MAP_STYLES[currentBasemap] ?? MAP_STYLES.satellite;
    if (basemap?.style) {
      try {
        mapInstanceRef.current.setStyle(basemap.style as any);
      } catch (err) {
        console.warn('Map style update fallback to re-init:', err);
        setMapInitRetry(r => r + 1);
      }
    }
  }, [currentBasemap]);

  // Render DOM Markers on MapLibre with Clustering
  const renderMapMarkers = (map: any, maplibre: any) => {
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const zoom = map.getZoom ? map.getZoom() : 2.1;
    const isClustered = zoom < 4.2;

    // 1. Render Clusters when zoomed out
    if (isClustered) {
      GLOBAL_CLUSTERS.forEach(cluster => {
        if (!isValidCoordinates(cluster.coordinates)) return;
        const el = document.createElement('div');
        el.className = 'cursor-pointer transform hover:scale-110 transition-transform duration-200 z-20';

        const colorClasses = {
          blue: 'bg-[#2563EB] shadow-blue-500/30',
          green: 'bg-[#059669] shadow-emerald-500/30',
          red: 'bg-[#DC2626] shadow-red-500/30',
          amber: 'bg-[#D97706] shadow-amber-500/30'
        }[cluster.color];

        el.innerHTML = `
          <div class="w-8 h-8 rounded-full ${colorClasses} border-2 border-white flex items-center justify-center shadow-xl text-white font-black text-xs">
            ${cluster.count}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          map.flyTo({ center: cluster.coordinates, zoom: 5.2, speed: 1.2 });
          showToast(`Expanded ${cluster.name} (${cluster.count} facilities)`);
        });

        const marker = new maplibre.Marker({ element: el })
          .setLngLat(cluster.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 2. Render Individual Markers
    allMarkers.forEach(item => {
      if (!isValidCoordinates(item.coordinates)) return;
      // If clustered and marker is inside cluster territory, skip rendering at global zoom
      if (isClustered) {
        if (item.country === 'United States' && item.id.includes('chicago')) return;
        if (item.country === 'Brazil' && (item.id.includes('brazil') || item.id.includes('need_brazil'))) return;
      }

      // Check visibility against humanitarian layers
      if (item.type === 'ngo' && !humanitarianLayers.verifiedNgo) return;
      if (item.type === 'disaster' && !humanitarianLayers.disasters && !humanitarianLayers.activeEmergencies) return;
      if (item.type === 'donation' && !humanitarianLayers.donationCenters) return;
      if (item.type === 'need' && !humanitarianLayers.urgentNeeds) return;

      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-125 transition-transform duration-200 z-20';

      const isSelected = selectedNgoId === item.id || selectedMarker?.id === item.id;

      if (item.type === 'disaster') {
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 rounded-full bg-red-500/40 animate-ping"></span>
            <div class="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
        `;
      } else if (item.type === 'ngo') {
        el.innerHTML = `
          <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
            <div class="w-6 h-6 rounded-full ${isSelected ? 'bg-emerald-500 ring-4 ring-white' : 'bg-[#059669] border-2 border-white'} flex items-center justify-center shadow-lg text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        `;
      } else if (item.type === 'donation') {
        el.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-md text-white font-bold text-[10px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-[#D97706] border-2 border-white flex items-center justify-center shadow-md text-white font-bold text-[10px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        `;
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedMarker(item);
        if (item.type === 'ngo' && onSelectNgo) {
          onSelectNgo(item.id);
        }
        map.flyTo({ center: item.coordinates, zoom: Math.max(map.getZoom(), 5.5), speed: 1.2 });
      });

      const marker = new maplibre.Marker({ element: el })
        .setLngLat(item.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    drawCanvasOverlays();
  };

  // Re-render markers whenever layers change
  useEffect(() => {
    if (mapInstanceRef.current) {
      import('maplibre-gl').then(maplibre => {
        renderMapMarkers(mapInstanceRef.current, maplibre);
      });
    }
  }, [humanitarianLayers, environmentalLayers, allMarkers, selectedNgoId]);

  // Synchronize selection from parent or cards
  useEffect(() => {
    if (!selectedNgoId || !mapInstanceRef.current) return;
    const target = allMarkers.find(m => m.id === selectedNgoId);
    if (!target) return;

    setSelectedMarker(target);
    mapInstanceRef.current.flyTo?.({
      center: target.coordinates,
      zoom: 7.5,
      speed: 1.2
    });
  }, [selectedNgoId]);

  // Canvas Overlay Drawing (Route Arcs, Heatmap, Planes)
  const drawCanvasOverlays = () => {
    const canvas = canvasOverlayRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = containerRef.current?.clientWidth || 1000;
    const height = canvas.height = containerRef.current?.clientHeight || 680;
    ctx.clearRect(0, 0, width, height);

    // 1. Heatmap layer if enabled
    if (humanitarianLayers.heatmap) {
      const hotspots: [number, number, number][] = [
        [91.73, 26.14, 60], // Assam
        [36.20, 36.80, 75], // Turkiye
        [35.59, 3.11, 65],  // Turkana Kenya
        [34.46, 31.50, 50], // Gaza
        [120.98, 14.60, 45] // Manila
      ];

      hotspots.forEach(([lng, lat, radius]) => {
        if (!isValidCoordinates([lng, lat])) return;
        try {
          const pt = map.project([lng, lat]);
          if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return;
          const grad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, radius * (map.getZoom() / 2));
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
          grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.2)');
          grad.addColorStop(1, 'rgba(6, 19, 41, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius * (map.getZoom() / 2), 0, Math.PI * 2);
          ctx.fill();
        } catch {}
      });
    }

    // 2. Relief Transport Route Arcs
    if (humanitarianLayers.reliefRoutes) {
      HUMANITARIAN_ROUTES.forEach(route => {
        if (!isValidCoordinates(route.from) || !isValidCoordinates(route.to)) return;
        try {
          const p1 = map.project(route.from);
          const p2 = map.project(route.to);
          if (!p1 || !p2 || !Number.isFinite(p1.x) || !Number.isFinite(p1.y) || !Number.isFinite(p2.x) || !Number.isFinite(p2.y)) return;

          // Calculate curved control point
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - Math.abs(p2.x - p1.x) * 0.2;

          // Draw curved dashed route line
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx.strokeStyle = route.type === 'sea' ? 'rgba(56, 189, 248, 0.65)' : 'rgba(251, 191, 36, 0.75)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw directional moving icon
          const t = (Date.now() % 3000) / 3000;
          const curX = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
          const curY = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00C8F8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } catch {}
      });
    }
  };

  // Continuous animation loop for routes and aircraft markers
  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawCanvasOverlays();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [humanitarianLayers]);

  // Handle Region Change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const map = mapInstanceRef.current;
    if (!map) return;

    const regions: Record<string, { center: [number, number]; zoom: number }> = {
      Global: { center: [30, 20], zoom: 2.1 },
      India: { center: [78.9629, 21.5937], zoom: 4.8 },
      Asia: { center: [85.0, 28.0], zoom: 3.5 },
      Europe: { center: [15.0, 50.0], zoom: 3.8 },
      Africa: { center: [20.0, 5.0], zoom: 3.5 },
      'North America': { center: [-98.0, 39.0], zoom: 3.4 },
      'South America': { center: [-60.0, -18.0], zoom: 3.4 },
      Australia: { center: [134.0, -25.0], zoom: 3.8 }
    };

    const target = regions[region] || regions.Global;
    map.flyTo({ center: target.center, zoom: target.zoom, speed: 1.2 });
  };

  // In-Map Search handler
  const handleInMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inMapSearch.trim()) return;

    const q = inMapSearch.toLowerCase();
    const match = allMarkers.find(
      m => m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.subtitle?.toLowerCase().includes(q)
    );

    if (match && mapInstanceRef.current) {
      setSelectedMarker(match);
      mapInstanceRef.current.flyTo({ center: match.coordinates, zoom: 7.5, speed: 1.2 });
      showToast(`Navigated to ${match.name}`);
    } else {
      showToast('No matching location found on current view');
    }
  };

  // Timeline scrubber playback simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timelinePlaying) {
      timer = setInterval(() => {
        setTimelineStep(prev => {
          if (prev >= 100) return 0;
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [timelinePlaying]);

  // Alert Actions
  const handleMarkAsRead = (id: string) => {
    setReadAlertIds(prev => new Set(prev).add(id));
  };

  const handleMarkAllAlertsRead = () => {
    const allIds = new Set(alerts.map(a => a.id));
    setReadAlertIds(allIds);
    showToast('All alerts marked as read');
  };

  const unreadAlertCount = Math.max(0, alerts.filter(a => !readAlertIds.has(a.id)).length + 7);

  // Zoom controls
  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      const z = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.zoomTo(z + delta);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }
    showToast('Resolving location...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 8 });
        }
        showToast('Map centered to your location');
      },
      () => showToast('Location permission denied')
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Emergency Card Click: zoom to emergency
  const handleSelectEmergency = (em: EmergencyCard) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: em.coordinates,
        zoom: 6.8,
        speed: 1.2,
        essential: true
      });
      const matchingMarker = allMarkers.find(m => m.id === em.id);
      if (matchingMarker) setSelectedMarker(matchingMarker);
      showToast(`Centered on ${em.name}`);
    }
  };

  const scrollEmergencies = (dir: 'left' | 'right') => {
    if (emergencyScrollRef.current) {
      const offset = dir === 'left' ? -300 : 300;
      emergencyScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Share Actions
  const handleCopyShareLink = async () => {
    const center = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : { lng: 30, lat: 20 };
    const zoom = mapInstanceRef.current ? Math.round(mapInstanceRef.current.getZoom() * 10) / 10 : 2.1;
    const shareUrl = `${window.location.origin}/explore?region=${encodeURIComponent(selectedRegion)}&lng=${center.lng.toFixed(4)}&lat=${center.lat.toFixed(4)}&z=${zoom}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Map link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MASSIVE INTERACTIVE MAP CONTAINER */}
      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#061329] select-none`}
      >
        {/* Canvas Overlay for Great-Circle Route Arcs and Heatmaps */}
        <canvas
          ref={canvasOverlayRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {/* Loading Spinner Overlay */}
        {mapLoading && (
          <div className="absolute inset-0 z-20 bg-[#061329]/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-cyan-400">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">Loading Relief Intelligence Map...</span>
          </div>
        )}

        {/* Error Fallback Overlay */}
        {mapError && (
          <div className="absolute inset-0 z-30 bg-[#061329]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shadow-lg border border-rose-500/30">
              ⚠️
            </div>
            <h4 className="text-sm font-bold text-white">Map Initialization Notice</h4>
            <p className="text-xs text-slate-400 max-w-md">{mapError}</p>
            <button
              onClick={() => setMapInitRetry(r => r + 1)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg"
            >
              Retry Loading Map
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-2xl border border-white/20 animate-in fade-in duration-200 backdrop-blur-md">
            {toastMessage}
          </div>
        )}

        {/* TOP FLOATING IN-MAP CONTROLS BAR */}
        <div className="absolute top-3 right-3 sm:right-4 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Live Data Switch */}
            <button
              onClick={() => {
                setIsLiveActive(!isLiveActive);
                showToast(isLiveActive ? 'Live updates paused' : 'Live telemetry stream active');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-bold shadow-xl transition ${
                isLiveActive
                  ? 'bg-slate-900/85 border-emerald-500/50 text-white'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>Live Data</span>
            </button>

            {/* Region Dropdown */}
            <select
              value={selectedRegion}
              onChange={e => handleRegionChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-xl focus:outline-none cursor-pointer"
            >
              <option value="Global">Global ▾</option>
              <option value="India">India</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="Africa">Africa</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Australia">Australia</option>
            </select>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/15 text-white hover:bg-slate-800 transition shadow-xl"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        {/* LEFT FLOATING CONTROL RAIL (Filters, Layers, Alerts, Share, Analytics) */}
        <div className="absolute top-16 left-3 sm:left-4 z-30 flex flex-col gap-2 pointer-events-auto">
          <div className="flex flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl p-1.5 border border-white/15 shadow-2xl divide-y divide-slate-800 text-[11px] font-semibold text-slate-300">
            {/* Filters */}
            <button
              onClick={() => setActiveSideDrawer(activeSideDrawer === 'filters' ? null : 'filters')}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'filters' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Filters Panel"
            >
              <Filter className="w-4 h-4" />
              <span className="text-[9px]">Filters</span>
            </button>

            {/* Layers */}
            <button
              onClick={() => setActiveSideDrawer(activeSideDrawer === 'layers' ? null : 'layers')}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'layers' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Layers Panel"
            >
              <Layers className="w-4 h-4" />
              <span className="text-[9px]">Layers</span>
            </button>

            {/* Alerts with Dynamic Badge */}
            <button
              onClick={() => setActiveSideDrawer(activeSideDrawer === 'alerts' ? null : 'alerts')}
              className={`relative p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'alerts' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Alerts Center"
            >
              <div className="relative">
                <Bell className="w-4 h-4" />
                {unreadAlertCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-600 text-white font-black text-[9px] rounded-full border border-slate-900">
                    {unreadAlertCount}
                  </span>
                )}
              </div>
              <span className="text-[9px]">Alerts</span>
            </button>

            {/* Problems */}
            <button
              onClick={() => {
                const nextState = activeSideDrawer === 'problems' ? null : 'problems';
                setActiveSideDrawer(nextState);
                if (nextState && problemsList.length === 0) {
                  setLoadingProblems(true);
                  fetch('/api/problems')
                    .then(r => r.json())
                    .then(data => {
                      if (data.problems) setProblemsList(data.problems);
                    })
                    .catch(() => {})
                    .finally(() => setLoadingProblems(false));
                }
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'problems' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Global Problems"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-[9px]">Problems</span>
            </button>

            {/* Solutions */}
            <button
              onClick={() => {
                const nextState = activeSideDrawer === 'solutions' ? null : 'solutions';
                setActiveSideDrawer(nextState);
                if (nextState && solutionsList.length === 0) {
                  setLoadingSolutions(true);
                  fetch('/api/solutions')
                    .then(r => r.json())
                    .then(data => {
                      if (data.solutions) setSolutionsList(data.solutions);
                    })
                    .catch(() => {})
                    .finally(() => setLoadingSolutions(false));
                }
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'solutions' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Solutions & Matches"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-[9px]">Solutions</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setActiveSideDrawer(activeSideDrawer === 'share' ? null : 'share')}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'share' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Share Map"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[9px]">Share</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => setActiveSideDrawer(activeSideDrawer === 'analytics' ? null : 'analytics')}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeSideDrawer === 'analytics' ? 'bg-[#00A878]/30 text-emerald-400' : 'hover:text-white hover:bg-slate-800/60'
              }`}
              title="Humanitarian Analytics"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[9px]">Analytics</span>
            </button>
          </div>
        </div>

        {/* 2. SLIDE-OUT DRAWER: FILTERS & LAYERS (Matching Reference Design) */}
        {(activeSideDrawer === 'layers' || activeSideDrawer === 'filters') && (
          <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 max-h-[580px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-left-4 duration-150">
            {/* Header with Reset */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Filters & Layers
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setHumanitarianLayers({
                      verifiedNgo: true,
                      disasters: true,
                      activeEmergencies: true,
                      donationCenters: true,
                      urgentNeeds: true,
                      reliefRoutes: true,
                      heatmap: true
                    });
                    setEnvironmentalLayers({
                      weatherLive: false,
                      rainfall: false,
                      cycloneTracks: false,
                      earthquakeZones: false,
                      floodRisk: false,
                      wildfireAlerts: false,
                      temperature: false
                    });
                    showToast('Layers reset to defaults');
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setActiveSideDrawer(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs: Map Layers | Filters */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveSideDrawer('layers')}
                className={`py-1.5 rounded-lg transition ${
                  activeSideDrawer === 'layers' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                Map Layers
              </button>
              <button
                onClick={() => setActiveSideDrawer('filters')}
                className={`py-1.5 rounded-lg transition ${
                  activeSideDrawer === 'filters' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                Filters
              </button>
            </div>

            {/* TAB CONTENT: MAP LAYERS */}
            {activeSideDrawer === 'layers' && (
              <div className="space-y-4 text-xs">
                {/* 1. Humanitarian Layers */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Humanitarian Layers
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-emerald-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>Verified NGOs</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.verifiedNgo}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, verifiedNgo: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-red-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span>Disaster Affected Areas</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.disasters}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, disasters: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-red-400">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Active Emergencies</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.activeEmergencies}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, activeEmergencies: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      <span>Donation Centers</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.donationCenters}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, donationCenters: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-amber-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span>Urgent Needs</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.urgentNeeds}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, urgentNeeds: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-cyan-400">
                    <span className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Relief Transport Routes</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.reliefRoutes}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, reliefRoutes: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:text-purple-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500" />
                      <span>Heatmap (Needs Density)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={humanitarianLayers.heatmap}
                      onChange={e => setHumanitarianLayers({ ...humanitarianLayers, heatmap: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>
                </div>

                {/* 2. Environmental Layers */}
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Environmental Layers
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                      <span>Weather (Live Radar)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.weatherLive}
                      onChange={e => {
                        setEnvironmentalLayers({ ...environmentalLayers, weatherLive: e.target.checked });
                        showToast(e.target.checked ? 'Live satellite cloud overlay enabled' : 'Weather overlay disabled');
                      }}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rainfall Forecast</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.rainfall}
                      onChange={e => {
                        setEnvironmentalLayers({ ...environmentalLayers, rainfall: e.target.checked });
                        showToast(e.target.checked ? 'Monsoon precipitation forecast layer enabled' : 'Rainfall layer disabled');
                      }}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-purple-400" />
                      <span>Cyclone & Storm Tracks</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.cycloneTracks}
                      onChange={e => {
                        setEnvironmentalLayers({ ...environmentalLayers, cycloneTracks: e.target.checked });
                        showToast(e.target.checked ? 'Pacific & Bay of Bengal cyclone storm tracks enabled' : 'Storm tracks disabled');
                      }}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Earthquake Zones</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.earthquakeZones}
                      onChange={e => {
                        setEnvironmentalLayers({ ...environmentalLayers, earthquakeZones: e.target.checked });
                        showToast(e.target.checked ? 'Seismic faultline boundaries enabled' : 'Earthquake zones disabled');
                      }}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>Wildfire Alerts</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.wildfireAlerts}
                      onChange={e => {
                        setEnvironmentalLayers({ ...environmentalLayers, wildfireAlerts: e.target.checked });
                        showToast(e.target.checked ? 'Thermal anomaly hotspots enabled' : 'Wildfire alerts disabled');
                      }}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                    <span className="flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                      <span>Temperature (°C)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={environmentalLayers.temperature}
                      onChange={e => setEnvironmentalLayers({ ...environmentalLayers, temperature: e.target.checked })}
                      className="accent-[#00A878] w-4 h-4 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FILTERS */}
            {activeSideDrawer === 'filters' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Geographic Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={e => handleRegionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none"
                  >
                    <option value="Global">Global</option>
                    <option value="India">India (Subcontinent)</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Africa">Africa</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Minimum Needs Count
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    defaultValue="0"
                    className="w-full accent-[#00A878]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>All Hubs</span>
                    <span>5+ Needs</span>
                    <span>10+ Needs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ALERTS CENTER DRAWER */}
        {activeSideDrawer === 'alerts' && (
          <div className="absolute top-16 left-20 z-40 w-80 sm:w-96 max-h-[580px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Alerts Center ({unreadAlertCount} Unread)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAlertsRead}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setActiveSideDrawer(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold py-1">
              {['all', 'code_red', 'high', 'medium'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setAlertSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition ${
                    alertSeverityFilter === sev ? 'bg-[#00A878] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sev.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-2.5 pt-1">
              {alerts.map(alert => {
                const isRead = readAlertIds.has(alert.id);
                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      handleMarkAsRead(alert.id);
                      handleSelectEmergency(alert);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isRead
                        ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                        : 'bg-slate-800/90 border-slate-700 hover:border-emerald-400 text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            alert.priority === 'Code Red' ? 'bg-rose-500 animate-ping' : 'bg-rose-500'
                          }`}
                        />
                        <h5 className="text-xs font-bold text-white">{alert.name}</h5>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                        {alert.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{alert.affected}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60">
                      <span>{alert.country}</span>
                      <span className="text-emerald-400 font-semibold hover:underline">Zoom to Epicenter →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3.1. PROBLEMS DRAWER */}
        {activeSideDrawer === 'problems' && (
          <div className="absolute top-16 left-20 z-40 w-80 sm:w-96 max-h-[580px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Global Humanitarian Problems ({problemsList.length})
                </span>
              </div>
              <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingProblems ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Querying verified humanitarian problem records...
              </div>
            ) : (
              <div className="space-y-2.5 pt-1 text-xs">
                {problemsList.map((prob: any) => (
                  <div
                    key={prob.id}
                    onClick={() => {
                      if (prob.coordinates && mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo({ center: [prob.coordinates[1], prob.coordinates[0]], zoom: 6.5, speed: 1.2 });
                        showToast(`Focused on ${prob.title}`);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-white text-xs">{prob.title}</div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        prob.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {prob.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{prob.location} • {prob.affectedCount}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prob.requiredResources?.slice(0, 3).map((r: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3.2. SOLUTIONS DRAWER */}
        {activeSideDrawer === 'solutions' && (
          <div className="absolute top-16 left-20 z-40 w-80 sm:w-96 max-h-[580px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Resource Matching & Solutions
                </span>
              </div>
              <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingSolutions ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Matching resources and verified NGOs...
              </div>
            ) : (
              <div className="space-y-2.5 pt-1 text-xs">
                {solutionsList.map((sol: any) => (
                  <div
                    key={sol.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-400 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-white text-xs">{sol.title}</div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">
                        {sol.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">{sol.ngoName} • {sol.coverageArea}</div>
                    <p className="text-[10px] text-slate-400 mt-1.5 bg-slate-900/60 p-2 rounded-lg italic border border-white/5">
                      "{sol.recommendationRationale}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SHARE DIALOG MODAL */}
        {activeSideDrawer === 'share' && (
          <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Share Humanitarian Map
              </span>
              <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Share the current view, coordinates, and active relief layer configuration with dispatch teams or donors.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyShareLink}
                className="w-full py-2.5 px-3 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Current View Link</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'ReliefLink AI World Relief Map',
                      text: 'Inspect verified humanitarian response corridors on ReliefLink AI.',
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    handleCopyShareLink();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Native Device Share</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. ANALYTICS INTELLIGENCE DRAWER */}
        {activeSideDrawer === 'analytics' && (
          <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-left-4 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Relief Telemetry
              </span>
              <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-base font-extrabold text-emerald-400">12,450+</div>
                <div className="text-[10px] text-slate-400">Verified Hubs</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-base font-extrabold text-blue-400">4,820</div>
                <div className="text-[10px] text-slate-400">Kits in Transit</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-base font-extrabold text-purple-400">94.2%</div>
                <div className="text-[10px] text-slate-400">Match Efficiency</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-base font-extrabold text-amber-400">3.4 hrs</div>
                <div className="text-[10px] text-slate-400">Avg Turnaround</div>
              </div>
            </div>
          </div>
        )}



        {/* SELECTED MARKER INFORMATION CARD (OVERLAY) */}
        {selectedMarker && (
          <div className="absolute top-16 right-3 sm:right-4 z-40 w-72 sm:w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200 text-white">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedMarker.type === 'disaster'
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      : selectedMarker.type === 'ngo'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : selectedMarker.type === 'donation'
                      ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                      : 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  }`}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {selectedMarker.type === 'disaster'
                    ? 'Disaster Zone'
                    : selectedMarker.type === 'ngo'
                    ? 'Verified Relief Hub'
                    : selectedMarker.type === 'donation'
                    ? 'Donation Point'
                    : 'Urgent Requirement'}
                </span>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2.5 space-y-1.5">
              <h4 className="text-sm font-bold text-white leading-snug">
                {selectedMarker.name}
              </h4>
              <p className="text-xs text-slate-300">
                {selectedMarker.subtitle || `${selectedMarker.country}`}
              </p>
              {selectedMarker.details?.items && selectedMarker.details.items.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedMarker.details.items.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-medium capitalize border border-slate-700"
                    >
                      {item.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              {selectedMarker.type === 'ngo' ? (
                <>
                  <Link
                    href={`/ngos/${encodeURIComponent(selectedMarker.id)}`}
                    className="flex-1 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/donate/individual?ngoId=${encodeURIComponent(selectedMarker.id)}`}
                    className="flex-1 py-1.5 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-semibold text-center transition"
                  >
                    Donate Here
                  </Link>
                </>
              ) : (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.coordinates[1]},${selectedMarker.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </a>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM-LEFT: LIVE ACTIVITY FEED (Matching Reference Design) */}
        <div className="absolute bottom-16 sm:bottom-14 left-3 sm:left-4 z-30 hidden md:block w-72 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-2xl text-white pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Activity Feed
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold cursor-pointer hover:underline">
              View All →
            </span>
          </div>

          <div className="space-y-2 pt-2 text-[11px]">
            <div
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.flyTo({ center: [85.32, 27.71], zoom: 6 });
                showToast('Centered on Nepal');
              }}
              className="flex items-start gap-2 cursor-pointer hover:text-emerald-400 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-white">New NGO registered in Nepal</div>
                <div className="text-[10px] text-slate-400">12 minutes ago</div>
              </div>
            </div>

            <div
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.flyTo({ center: [34.46, 31.50], zoom: 7 });
                showToast('Centered on Gaza Corridor');
              }}
              className="flex items-start gap-2 cursor-pointer hover:text-rose-400 transition"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-white">Urgent need: Medical supplies (Gaza)</div>
                <div className="text-[10px] text-slate-400">28 minutes ago</div>
              </div>
            </div>

            <div
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.flyTo({ center: [72.87, 19.07], zoom: 6 });
                showToast('Centered on Mumbai');
              }}
              className="flex items-start gap-2 cursor-pointer hover:text-blue-400 transition"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-white">500 food packets donated (Mumbai)</div>
                <div className="text-[10px] text-slate-400">1 hour ago</div>
              </div>
            </div>

            <div
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.flyTo({ center: [91.73, 26.14], zoom: 6 });
                showToast('Centered on Assam');
              }}
              className="flex items-start gap-2 cursor-pointer hover:text-amber-400 transition"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-white">Flood alert issued in Assam</div>
                <div className="text-[10px] text-slate-400">2 hours ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM-CENTER: TIMELINE PLAYBACK SCRUBBER (Matching Reference Design) */}
        {showTimelineBar && (
          <div className="absolute bottom-16 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-2xl text-white pointer-events-auto">
            {/* Play/Pause Button */}
            <button
              onClick={() => setTimelinePlaying(!timelinePlaying)}
              className="w-7 h-7 rounded-full bg-[#00A878] hover:bg-[#009167] text-white flex items-center justify-center transition"
            >
              {timelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            {/* Date Time Badge */}
            <div className="text-xs font-semibold whitespace-nowrap">
              <span>Aug 15, 2026 14:30 IST</span>
              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                ● Live
              </span>
            </div>

            {/* Scrubber slider */}
            <div className="w-48 sm:w-64 flex flex-col justify-center">
              <input
                type="range"
                min="0"
                max="100"
                value={timelineStep}
                onChange={e => setTimelineStep(Number(e.target.value))}
                className="w-full accent-[#00A878] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                <span>-72h</span>
                <span>-48h</span>
                <span>-24h</span>
                <span>-12h</span>
                <span>-6h</span>
                <span className="text-emerald-400 font-bold">Now</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Timeline event replay active')}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition whitespace-nowrap flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Show Timeline</span>
            </button>
          </div>
        )}

        {/* RIGHT MAP UTILITY RAIL: BASEMAP THUMBNAIL CARDS & ZOOM CONTROLS */}
        <div className="absolute top-14 right-3 sm:right-4 z-30 hidden md:flex flex-col items-center gap-2 pointer-events-auto">
          {/* Basemap Style Cards */}
          <div className="flex flex-col gap-1.5 p-1 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 shadow-2xl">
            {(['satellite', 'map', 'terrain', 'hybrid'] as const).map(style => (
              <button
                key={style}
                onClick={() => {
                  setCurrentBasemap(style);
                  showToast(`Basemap switched to ${style}`);
                }}
                className={`relative w-[62px] h-[36px] rounded-xl overflow-hidden border transition flex items-center justify-center text-[10px] font-bold capitalize shadow-xs ${
                  currentBasemap === style
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-emerald-500/20'
                    : 'border-white/10 text-slate-300 hover:text-white hover:border-white/30'
                }`}
              >
                <div
                  className={`absolute inset-0 opacity-75 ${
                    style === 'satellite'
                      ? 'bg-gradient-to-br from-[#0c2340] via-[#091b30] to-[#040d1a]'
                      : style === 'map'
                      ? 'bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#475569]'
                      : style === 'terrain'
                      ? 'bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d]'
                      : 'bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e]'
                  }`}
                />
                <span className="relative z-10 drop-shadow-md">{style}</span>
              </button>
            ))}
          </div>

          {/* Zoom and Locate Controls directly underneath */}
          <div className="flex flex-col gap-1 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/15 shadow-2xl">
            <button
              onClick={() => handleZoom(1)}
              title="Zoom In"
              className="p-2 rounded-lg text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-1)}
              title="Zoom Out"
              className="p-2 rounded-lg text-white hover:bg-slate-800 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleLocateMe}
              title="My Location"
              className="p-2 rounded-lg text-emerald-400 hover:bg-slate-800 transition"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM-RIGHT: INTERACTIVE MAP LEGEND (Matching Reference Design) */}
        {showLegend && (
          <div className="absolute bottom-2 right-3 sm:right-4 z-30 hidden sm:block p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-white/15 shadow-2xl text-white pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Map Legend
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Minimize Legend"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, verifiedNgo: !humanitarianLayers.verifiedNgo })}
                className="flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className={humanitarianLayers.verifiedNgo ? 'text-white' : 'line-through text-slate-500'}>Verified NGO</span>
              </div>

              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, donationCenters: !humanitarianLayers.donationCenters })}
                className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className={humanitarianLayers.donationCenters ? 'text-white' : 'line-through text-slate-500'}>Donation Center</span>
              </div>

              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, urgentNeeds: !humanitarianLayers.urgentNeeds })}
                className="flex items-center gap-2 cursor-pointer hover:text-amber-400 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className={humanitarianLayers.urgentNeeds ? 'text-white' : 'line-through text-slate-500'}>Urgent Need</span>
              </div>

              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, activeEmergencies: !humanitarianLayers.activeEmergencies })}
                className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className={humanitarianLayers.activeEmergencies ? 'text-white' : 'line-through text-slate-500'}>Active Emergency</span>
              </div>

              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, reliefRoutes: !humanitarianLayers.reliefRoutes })}
                className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition"
              >
                <span className="w-3 h-0.5 bg-cyan-400 border-dashed" />
                <span className={humanitarianLayers.reliefRoutes ? 'text-white' : 'line-through text-slate-500'}>Relief Transport Route</span>
              </div>

              <div
                onClick={() => setHumanitarianLayers({ ...humanitarianLayers, heatmap: !humanitarianLayers.heatmap })}
                className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition pt-0.5"
              >
                <span className="w-6 h-2 rounded bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500" />
                <span className={humanitarianLayers.heatmap ? 'text-white' : 'line-through text-slate-500'}>Heatmap (Needs Density)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. ACTIVE GLOBAL EMERGENCIES CAROUSEL (Matching Reference Design) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Active Global Emergencies
              </h3>
              <p className="text-xs text-slate-500">
                Verified high-priority disaster zones requiring immediate logistics coordination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/emergency"
              className="text-xs font-bold text-[#00A878] hover:underline hidden sm:inline"
            >
              View All Emergencies →
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollEmergencies('left')}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollEmergencies('right')}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Horizontal Track */}
        <div
          ref={emergencyScrollRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-2 pt-1"
        >
          {emergencies.map(em => (
            <div
              key={em.id}
              onClick={() => handleSelectEmergency(em)}
              className="flex-shrink-0 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition duration-200 cursor-pointer overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-32 overflow-hidden bg-slate-900">
                  <img
                    src={em.image}
                    alt={em.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        em.priority === 'Code Red'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : em.priority === 'High Priority'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-amber-500 text-white shadow-xs'
                      }`}
                    >
                      {em.priority}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {em.name}
                  </h4>
                  <div className="text-xs text-slate-500 font-medium">
                    {em.country}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 pt-1">
                    <span>{em.affected}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{em.activeNgosCount} NGOs Active</span>
                  </div>
                </div>
              </div>

              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {em.source || 'Verified Source'}
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
