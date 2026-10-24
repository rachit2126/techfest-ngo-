'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, MapPin, ExternalLink, RefreshCw, Layers, Globe } from 'lucide-react';
import Link from 'next/link';

interface NGOPoint {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  status: string;
  categories: string[];
  source: string;
  verifiedDate?: string;
  needsCount?: number;
}

const DEFAULT_POINTS: NGOPoint[] = [
  {
    id: 'hub_india',
    name: 'India Relief Operations Hub',
    city: 'India',
    state: '12 NGOs • Flood Relief',
    lat: 22.5,
    lng: 78.9,
    status: 'verified',
    categories: ['Flood Relief', 'Dry Rations', 'Water Purification'],
    source: 'National Disaster Management Authority (NDMA)',
    verifiedDate: 'Aug 2026',
    needsCount: 12
  },
  {
    id: 'hub_turkiye',
    name: 'Türkiye Earthquake & Emergency Hub',
    city: 'Türkiye',
    state: '3 NGOs • Urgent Needs',
    lat: 38.9,
    lng: 35.2,
    status: 'urgent',
    categories: ['Shelter & Blankets', 'First Aid', 'Hygiene Kits'],
    source: 'AFAD Emergency Disaster Coordination',
    verifiedDate: 'Sep 2026',
    needsCount: 3
  },
  {
    id: 'hub_kenya',
    name: 'Kenya Drought & Nutrition Corridor',
    city: 'Kenya',
    state: '8 NGOs • Food Supplies',
    lat: -1.29,
    lng: 36.8,
    status: 'warning',
    categories: ['Food Supplies', 'Clean Water', 'Medical Kits'],
    source: 'Kenya Red Cross Humanitarian Roster',
    verifiedDate: 'Jul 2026',
    needsCount: 8
  },
  {
    id: 'hub_seasia',
    name: 'SE Asia Coastal Emergency Hub',
    city: 'Philippines',
    state: '5 NGOs • Typhoon Relief',
    lat: 13.4,
    lng: 122.5,
    status: 'verified',
    categories: ['Typhoon Kits', 'Emergency Power'],
    source: 'NDRRMC Disaster Response',
    needsCount: 5
  }
];

