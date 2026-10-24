'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Leaf,
  ShieldCheck,
  Building2,
  PackageCheck,
  Users,
  Download,
  Info,
  Scale,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function ImpactPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/impact/summary');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Fetch impact error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," +
      "Metric,Value,Calculation Methodology\n" +
      `Confirmed Deliveries,${data.confirmedMetrics?.confirmedDeliveriesCount},Physical Recipient Confirmed\n` +
      `Food Rescued (kg),${data.confirmedMetrics?.totals?.foodRescuedKg},Industrial Scale Verification\n` +
      `Blankets Distributed,${data.confirmedMetrics?.totals?.blanketsDistributed},Depot Counted Receipts\n` +
      `CO2e Emissions Diverted (kg),${data.estimates?.co2eAvoidedKg},UN FAO / EPA WARM 2.5x Multiplier\n` +
      `Verified NGOs Served,${data.confirmedMetrics?.verifiedNGOsCount},Statutory Audit Directory\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sahay_Impact_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Aggregating confirmed delivery ledgers and carbon formulas...</p>
      </div>
    );
  }

  const { confirmedMetrics, estimates, provenance } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Durable Outcomes Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Confirmed Humanitarian & Environmental Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Aggregated exclusively from physically signed recipient delivery receipts. Unverified submissions strictly omitted.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchImpact}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {confirmedMetrics?.confirmedDeliveriesCount || 0}
          </div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% physically receipted
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Surplus Food Rescued</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {confirmedMetrics?.totals?.foodRescuedKg || 0} <span className="text-lg font-bold text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-500">
            ~{estimates?.mealsEquivalency || 0} community meals served
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Emissions Diverted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {estimates?.co2eAvoidedKg || 0} <span className="text-lg font-bold text-slate-500">kg CO2e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Landfill methane mitigation
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified NGO Hubs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {confirmedMetrics?.verifiedNGOsCount || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Active in relief distribution
          </p>
        </div>
      </div>

      {/* Methodology & Integrity Transparency Box */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Info className="w-4 h-4 text-teal-600" />
          Impact Integrity & Estimation Methodology Disclosure
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-semibold text-slate-900 block">Durable Confirmed Rule (Anti-Vanity Metric):</span>
            <p className="leading-relaxed">
              Sahay does not count submissions, drafts, or proposed matches as fulfilled impact. Figures increase ONLY upon verified recipient signature and scale weight upload.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-semibold text-slate-900 block">Carbon Estimation Equation:</span>
            <p className="leading-relaxed font-mono text-[11px] text-slate-700">
              Formula: {estimates?.formula}
            </p>
            <p className="text-[11px] text-slate-500">
              Derived from UN FAO Food Loss and Waste Model and EPA WARM organic landfill diversion guidelines.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
          <span>Source: <strong className="text-slate-700">{provenance?.source}</strong></span>
          <span>Last Confirmed Audit: {new Date(provenance?.lastUpdated).toLocaleString()}</span>
          <span className="text-amber-800 font-semibold">{provenance?.demoDataLabel}</span>
        </div>
      </div>
    </div>
  );
}
