'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function DonationsListPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, [categoryFilter, statusFilter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/donations?${params.toString()}`);
      const data = await res.json();
      setDonations(data.donations || []);
    } catch (err) {
      console.error('Fetch donations error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Donation Lots & Inventory Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" />
            Active Donation Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track individual lots and enterprise bulk surplus through verification, matching, and physical delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/donate/individual"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Individual Donation
          </Link>
          <Link
            href="/donate/organisation"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm"
          >
            Bulk CSV Upload
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter By:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="clothing_blankets">Clothing & Blankets</option>
            <option value="packaged_food">Packaged Food</option>
            <option value="hygiene_kits">Hygiene Kits</option>
            <option value="medical_first_aid">Medical / First Aid</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Lifecycles</option>
            <option value="eligible">Eligible (Ready for Matching)</option>
            <option value="approved">Approved & Reserved</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered_confirmed">Delivered Confirmed</option>
          </select>
        </div>

        <div className="text-slate-500">
          Showing <strong className="text-slate-900">{donations.length}</strong> donation records
        </div>
      </div>

      {/* Donation Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading donation inventory from MongoDB...</div>
      ) : donations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No donations match your selected filters</h3>
          <p className="text-xs text-slate-500">Submit a new donation to begin the smart matching workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {donations.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    <span className="font-mono text-slate-400 text-xs">#{d.id}</span>
                    {d.batchLotCode && (
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Batch: {d.batchLotCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{d.itemName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {d.location?.city}, {d.location?.state} • Donor: <strong className="text-slate-700">{d.donorName}</strong> ({d.donorType})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    href={`/matches/${d.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition"
                  >
                    Match Rationale
                  </Link>
                  <Link
                    href={`/donations/${d.id}/tracking`}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Track Delivery
                  </Link>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div>
                  Available: <strong className="text-slate-900">{d.remainingQuantity} / {d.quantity} {d.unit}</strong>
                </div>
                {d.expiryDate && (
                  <div className="text-amber-800 font-medium">
                    Best-Before: {new Date(d.expiryDate).toLocaleDateString()}
                  </div>
                )}
                <div className="text-slate-400 text-[11px]">
                  Submitted {new Date(d.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
