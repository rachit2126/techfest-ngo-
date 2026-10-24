'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import {
  Filter,
  Layers,
  Bell,
  HelpCircle,
  Lightbulb,
  Share2,
  BarChart3,
  Globe,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Package,
  AlertTriangle,
  Heart,
  Droplets,
  Building2,
  Sparkles,
  MapPin,
  CheckCircle2,
  Navigation,
  Send,
  Copy,
  Info
} from 'lucide-react';
import { GlobalProblem } from '@/app/api/problems/route';
import { SolutionMatch } from '@/app/api/solutions/route';

interface RealisticGlobeDashboardProps {
  ngos?: any[];
  selectedNgoId?: string | null;
  onSelectNgo?: (id: string) => void;
  onNavigateToDirectory?: (region?: string) => void;
}

interface GlobeLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'ngo' | 'emergency' | 'donation' | 'need' | 'cluster';
  count?: number;
  severity?: 'critical' | 'high' | 'medium';
  priority?: string;
  affected?: string;
  activeNgosCount?: number;
  subtitle?: string;
}

const GLOBE_LOCATIONS: GlobeLocation[] = [
  // Clusters
  { id: 'cluster_india', name: 'South Asia Relief Hub', country: 'India', lat: 21.5, lng: 79.0, type: 'cluster', count: 24, subtitle: '24 Operational Depots & Water Hubs' },
  { id: 'cluster_turkiye', name: 'Anatolian Emergency Cluster', country: 'Türkiye', lat: 38.0, lng: 36.5, type: 'cluster', count: 15, subtitle: '15 Winterized Camps & Triage Units' },
  { id: 'cluster_kenya', name: 'Horn of Africa Nutrition Network', country: 'Kenya', lat: 1.0, lng: 37.0, type: 'cluster', count: 18, subtitle: '18 Food Distribution Corridors' },
  { id: 'cluster_na', name: 'North America Logistics Stockpile', country: 'United States', lat: 39.5, lng: -98.0, type: 'cluster', count: 12, subtitle: '12 Strategic Consignment Centers' },
  { id: 'cluster_asia', name: 'Central Asia Resource Depot', country: 'Central Asia', lat: 35.0, lng: 104.0, type: 'cluster', count: 10, subtitle: '10 Strategic Medical Depots' },
  { id: 'cluster_sa', name: 'South America Disaster Response', country: 'Brazil', lat: -14.0, lng: -55.0, type: 'cluster', count: 8, subtitle: '8 Displaced Inundation Centers' },

  // Active Emergencies
  { id: 'em_assam', name: 'Assam Flood Inundation', country: 'India', lat: 26.14, lng: 91.73, type: 'emergency', severity: 'high', priority: 'High Priority', affected: '25,000+ People Displaced', activeNgosCount: 12 },
  { id: 'em_turkiye', name: 'Hatay Earthquake Recovery', country: 'Türkiye', lat: 36.80, lng: 36.20, type: 'emergency', severity: 'critical', priority: 'Code Red', affected: '1.2M People Affected', activeNgosCount: 15 },
  { id: 'em_kenya', name: 'Turkana Drought Crisis', country: 'Kenya', lat: 3.11, lng: 35.59, type: 'emergency', severity: 'critical', priority: 'Code Red', affected: '320,000 People Affected', activeNgosCount: 8 },
  { id: 'em_gaza', name: 'Gaza Medical Consignment Sector', country: 'Gaza', lat: 31.50, lng: 34.46, type: 'emergency', severity: 'critical', priority: 'Code Red', affected: '1.7M People Affected', activeNgosCount: 18 },
  { id: 'em_philippines', name: 'Luzon Typhoon Response', country: 'Philippines', lat: 14.60, lng: 120.98, type: 'emergency', severity: 'medium', priority: 'Medium Priority', affected: '280,000 People Affected', activeNgosCount: 10 },

  // Verified NGOs
  { id: 'ngo_paris', name: 'Médecins Humanitaires Europe', country: 'France', lat: 48.85, lng: 2.35, type: 'ngo', subtitle: 'Paris Global Dispatch Hub' },
  { id: 'ngo_japan', name: 'Nippon Humanitarian Logistics', country: 'Japan', lat: 35.68, lng: 139.69, type: 'ngo', subtitle: 'Tokyo Seaport Crisis Center' },
  { id: 'ngo_sydney', name: 'Australian Disaster Volunteers', country: 'Australia', lat: -33.86, lng: 151.20, type: 'ngo', subtitle: 'Sydney Southern Marine Base' },
  { id: 'ngo_california', name: 'West Coast Disaster Network', country: 'United States', lat: 37.77, lng: -122.41, type: 'ngo', subtitle: 'San Francisco Marine Staging' },
  { id: 'ngo_nigeria', name: 'West Africa Emergency Coalition', country: 'Nigeria', lat: 9.08, lng: 7.49, type: 'ngo', subtitle: 'Abuja Federal Relief Depot' }
];

