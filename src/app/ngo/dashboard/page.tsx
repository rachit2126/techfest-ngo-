'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Clock,
  CheckCircle2,
  Plus,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function NGODashboardPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'needs' | 'allocations' | 'claims'>('recommended');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [needsRes, allocRes, donationsRes, claimsRes] = await Promise.all([
        fetch('/api/ngo/requests?orgId=ngo_goonj'),
        fetch('/api/allocations'),
        fetch('/api/donations'),
        fetch('/api/marketplace/claims')
      ]);

      const needsData = await needsRes.json();
      const allocData = await allocRes.json();
      const donationsData = await donationsRes.json();
      const claimsData = await claimsRes.json();

      setNeeds(needsData.requests || []);
      setAllocations(allocData.allocations || []);
      setMarketplaceListings(donationsData.donations || []);
      setClaims(claimsData.claims || []);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimListing = async (listingId: string, quantity: number) => {
    try {
      const res = await fetch('/api/marketplace/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          requestedQuantity: quantity,
          purposeDescription: 'Dispatched directly to winter relief camp distribution.'
        })
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || 'Claim failed');
      else {
        alert(`Claim successful! Handover verification code: ${data.claim?.handoverCode}`);
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Error creating claim');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Verified Partner Operations
            </span>
            <StatusBadge status="verified" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Goonj Relief & Community Development Trust
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Depot: Sarita Vihar Logistics Center, South Delhi | Statutory ID: DL/2004/0014298
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ngo/requests"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Publish New Need
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Active Published Requests</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{needs.length}</div>
          <span className="text-[11px] text-teal-700 font-medium">Open on matching engine</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Reserved Allocations</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{allocations.length}</div>
          <span className="text-[11px] text-sky-700 font-medium">Under active logistics</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Verification Status</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">Full 80G Vetted</div>
          <span className="text-[11px] text-slate-400">Valid until Aug 2027</span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'recommended' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Recommended Marketplace Goods ({marketplaceListings.length})
        </button>
        <button
          onClick={() => setActiveTab('needs')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'needs' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Documented Needs ({needs.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'claims' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Active Claims & Handovers ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'allocations' ? 'bg-[#00A878] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deliveries & Chain of Custody ({allocations.length})
        </button>
      </div>

      {/* TAB 1: RECOMMENDED MARKETPLACE GOODS */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Available Humanitarian Supplies & Surplus
            </h2>
            <Link href="/explore" className="text-xs text-teal-700 font-semibold hover:underline">
              Explore Regional Hubs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceListings.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <img
                      src={item.photos?.[0] || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=80'}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-md ${
                        item.marketplaceType === 'affordable_sale'
                          ? 'bg-rose-500/90 text-white'
                          : item.marketplaceType === 'business_surplus'
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                      }`}>
                        {item.marketplaceType === 'affordable_sale' ? 'Affordable Sale' : item.marketplaceType === 'business_surplus' ? 'Business Surplus' : '100% Free Donation'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 line-clamp-1">{item.itemName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.location?.city}, {item.location?.state} • {item.remainingQuantity} {item.unit} available</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    Condition: <strong className="capitalize">{item.condition}</strong> • {item.brand || 'Relief Stockpile'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleClaimListing(item.id, Math.min(25, item.remainingQuantity))}
                    className="w-full py-2.5 rounded-xl bg-[#00A878] hover:bg-[#009167] text-white text-xs font-bold text-center transition shadow-xs"
                  >
                    Request / Claim Supplies
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLAIMS & HANDOVER VERIFICATION */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Reserved Claims & Secure Handover Codes
            </h2>
          </div>

          {claims.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No active claims requested. Browse recommended goods to request supplies.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {claims.map((c: any) => (
                <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Claim #{c.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Requested: <strong className="text-slate-800">{c.requestedQuantity} {c.unit}</strong> | Purpose: {c.purposeDescription}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold">
                      Handover OTP: {c.handoverCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Published Relief Needs Table */}
      {activeTab === 'needs' && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Current Documented Needs
          </h2>
          <Link href="/ngo/requests" className="text-xs text-teal-700 font-semibold hover:underline">
            + Add Another Need
          </Link>
        </div>

        {needs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No active needs published.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {needs.map(n => (
              <div key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{n.itemSpecification}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      n.urgency === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {n.urgency}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Target: <strong className="text-slate-800">{n.quantityRequested} {n.unit}</strong> | Fulfilled so far: <strong className="text-teal-700">{n.quantityFulfilled} {n.unit}</strong> | Deadline: {new Date(n.neededBy).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/matches/don_blankets_100_demo`}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition"
                  >
                    Inspect Matches
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* TAB 4: Active Allocations & Receipts Table */}
      {activeTab === 'allocations' && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Matched Allocations & Chain of Custody
          </h2>
        </div>

        {allocations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No active allocations yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {allocations.map(a => (
              <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Allocation #{a.id}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-slate-500">
                    Allocated Quantity: <strong className="text-slate-800">{a.quantityAllocated} {a.unit}</strong> | Recipient: {a.ngoName}
                  </div>
                </div>

                <Link
                  href={`/donations/${a.donationId}/tracking`}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1 self-start sm:self-auto"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Track Delivery
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
