'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  Package,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Calendar,
  Truck,
  ExternalLink,
  Share2,
  Clock,
  AlertTriangle,
  Building2,
  HeartHandshake
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

function NGOProfileContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ngo, setNgo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadNGO() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ngos/${encodeURIComponent(id)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Organisation not found in the verified registry.');
          } else {
            setError('Failed to load organisation profile.');
          }
          return;
        }
        const data = await res.json();
        setNgo(data.organisation);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    }

    loadNGO();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ngo) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Organisation Not Found</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          {error || 'The requested NGO profile does not exist or has not been approved for public registry listing.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Explore NGOs
          </Link>
        </div>
      </div>
    );
  }

  const coords = ngo.serviceArea?.coordinates || [28.6139, 77.2090];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-slate-900 transition">Explore NGOs</Link>
            <span>/</span>
            <span className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-sm">
              {ngo.legalName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share Hub'}</span>
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Main NGO Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
            <img
              src={ngo.publicProfile?.imageUrl || '/hero_volunteer.jpg'}
              alt={ngo.legalName}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Relief Hub
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 -mt-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Statutory Hub
                  </span>
                  {ngo.verificationDate && (
                    <span className="text-xs text-slate-400">
                      Audit: {new Date(ngo.verificationDate).toLocaleDateString()}
                    </span>
                  )}
                  {ngo.registrationNumber && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">
                      Reg: {ngo.registrationNumber}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {ngo.legalName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      {ngo.serviceArea.city}, {ngo.serviceArea.state}, {ngo.serviceArea.country}
                    </span>
                  </div>
                  {ngo.publicProfile?.website && (
                    <a
                      href={ngo.publicProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action CTA */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href={`/donate/individual?ngoId=${encodeURIComponent(ngo.id)}`}
                  className="px-6 py-3 rounded-2xl bg-[#00A878] hover:bg-[#009167] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Donate to this Hub</span>
                </Link>
                {ngo.publicProfile?.contactEmail && (
                  <a
                    href={`mailto:${ngo.publicProfile.contactEmail}`}
                    className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Contact Hub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    About This Organization
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {ngo.publicProfile?.description}
                  </p>
                </div>

                {/* Storage & Logistics Capability */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-teal-600" />
                    <span>Depot Capacity & Logistics</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {ngo.capacitySummary || 'Standard verified relief intake hub with volunteer sorting infrastructure.'}
                  </p>
                  <div className="text-xs text-slate-500 pt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Intake Location: {ngo.serviceArea.approximateLocationText}</span>
                  </div>
                </div>

                {/* Supported Relief Categories */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Supported Relief Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ngo.supportedCategories?.map((cat: string) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold capitalize"
                      >
                        {cat.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Relief Requirements */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-teal-600" />
                      <h3 className="text-base font-bold text-slate-900">
                        Active Relief Needs ({ngo.needs?.length || 0})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500">Documented needs awaiting donation matches</span>
                  </div>

                  {ngo.needs && ngo.needs.length > 0 ? (
                    <div className="space-y-3">
                      {ngo.needs.map((need: any) => (
                        <div
                          key={need.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-semibold capitalize">
                                {need.category?.replace(/_/g, ' ')}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  need.urgency === 'high'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {need.urgency} Urgency
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {need.itemSpecification}
                            </h4>
                            <div className="text-xs text-slate-500 flex items-center gap-3">
                              <span>Target: {need.quantityRequested} {need.unit}</span>
                              <span>•</span>
                              <span>Fulfilled: {need.quantityFulfilled} {need.unit}</span>
                            </div>
                          </div>

                          <Link
                            href={`/donate/individual?ngoId=${encodeURIComponent(ngo.id)}&category=${encodeURIComponent(need.category)}`}
                            className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition text-center shrink-0"
                          >
                            Donate this Item →
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                      No urgent item shortages currently logged. General supplies are always accepted for depot reserves.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info Cards */}
              <div className="space-y-4">
                {/* Statutory Verification Provenance */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Statutory Provenance
                    </h3>
                  </div>

                  <div className="text-xs space-y-2 text-slate-600">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Registry Source</div>
                      <div className="font-semibold text-slate-800">{ngo.sourceProvenance?.directoryName || 'NGO Darpan (NITI Aayog)'}</div>
                    </div>

                    {ngo.sourceProvenance?.recordId && (
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Provenance Record ID</div>
                        <div className="font-mono text-slate-700">{ngo.sourceProvenance.recordId}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Verification Method</div>
                      <div className="text-slate-700">{ngo.sourceProvenance?.verifiedMethod || 'Full Physical Depot & Registration Audit'}</div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Auditing Officer</div>
                      <div className="text-slate-700">{ngo.verifiedBy || 'Designated Humanitarian Officer'}</div>
                    </div>
                  </div>
                </div>

                {/* Service Area Info */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Geographic Service Area
                    </h3>
                  </div>

                  <div className="text-xs space-y-2 text-slate-600">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Operating Hub</div>
                      <div className="font-medium text-slate-800">{ngo.serviceArea.city}, {ngo.serviceArea.state}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Coverage Radius</div>
                      <div className="text-slate-700">{ngo.serviceArea.radiusKm} km radius from depot</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Coordinates (Privacy-Centroid)</div>
                      <div className="font-mono text-slate-600 text-[11px]">
                        {coords[0].toFixed(4)}° N, {coords[1].toFixed(4)}° E
                      </div>
                    </div>
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NGOProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      }
    >
      <NGOProfileContent />
    </Suspense>
  );
}