interface FlightRoute {
  id: string;
  name: string;
  from: [number, number]; // [lat, lng]
  to: [number, number];
  type: 'air' | 'sea' | 'land';
  color: string;
  cargo: string;
}

const HUMANITARIAN_FLIGHTS: FlightRoute[] = [
  { id: 'f_1', name: 'Transatlantic Medical Airlift', from: [40.7, -74.0], to: [48.85, 2.35], type: 'air', color: '#38BDF8', cargo: 'Surgical Kits & Antibiotics' },
  { id: 'f_2', name: 'South Asia Relief Air Bridge', from: [28.61, 77.20], to: [26.14, 91.73], type: 'air', color: '#10B981', cargo: 'Flood Boats & Water Filters' },
  { id: 'f_3', name: 'Anatolian Emergency Air Corridor', from: [50.11, 8.68], to: [36.80, 36.20], type: 'air', color: '#F59E0B', cargo: 'Thermal Tents & Mobile Heaters' },
  { id: 'f_4', name: 'Horn of Africa Nutrition Bridge', from: [-1.28, 36.85], to: [3.11, 35.59], type: 'land', color: '#F97316', cargo: 'Fortified Flour & Electrolytes' },
  { id: 'f_5', name: 'Pacific Island Disaster Sealift', from: [-33.86, 151.20], to: [14.60, 120.98], type: 'sea', color: '#06B6D4', cargo: 'Desalination Units' },
  { id: 'f_6', name: 'Mediterranean Maritime Consignment', from: [41.90, 12.50], to: [31.50, 34.46], type: 'sea', color: '#EF4444', cargo: 'Trauma First Aid Packages' }
];