export default function GlobeVisualizer({ height = 480 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<NGOPoint | null>(null);

  // Simplified country / coastline vertices relative to India focus (centered near lat 22, lng 78)
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.42;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient background
      const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.4);
      bgGrad.addColorStop(0, '#041326');
      bgGrad.addColorStop(0.7, '#020b17');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Atmosphere outer glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 148, 136, 0.12)';
      ctx.fill();
      ctx.restore();

      // Globe sphere surface
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      const globeGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      globeGrad.addColorStop(0, '#0c2646');
      globeGrad.addColorStop(0.5, '#071a32');
      globeGrad.addColorStop(1, '#030d1b');
      ctx.fillStyle = globeGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
      ctx.stroke();
      ctx.clip(); // Keep latitude/longitude inside sphere

      // Draw latitude parallels
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.16)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        const y = cy - Math.sin((lat * Math.PI) / 180) * radius;
        const rLat = Math.cos((lat * Math.PI) / 180) * radius;
        ctx.ellipse(cx, y, rLat, rLat * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw longitude meridians with rotation angle
      const rotRad = (angle * Math.PI) / 180;
      for (let lng = 0; lng < 360; lng += 30) {
        const currentLng = (lng + angle) % 360;
        const rad = (currentLng * Math.PI) / 180;
        const xOffset = Math.sin(rad) * radius;

        if (Math.cos(rad) > 0) {
          // Visible front hemisphere
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.14)';
          ctx.stroke();
        }
      }

      // Draw decorative relief connection arc between New Delhi and Guwahati (Flood relief line)
      const pDelhi = projectCoord(28.5355, 77.2610, angle, radius, cx, cy);
      const pGuwahati = projectCoord(26.1445, 91.7362, angle, radius, cx, cy);

      if (pDelhi.visible && pGuwahati.visible) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pDelhi.x, pDelhi.y);
        const midX = (pDelhi.x + pGuwahati.x) / 2;
        const midY = (pDelhi.y + pGuwahati.y) / 2 - 40;
        ctx.quadraticCurveTo(midX, midY, pGuwahati.x, pGuwahati.y);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)'; // Orange relief arc
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // Draw NGO pins with styled pill badges matching screenshot
      DEFAULT_POINTS.forEach(pt => {
        const proj = projectCoord(pt.lat, pt.lng, angle, radius, cx, cy);
        if (proj.visible) {
          const isSelected = selectedPoint?.id === pt.id;

          // Glowing pin dot
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, isSelected ? 8 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = pt.status === 'urgent' ? '#f43f5e' : pt.status === 'warning' ? '#f59e0b' : '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Outer pulse
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, isSelected ? 14 : 9, 0, Math.PI * 2);
          ctx.fillStyle = pt.status === 'urgent'
            ? 'rgba(244, 63, 94, 0.25)'
            : pt.status === 'warning'
            ? 'rgba(245, 158, 11, 0.25)'
            : 'rgba(16, 185, 129, 0.25)';
          ctx.fill();

          // Pill Badge Box
          const pillW = 100;
          const pillH = 26;
          const pillX = proj.x + 8;
          const pillY = proj.y - 13;

          // Background pill
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 6);
          ctx.fillStyle = pt.status === 'urgent'
            ? 'rgba(159, 18, 57, 0.92)'
            : pt.status === 'warning'
            ? 'rgba(146, 64, 14, 0.92)'
            : 'rgba(6, 95, 70, 0.92)';
          ctx.fill();
          ctx.strokeStyle = pt.status === 'urgent'
            ? 'rgba(244, 63, 94, 0.6)'
            : pt.status === 'warning'
            ? 'rgba(245, 158, 11, 0.6)'
            : 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Pill Text
          ctx.font = 'bold 9px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          const icon = pt.status === 'urgent' ? '▲ ' : pt.status === 'warning' ? '▲ ' : '✓ ';
          ctx.fillText(icon + pt.city, pillX + 6, pillY + 11);

          ctx.font = '8px Inter, system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillText(pt.state, pillX + 6, pillY + 21);
        }
      });

      ctx.restore();

      if (isRotating) {
        angle = (angle + 0.35) % 360;
        setRotation(Math.round(angle));
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRotating, selectedPoint]);

  // Coordinate projection helper
  function projectCoord(lat: number, lng: number, angle: number, radius: number, cx: number, cy: number) {
    // Center view near India longitude (~78 deg)
    const adjustedLng = (lng - 78 + angle) % 360;
    const phi = (lat * Math.PI) / 180;
    const theta = (adjustedLng * Math.PI) / 180;

    const visible = Math.cos(theta) > -0.2; // Front visible hemisphere

    const x = cx + radius * Math.cos(phi) * Math.sin(theta);
    const y = cy - radius * Math.sin(phi);

    return { x, y, visible };
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const radius = Math.min(canvas.width, canvas.height) * 0.42;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Check hit against points
    for (const pt of DEFAULT_POINTS) {
      const proj = projectCoord(pt.lat, pt.lng, rotation, radius, cx, cy);
      if (proj.visible) {
        const dist = Math.hypot(clickX - proj.x, clickY - proj.y);
        if (dist <= 18) {
          setSelectedPoint(pt);
          setIsRotating(false);
          return;
        }
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col items-center">
      {/* Globe Top Bar matching reference screenshot */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
        {/* Globe View / Map View Toggle Pill */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-full p-1 border border-slate-700/80 pointer-events-auto shadow-lg text-[11px] font-bold">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-3 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            Globe View
          </button>
          <Link
            href="/explore"
            className="px-3 py-1 rounded-full text-slate-300 hover:text-white transition"
          >
            Map View
          </Link>
        </div>

        {/* Fullscreen / Expand square icon on right */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            href="/explore"
            className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center"
            title="Expand Full Screen Geospatial Map"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={760}
        height={height}
        onClick={handleCanvasClick}
        className="w-full max-w-[760px] cursor-pointer"
        style={{ height: `${height}px` }}
      />

      {/* Selected NGO Profile Modal / Card Overlay */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-slate-200 z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {selectedPoint.status === 'verified' ? 'Verified Partner Hub' : 'In Verification Review'}
              </span>
              <h4 className="font-semibold text-slate-900 text-sm mt-1">{selectedPoint.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {selectedPoint.city}, {selectedPoint.state}
              </p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Active Relief Needs:</span>
              <span className="font-semibold text-teal-700">{selectedPoint.needsCount} open requests</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Data Provenance:</span>
              <span className="font-medium text-slate-800 text-[11px] truncate max-w-[190px]">{selectedPoint.source}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between gap-2">
            <Link
              href={`/explore?q=${encodeURIComponent(selectedPoint.city)}`}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
            >
              View Full Profile & Needs <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/donate/individual"
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Donate Here
            </Link>
          </div>
        </div>
      )}

      {/* Legend footnote */}
      <div className="w-full bg-slate-900/90 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Verified NGO Hub
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> In Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-orange-500 inline-block" /> Active Disaster Priority Arc
          </span>
        </div>
        <span className="text-slate-500">Privacy Safeguard: Service-area centroids shown; exact private depots protected.</span>
      </div>
    </div>
  );
}