export default function RealisticGlobeDashboard({
  ngos = [],
  selectedNgoId,
  onSelectNgo,
  onNavigateToDirectory
}: RealisticGlobeDashboardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const routesGroupRef = useRef<THREE.Group | null>(null);
  const transportsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction State
  const [activeSideDrawer, setActiveSideDrawer] = useState<'filters' | 'layers' | 'alerts' | 'problems' | 'solutions' | 'share' | 'analytics' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GlobeLocation>(GLOBE_LOCATIONS[0]);
  const [selectedRegionName, setSelectedRegionName] = useState('India');
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Problems & Solutions Data
  const [problems, setProblems] = useState<GlobalProblem[]>([]);
  const [solutions, setSolutions] = useState<SolutionMatch[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<GlobalProblem | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<SolutionMatch | null>(null);

  // Layers State
  const [layersState, setLayersState] = useState({
    verifiedNgo: true,
    emergencies: true,
    donationCenters: true,
    transportRoutes: true,
    atmosphereGlow: true,
    clouds: true
  });

  // Alerts State
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Convert lat/lng to Vector3 on sphere of given radius
  const latLngToVector3 = (lat: number, lng: number, radius = 100): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Fetch Problems and Solutions
  useEffect(() => {
    async function loadData() {
      try {
        const [probRes, solRes] = await Promise.all([
          fetch('/api/problems'),
          fetch('/api/solutions')
        ]);
        if (probRes.ok) {
          const pData = await probRes.json();
          if (pData.problems) {
            setProblems(pData.problems);
            setSelectedProblem(pData.problems[0]);
          }
        }
        if (solRes.ok) {
          const sData = await solRes.json();
          if (sData.solutions) {
            setSolutions(sData.solutions);
            setSelectedSolution(sData.solutions[0]);
          }
        }
      } catch (err) {
        console.warn('Fallback data for problems/solutions:', err);
      }
    }
    loadData();
  }, []);

  // Three.js Photorealistic 3D Earth Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 640;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 40, 290);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Earth Group (Rotates as a single astronomical unit)
    const earthGroup = new THREE.Group();
    // Default tilt towards India / Europe for initial composition
    earthGroup.rotation.y = 2.4;
    earthGroup.rotation.x = 0.25;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. Photorealistic Earth Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/earth_day.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const earthGeo = new THREE.SphereGeometry(100, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTexture,
      shininess: 12,
      specular: new THREE.Color(0x224466)
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 5. Cloud Layer
    const cloudsTexture = textureLoader.load('/earth_clouds.png');
    const cloudsGeo = new THREE.SphereGeometry(101.4, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);
    cloudsRef.current = cloudsMesh;

    // 6. Atmospheric Rim Glow Shader (Fresnel back-side rim)
    const atmosphereGeo = new THREE.SphereGeometry(104.5, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.6);
          gl_FragColor = vec4(0.12, 0.65, 0.98, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // 7. Starfield Background (1,500 twinkling points)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1400;
      starPositions[i + 1] = (Math.random() - 0.5) * 1400;
      starPositions[i + 2] = -300 - Math.random() * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 1.5, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 8. Lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(200, 100, 150);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x1e3a8a, 0.9);
    scene.add(ambientLight);

    // 9. 3D Great-Circle Curved Routes Group
    const routesGroup = new THREE.Group();
    earthGroup.add(routesGroup);
    routesGroupRef.current = routesGroup;

    // 10. Markers & Transports Groups
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const transportsGroup = new THREE.Group();
    earthGroup.add(transportsGroup);
    transportsGroupRef.current = transportsGroup;

    // Render Routes
    HUMANITARIAN_FLIGHTS.forEach(flight => {
      const p1 = latLngToVector3(flight.from[0], flight.from[1], 100.5);
      const p2 = latLngToVector3(flight.to[0], flight.to[1], 100.5);

      // Slerp or calculate mid control point above sphere
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(100.5 + distance * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(flight.color),
        dashSize: 3,
        gapSize: 2,
        linewidth: 2,
        transparent: true,
        opacity: 0.85
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      routesGroup.add(line);
    });

    // Render Markers & Cluster Badges
    GLOBE_LOCATIONS.forEach(loc => {
      const pos = latLngToVector3(loc.lat, loc.lng, 101.2);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.lookAt(pos.clone().multiplyScalar(2));

      // Color by type
      const colorHex = loc.type === 'cluster'
        ? (loc.count && loc.count >= 20 ? 0xef4444 : loc.count && loc.count >= 15 ? 0xf59e0b : 0x3b82f6)
        : loc.type === 'emergency' ? 0xef4444
        : loc.type === 'ngo' ? 0x10b981
        : 0x3b82f6;

      // Base Circle
      const radius = loc.type === 'cluster' ? 3.8 : 2.5;
      const circleGeo = new THREE.CircleGeometry(radius, 24);
      const circleMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(circleGeo, circleMat);
      markerGroup.add(circle);

      // Subtle Outer Ring
      const ringGeo = new THREE.RingGeometry(radius + 0.6, radius + 1.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      markerGroup.add(ring);

      markerGroup.userData = loc;
      markersGroup.add(markerGroup);
    });

    // 11. Mouse Drag & Touch Rotation Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = earthGroup.rotation.y;
    let targetRotationX = earthGroup.rotation.x;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.8, Math.min(0.8, targetRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Zoom on Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.15;
      camera.position.z = Math.max(190, Math.min(420, camera.position.z));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 12. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Idle auto-rotation if not dragging
      if (!isDragging && isLiveActive) {
        targetRotationY += 0.0012;
      }

      // Smooth damping
      earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * 0.08;
      earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * 0.08;

      // Rotate cloud layer relative to Earth for atmospheric realism
      if (cloudsMesh) {
        cloudsMesh.rotation.y += 0.0004;
      }

      // Update Animated Airplanes and Ships along geodetic curves
      // Clear previous transports
      while (transportsGroup.children.length > 0) {
        transportsGroup.remove(transportsGroup.children[0]);
      }

      HUMANITARIAN_FLIGHTS.forEach((flight, idx) => {
        const p1 = latLngToVector3(flight.from[0], flight.from[1], 100.5);
        const p2 = latLngToVector3(flight.to[0], flight.to[1], 100.5);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const distance = p1.distanceTo(p2);
        mid.normalize().multiplyScalar(100.5 + distance * 0.28);

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const t = (elapsed * 0.18 + idx * 0.25) % 1.0;
        const curPoint = curve.getPoint(t);
        const tangent = curve.getTangent(t);

        // Airplane / Ship Mesh
        const transGeo = flight.type === 'sea'
          ? new THREE.BoxGeometry(2.8, 1.2, 1.6)
          : new THREE.ConeGeometry(1.6, 4.2, 4);

        const transMat = new THREE.MeshBasicMaterial({
          color: flight.type === 'sea' ? 0x06b6d4 : 0xffffff
        });
        const transMesh = new THREE.Mesh(transGeo, transMat);
        transMesh.position.copy(curPoint);
        transMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        transportsGroup.add(transMesh);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isLiveActive]);

  // Focus Earth on Region or Emergency
  const focusRegion = (lat: number, lng: number, regionTitle: string) => {
    setSelectedRegionName(regionTitle);
    if (!earthGroupRef.current) return;
    // Calculate rotation angles to bring lat/lng to front facing camera (0, 0, 1)
    const targetY = -(lng * (Math.PI / 180)) - Math.PI / 2;
    const targetX = lat * (Math.PI / 180) * 0.5;

    earthGroupRef.current.rotation.y = targetY;
    earthGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, targetX));
    showToast(`Focused 3D Earth on ${regionTitle}`);
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Timeline scrubber timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timelinePlaying) {
      interval = setInterval(() => {
        setTimelineStep(prev => (prev >= 100 ? 0 : prev + 4));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [timelinePlaying]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#020817] border border-cyan-950/80 shadow-[0_20px_50px_rgba(3,11,28,0.9)] text-white select-none">
      {/* 1. 3D WEBGL EARTH CANVAS MOUNT */}
      <div
        ref={mountRef}
        className="relative w-full h-[640px] sm:h-[720px] lg:h-[760px] cursor-grab active:cursor-grabbing overflow-hidden"
      />

      {/* 2. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-2xl border border-cyan-500/40 animate-in fade-in duration-200 backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* 3. LEFT FLOATING CONTROL RAIL (Filters, Layers, Alerts, Problems, Solutions, Share, Analytics) */}
      <div className="absolute top-16 left-3 sm:left-4 z-30 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-2xl p-1.5 border border-cyan-500/20 shadow-2xl divide-y divide-slate-800 text-[11px] font-semibold text-slate-300">
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
              activeSideDrawer === 'layers' ? 'bg-cyan-500/30 text-cyan-400' : 'hover:text-white hover:bg-slate-800/60'
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
              activeSideDrawer === 'alerts' ? 'bg-rose-500/30 text-rose-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Alerts Center"
          >
            <Bell className="w-4 h-4" />
            <span className="text-[9px]">Alerts</span>
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
              6
            </span>
          </button>

          {/* NEW: Global Problems */}
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === 'problems' ? null : 'problems')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeSideDrawer === 'problems' ? 'bg-amber-500/30 text-amber-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Global Problems"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[9px]">Problems</span>
          </button>

          {/* NEW: Solutions & Resource Matching */}
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === 'solutions' ? null : 'solutions')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeSideDrawer === 'solutions' ? 'bg-purple-500/30 text-purple-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Solutions Matching"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-[9px]">Solutions</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === 'share' ? null : 'share')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeSideDrawer === 'share' ? 'bg-blue-500/30 text-blue-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Share View"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[9px]">Share</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === 'analytics' ? null : 'analytics')}
            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeSideDrawer === 'analytics' ? 'bg-teal-500/30 text-teal-400' : 'hover:text-white hover:bg-slate-800/60'
            }`}
            title="Live Telemetry"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[9px]">Analytics</span>
          </button>
        </div>
      </div>

      {/* 4. UPPER-LEFT FLOATING CARD: "LIVE NGO NETWORK" (Matching Reference Design) */}
      <div className="absolute top-16 left-20 z-20 hidden md:block w-64 p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Live NGO Network
          </span>
        </div>

        <div className="space-y-2 pt-2.5">
          {/* Item 1: Verified NGOs */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">12,450+</div>
                <div className="text-[9px] text-slate-400">Verified NGOs</div>
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold font-mono">
              +12%
            </div>
          </div>

          {/* Item 2: Countries Covered */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">180+</div>
                <div className="text-[9px] text-slate-400">Countries Covered</div>
              </div>
            </div>
            <div className="text-[10px] text-blue-400 font-bold font-mono">
              +5 new
            </div>
          </div>

          {/* Item 3: Resources Addressed */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">560T</div>
                <div className="text-[9px] text-slate-400">Resources Addressed</div>
              </div>
            </div>
            <div className="text-[10px] text-teal-400 font-bold font-mono">
              +18%
            </div>
          </div>

          {/* Item 4: People Supported */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">4.2M+</div>
                <div className="text-[9px] text-slate-400">People Supported</div>
              </div>
            </div>
            <div className="text-[10px] text-purple-400 font-bold font-mono">
              +22%
            </div>
          </div>
        </div>
      </div>

      {/* 5. LOWER-LEFT FLOATING CARD: "LIVE ACTIVITY FEED" */}
      <div className="absolute bottom-16 sm:bottom-14 left-20 z-20 hidden lg:block w-72 p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Activity Feed
          </span>
          <span className="text-[10px] text-cyan-400 font-semibold cursor-pointer hover:underline">
            View All →
          </span>
        </div>

        <div className="space-y-2 pt-2 text-[11px]">
          <div
            onClick={() => focusRegion(27.71, 85.32, 'Nepal')}
            className="flex items-start gap-2 cursor-pointer hover:text-emerald-400 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-white">New NGO registered in Nepal</div>
              <div className="text-[10px] text-slate-400">12 minutes ago</div>
            </div>
          </div>

          <div
            onClick={() => focusRegion(31.50, 34.46, 'Gaza')}
            className="flex items-start gap-2 cursor-pointer hover:text-rose-400 transition"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-white">Medical supplies needed in Gaza</div>
              <div className="text-[10px] text-slate-400">28 minutes ago</div>
            </div>
          </div>

          <div
            onClick={() => focusRegion(19.07, 72.87, 'Mumbai')}
            className="flex items-start gap-2 cursor-pointer hover:text-blue-400 transition"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-white">500 food packets donated (Mumbai)</div>
              <div className="text-[10px] text-slate-400">1 hour ago</div>
            </div>
          </div>

          <div
            onClick={() => focusRegion(26.14, 91.73, 'Assam')}
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

      {/* 6. TOP-RIGHT CONTROLS: REAL-TIME TOGGLE + SCOPE SELECTOR + FULLSCREEN */}
      <div className="absolute top-3 right-3 sm:right-4 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Real-time Data Switch */}
        <button
          onClick={() => {
            setIsLiveActive(!isLiveActive);
            showToast(isLiveActive ? 'Live orbit simulation paused' : 'Live real-time telemetry active');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-bold shadow-xl transition ${
            isLiveActive
              ? 'bg-slate-900/85 border-emerald-500/50 text-white'
              : 'bg-slate-900/60 border-slate-700 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>Real-time Data</span>
        </button>

        {/* Global / Continent Dropdown */}
        <select
          value={selectedRegionName}
          onChange={e => {
            const v = e.target.value;
            if (v === 'India') focusRegion(21.5, 79.0, 'India');
            else if (v === 'Türkiye') focusRegion(38.0, 36.5, 'Türkiye');
            else if (v === 'Kenya') focusRegion(1.0, 37.0, 'Kenya');
            else if (v === 'Asia') focusRegion(30.0, 90.0, 'Asia');
            else if (v === 'Europe') focusRegion(48.0, 15.0, 'Europe');
            else if (v === 'Africa') focusRegion(2.0, 25.0, 'Africa');
            else if (v === 'North America') focusRegion(38.0, -97.0, 'North America');
            else if (v === 'South America') focusRegion(-15.0, -55.0, 'South America');
            else if (v === 'Australia') focusRegion(-25.0, 134.0, 'Australia');
            else focusRegion(20, 0, 'Global');
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/20 text-white text-xs font-semibold shadow-xl focus:outline-none cursor-pointer"
        >
          <option value="Global">Global ▾</option>
          <option value="India">India</option>
          <option value="Türkiye">Türkiye</option>
          <option value="Kenya">Kenya</option>
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
          className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/20 text-white hover:bg-slate-800 transition shadow-xl"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 7. UPPER-RIGHT FLOATING CARD: "SELECTED REGION" */}
      <div className="absolute top-16 right-3 sm:right-4 z-20 hidden md:block w-72 p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Selected Region</div>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>{selectedRegionName}</span>
            </div>
          </div>
          <div className="w-10 h-7 rounded-lg overflow-hidden bg-slate-800 border border-white/10">
            <img src="/emergency_rescue.jpg" alt={selectedRegionName} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Region Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 py-2.5 text-center">
          <div className="p-1.5 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="text-xs font-black text-emerald-400">12</div>
            <div className="text-[8px] text-slate-400">Active NGOs</div>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="text-xs font-black text-rose-400">3</div>
            <div className="text-[8px] text-slate-400">Emergencies</div>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="text-xs font-black text-amber-400">5</div>
            <div className="text-[8px] text-slate-400">Urgent Needs</div>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="text-xs font-black text-cyan-400">2.4M</div>
            <div className="text-[8px] text-slate-400">Affected</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              if (onNavigateToDirectory) onNavigateToDirectory(selectedRegionName);
              showToast(`Showing verified directory for ${selectedRegionName}`);
            }}
            className="py-1.5 px-2 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-[10px] font-bold transition shadow-xs text-center"
          >
            View NGOs in Region
          </button>
          <button
            onClick={() => setActiveSideDrawer('problems')}
            className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition border border-slate-700 text-center"
          >
            View Details
          </button>
        </div>
      </div>

      {/* 8. LOWER-RIGHT FLOATING CARD: "CURRENT GLOBAL PROBLEMS" */}
      <div className="absolute bottom-16 sm:bottom-14 right-3 sm:right-4 z-20 hidden md:block w-72 p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            Current Global Problems
          </span>
          <span
            onClick={() => setActiveSideDrawer('problems')}
            className="text-[10px] text-cyan-400 font-semibold cursor-pointer hover:underline"
          >
            View All →
          </span>
        </div>

        <div className="space-y-1.5 pt-2 text-xs">
          {/* Problem 1 */}
          <div
            onClick={() => {
              setActiveSideDrawer('problems');
              focusRegion(3.11, 35.59, 'Kenya');
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                🍞
              </span>
              <span className="text-[11px] font-semibold text-white group-hover:text-amber-400">Food Shortage</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>23 regions</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Problem 2 */}
          <div
            onClick={() => {
              setActiveSideDrawer('problems');
              focusRegion(31.50, 34.46, 'Gaza');
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">
                🏥
              </span>
              <span className="text-[11px] font-semibold text-white group-hover:text-rose-400">Medical Supplies</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>17 regions</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Problem 3 */}
          <div
            onClick={() => {
              setActiveSideDrawer('problems');
              focusRegion(26.14, 91.73, 'Assam');
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                💧
              </span>
              <span className="text-[11px] font-semibold text-white group-hover:text-cyan-400">Clean Water Access</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>14 regions</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Problem 4 */}
          <div
            onClick={() => {
              setActiveSideDrawer('problems');
              focusRegion(36.80, 36.20, 'Türkiye');
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">
                🏠
              </span>
              <span className="text-[11px] font-semibold text-white group-hover:text-purple-400">Shelter & Housing</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>11 regions</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Problem 5 */}
          <div
            onClick={() => {
              setActiveSideDrawer('problems');
              focusRegion(14.60, 120.98, 'Philippines');
            }}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                🛡️
              </span>
              <span className="text-[11px] font-semibold text-white group-hover:text-emerald-400">Child Protection</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>9 regions</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 9. BOTTOM-CENTER: TIMELINE PLAYBACK SCRUBBER */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/20 shadow-2xl pointer-events-auto">
        <button
          onClick={() => setTimelinePlaying(!timelinePlaying)}
          className="w-7 h-7 rounded-full bg-[#00A878] hover:bg-[#009167] text-white flex items-center justify-center transition"
        >
          {timelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <div className="text-xs font-semibold whitespace-nowrap">
          <span>Aug 15, 2026 14:30 IST</span>
          <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
            ● Live
          </span>
        </div>

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
            <span className="text-emerald-400 font-bold">Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+72h</span>
          </div>
        </div>

        <button
          onClick={() => showToast('Timeline event replay synchronized with 3D Earth')}
          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition whitespace-nowrap flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Show Timeline</span>
        </button>
      </div>

      {/* 10. NEW DRAWER: GLOBAL PROBLEMS DRAWER */}
      {activeSideDrawer === 'problems' && (
        <div className="absolute top-16 left-20 z-40 w-80 sm:w-96 max-h-[580px] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-5 border border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-150 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Global Humanitarian Problems</h3>
            </div>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Identified humanitarian deficits categorized by urgency, requiring resource staging and verified NGO coordination.
          </p>

          <div className="space-y-3">
            {problems.map(prob => (
              <div
                key={prob.id}
                onClick={() => {
                  setSelectedProblem(prob);
                  focusRegion(prob.coordinates[1], prob.coordinates[0], prob.country);
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  selectedProblem?.id === prob.id
                    ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/20'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-snug">{prob.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                    prob.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {prob.priority}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{prob.region}, {prob.country}</span>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 line-clamp-2">
                  {prob.description}
                </p>

                <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{prob.affectedPeopleCount.toLocaleString()} affected</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSideDrawer('solutions');
                      showToast(`Matching relief solutions for ${prob.country}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 transition"
                  >
                    Match Solutions →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. NEW DRAWER: SOLUTIONS & RESOURCE MATCHING DRAWER */}
      {activeSideDrawer === 'solutions' && (
        <div className="absolute top-16 left-20 z-40 w-80 sm:w-96 max-h-[580px] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-5 border border-purple-500/30 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-150 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Solutions & Resource Matching</h3>
            </div>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Algorithmic resource allocation connecting staged donations, donor transit centers, and verified NGOs.
          </p>

          <div className="space-y-3.5">
            {solutions.map(sol => (
              <div
                key={sol.id}
                onClick={() => {
                  setSelectedSolution(sol);
                  focusRegion(sol.coordinates.destination[1], sol.coordinates.destination[0], sol.matchedNgo.country);
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                  selectedSolution?.id === sol.id
                    ? 'bg-purple-500/10 border-purple-500/60 ring-2 ring-purple-500/20'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-white">{sol.problemTitle}</div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono shrink-0">
                    {sol.fulfillmentPercentage}% Matched
                  </span>
                </div>

                <div className="text-[11px] p-2 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="text-slate-400">Responding Verified NGO:</div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{sol.matchedNgo.name}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Explainable AI Reason:
                  </div>
                  <p className="leading-relaxed text-slate-300">{sol.aiRecommendationReason}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">{sol.stagingHub.distanceKm} km transit</span>
                  <Link
                    href={`/donate/individual?ngoId=${encodeURIComponent(sol.matchedNgo.id)}`}
                    className="px-3 py-1.5 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold transition shadow-xs"
                  >
                    Fulfill Solution
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. LAYERS DRAWER */}
      {activeSideDrawer === 'layers' && (
        <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-4 border border-cyan-500/20 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3D Globe Layers
            </span>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Verified NGOs</span>
              </span>
              <input
                type="checkbox"
                checked={layersState.verifiedNgo}
                onChange={e => setLayersState({ ...layersState, verifiedNgo: e.target.checked })}
                className="accent-[#00A878] w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Active Emergencies</span>
              </span>
              <input
                type="checkbox"
                checked={layersState.emergencies}
                onChange={e => setLayersState({ ...layersState, emergencies: e.target.checked })}
                className="accent-[#00A878] w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Donation Depots</span>
              </span>
              <input
                type="checkbox"
                checked={layersState.donationCenters}
                onChange={e => setLayersState({ ...layersState, donationCenters: e.target.checked })}
                className="accent-[#00A878] w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>Air & Sea Transport Routes</span>
              </span>
              <input
                type="checkbox"
                checked={layersState.transportRoutes}
                onChange={e => setLayersState({ ...layersState, transportRoutes: e.target.checked })}
                className="accent-[#00A878] w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Atmospheric Glow Rim</span>
              </span>
              <input
                type="checkbox"
                checked={layersState.atmosphereGlow}
                onChange={e => setLayersState({ ...layersState, atmosphereGlow: e.target.checked })}
                className="accent-[#00A878] w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* 13. ALERTS DRAWER */}
      {activeSideDrawer === 'alerts' && (
        <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-4 border border-rose-500/30 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Emergency Alerts Center
            </span>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {GLOBE_LOCATIONS.filter(l => l.type === 'emergency').map(em => (
              <div
                key={em.id}
                onClick={() => focusRegion(em.lat, em.lng, em.country)}
                className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-rose-500/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white text-xs">{em.name}</div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-400 font-bold">
                    {em.priority}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{em.country} • {em.affected}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. SHARE MODAL */}
      {activeSideDrawer === 'share' && (
        <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-4 border border-blue-500/30 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Share 3D Globe View
            </span>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Share the active 3D planetary dispatch telemetry, active routes, and relief coordinates.
          </p>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('3D Globe link copied to clipboard!');
              }
            }}
            className="w-full py-2.5 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Copy className="w-4 h-4" /> Copy Coordinates URL
          </button>
        </div>
      )}

      {/* 15. ANALYTICS DRAWER */}
      {activeSideDrawer === 'analytics' && (
        <div className="absolute top-16 left-20 z-40 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-4 border border-teal-500/30 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-left-4 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Planetary Telemetry
            </span>
            <button onClick={() => setActiveSideDrawer(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-sm font-extrabold text-emerald-400">12,450+</div>
              <div className="text-[9px] text-slate-400">Verified Hubs</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-sm font-extrabold text-blue-400">6 Flights</div>
              <div className="text-[9px] text-slate-400">Air Consignments</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-sm font-extrabold text-purple-400">94.2%</div>
              <div className="text-[9px] text-slate-400">Match Efficiency</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-sm font-extrabold text-amber-400">3.4 hrs</div>
              <div className="text-[9px] text-slate-400">Avg Turnaround</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
